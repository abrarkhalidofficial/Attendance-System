import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to get current user and verify authentication
const getCurrentUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  
  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("email"), identity.email))
    .first();
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
};

// Clock in function
export const clockIn = mutation({
  args: {
    method: v.string(),
    verification: v.object({
      faceScore: v.optional(v.number()),
      ip: v.string(),
      ua: v.string(),
      geo: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
        acc: v.number(),
      })),
    }),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Check if user already has an active session (no clock-out)
    const activeSession = await ctx.db
      .query("attendanceSessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("clockOutAt"), undefined)
        )
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
      verification: args.verification,
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
        },
      },
      at: Date.now(),
    });
    
    return { success: true, sessionId };
  },
});

// Clock out function
export const clockOut = mutation({
  args: {
    sessionId: v.optional(v.id("attendanceSessions")),
    verification: v.object({
      faceScore: v.optional(v.number()),
      ip: v.string(),
      ua: v.string(),
      geo: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
        acc: v.number(),
      })),
    }),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
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
          q.and(
            q.eq(q.field("userId"), user._id),
            q.eq(q.field("clockOutAt"), undefined)
          )
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
      durationFormatted: formatDuration(durationSec)
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
    // Get current user and verify admin
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized. Only admins and managers can fix clock-outs.");
    }
    
    // Get the session
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    
    if (session.clockOutAt) {
      throw new Error("This session is already clocked out");
    }
    
    // Validate clock-out time is after clock-in
    if (args.clockOutAt < session.clockInAt) {
      throw new Error("Clock-out time cannot be before clock-in time");
    }
    
    const durationSec = Math.floor((args.clockOutAt - session.clockInAt) / 1000);
    
    // Update session
    await ctx.db.patch(args.sessionId, {
      clockOutAt: args.clockOutAt,
      durationSec,
      notes: args.notes || session.notes,
      closedByAdminId: user._id,
      updatedAt: Date.now(),
    });
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "admin_fix_clock_out",
      target: {
        type: "attendanceSessions",
        id: session._id,
      },
      metadata: {
        durationSec,
        originalClockInAt: session.clockInAt,
        fixedClockOutAt: args.clockOutAt,
      },
      at: Date.now(),
    });
    
    // If there was a project and task, create a time entry
    if (session.projectId || session.taskId) {
      await ctx.db.insert("timeEntries", {
        userId: session.userId,
        projectId: session.projectId,
        taskId: session.taskId,
        sessionId: session._id,
        startedAt: session.clockInAt,
        endedAt: args.clockOutAt,
        durationSec,
        note: `Admin fixed clock-out by ${user.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return { 
      success: true, 
      sessionId: session._id,
      durationSec,
      durationFormatted: formatDuration(durationSec)
    };
  },
});

// Get current active session for user
export const getCurrentSession = query({
  handler: async (ctx) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Find active session
    const activeSession = await ctx.db
      .query("attendanceSessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("clockOutAt"), undefined)
        )
      )
      .first();
    
    if (!activeSession) {
      return null;
    }
    
    // Calculate current duration
    const currentDuration = Math.floor((Date.now() - activeSession.clockInAt) / 1000);
    
    return {
      ...activeSession,
      currentDuration,
      currentDurationFormatted: formatDuration(currentDuration),
    };
  },
});

// Get user's attendance history
export const getUserAttendanceHistory = query({
  args: {
    userId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await getCurrentUser(ctx);
    
    // Determine which user's history to fetch
    const targetUserId = args.userId || currentUser._id;
    
    // If requesting another user's history, verify permissions
    if (targetUserId !== currentUser._id && 
        currentUser.role !== "admin" && 
        currentUser.role !== "manager") {
      throw new Error("Unauthorized to view other users' attendance history");
    }
    
    // Build query
    let sessionsQuery = ctx.db
      .query("attendanceSessions")
      .filter((q) => q.eq(q.field("userId"), targetUserId))
      .order("desc");
    
    // Apply date filters if provided
    if (args.startDate) {
      sessionsQuery = sessionsQuery.filter((q) => 
        q.gte(q.field("clockInAt"), args.startDate!)
      );
    }
    
    if (args.endDate) {
      sessionsQuery = sessionsQuery.filter((q) => 
        q.lte(q.field("clockInAt"), args.endDate!)
      );
    }
    
    // Apply limit if provided
    const limit = args.limit || 50;
    const sessions = await sessionsQuery.take(limit);
    
    // Format sessions with duration
    return sessions.map(session => {
      const durationSec = session.durationSec || 
        (session.clockOutAt ? 
          Math.floor((session.clockOutAt - session.clockInAt) / 1000) : 
          Math.floor((Date.now() - session.clockInAt) / 1000));
      
      return {
        ...session,
        durationFormatted: formatDuration(durationSec),
      };
    });
  },
});

// Get users who are currently clocked in
export const getCurrentlyActiveUsers = query({
  handler: async (ctx) => {
    // Get current user and verify permissions
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized. Only admins and managers can view active users.");
    }
    
    // Get active sessions
    const activeSessions = await ctx.db
      .query("attendanceSessions")
      .filter((q) => q.eq(q.field("clockOutAt"), undefined))
      .collect();
    
    // Get user details for each session
    const userIds = [...new Set(activeSessions.map(session => session.userId))];
    const users = await Promise.all(
      userIds.map(userId => ctx.db.get(userId))
    );
    
    // Combine session and user data
    return activeSessions.map(session => {
      const sessionUser = users.find(u => u?._id === session.userId);
      const currentDuration = Math.floor((Date.now() - session.clockInAt) / 1000);
      
      return {
        session: {
          ...session,
          currentDuration,
          currentDurationFormatted: formatDuration(currentDuration),
        },
        user: sessionUser,
      };
    });
  },
});

// Helper function to format duration in HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}