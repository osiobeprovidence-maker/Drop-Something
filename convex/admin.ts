import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

async function requireAdmin(ctx: any, sessionToken?: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    // Allow DB role-based admins or the configured super-admin email
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "riderezzy@gmail.com";
    if (user?.role === "admin" || user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { user, session: null as Doc<"adminSessions"> | null };
    }
  }

  if (!sessionToken) {
    throw new Error("Unauthorized: Admin access required");
  }

  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique();

  if (!session) {
    throw new Error("Unauthorized: Admin access required");
  }

  if (session.expiresAt <= Date.now()) {
    await ctx.db.delete(session._id);
    throw new Error("Unauthorized: Admin session expired");
  }

  return { user: null, session };
}

export const getOverviewStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const users = await ctx.db.query("users").collect();
    const slates = await ctx.db.query("slates").collect();
    const comments = await ctx.db.query("slateComments").collect();
    const creators = await ctx.db.query("creators").collect();
    const products = await ctx.db.query("products").collect();
    const reports = await ctx.db.query("reports").collect();

    const pendingReports = reports.filter((report) => report.status === "pending").length;

    return {
      totalUsers: users.length,
      totalSlates: slates.length,
      totalComments: comments.length,
      totalCreators: creators.length,
      totalProducts: products.length,
      pendingReports,
    };
  },
});

export const getAllUsers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query("users").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const banUser = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.patch(args.userId, {
      role: "banned",
    });
  },
});

export const getAllSlates = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const slates = await ctx.db.query("slates").order("desc").collect();

    return await Promise.all(
      slates.map(async (slate) => {
        const creator = await ctx.db.get(slate.creatorId);
        return {
          ...slate,
          creatorName: creator?.name || "Unknown",
          creatorUsername: creator?.username || "unknown",
        };
      })
    );
  },
});

export const deleteSlate = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    slateId: v.id("slates"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    if (admin.user) {
      await ctx.db.insert("reports", {
        reporterId: admin.user._id,
        targetId: args.slateId,
        type: "slate",
        reason: args.reason || "Admin removed",
        status: "resolved",
      });
    }

    return await ctx.db.delete(args.slateId);
  },
});

export const getAllComments = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const comments = await ctx.db.query("slateComments").order("desc").collect();

    return await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          userName: user?.name || "Unknown",
        };
      })
    );
  },
});

export const deleteComment = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    commentId: v.id("slateComments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.delete(args.commentId);
  },
});

export const getAllProducts = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const products = await ctx.db.query("products").collect();

    return await Promise.all(
      products.map(async (product) => {
        const creator = await ctx.db.get(product.creatorId);
        return {
          ...product,
          creatorName: creator?.name || "Unknown",
          creatorUsername: creator?.username || "unknown",
        };
      })
    );
  },
});

export const deleteProduct = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.delete(args.productId);
  },
});

export const getReports = query({
  args: {
    sessionToken: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    if (args.status) {
      return await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .collect();
    }

    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const updateReportStatus = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    reportId: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.patch(args.reportId, { status: args.status });
  },
});

export const createReport = mutation({
  args: {
    reporterId: v.id("users"),
    targetId: v.union(v.id("slates"), v.id("slateComments")),
    type: v.union(v.literal("slate"), v.literal("comment")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      ...args,
      status: "pending",
    });
  },
});

export const updateUserPlan = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("premium")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    console.log(`Admin updated user ${args.userId} plan to ${args.plan}`);
    return { success: true };
  },
});
