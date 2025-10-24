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

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    parentTaskId: v.optional(v.id("tasks")),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user can create tasks in this project
    const isAdmin = user.role === "admin";
    const isManager = user.role === "manager";
    const isProjectMember = project.members.includes(user._id);
    
    if (!isAdmin && !isManager && !isProjectMember) {
      throw new Error("Unauthorized to create tasks in this project");
    }
    
    // If parent task is specified, verify it exists
    if (args.parentTaskId) {
      const parentTask = await ctx.db.get(args.parentTaskId);
      if (!parentTask) {
        throw new Error("Parent task not found");
      }
      
      // Verify parent task belongs to the same project
      if (parentTask.projectId !== args.projectId) {
        throw new Error("Parent task must belong to the same project");
      }
    }
    
    // Create task
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description || "",
      projectId: args.projectId,
      creatorId: user._id,
      assigneeId: args.assigneeId,
      status: "backlog", // Default status
      priority: args.priority || "medium",
      estimatedHours: args.estimatedHours,
      actualHours: 0,
      dueDate: args.dueDate,
      parentTaskId: args.parentTaskId,
      attachments: args.attachments || [],
      subtasks: [],
      comments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // If this is a subtask, update parent task
    if (args.parentTaskId) {
      const parentTask = await ctx.db.get(args.parentTaskId);
      if (parentTask) {
        const subtasks = [...(parentTask.subtasks || []), taskId];
        await ctx.db.patch(args.parentTaskId, { subtasks });
      }
    }
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "create_task",
      target: {
        type: "tasks",
        id: taskId,
      },
      metadata: {
        title: args.title,
        projectId: args.projectId,
      },
      at: Date.now(),
    });
    
    return { success: true, taskId };
  },
});

// Update task
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    assigneeId: v.optional(v.id("users")),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get task
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Get project
    const project = await ctx.db.get(task.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check permissions
    const isAdmin = user.role === "admin";
    const isManager = user.role === "manager";
    const isCreator = task.creatorId === user._id;
    const isAssignee = task.assigneeId === user._id;
    const isProjectMember = project.members.includes(user._id);
    
    // Only project members, task creator, assignee, or admins/managers can update
    if (!isAdmin && !isManager && !isCreator && !isAssignee && !isProjectMember) {
      throw new Error("Unauthorized to update this task");
    }
    
    // Build update object
    const updateData: any = { updatedAt: Date.now() };
    
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.assigneeId !== undefined) updateData.assigneeId = args.assigneeId;
    if (args.priority !== undefined) updateData.priority = args.priority;
    if (args.dueDate !== undefined) updateData.dueDate = args.dueDate;
    if (args.estimatedHours !== undefined) updateData.estimatedHours = args.estimatedHours;
    if (args.attachments !== undefined) updateData.attachments = args.attachments;
    
    // Update task
    await ctx.db.patch(args.taskId, updateData);
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "update_task",
      target: {
        type: "tasks",
        id: args.taskId,
      },
      metadata: {
        updates: Object.keys(updateData).filter(key => key !== "updatedAt"),
      },
      at: Date.now(),
    });
    
    return { success: true };
  },
});

// Add comment to task
export const addTaskComment = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
    mentions: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get task
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Get project
    const project = await ctx.db.get(task.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user can comment on this task
    const isProjectMember = project.members.includes(user._id);
    if (!isProjectMember && user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized to comment on this task");
    }
    
    // Create comment
    const comment = {
      id: Date.now().toString(), // Simple unique ID
      authorId: user._id,
      content: args.content,
      mentions: args.mentions || [],
      createdAt: Date.now(),
    };
    
    // Update task with new comment
    const comments = [...(task.comments || []), comment];
    await ctx.db.patch(args.taskId, { comments });
    
    // Create notifications for mentioned users
    if (args.mentions && args.mentions.length > 0) {
      for (const mentionedUserId of args.mentions) {
        await ctx.db.insert("notifications", {
          userId: mentionedUserId,
          type: "mention",
          title: "You were mentioned in a task comment",
          content: `${user.name} mentioned you in a comment on task "${task.title}"`,
          read: false,
          data: {
            taskId: args.taskId,
            projectId: task.projectId,
            commentId: comment.id,
          },
          createdAt: Date.now(),
        });
      }
    }
    
    return { success: true, commentId: comment.id };
  },
});

// Log time on task
export const logTimeOnTask = mutation({
  args: {
    taskId: v.id("tasks"),
    hours: v.number(),
    description: v.optional(v.string()),
    date: v.optional(v.number()), // Timestamp for the date of work
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get task
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Get project
    const project = await ctx.db.get(task.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user can log time on this task
    const isProjectMember = project.members.includes(user._id);
    const isAssignee = task.assigneeId === user._id;
    
    if (!isProjectMember && !isAssignee && user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized to log time on this task");
    }
    
    // Create time entry
    const timeEntryId = await ctx.db.insert("timeEntries", {
      userId: user._id,
      taskId: args.taskId,
      projectId: task.projectId,
      hours: args.hours,
      description: args.description || "",
      date: args.date || Date.now(),
      billable: project.billable || false,
      rate: project.ratePerHour,
      createdAt: Date.now(),
    });
    
    // Update task's actual hours
    const actualHours = (task.actualHours || 0) + args.hours;
    await ctx.db.patch(args.taskId, { actualHours });
    
    return { success: true, timeEntryId };
  },
});

// Get tasks by project
export const getTasksByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user can view tasks in this project
    const isProjectMember = project.members.includes(user._id);
    if (!isProjectMember && user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized to view tasks in this project");
    }
    
    // Build query
    let tasksQuery = ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("projectId"), args.projectId));
    
    // Filter by status if provided
    if (args.status) {
      tasksQuery = tasksQuery.filter((q) => 
        q.eq(q.field("status"), args.status)
      );
    }
    
    // Get tasks
    const tasks = await tasksQuery.collect();
    
    // Get user details for creators and assignees
    const userIds = new Set<Id<"users">>();
    tasks.forEach(task => {
      if (task.creatorId) userIds.add(task.creatorId);
      if (task.assigneeId) userIds.add(task.assigneeId);
      
      // Add comment authors
      if (task.comments) {
        task.comments.forEach((comment: any) => {
          if (comment.authorId) userIds.add(comment.authorId);
        });
      }
    });
    
    const users = await Promise.all(
      Array.from(userIds).map(userId => ctx.db.get(userId))
    );
    
    // Map users to tasks
    return tasks.map(task => {
      const creator = users.find(u => u?._id === task.creatorId);
      const assignee = users.find(u => u?._id === task.assigneeId);
      
      // Map comment authors
      const comments = task.comments ? task.comments.map((comment: any) => {
        const author = users.find(u => u?._id === comment.authorId);
        return {
          ...comment,
          author,
        };
      }) : [];
      
      return {
        ...task,
        creator,
        assignee,
        comments,
      };
    });
  },
});

// Get task by ID
export const getTaskById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get task
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Get project
    const project = await ctx.db.get(task.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user can view this task
    const isProjectMember = project.members.includes(user._id);
    if (!isProjectMember && user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized to view this task");
    }
    
    // Get creator and assignee details
    const creator = task.creatorId ? await ctx.db.get(task.creatorId) : null;
    const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
    
    // Get parent task if exists
    const parentTask = task.parentTaskId ? await ctx.db.get(task.parentTaskId) : null;
    
    // Get subtasks if any
    const subtasks = task.subtasks && task.subtasks.length > 0
      ? await Promise.all(task.subtasks.map((subtaskId: Id<"tasks">) => ctx.db.get(subtaskId)))
      : [];
    
    // Get time entries for this task
    const timeEntries = await ctx.db
      .query("timeEntries")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .collect();
    
    // Get user details for comment authors
    const commentAuthorIds = new Set<Id<"users">>();
    if (task.comments) {
      task.comments.forEach((comment: any) => {
        if (comment.authorId) commentAuthorIds.add(comment.authorId);
      });
    }
    
    const commentAuthors = await Promise.all(
      Array.from(commentAuthorIds).map(userId => ctx.db.get(userId))
    );
    
    // Map comment authors
    const comments = task.comments ? task.comments.map((comment: any) => {
      const author = commentAuthors.find(u => u?._id === comment.authorId);
      return {
        ...comment,
        author,
      };
    }) : [];
    
    // Get time entry users
    const timeEntryUserIds = new Set<Id<"users">>();
    timeEntries.forEach(entry => {
      if (entry.userId) timeEntryUserIds.add(entry.userId);
    });
    
    const timeEntryUsers = await Promise.all(
      Array.from(timeEntryUserIds).map(userId => ctx.db.get(userId))
    );
    
    // Map users to time entries
    const mappedTimeEntries = timeEntries.map(entry => {
      const entryUser = timeEntryUsers.find(u => u?._id === entry.userId);
      return {
        ...entry,
        user: entryUser,
      };
    });
    
    return {
      ...task,
      creator,
      assignee,
      parentTask,
      subtasks: subtasks.filter(Boolean), // Filter out any null values
      comments,
      timeEntries: mappedTimeEntries,
      project,
    };
  },
});

// Get tasks assigned to user
export const getUserTasks = query({
  args: {
    userId: v.optional(v.id("users")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await getCurrentUser(ctx);
    
    // Determine which user's tasks to fetch
    const targetUserId = args.userId || currentUser._id;
    
    // If requesting another user's tasks, verify permissions
    if (targetUserId !== currentUser._id && 
        currentUser.role !== "admin" && 
        currentUser.role !== "manager") {
      throw new Error("Unauthorized to view other users' tasks");
    }
    
    // Build query
    let tasksQuery = ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("assigneeId"), targetUserId));
    
    // Filter by status if provided
    if (args.status) {
      tasksQuery = tasksQuery.filter((q) => 
        q.eq(q.field("status"), args.status)
      );
    }
    
    // Get tasks
    const tasks = await tasksQuery.collect();
    
    // Get project details
    const projectIds = [...new Set(tasks.map(task => task.projectId))];
    const projects = await Promise.all(
      projectIds.map(projectId => ctx.db.get(projectId))
    );
    
    // Map projects to tasks
    return tasks.map(task => {
      const project = projects.find(p => p?._id === task.projectId);
      
      return {
        ...task,
        project,
      };
    });
  },
});