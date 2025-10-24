import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Projects
export const getProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

export const getProjectById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getProjectsByStatus = query({
  args: { status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getProjectsByCreator = query({
  args: { createdBy: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.createdBy))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    client: v.optional(v.string()),
    isBillable: v.boolean(),
    hourlyRate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("archived"))),
    createdBy: v.id("users"),
    teamMembers: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      client: args.client,
      isBillable: args.isBillable,
      hourlyRate: args.hourlyRate,
      status: args.status ?? "active",
      createdBy: args.createdBy,
      teamMembers: args.teamMembers ?? [],
    });
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    client: v.optional(v.string()),
    isBillable: v.optional(v.boolean()),
    hourlyRate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("archived"))),
    teamMembers: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Archive project instead of deleting
    return await ctx.db.patch(args.id, { status: "archived" });
  },
});

export const addTeamMember = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.teamMembers.includes(args.userId)) {
      throw new Error("User is already a team member");
    }

    return await ctx.db.patch(args.projectId, {
      teamMembers: [...project.teamMembers, args.userId],
    });
  },
});

export const removeTeamMember = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    return await ctx.db.patch(args.projectId, {
      teamMembers: project.teamMembers.filter(id => id !== args.userId),
    });
  },
});

// Tasks
export const getTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getTaskById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTasksByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getTasksByAssignee = query({
  args: { assignedTo: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo))
      .collect();
  },
});

export const getTasksByStatus = query({
  args: { 
    status: v.union(
      v.literal("backlog"),
      v.literal("in-progress"),
      v.literal("blocked"),
      v.literal("on-hold"),
      v.literal("done")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("backlog"),
      v.literal("in-progress"),
      v.literal("blocked"),
      v.literal("on-hold"),
      v.literal("done")
    )),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    estimatedHours: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      status: args.status ?? "backlog",
      assignedTo: args.assignedTo,
      createdBy: args.createdBy,
      estimatedHours: args.estimatedHours,
      actualHours: 0,
      dueDate: args.dueDate,
      priority: args.priority ?? "medium",
      attachments: args.attachments ?? [],
      subtasks: [],
    });
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("backlog"),
      v.literal("in-progress"),
      v.literal("blocked"),
      v.literal("on-hold"),
      v.literal("done")
    )),
    assignedTo: v.optional(v.id("users")),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    attachments: v.optional(v.array(v.string())),
    subtasks: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      completed: v.boolean(),
    }))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const addSubtask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const newSubtask = {
      id: crypto.randomUUID(),
      title: args.title,
      completed: false,
    };

    return await ctx.db.patch(args.taskId, {
      subtasks: [...task.subtasks, newSubtask],
    });
  },
});

export const updateSubtask = mutation({
  args: {
    taskId: v.id("tasks"),
    subtaskId: v.string(),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const updatedSubtasks = task.subtasks.map(subtask => {
      if (subtask.id === args.subtaskId) {
        return {
          ...subtask,
          title: args.title ?? subtask.title,
          completed: args.completed ?? subtask.completed,
        };
      }
      return subtask;
    });

    return await ctx.db.patch(args.taskId, {
      subtasks: updatedSubtasks,
    });
  },
});

export const deleteSubtask = mutation({
  args: {
    taskId: v.id("tasks"),
    subtaskId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== args.subtaskId);

    return await ctx.db.patch(args.taskId, {
      subtasks: updatedSubtasks,
    });
  },
});