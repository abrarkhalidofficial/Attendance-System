import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireAuth, requireRole } from "./auth";
import { z } from "zod";

// Zod schemas for attendance inputs
const verificationSchema = z.object({
  ip: z.string().min(3),
  ua: z.string().min(3),
  geo: z
    .object({ lat: z.number(), lng: z.number(), acc: z.number() })
    .optional(),
  faceEmbedding: z.array(z.number()).min(64).max(1024).optional(),
});

const clockInSchema = z.object({
  method: z.enum(["web", "mobile", "kiosk"]),
  verification: verificationSchema,
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0,
    normA = 0,
    normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Clock in function with face verification
export const clockIn = mutation({
  args: {
    method: v.string(),
    verification: v.object({
      faceScore: v.optional(v.number()),
      ip: v.string(),
      ua: v.string(),
      geo: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
          acc: v.number(),
        })
      ),
      // Temporary embedding for verification (not stored server-side)
      faceEmbedding: v.optional(v.array(v.number())),
      pass: v.optional(v.boolean()),
    }),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Zod validation for extra constraints
    const parsed = clockInSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(parsed.error.flatten().formErrors.join("; "));
    }

    // Get current user
    const user = await requireRole(ctx, ["employee", "manager", "admin"]);

    // If user has enrolled faceEmbedding and client provided current embedding, verify
    let faceScore: number | undefined = undefined;
    let facePass: boolean | undefined = undefined;
    const threshold = 0.85;
    if (user.faceEmbedding && args.verification.faceEmbedding) {
      faceScore = cosineSimilarity(user.faceEmbedding, args.verification.faceEmbedding);
      facePass = faceScore >= threshold;
      if (!facePass) {
        throw new Error("Face verification failed. Please try again or contact admin.");
      }
    }

    // Check if user already has an active session (no clock-out)
    const activeSession = await ctx.db
      .query("attendanceSessions")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), user._id), q.eq(q.field("clockOutAt"), undefined))
      )
      .first();

    if (activeSession) {
      throw new Error("You already have an active session. Please clock out first.");
    }

    // Create new attendance session
    const sessionId = await ctx.db.insert("attendanceSessions", {
      userId: user._id,
      clockInAt: Date.now(),
      method: args.method,
      verification: {
        ip: args.verification.ip,
        ua: args.verification.ua,
        geo: args.verification.geo,
        faceScore,
        pass: facePass,
      },
      projectId: args.projectId,
      taskId: args.taskId,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "clock_in",
      target: {
        type: "attendanceSessions",
        id: sessionId,
      },
      metadata: {
        method: args.method,
        verification: {
          ip: args.verification.ip,
          geo: args.verification.geo,
          faceScore,
        },
      },
      at: Date.now(),
    });

    return { success: true, sessionId };
  },
});

// Clock out function (auth + zod verification)
export const clockOut = mutation({
  args: {
    sessionId: v.optional(v.id("attendanceSessions")),
    verification: v.object({
      faceScore: v.optional(v.number()),
      ip: v.string(),
      ua: v.string(),
      geo: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
          acc: v.number(),
        })
      ),
    }),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate verification shape
    const parsed = verificationSchema.safeParse(args.verification);
    if (!parsed.success) {
      throw new Error(parsed.error.flatten().formErrors.join("; "));
    }

    const user = await requireRole(ctx, ["employee", "manager", "admin"]);

    // Find active session
    let activeSession;

    if (args.sessionId) {
      activeSession = await ctx.db.get(args.sessionId);

      if (!activeSession) {
        throw new Error("Session not found");
      }

      if (activeSession.userId !== user._id && user.role !== "admin") {
        throw new Error("Unauthorized to modify this session");
      }

      if (activeSession.clockOutAt) {
        throw new Error("This session is already clocked out");
      }
    } else {
      activeSession = await ctx.db
        .query("attendanceSessions")
        .filter((q) =>
          q.and(q.eq(q.field("userId"), user._id), q.eq(q.field("clockOutAt"), undefined))
        )
        .first();

      if (!activeSession) {
        throw new Error("No active session found. Please clock in first.");
      }
    }

    const clockOutTime = Date.now();
    const durationSec = Math.floor((clockOutTime - activeSession.clockInAt) / 1000);

    // Update session with clock out time
    await ctx.db.patch(activeSession._id, {
      clockOutAt: clockOutTime,
      durationSec,
      notes: args.notes || activeSession.notes,
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "clock_out",
      target: {
        type: "attendanceSessions",
        id: activeSession._id,
      },
      metadata: {
        durationSec,
        verification: {
          ip: args.verification.ip,
          geo: args.verification.geo,
        },
      },
      at: Date.now(),
    });

    // If there was a project and task, create a time entry
    if (activeSession.projectId || activeSession.taskId) {
      await ctx.db.insert("timeEntries", {
        userId: user._id,
        projectId: activeSession.projectId,
        taskId: activeSession.taskId,
        sessionId: activeSession._id,
        startedAt: activeSession.clockInAt,
        endedAt: clockOutTime,
        durationSec,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      sessionId: activeSession._id,
      durationSec,
      durationFormatted: formatDuration(durationSec),
    };
  },
});

// Admin function to fix missed clock-out
export const adminFixClockOut = mutation({
  args: {
    sessionId: v.id("attendanceSessions"),
    clockOutAt: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "manager"]);

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.clockOutAt) {
      throw new Error("This session is already clocked out");
    }

    if (args.clockOutAt < session.clockInAt) {
      throw new Error("Clock-out time cannot be before clock-in time");
    }

    const durationSec = Math.floor((args.clockOutAt - session.clockInAt) / 1000);

    await ctx.db.patch(args.sessionId, {
      clockOutAt: args.clockOutAt,
      durationSec,
      notes: args.notes || session.notes,
      closedByAdminId: user._id,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "admin_fix_clock_out",
      target: {
        type: "attendanceSessions",
        id: session._id,
      },
      metadata: {
        durationSec,
      },
      at: Date.now(),
    });

    return { success: true };
  },
});

// Enroll face embedding (explicit consent)
export const enrollFace = mutation({
  args: {
    embedding: v.array(v.number()),
    consent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["employee", "manager", "admin"]);

    const enrollSchema = z.object({
      embedding: z.array(z.number()).min(64).max(1024),
      consent: z.literal(true),
    });
    const parsed = enrollSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error("Explicit consent required and embedding must be valid");
    }

    await ctx.db.patch(user._id, {
      faceEmbedding: args.embedding.map((x) => Number(x)),
      faceConsentAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "enroll_face",
      target: { type: "users", id: user._id },
      metadata: { dims: args.embedding.length },
      at: Date.now(),
    });

    return { success: true };
  },
});

// Delete biometric data (user-initiated)
export const deleteBiometricData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["employee", "manager", "admin"]);

    await ctx.db.patch(user._id, {
      faceEmbedding: undefined,
      faceConsentAt: undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "delete_biometric",
      target: { type: "users", id: user._id },
      metadata: {},
      at: Date.now(),
    });

    return { success: true };
  },
});

export const getCurrentSession = query({
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const activeSession = await ctx.db
      .query("attendanceSessions")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), user._id), q.eq(q.field("clockOutAt"), undefined))
      )
      .first();

    if (!activeSession) return null;
    return activeSession;
  },
});

export const getUserAttendanceHistory = query({
  args: {
    userId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const current = await requireRole(ctx, ["employee", "manager", "admin"]);
    const targetUserId = args.userId ?? current._id;

    // Role-based access: employees can only read their own; managers/admins can read all
    if (current.role === "employee" && targetUserId !== current._id) {
      throw new Error("Forbidden");
    }

    let q = ctx.db
      .query("attendanceSessions")
      .filter((qq) => qq.eq(qq.field("userId"), targetUserId));

    if (args.startDate) q = q.filter((qq) => qq.gte(qq.field("clockInAt"), args.startDate!));
    if (args.endDate) q = q.filter((qq) => qq.lte(qq.field("clockInAt"), args.endDate!));

    const limit = Math.min(args.limit ?? 50, 200);
    const results = await q.order("desc").take(limit);
    return results;
  },
});

export const getCurrentlyActiveUsers = query({
  handler: async (ctx) => {
    const current = await requireRole(ctx, ["manager", "admin"]);

    const active = await ctx.db
      .query("attendanceSessions")
      .filter((q) => q.eq(q.field("clockOutAt"), undefined))
      .collect();

    // Return with joined user info
    const usersMap = new Map<string, any>();
    for (const s of active) {
      if (!usersMap.has(String(s.userId))) {
        const u = await ctx.db.get(s.userId);
        usersMap.set(String(s.userId), u);
      }
    }

    return active.map((s) => ({
      session: s,
      user: usersMap.get(String(s.userId)),
    }));
  },
});

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}