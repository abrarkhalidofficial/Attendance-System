import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(), // In production, this should be hashed
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("employee")),
    avatar: v.optional(v.string()),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    isActive: v.boolean(),
    faceEmbedding: v.optional(v.array(v.number())),
    locationOptIn: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  attendanceSessions: defineTable({
    userId: v.id("users"),
    clockIn: v.string(),
    clockOut: v.optional(v.string()),
    deviceFingerprint: v.string(),
    ipAddress: v.string(),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      accuracy: v.number(),
      timestamp: v.string(),
    })),
    notes: v.optional(v.string()),
    faceVerified: v.boolean(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("missed-clockout")
    ),
    totalHours: v.optional(v.number()),
    isRemote: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  leaveTypes: defineTable({
    name: v.string(),
    color: v.string(),
    defaultBalance: v.number(),
  }),

  leaveRequests: defineTable({
    userId: v.id("users"),
    leaveTypeId: v.id("leaveTypes"),
    startDate: v.string(),
    endDate: v.string(),
    isHalfDay: v.boolean(),
    reason: v.string(),
    attachments: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_leaveType", ["leaveTypeId"]),

  leaveComments: defineTable({
    leaveRequestId: v.id("leaveRequests"),
    userId: v.id("users"),
    text: v.string(),
  })
    .index("by_leaveRequest", ["leaveRequestId"]),

  leaveBalances: defineTable({
    userId: v.id("users"),
    leaveTypeId: v.id("leaveTypes"),
    balance: v.number(),
    used: v.number(),
    carryover: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_leaveType", ["userId", "leaveTypeId"]),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    client: v.optional(v.string()),
    isBillable: v.boolean(),
    hourlyRate: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    createdBy: v.id("users"),
    teamMembers: v.array(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("in-progress"),
      v.literal("blocked"),
      v.literal("on-hold"),
      v.literal("done")
    ),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    estimatedHours: v.optional(v.number()),
    actualHours: v.number(),
    dueDate: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    attachments: v.optional(v.array(v.string())),
    subtasks: v.array(v.object({
      id: v.string(),
      title: v.string(),
      completed: v.boolean(),
    })),
  })
    .index("by_projectId", ["projectId"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_status", ["status"]),

  timeEntries: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    sessionId: v.optional(v.id("attendanceSessions")),
    hours: v.number(),
    description: v.optional(v.string()),
    date: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"])
    .index("by_date", ["date"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_entityType", ["entityType"]),

  notifications: defineTable({
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
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_read", ["read"]),

  companySettings: defineTable({
    allowSelfRegistration: v.boolean(),
    requireFaceVerification: v.boolean(),
    enableGeofencing: v.boolean(),
    officeLocations: v.array(v.object({
      id: v.string(),
      name: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      radius: v.number(),
    })),
    overtimeRules: v.object({
      dailyThreshold: v.number(),
      weeklyThreshold: v.number(),
      multiplier: v.number(),
    }),
    workingHoursPerDay: v.number(),
    workingDaysPerWeek: v.number(),
  }),
});