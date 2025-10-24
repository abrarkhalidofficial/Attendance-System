import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all attendance sessions
export const getAttendanceSessions = query({
  handler: async (ctx) => {
    return await ctx.db.query("attendanceSessions").collect();
  },
});

// Get attendance sessions by user ID
export const getAttendanceByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendanceSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get active session for a user
export const getActiveSession = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendanceSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

// Clock in
export const clockIn = mutation({
  args: {
    userId: v.id("users"),
    deviceFingerprint: v.string(),
    ipAddress: v.string(),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        accuracy: v.number(),
        timestamp: v.string(),
      })
    ),
    notes: v.optional(v.string()),
    faceVerified: v.optional(v.boolean()),
    isRemote: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if user already has an active session
    const activeSession = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (activeSession) {
      throw new Error("User already has an active session");
    }

    const clockInTime = new Date().toISOString();

    return await ctx.db.insert("attendanceSessions", {
      userId: args.userId,
      clockIn: clockInTime,
      deviceFingerprint: args.deviceFingerprint,
      ipAddress: args.ipAddress,
      location: args.location,
      notes: args.notes,
      faceVerified: args.faceVerified ?? false,
      status: "active",
      isRemote: args.isRemote ?? false,
    });
  },
});

// Clock out
export const clockOut = mutation({
  args: {
    sessionId: v.id("attendanceSessions"),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        accuracy: v.number(),
        timestamp: v.string(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "active") {
      throw new Error("Session is not active");
    }

    const clockOutTime = new Date().toISOString();
    const clockInTime = new Date(session.clockIn);
    const clockOutTimeDate = new Date(clockOutTime);
    const totalHours =
      (clockOutTimeDate.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    return await ctx.db.patch(args.sessionId, {
      clockOut: clockOutTime,
      status: "completed",
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      location: args.location || session.location,
      notes: args.notes || session.notes,
    });
  },
});

// Update attendance session
export const updateAttendanceSession = mutation({
  args: {
    sessionId: v.id("attendanceSessions"),
    clockIn: v.optional(v.string()),
    clockOut: v.optional(v.string()),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        accuracy: v.number(),
        timestamp: v.string(),
      })
    ),
    notes: v.optional(v.string()),
    faceVerified: v.optional(v.boolean()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("missed-clockout")
      )
    ),
    isRemote: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...updates } = args;

    // Recalculate total hours if clock times are updated
    if (updates.clockIn || updates.clockOut) {
      const session = await ctx.db.get(sessionId);
      if (session) {
        const clockIn = updates.clockIn || session.clockIn;
        const clockOut = updates.clockOut || session.clockOut;

        if (clockIn && clockOut) {
          const clockInTime = new Date(clockIn);
          const clockOutTime = new Date(clockOut);
          const totalHours =
            (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
          (updates as any).totalHours = Math.round(totalHours * 100) / 100;
        }
      }
    }

    return await ctx.db.patch(sessionId, updates);
  },
});

// Get attendance sessions by date range
export const getAttendanceByDateRange = query({
  args: {
    userId: v.optional(v.id("users")),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("attendanceSessions");

    if (args.userId) {
      query = query.withIndex("by_userId", (q) => q.eq("userId", args.userId!));
    }

    const sessions = await query.collect();

    return sessions.filter((session) => {
      const sessionDate = session.clockIn.split("T")[0];
      return sessionDate >= args.startDate && sessionDate <= args.endDate;
    });
  },
});

// Mark missed clock-out sessions
export const markMissedClockOuts = mutation({
  handler: async (ctx) => {
    const activeSessions = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const updates = [];

    for (const session of activeSessions) {
      const clockInTime = new Date(session.clockIn);

      // If session is older than 24 hours, mark as missed clock-out
      if (clockInTime < yesterday) {
        updates.push(
          ctx.db.patch(session._id, {
            status: "missed-clockout",
            clockOut: new Date(
              clockInTime.getTime() + 8 * 60 * 60 * 1000
            ).toISOString(), // Assume 8-hour workday
            totalHours: 8,
          })
        );
      }
    }

    return await Promise.all(updates);
  },
});
