import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Audit Logs
export const getAuditLogs = query({
  handler: async (ctx) => {
    return await ctx.db.query("auditLogs").order("desc").collect();
  },
});

export const getAuditLogsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getAuditLogsByEntityType = query({
  args: { entityType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_entityType", (q) => q.eq("entityType", args.entityType))
      .order("desc")
      .collect();
  },
});

export const getAuditLogsByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_entityType", (q) => q.eq("entityType", args.entityType))
      .collect();

    return logs
      .filter(log => log.entityId === args.entityId)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const createAuditLog = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", args);
  },
});

// Helper functions for common audit log scenarios
export const logUserAction = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    targetUserId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      entityType: "user",
      entityId: args.targetUserId,
      changes: args.changes,
      ipAddress: args.ipAddress,
    });
  },
});

export const logAttendanceAction = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    sessionId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      entityType: "attendance_session",
      entityId: args.sessionId,
      changes: args.changes,
      ipAddress: args.ipAddress,
    });
  },
});

export const logLeaveAction = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    leaveRequestId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      entityType: "leave_request",
      entityId: args.leaveRequestId,
      changes: args.changes,
      ipAddress: args.ipAddress,
    });
  },
});

export const logProjectAction = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    projectId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      entityType: "project",
      entityId: args.projectId,
      changes: args.changes,
      ipAddress: args.ipAddress,
    });
  },
});

export const logTaskAction = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    taskId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      entityType: "task",
      entityId: args.taskId,
      changes: args.changes,
      ipAddress: args.ipAddress,
    });
  },
});

export const logSettingsAction = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    changes: v.any(),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      entityType: "company_settings",
      entityId: "settings",
      changes: args.changes,
      ipAddress: args.ipAddress,
    });
  },
});

// Get audit logs with pagination
export const getAuditLogsPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    entityType: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let query = ctx.db.query("auditLogs");

    if (args.entityType) {
      query = query.withIndex("by_entityType", (q) => q.eq("entityType", args.entityType));
    } else if (args.userId) {
      query = query.withIndex("by_userId", (q) => q.eq("userId", args.userId));
    }

    const results = await query.order("desc").paginate({
      cursor: args.cursor,
      numItems: limit,
    });

    return results;
  },
});

// Get audit statistics
export const getAuditStats = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("auditLogs").collect();
    
    let filteredLogs = logs;
    
    if (args.startDate && args.endDate) {
      const startTime = new Date(args.startDate).getTime();
      const endTime = new Date(args.endDate).getTime();
      
      filteredLogs = logs.filter(log => {
        return log._creationTime >= startTime && log._creationTime <= endTime;
      });
    }

    // Group by action
    const actionStats = filteredLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by entity type
    const entityTypeStats = filteredLogs.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by user
    const userStats = filteredLogs.reduce((acc, log) => {
      acc[log.userId] = (acc[log.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: filteredLogs.length,
      actionStats,
      entityTypeStats,
      userStats,
    };
  },
});