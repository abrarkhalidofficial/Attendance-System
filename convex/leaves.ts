import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Leave Types
export const getLeaveTypes = query({
  handler: async (ctx) => {
    return await ctx.db.query("leaveTypes").collect();
  },
});

export const createLeaveType = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    defaultBalance: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leaveTypes", args);
  },
});

export const updateLeaveType = mutation({
  args: {
    id: v.id("leaveTypes"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    defaultBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Leave Requests
export const getLeaveRequests = query({
  handler: async (ctx) => {
    return await ctx.db.query("leaveRequests").collect();
  },
});

export const getLeaveRequestsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leaveRequests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getLeaveRequestsByStatus = query({
  args: { status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leaveRequests")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const createLeaveRequest = mutation({
  args: {
    userId: v.id("users"),
    leaveTypeId: v.id("leaveTypes"),
    startDate: v.string(),
    endDate: v.string(),
    isHalfDay: v.boolean(),
    reason: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check for overlapping leave requests
    const existingRequests = await ctx.db
      .query("leaveRequests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("status"), "rejected"))
      .collect();

    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);

    for (const request of existingRequests) {
      const requestStart = new Date(request.startDate);
      const requestEnd = new Date(request.endDate);

      if (
        (startDate >= requestStart && startDate <= requestEnd) ||
        (endDate >= requestStart && endDate <= requestEnd) ||
        (startDate <= requestStart && endDate >= requestEnd)
      ) {
        throw new Error("Leave request overlaps with existing request");
      }
    }

    return await ctx.db.insert("leaveRequests", {
      ...args,
      status: "pending",
    });
  },
});

export const updateLeaveRequest = mutation({
  args: {
    id: v.id("leaveRequests"),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isHalfDay: v.optional(v.boolean()),
    reason: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    if (updates.status === "approved" || updates.status === "rejected") {
      updates.approvedAt = new Date().toISOString();
    }

    return await ctx.db.patch(id, updates);
  },
});

// Leave Comments
export const getLeaveComments = query({
  args: { leaveRequestId: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leaveComments")
      .withIndex("by_leaveRequest", (q) => q.eq("leaveRequestId", args.leaveRequestId))
      .collect();
  },
});

export const addLeaveComment = mutation({
  args: {
    leaveRequestId: v.id("leaveRequests"),
    userId: v.id("users"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leaveComments", args);
  },
});

// Leave Balances
export const getLeaveBalances = query({
  handler: async (ctx) => {
    return await ctx.db.query("leaveBalances").collect();
  },
});

export const getLeaveBalancesByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leaveBalances")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const updateLeaveBalance = mutation({
  args: {
    userId: v.id("users"),
    leaveTypeId: v.id("leaveTypes"),
    balance: v.optional(v.number()),
    used: v.optional(v.number()),
    carryover: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingBalance = await ctx.db
      .query("leaveBalances")
      .withIndex("by_userId_leaveType", (q) => 
        q.eq("userId", args.userId).eq("leaveTypeId", args.leaveTypeId)
      )
      .first();

    if (existingBalance) {
      const { userId, leaveTypeId, ...updates } = args;
      return await ctx.db.patch(existingBalance._id, updates);
    } else {
      return await ctx.db.insert("leaveBalances", {
        userId: args.userId,
        leaveTypeId: args.leaveTypeId,
        balance: args.balance ?? 0,
        used: args.used ?? 0,
        carryover: args.carryover ?? 0,
      });
    }
  },
});

export const initializeLeaveBalances = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const leaveTypes = await ctx.db.query("leaveTypes").collect();
    const balances = [];

    for (const leaveType of leaveTypes) {
      const existingBalance = await ctx.db
        .query("leaveBalances")
        .withIndex("by_userId_leaveType", (q) => 
          q.eq("userId", args.userId).eq("leaveTypeId", leaveType._id)
        )
        .first();

      if (!existingBalance) {
        balances.push(
          ctx.db.insert("leaveBalances", {
            userId: args.userId,
            leaveTypeId: leaveType._id,
            balance: leaveType.defaultBalance,
            used: 0,
            carryover: 0,
          })
        );
      }
    }

    return await Promise.all(balances);
  },
});

// Calculate leave days
export const calculateLeaveDays = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    isHalfDay: v.boolean(),
  },
  handler: async (ctx, args) => {
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    
    let days = 0;
    const current = new Date(start);

    while (current <= end) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    return args.isHalfDay ? days * 0.5 : days;
  },
});