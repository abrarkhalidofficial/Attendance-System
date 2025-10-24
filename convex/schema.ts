import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users collection
  users: defineTable({
    authId: v.optional(v.string()),
    email: v.string(),
    password: v.string(), // In production, use proper password hashing
    name: v.string(),
    role: v.string(), // "admin", "manager", or "employee"
    status: v.string(), // "active" or "inactive"
    avatarStorageId: v.optional(v.string()),
    faceEmbedding: v.optional(v.array(v.number())),
    faceConsentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // Profiles collection
  profiles: defineTable({
    userId: v.id("users"),
    phone: v.optional(v.string()),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    locationPrefs: v.optional(v.any()),
    workSchedule: v.object({
      tz: v.string(),
      weekTemplate: v.any(),
    }),
    emergencyContact: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Attendance Sessions collection
  attendanceSessions: defineTable({
    userId: v.id("users"),
    clockInAt: v.number(),
    clockOutAt: v.optional(v.number()),
    durationSec: v.optional(v.number()),
    method: v.string(), // "web", "mobile", or "kiosk"
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
    closedByAdminId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Attendance Policies collection
  attendancePolicies: defineTable({
    orgId: v.optional(v.string()),
    overtimeAfterHours: v.optional(v.number()),
    graceMinutes: v.optional(v.number()),
    geofences: v.optional(v.array(v.object({
      name: v.string(),
      center: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      radiusM: v.number(),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Leaves collection
  leaves: defineTable({
    userId: v.id("users"),
    type: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    partial: v.optional(v.string()), // "AM" or "PM"
    reason: v.string(),
    status: v.string(), // "pending", "approved", "rejected", or "canceled"
    approverId: v.optional(v.id("users")),
    comments: v.array(v.object({
      userId: v.id("users"),
      text: v.string(),
      at: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Leave Balances collection
  leaveBalances: defineTable({
    userId: v.id("users"),
    year: v.number(),
    type: v.string(),
    accrued: v.number(),
    used: v.number(),
    remaining: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId_year_type", ["userId", "year", "type"]),

  // Projects collection
  projects: defineTable({
    name: v.string(),
    code: v.string(),
    client: v.optional(v.string()),
    billable: v.optional(v.boolean()),
    ratePerHour: v.optional(v.number()),
    ownerId: v.id("users"),
    members: v.array(v.id("users")),
    status: v.string(), // "active" or "archived"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),

  // Tasks collection
  tasks: defineTable({
    projectId: v.id("projects"),
    creatorId: v.id("users"),
    assignees: v.array(v.id("users")),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    dueAt: v.optional(v.number()),
    estimateHrs: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_projectId", ["projectId"]),

  // Time Entries collection
  timeEntries: defineTable({
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
    sessionId: v.optional(v.id("attendanceSessions")),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationSec: v.optional(v.number()),
    note: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Notifications collection
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    payload: v.any(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Audit Logs collection
  auditLogs: defineTable({
    actorId: v.id("users"),
    action: v.string(),
    target: v.object({
      type: v.string(),
      id: v.string(),
    }),
    metadata: v.any(),
    at: v.number(),
  }).index("by_actorId", ["actorId"]),

  // Organization Settings collection
  orgSettings: defineTable({
    name: v.string(),
    locale: v.string(),
    tzDefault: v.string(),
    workDays: v.array(v.string()),
    holidays: v.array(v.number()),
    emailFrom: v.string(),
    policiesRefs: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});