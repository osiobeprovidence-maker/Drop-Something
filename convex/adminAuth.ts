import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcryptjs from "bcryptjs";

const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      throw new Error("Admin authentication is not configured.");
    }

    if (args.email.toLowerCase() !== adminEmail.toLowerCase()) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcryptjs.compare(args.password, adminPasswordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const now = Date.now();
    const expiresAt = now + ADMIN_SESSION_DURATION_MS;
    const token = crypto.randomUUID();

    await ctx.db.insert("adminSessions", {
      token,
      email: adminEmail,
      createdAt: now,
      expiresAt,
    });

    return {
      success: true,
      adminEmail,
      timestamp: now,
      token,
      expiresAt,
    };
  },
});

export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});
