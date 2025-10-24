import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

// Seed the admin user
export const seedAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "admin@gmail.com"))
      .first();

    if (existingAdmin) {
      return { success: true, message: "Admin already exists" };
    }

    const now = Date.now();
    await ctx.db.insert("users", {
      email: "admin@gmail.com",
      password: "12345678", // In production, use proper password hashing
      name: "Admin User",
      role: "admin",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, message: "Admin user created" };
  },
});

// Get all users (admin only)
export const listUsers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId);
    
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }));
  },
});

// Create a new user (admin only)
export const createUser = mutation({
  args: {
    adminId: v.id("users"),
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminId);
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
      
    if (existingUser) {
      return { success: false, message: "User with this email already exists" };
    }
    
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password, // In production, use proper password hashing
      name: args.name || args.email.split("@")[0],
      role: args.role,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    
    return { 
      success: true, 
      message: "User created successfully",
      userId 
    };
  },
});

// Update a user (admin only)
export const updateUser = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminId);
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    
    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.role !== undefined) updates.role = args.role;
    if (args.status !== undefined) updates.status = args.status;
    
    await ctx.db.patch(args.userId, updates);
    
    return { success: true, message: "User updated successfully" };
  },
});