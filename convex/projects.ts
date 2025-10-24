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

// Create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    client: v.optional(v.string()),
    billable: v.optional(v.boolean()),
    ratePerHour: v.optional(v.number()),
    members: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get current user and verify permissions
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin" && user.role !== "manager") {
      throw new Error("Unauthorized. Only admins and managers can create projects.");
    }
    
    // Create project
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      code: args.code,
      client: args.client,
      billable: args.billable,
      ratePerHour: args.ratePerHour,
      ownerId: user._id,
      members: [...args.members, user._id], // Include creator in members
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "create_project",
      target: {
        type: "projects",
        id: projectId,
      },
      metadata: {
        name: args.name,
        code: args.code,
      },
      at: Date.now(),
    });
    
    return { success: true, projectId };
  },
});

// Update project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    client: v.optional(v.string()),
    billable: v.optional(v.boolean()),
    ratePerHour: v.optional(v.number()),
    members: v.optional(v.array(v.id("users"))),
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
    
    // Verify permissions (owner, admin, or manager)
    if (project.ownerId !== user._id && 
        user.role !== "admin" && 
        user.role !== "manager") {
      throw new Error("Unauthorized to update this project");
    }
    
    // Build update object
    const updateData: any = { updatedAt: Date.now() };
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.code !== undefined) updateData.code = args.code;
    if (args.client !== undefined) updateData.client = args.client;
    if (args.billable !== undefined) updateData.billable = args.billable;
    if (args.ratePerHour !== undefined) updateData.ratePerHour = args.ratePerHour;
    if (args.members !== undefined) updateData.members = args.members;
    if (args.status !== undefined) updateData.status = args.status;
    
    // Update project
    await ctx.db.patch(args.projectId, updateData);
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "update_project",
      target: {
        type: "projects",
        id: args.projectId,
      },
      metadata: {
        updates: Object.keys(updateData).filter(key => key !== "updatedAt"),
      },
      at: Date.now(),
    });
    
    return { success: true };
  },
});

// Archive project
export const archiveProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Verify permissions (owner, admin, or manager)
    if (project.ownerId !== user._id && 
        user.role !== "admin" && 
        user.role !== "manager") {
      throw new Error("Unauthorized to archive this project");
    }
    
    // Update project status
    await ctx.db.patch(args.projectId, {
      status: "archived",
      updatedAt: Date.now(),
    });
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "archive_project",
      target: {
        type: "projects",
        id: args.projectId,
      },
      metadata: {
        name: project.name,
      },
      at: Date.now(),
    });
    
    return { success: true };
  },
});

// Get all projects
export const getAllProjects = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Build query
    let projectsQuery = ctx.db.query("projects");
    
    // Filter by status if provided
    if (args.status) {
      projectsQuery = projectsQuery.filter((q) => 
        q.eq(q.field("status"), args.status)
      );
    }
    
    // For non-admin/manager users, only show projects they are members of
    if (user.role !== "admin" && user.role !== "manager") {
      projectsQuery = projectsQuery.filter((q) => 
        q.includes(q.field("members"), user._id)
      );
    }
    
    const projects = await projectsQuery.collect();
    
    // Get owner details for each project
    const ownerIds = [...new Set(projects.map(project => project.ownerId))];
    const owners = await Promise.all(
      ownerIds.map(ownerId => ctx.db.get(ownerId))
    );
    
    // Combine project and owner data
    return projects.map(project => {
      const owner = owners.find(o => o?._id === project.ownerId);
      
      return {
        ...project,
        owner,
      };
    });
  },
});

// Get project by ID
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Verify access (admin, manager, or project member)
    if (user.role !== "admin" && 
        user.role !== "manager" && 
        !project.members.includes(user._id)) {
      throw new Error("Unauthorized to view this project");
    }
    
    // Get owner details
    const owner = await ctx.db.get(project.ownerId);
    
    // Get member details
    const members = await Promise.all(
      project.members.map(memberId => ctx.db.get(memberId))
    );
    
    // Get tasks for this project
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
    
    return {
      ...project,
      owner,
      members: members.filter(Boolean), // Filter out any null values
      tasks,
    };
  },
});

// Get user's projects
export const getUserProjects = query({
  args: {
    userId: v.optional(v.id("users")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await getCurrentUser(ctx);
    
    // Determine which user's projects to fetch
    const targetUserId = args.userId || currentUser._id;
    
    // If requesting another user's projects, verify permissions
    if (targetUserId !== currentUser._id && 
        currentUser.role !== "admin" && 
        currentUser.role !== "manager") {
      throw new Error("Unauthorized to view other users' projects");
    }
    
    // Build query
    let projectsQuery = ctx.db
      .query("projects")
      .filter((q) => q.includes(q.field("members"), targetUserId));
    
    // Filter by status if provided
    if (args.status) {
      projectsQuery = projectsQuery.filter((q) => 
        q.eq(q.field("status"), args.status)
      );
    }
    
    const projects = await projectsQuery.collect();
    
    // Get owner details for each project
    const ownerIds = [...new Set(projects.map(project => project.ownerId))];
    const owners = await Promise.all(
      ownerIds.map(ownerId => ctx.db.get(ownerId))
    );
    
    // Combine project and owner data
    return projects.map(project => {
      const owner = owners.find(o => o?._id === project.ownerId);
      
      return {
        ...project,
        owner,
      };
    });
  },
});