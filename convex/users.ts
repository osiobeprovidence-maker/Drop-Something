import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    // Super admin email - automatically grant admin role (read from env)
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "riderezzy@gmail.com";
    const isAdmin = args.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        image: args.image,
        // Ensure admin role is set for super admin
        role: existingUser.role || (isAdmin ? "admin" : "user"),
      });
      return { id: existingUser._id, isNew: false };
    }

    const id = await ctx.db.insert("users", {
      ...args,
      role: isAdmin ? "admin" : "user",
    });
    return { id, isNew: true };
  },
});

export const currentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
  },
});

// Mutation to set admin role for super admin user (can be run via CLI with convex run)
export const setAdminRole = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Only allow setting admin for super admin email (read from env)
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "riderezzy@gmail.com";
    if (args.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Unauthorized: Only the super admin email can be set as admin");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found: No user exists with email " + args.email);
    }

    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true, userId: user._id, email: args.email };
  },
});

// Also export a simpler version for the mutation helper
export const setAdminRoleMutation = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // This is kept for backward compatibility - redirects to setAdminRole logic
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "riderezzy@gmail.com";
    if (args.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Unauthorized: Only the super admin email can be set as admin");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found: No user exists with email " + args.email);
    }

    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true, userId: user._id, email: args.email };
  },
});

// Remove the action - not needed since mutations work with convex run

// Get user by email (for admin purposes)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    return user;
  },
});
