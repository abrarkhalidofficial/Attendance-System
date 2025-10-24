import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";
import { requireRole } from "./auth";
import { z } from "zod";

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
// Enhance listUsers with optional filters
export const listUsers = query({
  args: { userId: v.id("users"), role: v.optional(v.string()), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId);
    let q = ctx.db.query("users");
    if (args.role) q = q.filter((qq) => qq.eq(qq.field("role"), args.role!));
    if (args.status) q = q.filter((qq) => qq.eq(qq.field("status"), args.status!));
    const users = await q.collect();
    return users.map((user) => ({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }));
  },
});

// Current authenticated user
export const me = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return null;
    return { id: user._id, email: user.email, name: user.name, role: user.role, status: user.status };
  },
});

// Get a single user by id (self or admin/manager)
export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["admin", "manager", "employee"]);
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    if (caller.role === "employee" && caller._id !== user._id) {
      throw new Error("Forbidden");
    }
    return { id: user._id, email: user.email, name: user.name, role: user.role, status: user.status };
  },
});

// Admin create user with validation
export const adminCreateUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).optional(),
      role: z.enum(["admin", "manager", "employee"]),
    });
    schema.parse(args);

    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    if (existing) {
      return { success: false, message: "User with this email already exists" };
    }
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name || args.email.split("@")[0],
      role: args.role,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    // optional audit log
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "admin_create_user",
      target: { type: "users", id: userId },
      metadata: { email: args.email, role: args.role },
      at: now,
    });
    return { success: true, userId };
  },
});

// Admin update user (patch)
export const adminUpdateUser = mutation({
  args: { id: v.id("users"), name: v.optional(v.string()), role: v.optional(v.string()), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);
    const user = await ctx.db.get(args.id);
    if (!user) return { success: false, message: "User not found" };
    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.role !== undefined) updates.role = args.role;
    if (args.status !== undefined) updates.status = args.status;
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "admin_update_user",
      target: { type: "users", id: args.id },
      metadata: updates,
      at: Date.now(),
    });
    return { success: true };
  },
});

// Deactivate user
export const deactivateUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);
    const user = await ctx.db.get(args.id);
    if (!user) return { success: false, message: "User not found" };
    await ctx.db.patch(args.id, { status: "inactive", updatedAt: Date.now() });
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "deactivate_user",
      target: { type: "users", id: args.id },
      metadata: {},
      at: Date.now(),
    });
    return { success: true };
  },
});

// Enroll face embedding (self or admin)
export const enrollFaceEmbedding = mutation({
  args: { embedding: v.array(v.number()), consentFlag: v.boolean(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["admin", "manager", "employee"]);
    const targetUserId = args.userId ?? caller._id;
    if (caller.role === "employee" && targetUserId !== caller._id) {
      throw new Error("Forbidden");
    }
    const now = Date.now();
    const updates: any = { faceEmbedding: args.embedding, updatedAt: now };
    if (args.consentFlag) updates.faceConsentAt = now;
    await ctx.db.patch(targetUserId, updates);
    await ctx.db.insert("auditLogs", {
      actorId: caller._id,
      action: "enroll_face_embedding",
      target: { type: "users", id: targetUserId },
      metadata: { consentFlag: args.consentFlag },
      at: now,
    });
    return { success: true };
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