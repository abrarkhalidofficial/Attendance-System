import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Time Entries
export const getTimeEntries = query({
  handler: async (ctx) => {
    return await ctx.db.query("timeEntries").collect();
  },
});

export const getTimeEntriesByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getTimeEntriesByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timeEntries")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getTimeEntriesByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timeEntries")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

export const getTimeEntriesByDateRange = query({
  args: {
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("timeEntries");
    
    if (args.userId) {
      query = query.withIndex("by_userId", (q) => q.eq("userId", args.userId));
    } else if (args.projectId) {
      query = query.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId));
    }

    const entries = await query.collect();
    
    return entries.filter(entry => {
      return entry.date >= args.startDate && entry.date <= args.endDate;
    });
  },
});

export const createTimeEntry = mutation({
  args: {
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    sessionId: v.optional(v.id("attendanceSessions")),
    hours: v.number(),
    description: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Update task actual hours if taskId is provided
    if (args.taskId) {
      const task = await ctx.db.get(args.taskId);
      if (task) {
        await ctx.db.patch(args.taskId, {
          actualHours: task.actualHours + args.hours,
        });
      }
    }

    return await ctx.db.insert("timeEntries", args);
  },
});

export const updateTimeEntry = mutation({
  args: {
    id: v.id("timeEntries"),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    sessionId: v.optional(v.id("attendanceSessions")),
    hours: v.optional(v.number()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // If hours are being updated, adjust task actual hours
    if (updates.hours !== undefined) {
      const currentEntry = await ctx.db.get(id);
      if (currentEntry && currentEntry.taskId) {
        const task = await ctx.db.get(currentEntry.taskId);
        if (task) {
          const hoursDifference = updates.hours - currentEntry.hours;
          await ctx.db.patch(currentEntry.taskId, {
            actualHours: task.actualHours + hoursDifference,
          });
        }
      }
    }

    return await ctx.db.patch(id, updates);
  },
});

export const deleteTimeEntry = mutation({
  args: { id: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.id);
    
    // Subtract hours from task if applicable
    if (entry && entry.taskId) {
      const task = await ctx.db.get(entry.taskId);
      if (task) {
        await ctx.db.patch(entry.taskId, {
          actualHours: Math.max(0, task.actualHours - entry.hours),
        });
      }
    }

    return await ctx.db.delete(args.id);
  },
});

// Time tracking statistics
export const getTimeStatsByUser = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const filteredEntries = entries.filter(entry => {
      return entry.date >= args.startDate && entry.date <= args.endDate;
    });

    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const entriesCount = filteredEntries.length;
    const averageHoursPerDay = entriesCount > 0 ? totalHours / entriesCount : 0;

    // Group by project
    const projectStats = filteredEntries.reduce((acc, entry) => {
      if (entry.projectId) {
        if (!acc[entry.projectId]) {
          acc[entry.projectId] = { hours: 0, entries: 0 };
        }
        acc[entry.projectId].hours += entry.hours;
        acc[entry.projectId].entries += 1;
      }
      return acc;
    }, {} as Record<string, { hours: number; entries: number }>);

    return {
      totalHours,
      entriesCount,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      projectStats,
    };
  },
});

export const getTimeStatsByProject = query({
  args: {
    projectId: v.id("projects"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredEntries = entries.filter(entry => {
      return entry.date >= args.startDate && entry.date <= args.endDate;
    });

    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const entriesCount = filteredEntries.length;

    // Group by user
    const userStats = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.userId]) {
        acc[entry.userId] = { hours: 0, entries: 0 };
      }
      acc[entry.userId].hours += entry.hours;
      acc[entry.userId].entries += 1;
      return acc;
    }, {} as Record<string, { hours: number; entries: number }>);

    return {
      totalHours,
      entriesCount,
      userStats,
    };
  },
});