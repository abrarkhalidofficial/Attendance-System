import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { z } from "zod";

const dateRangeSchema = z.object({
  startDate: z.number().optional(),
  endDate: z.number().optional(),
});

const requireManagerOrAdmin = async (ctx: any, currentUser?: any) => {
  // Try to resolve current user if not provided
  if (!currentUser) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
  }
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "manager")) {
    throw new Error("Unauthorized. Admin or manager required");
  }
  return currentUser;
};

export const attendanceHeatmap = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    dateRangeSchema.parse(args);

    let sessionsQuery = ctx.db.query("attendanceSessions");
    if (args.startDate) {
      sessionsQuery = sessionsQuery.filter((q) => q.gte(q.field("clockInAt"), args.startDate!));
    }
    if (args.endDate) {
      sessionsQuery = sessionsQuery.filter((q) => q.lte(q.field("clockInAt"), args.endDate!));
    }
    const sessions = await sessionsQuery.collect();

    const buckets = new Map<string, number>();
    for (const s of sessions) {
      const d = new Date(s.clockInAt);
      const dow = d.getDay();
      const hour = d.getHours();
      const key = `${dow}:${hour}`;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const heatmap: { dow: number; hour: number; count: number }[] = [];
    for (let dow = 0; dow < 7; dow++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${dow}:${hour}`;
        heatmap.push({ dow, hour, count: buckets.get(key) || 0 });
      }
    }
    return heatmap;
  },
});

export const hoursPerUserProject = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    dateRangeSchema.parse(args);

    let entriesQuery = ctx.db.query("timeEntries");
    if (args.startDate) entriesQuery = entriesQuery.filter((q) => q.gte(q.field("startedAt"), args.startDate!));
    if (args.endDate) entriesQuery = entriesQuery.filter((q) => q.lte(q.field("startedAt"), args.endDate!));
    const entries = await entriesQuery.collect();

    const group = new Map<string, { userId: Id<"users">; projectId?: Id<"projects">; hours: number }>();
    for (const e of entries) {
      const key = `${e.userId}:${e.projectId ?? "none"}`;
      const durSec = e.durationSec ?? (e.endedAt ? Math.floor((e.endedAt - e.startedAt) / 1000) : 0);
      const prev = group.get(key) || { userId: e.userId, projectId: e.projectId, hours: 0 };
      prev.hours += durSec / 3600;
      group.set(key, prev);
    }
    const userIds = Array.from(new Set(Array.from(group.values()).map((g) => g.userId)));
    const projectIds = Array.from(new Set(Array.from(group.values()).map((g) => g.projectId).filter(Boolean))) as Id<"projects">[];
    const [users, projects] = await Promise.all([
      Promise.all(userIds.map((id) => ctx.db.get(id))),
      Promise.all(projectIds.map((id) => ctx.db.get(id))),
    ]);

    return Array.from(group.values()).map((g) => {
      const u = users.find((uu) => uu?._id === g.userId);
      const p = g.projectId ? projects.find((pp) => pp?._id === g.projectId) : undefined;
      return {
        userId: g.userId,
        userName: u?.name ?? "Unknown",
        projectId: g.projectId ?? null,
        projectName: p?.name ?? (g.projectId ? "Unknown" : "No Project"),
        hours: Number(g.hours.toFixed(2)),
      };
    });
  },
});

export const overtimeReport = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    dateRangeSchema.parse(args);

    // Determine threshold from policy or default 8 hours
    const policy = await ctx.db.query("attendancePolicies").first();
    const threshold = policy?.overtimeAfterHours ?? 8;

    let entriesQuery = ctx.db.query("timeEntries");
    if (args.startDate) entriesQuery = entriesQuery.filter((q) => q.gte(q.field("startedAt"), args.startDate!));
    if (args.endDate) entriesQuery = entriesQuery.filter((q) => q.lte(q.field("startedAt"), args.endDate!));
    const entries = await entriesQuery.collect();

    // Group by user + calendar day
    const group = new Map<string, { userId: Id<"users">; date: string; hours: number }>();
    for (const e of entries) {
      const d = new Date(e.startedAt);
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const key = `${e.userId}:${dateKey}`;
      const durSec = e.durationSec ?? (e.endedAt ? Math.floor((e.endedAt - e.startedAt) / 1000) : 0);
      const prev = group.get(key) || { userId: e.userId, date: dateKey, hours: 0 };
      prev.hours += durSec / 3600;
      group.set(key, prev);
    }

    const userIds = Array.from(new Set(Array.from(group.values()).map((g) => g.userId)));
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    return Array.from(group.values())
      .filter((g) => g.hours > threshold)
      .map((g) => ({
        userId: g.userId,
        userName: users.find((u) => u?._id === g.userId)?.name ?? "Unknown",
        date: g.date,
        hours: Number(g.hours.toFixed(2)),
        overtimeHours: Number((g.hours - threshold).toFixed(2)),
      }));
  },
});

export const leaveUtilization = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    const year = args.year ?? new Date().getFullYear();

    const balances = await ctx.db.query("leaveBalances").collect();
    const byUser = new Map<Id<"users">, { accrued: number; used: number }>();
    for (const b of balances.filter((bb) => bb.year === year)) {
      const prev = byUser.get(b.userId) || { accrued: 0, used: 0 };
      prev.accrued += b.accrued;
      prev.used += b.used;
      byUser.set(b.userId, prev);
    }

    const userIds = Array.from(byUser.keys());
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    return userIds.map((uid) => {
      const u = users.find((uu) => uu?._id === uid);
      const stats = byUser.get(uid)!;
      const utilization = stats.accrued > 0 ? Number(((stats.used / stats.accrued) * 100).toFixed(1)) : 0;
      return {
        userId: uid,
        userName: u?.name ?? "Unknown",
        accrued: stats.accrued,
        used: stats.used,
        remaining: Number((stats.accrued - stats.used).toFixed(2)),
        utilizationPct: utilization,
      };
    });
  },
});

export const missingClockOuts = query({
  args: { maxHours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    const maxHours = args.maxHours ?? 10; // consider missing after 10 hours

    const activeSessions = await ctx.db
      .query("attendanceSessions")
      .filter((q) => q.eq(q.field("clockOutAt"), undefined))
      .collect();

    const now = Date.now();
    const offenders = activeSessions.filter((s) => (now - s.clockInAt) / 3600000 > maxHours);

    const users = await Promise.all(offenders.map((s) => ctx.db.get(s.userId)));
    return offenders.map((s) => ({
      sessionId: s._id,
      userId: s.userId,
      userName: users.find((u) => u?._id === s.userId)?.name ?? "Unknown",
      clockInAt: s.clockInAt,
      hoursSinceClockIn: Number(((now - s.clockInAt) / 3600000).toFixed(2)),
    }));
  },
});

export const payrollData = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await requireManagerOrAdmin(ctx);
    z.object({ startDate: z.number(), endDate: z.number(), projectId: z.any().optional() }).parse(args);

    let entriesQuery = ctx.db.query("timeEntries");
    entriesQuery = entriesQuery.filter((q) => q.gte(q.field("startedAt"), args.startDate));
    entriesQuery = entriesQuery.filter((q) => q.lte(q.field("startedAt"), args.endDate));
    if (args.projectId) entriesQuery = entriesQuery.filter((q) => q.eq(q.field("projectId"), args.projectId!));

    const entries = await entriesQuery.collect();

    const group = new Map<string, { userId: Id<"users">; projectId?: Id<"projects">; hours: number }>();
    for (const e of entries) {
      const key = `${e.userId}:${e.projectId ?? "none"}`;
      const durSec = e.durationSec ?? (e.endedAt ? Math.floor((e.endedAt - e.startedAt) / 1000) : 0);
      const prev = group.get(key) || { userId: e.userId, projectId: e.projectId, hours: 0 };
      prev.hours += durSec / 3600;
      group.set(key, prev);
    }

    const userIds = Array.from(new Set(Array.from(group.values()).map((g) => g.userId)));
    const projectIds = Array.from(new Set(Array.from(group.values()).map((g) => g.projectId).filter(Boolean))) as Id<"projects">[];
    const [users, projects] = await Promise.all([
      Promise.all(userIds.map((id) => ctx.db.get(id))),
      Promise.all(projectIds.map((id) => ctx.db.get(id))),
    ]);

    return Array.from(group.values()).map((g) => {
      const u = users.find((uu) => uu?._id === g.userId);
      const p = g.projectId ? projects.find((pp) => pp?._id === g.projectId) : undefined;
      return {
        userId: g.userId,
        userName: u?.name ?? "Unknown",
        projectId: g.projectId ?? null,
        projectName: p?.name ?? (g.projectId ? "Unknown" : "No Project"),
        hours: Number(g.hours.toFixed(2)),
      };
    });
  },
});