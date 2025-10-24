import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // In production, use proper password comparison
    if (user.password !== args.password) {
      return { success: false, message: "Invalid password" };
    }

    if (user.status !== "active") {
      return { success: false, message: "User is inactive" };
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});

export const getCurrentUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const requireAdmin = async (ctx: any, userId: any) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
};