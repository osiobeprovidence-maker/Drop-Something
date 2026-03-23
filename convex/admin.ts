import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper to check if user is admin
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
    .unique();

  // Default to "user" if role is not set, only "admin" can access
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// ==================== OVERVIEW STATS ====================

export const getOverviewStats = query({
  handler: async (ctx) => {
    // Admin dashboard is now public - no auth required
    const users = await ctx.db.query("users").collect();
    const slates = await ctx.db.query("slates").collect();
    const comments = await ctx.db.query("slateComments").collect();
    const creators = await ctx.db.query("creators").collect();
    const products = await ctx.db.query("products").collect();
    const reports = await ctx.db.query("reports").collect();

    const pendingReports = reports.filter(r => r.status === "pending").length;

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

// ==================== USERS MANAGEMENT ====================

export const getAllUsers = query({
  handler: async (ctx) => {
    // Admin dashboard is now public - no auth required
    return await ctx.db.query("users").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
    return await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const banUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
    // Mark user as banned by setting role to a special value
    // In production, you might want a separate isBanned field
    return await ctx.db.patch(args.userId, { 
      role: "banned" as any,
      // Store ban reason in a separate field if needed
    });
  },
});

// ==================== SLATE MODERATION ====================

export const getAllSlates = query({
  handler: async (ctx) => {
    // Admin dashboard is now public - no auth required
    const slates = await ctx.db.query("slates").order("desc").collect();
    
    // Resolve creator info for each slate
    const resolvedSlates = await Promise.all(
      slates.map(async (slate) => {
        const creator = await ctx.db.get(slate.creatorId);
        return {
          ...slate,
          creatorName: creator?.name || "Unknown",
          creatorUsername: creator?.username || "unknown",
        };
      })
    );

    return resolvedSlates;
  },
});

export const deleteSlate = mutation({
  args: { slateId: v.id("slates"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
    // Optionally create a report record for tracking
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const adminUser = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
        .unique();
      
      if (adminUser) {
        await ctx.db.insert("reports", {
          reporterId: adminUser._id,
          targetId: args.slateId as any,
          type: "slate",
          reason: args.reason || "Admin removed",
          status: "resolved",
        });
      }
    }
    
    return await ctx.db.delete(args.slateId);
  },
});

// ==================== COMMENTS MODERATION ====================

export const getAllComments = query({
  handler: async (ctx) => {
    // Admin dashboard is now public - no auth required
    const comments = await ctx.db.query("slateComments").order("desc").collect();
    
    const resolvedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          userName: user?.name || "Unknown",
        };
      })
    );

    return resolvedComments;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("slateComments"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
    return await ctx.db.delete(args.commentId);
  },
});

// ==================== SHOP MANAGEMENT ====================

export const getAllProducts = query({
  handler: async (ctx) => {
    // Admin dashboard is now public - no auth required
    const products = await ctx.db.query("products").collect();
    
    const resolvedProducts = await Promise.all(
      products.map(async (product) => {
        const creator = await ctx.db.get(product.creatorId);
        return {
          ...product,
          creatorName: creator?.name || "Unknown",
          creatorUsername: creator?.username || "unknown",
        };
      })
    );

    return resolvedProducts;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
    return await ctx.db.delete(args.productId);
  },
});

// ==================== REPORTS ====================

export const getReports = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed"))) },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
    let reports;
    if (args.status) {
      reports = await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .collect();
    } else {
      reports = await ctx.db.query("reports").order("desc").collect();
    }
    
    return reports;
  },
});

export const updateReportStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
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

// ==================== USER PLAN MANAGEMENT ====================

export const updateUserPlan = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("premium")),
  },
  handler: async (ctx, args) => {
    // Admin dashboard is now public - no auth required
    // This would typically update a subscriptions table
    // For now, we'll just log the action
    console.log(`Admin updated user ${args.userId} plan to ${args.plan}`);
    return { success: true };
  },
});
