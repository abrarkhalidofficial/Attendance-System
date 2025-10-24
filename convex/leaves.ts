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

// Request leave
export const requestLeave = mutation({
  args: {
    type: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    partial: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Validate dates
    if (args.startDate > args.endDate) {
      throw new Error("Start date cannot be after end date");
    }
    
    if (args.startDate < Date.now() - 86400000) { // 1 day in milliseconds
      throw new Error("Cannot request leave for past dates");
    }
    
    // Create leave request
    const leaveId = await ctx.db.insert("leaves", {
      userId: user._id,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      partial: args.partial,
      reason: args.reason,
      status: "pending",
      comments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "request_leave",
      target: {
        type: "leaves",
        id: leaveId,
      },
      metadata: {
        type: args.type,
        startDate: args.startDate,
        endDate: args.endDate,
      },
      at: Date.now(),
    });
    
    return { success: true, leaveId };
  },
});

// Approve or reject leave request (admin/manager only)
export const updateLeaveStatus = mutation({
  args: {
    leaveId: v.id("leaves"),
    status: v.string(), // "approved" or "rejected"
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user and verify permissions
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized. Only admins and managers can approve/reject leave requests.");
    }
    
    // Get the leave request
    const leave = await ctx.db.get(args.leaveId);
    if (!leave) {
      throw new Error("Leave request not found");
    }
    
    if (leave.status !== "pending") {
      throw new Error(`Leave request is already ${leave.status}`);
    }
    
    // Update leave status
    const now = Date.now();
    const comments = [...leave.comments];
    
    if (args.comment) {
      comments.push({
        userId: user._id,
        text: args.comment,
        at: now,
      });
    }
    
    await ctx.db.patch(args.leaveId, {
      status: args.status,
      approverId: user._id,
      comments,
      updatedAt: now,
    });
    
    // Update leave balance if approved
    if (args.status === "approved") {
      // Calculate number of days
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      
      // Adjust for partial days
      let daysToDeduct = daysDiff;
      if (leave.partial) {
        daysToDeduct -= 0.5;
      }
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Get or create leave balance
      const leaveBalance = await ctx.db
        .query("leaveBalances")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), leave.userId),
            q.eq(q.field("year"), currentYear),
            q.eq(q.field("type"), leave.type)
          )
        )
        .first();
      
      if (leaveBalance) {
        // Update existing balance
        await ctx.db.patch(leaveBalance._id, {
          used: leaveBalance.used + daysToDeduct,
          remaining: leaveBalance.remaining - daysToDeduct,
          updatedAt: now,
        });
      } else {
        // Create new balance with default values
        // In a real app, you would have a policy for initial accrual
        const defaultAccrual = 20; // Example: 20 days annual leave
        await ctx.db.insert("leaveBalances", {
          userId: leave.userId,
          year: currentYear,
          type: leave.type,
          accrued: defaultAccrual,
          used: daysToDeduct,
          remaining: defaultAccrual - daysToDeduct,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: `leave_${args.status}`,
      target: {
        type: "leaves",
        id: args.leaveId,
      },
      metadata: {
        leaveType: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
      },
      at: now,
    });
    
    return { success: true };
  },
});

// Cancel leave request
export const cancelLeave = mutation({
  args: {
    leaveId: v.id("leaves"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get the leave request
    const leave = await ctx.db.get(args.leaveId);
    if (!leave) {
      throw new Error("Leave request not found");
    }
    
    // Verify ownership or admin/manager
    if (leave.userId !== user._id && 
        user.role !== "admin" && 
        user.role !== "manager") {
      throw new Error("Unauthorized to cancel this leave request");
    }
    
    if (leave.status !== "pending" && leave.status !== "approved") {
      throw new Error(`Cannot cancel leave that is ${leave.status}`);
    }
    
    // Check if leave has already started
    if (leave.status === "approved" && leave.startDate <= Date.now()) {
      throw new Error("Cannot cancel leave that has already started");
    }
    
    // Update leave status
    const now = Date.now();
    const comments = [...leave.comments];
    
    if (args.reason) {
      comments.push({
        userId: user._id,
        text: `Cancellation reason: ${args.reason}`,
        at: now,
      });
    }
    
    await ctx.db.patch(args.leaveId, {
      status: "canceled",
      comments,
      updatedAt: now,
    });
    
    // If leave was approved, restore the leave balance
    if (leave.status === "approved") {
      // Calculate number of days
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      
      // Adjust for partial days
      let daysToRestore = daysDiff;
      if (leave.partial) {
        daysToRestore -= 0.5;
      }
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Get leave balance
      const leaveBalance = await ctx.db
        .query("leaveBalances")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), leave.userId),
            q.eq(q.field("year"), currentYear),
            q.eq(q.field("type"), leave.type)
          )
        )
        .first();
      
      if (leaveBalance) {
        // Update balance
        await ctx.db.patch(leaveBalance._id, {
          used: Math.max(0, leaveBalance.used - daysToRestore),
          remaining: leaveBalance.remaining + daysToRestore,
          updatedAt: now,
        });
      }
    }
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "leave_canceled",
      target: {
        type: "leaves",
        id: args.leaveId,
      },
      metadata: {
        leaveType: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
      },
      at: now,
    });
    
    return { success: true };
  },
});

// Add comment to leave request
export const addLeaveComment = mutation({
  args: {
    leaveId: v.id("leaves"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get the leave request
    const leave = await ctx.db.get(args.leaveId);
    if (!leave) {
      throw new Error("Leave request not found");
    }
    
    // Verify permissions (user's own leave or admin/manager)
    if (leave.userId !== user._id && 
        user.role !== "admin" && 
        user.role !== "manager") {
      throw new Error("Unauthorized to comment on this leave request");
    }
    
    // Add comment
    const now = Date.now();
    const comments = [...leave.comments, {
      userId: user._id,
      text: args.text,
      at: now,
    }];
    
    await ctx.db.patch(args.leaveId, {
      comments,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

// Get user's leave requests
export const getUserLeaves = query({
  args: {
    userId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await getCurrentUser(ctx);
    
    // Determine which user's leaves to fetch
    const targetUserId = args.userId || currentUser._id;
    
    // If requesting another user's leaves, verify permissions
    if (targetUserId !== currentUser._id && 
        currentUser.role !== "admin" && 
        currentUser.role !== "manager") {
      throw new Error("Unauthorized to view other users' leave requests");
    }
    
    // Build query
    let leavesQuery = ctx.db
      .query("leaves")
      .filter((q) => q.eq(q.field("userId"), targetUserId))
      .order("desc");
    
    // Apply status filter if provided
    if (args.status) {
      leavesQuery = leavesQuery.filter((q) => 
        q.eq(q.field("status"), args.status)
      );
    }
    
    // Apply date filters if provided
    if (args.startDate) {
      leavesQuery = leavesQuery.filter((q) => 
        q.gte(q.field("startDate"), args.startDate!)
      );
    }
    
    if (args.endDate) {
      leavesQuery = leavesQuery.filter((q) => 
        q.lte(q.field("endDate"), args.endDate!)
      );
    }
    
    const leaves = await leavesQuery.collect();
    
    // Get user details for each leave
    const userIds = [...new Set(leaves.map(leave => leave.userId))];
    const users = await Promise.all(
      userIds.map(userId => ctx.db.get(userId))
    );
    
    // Get approver details for each leave
    const approverIds = [...new Set(leaves
      .filter(leave => leave.approverId)
      .map(leave => leave.approverId!))];
    const approvers = await Promise.all(
      approverIds.map(approverId => ctx.db.get(approverId))
    );
    
    // Combine leave and user data
    return leaves.map(leave => {
      const leaveUser = users.find(u => u?._id === leave.userId);
      const approver = leave.approverId ? 
        approvers.find(a => a?._id === leave.approverId) : null;
      
      return {
        ...leave,
        user: leaveUser,
        approver,
      };
    });
  },
});

// Get all pending leave requests (admin/manager only)
export const getPendingLeaves = query({
  handler: async (ctx) => {
    // Get current user and verify permissions
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized. Only admins and managers can view all pending leave requests.");
    }
    
    // Get pending leaves
    const pendingLeaves = await ctx.db
      .query("leaves")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("asc")
      .collect();
    
    // Get user details for each leave
    const userIds = [...new Set(pendingLeaves.map(leave => leave.userId))];
    const users = await Promise.all(
      userIds.map(userId => ctx.db.get(userId))
    );
    
    // Combine leave and user data
    return pendingLeaves.map(leave => {
      const leaveUser = users.find(u => u?._id === leave.userId);
      
      return {
        ...leave,
        user: leaveUser,
      };
    });
  },
});

// Get user's leave balances
export const getUserLeaveBalances = query({
  args: {
    userId: v.optional(v.id("users")),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await getCurrentUser(ctx);
    
    // Determine which user's balances to fetch
    const targetUserId = args.userId || currentUser._id;
    
    // If requesting another user's balances, verify permissions
    if (targetUserId !== currentUser._id && 
        currentUser.role !== "admin" && 
        currentUser.role !== "manager") {
      throw new Error("Unauthorized to view other users' leave balances");
    }
    
    // Determine year
    const year = args.year || new Date().getFullYear();
    
    // Get leave balances
    const balances = await ctx.db
      .query("leaveBalances")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), targetUserId),
          q.eq(q.field("year"), year)
        )
      )
      .collect();
    
    return balances;
  },
});