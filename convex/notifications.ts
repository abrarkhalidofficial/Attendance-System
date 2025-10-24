import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Notifications
export const getNotifications = query({
  handler: async (ctx) => {
    return await ctx.db.query("notifications").collect();
  },
});

export const getNotificationsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getUnreadNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .order("desc")
      .collect();
  },
});

export const getUnreadNotificationCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    
    return unreadNotifications.length;
  },
});

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("leave-approval"),
      v.literal("leave-rejection"),
      v.literal("missed-clockout"),
      v.literal("task-assigned"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
    });
  },
});

export const markNotificationAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    const updates = unreadNotifications.map(notification =>
      ctx.db.patch(notification._id, { read: true })
    );

    return await Promise.all(updates);
  },
});

export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const deleteAllNotifications = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const deletions = userNotifications.map(notification =>
      ctx.db.delete(notification._id)
    );

    return await Promise.all(deletions);
  },
});

// Notification helpers for common scenarios
export const notifyLeaveApproval = mutation({
  args: {
    userId: v.id("users"),
    leaveRequestId: v.string(),
    approverName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "leave-approval",
      title: "Leave Request Approved",
      message: `Your leave request has been approved by ${args.approverName}`,
      actionUrl: `/leaves/${args.leaveRequestId}`,
      read: false,
    });
  },
});

export const notifyLeaveRejection = mutation({
  args: {
    userId: v.id("users"),
    leaveRequestId: v.string(),
    approverName: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const message = args.reason 
      ? `Your leave request has been rejected by ${args.approverName}. Reason: ${args.reason}`
      : `Your leave request has been rejected by ${args.approverName}`;

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "leave-rejection",
      title: "Leave Request Rejected",
      message,
      actionUrl: `/leaves/${args.leaveRequestId}`,
      read: false,
    });
  },
});

export const notifyMissedClockout = mutation({
  args: {
    userId: v.id("users"),
    sessionDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "missed-clockout",
      title: "Missed Clock-out",
      message: `You forgot to clock out on ${args.sessionDate}. Please contact your manager to correct your attendance.`,
      actionUrl: "/attendance",
      read: false,
    });
  },
});

export const notifyTaskAssignment = mutation({
  args: {
    userId: v.id("users"),
    taskId: v.string(),
    taskTitle: v.string(),
    assignerName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "task-assigned",
      title: "New Task Assigned",
      message: `You have been assigned a new task: "${args.taskTitle}" by ${args.assignerName}`,
      actionUrl: `/tasks/${args.taskId}`,
      read: false,
    });
  },
});

export const notifySystemMessage = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system",
      title: args.title,
      message: args.message,
      actionUrl: args.actionUrl,
      read: false,
    });
  },
});

// Broadcast notifications to multiple users
export const broadcastNotification = mutation({
  args: {
    userIds: v.array(v.id("users")),
    type: v.union(
      v.literal("leave-approval"),
      v.literal("leave-rejection"),
      v.literal("missed-clockout"),
      v.literal("task-assigned"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notifications = args.userIds.map(userId =>
      ctx.db.insert("notifications", {
        userId,
        type: args.type,
        title: args.title,
        message: args.message,
        actionUrl: args.actionUrl,
        read: false,
      })
    );

    return await Promise.all(notifications);
  },
});