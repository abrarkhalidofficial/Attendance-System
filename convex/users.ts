import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all users
export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get user by ID
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("employee")
    ),
    avatar: v.optional(v.string()),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    faceEmbedding: v.optional(v.array(v.number())),
    locationOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if user with email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return await ctx.db.insert("users", {
      email: args.email,
      password: args.password, // In production, hash this password
      name: args.name,
      role: args.role,
      avatar: args.avatar,
      department: args.department,
      position: args.position,
      isActive: args.isActive ?? true,
      faceEmbedding: args.faceEmbedding,
      locationOptIn: args.locationOptIn ?? false,
    });
  },
});

// Update user
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("manager"), v.literal("employee"))
    ),
    avatar: v.optional(v.string()),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    faceEmbedding: v.optional(v.array(v.number())),
    locationOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If email is being updated, check for duplicates
    if (updates.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();

      if (existingUser && existingUser._id !== id) {
        throw new Error("User with this email already exists");
      }
    }

    return await ctx.db.patch(id, updates);
  },
});

// Delete user (soft delete by setting isActive to false)
export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { isActive: false });
  },
});

// Authenticate user (simple email/password check)
export const authenticateUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.password !== args.password || !user.isActive) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// Get users by role
export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("employee")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
