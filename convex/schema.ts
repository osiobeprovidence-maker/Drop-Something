import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    username: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // For Firebase/Clerk/etc
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("moderator"),
        v.literal("user"),
      ),
    ),
    isBanned: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  adminSessions: defineTable({
    token: v.string(),
    email: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  creators: defineTable({
    userId: v.id("users"),
    username: v.string(),
    name: v.string(),
    bio: v.string(),
    about: v.optional(v.string()),
    avatar: v.string(),
    coverImage: v.string(),
    coverPosition: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    })),
    pageStyle: v.union(v.literal("support"), v.literal("shop"), v.literal("goal"), v.literal("hybrid")),
    totalRevenue: v.number(),
    supporterCount: v.number(),
  }).index("by_username", ["username"])
    .index("by_userId", ["userId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("creators"),
  }).index("by_follower", ["followerId"])
    .index("by_following", ["followingId"]),

  links: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    url: v.string(),
  }).index("by_creatorId", ["creatorId"]),

  memberships: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    price: v.number(),
    description: v.string(),
  }).index("by_creatorId", ["creatorId"]),

  goals: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
  }).index("by_creatorId", ["creatorId"]),

  // Wishlist (enhanced goals with renewable support)
  wishlists: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    status: v.union(v.literal("active"), v.literal("completed")),
    isRenewable: v.boolean(),
  }).index("by_creatorId", ["creatorId"]),

  products: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.union(v.literal("digital"), v.literal("physical"), v.literal("ticket")),
    image: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
    deliveryInfo: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    eventTime: v.optional(v.string()),
    venue: v.optional(v.string()),
    locationAddress: v.optional(v.string()),
    ticketType: v.optional(v.string()),
  }).index("by_creatorId", ["creatorId"]),

  tips: defineTable({
    creatorId: v.id("creators"),
    supporterName: v.string(),
    amount: v.number(),
    message: v.optional(v.string()),
    type: v.union(v.literal("tip"), v.literal("membership")),
    paystackReference: v.optional(v.string()),
  }).index("by_creatorId", ["creatorId"]),

  // Payment Details for creator payouts
  paymentDetails: defineTable({
    userId: v.id("users"),
    accountName: v.string(),
    bankName: v.string(),
    accountNumber: v.string(),
  }).index("by_userId", ["userId"]),

  // KYC verification
  kyc: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    idType: v.string(),
    idImageId: v.string(),
    selfieImageId: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // Subscriptions for shop access
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(v.literal("shop"), v.literal("premium")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("cancelled")),
    expiresAt: v.number(), // Unix timestamp
    paystackReference: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  paymentReceipts: defineTable({
    reference: v.string(),
    type: v.union(
      v.literal("tip"),
      v.literal("membership"),
      v.literal("product"),
      v.literal("goal"),
      v.literal("wishlist"),
      v.literal("subscription"),
    ),
    amount: v.number(),
    email: v.string(),
    userId: v.optional(v.id("users")),
    creatorId: v.optional(v.id("creators")),
    itemId: v.optional(v.string()),
    subscriptionPlan: v.optional(v.union(v.literal("shop"), v.literal("premium"))),
    supporterName: v.optional(v.string()),
    message: v.optional(v.string()),
    buyerPhone: v.optional(v.string()),
    quantity: v.optional(v.number()),
    deliveryRequired: v.optional(v.boolean()),
    deliveryAddressId: v.optional(v.id("addresses")),
    fulfilledAt: v.number(),
  }).index("by_reference", ["reference"])
    .index("by_email", ["email"]),

  // User delivery addresses
  addresses: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    isDefault: v.boolean(),
  }).index("by_userId", ["userId"]),

  // Slate content posts
  slateSeries: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  }).index("by_creatorId", ["creatorId"]),

  showcases: defineTable({
    creatorId: v.id("creators"),
    role: v.optional(v.string()),
    location: v.optional(v.string()),
    about: v.optional(v.string()),
    hireLink: v.optional(v.string()),
    messageLink: v.optional(v.string()),
    skills: v.array(v.string()),
    featuredSlateIds: v.array(v.id("slates")),
    projects: v.array(v.object({
      id: v.string(),
      title: v.string(),
      story: v.string(),
      timeframe: v.optional(v.string()),
    })),
    sectionOrder: v.array(v.string()),
    hiddenSections: v.array(v.string()),
  }).index("by_creatorId", ["creatorId"]),
  slates: defineTable({
    creatorId: v.id("creators"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal("audio")),
    content: v.optional(v.string()), // text content
    mediaUrl: v.optional(v.string()), // for images/audio (storageId or URL)
    playbackId: v.optional(v.string()), // for Mux video/audio playback
    thumbnailImage: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("followers"), v.literal("supporters"), v.literal("members")),
    seriesId: v.optional(v.id("slateSeries")),
    entryType: v.optional(v.union(v.literal("episode"), v.literal("chapter"))),
    sequence: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_creatorId", ["creatorId"])
    .index("by_seriesId", ["seriesId"]),

  // Slate likes
  slateLikes: defineTable({
    userId: v.id("users"),
    slateId: v.id("slates"),
  }).index("by_userId", ["userId"])
    .index("by_slateId", ["slateId"])
    .index("by_userId_and_slateId", ["userId", "slateId"]),

  // Slate comments
  slateComments: defineTable({
    userId: v.id("users"),
    slateId: v.id("slates"),
    content: v.string(),
  }).index("by_slateId", ["slateId"])
    .index("by_userId", ["userId"]),

  // Reports for moderation
  reports: defineTable({
    reporterId: v.id("users"),
    targetId: v.union(v.id("slates"), v.id("slateComments")),
    type: v.union(v.literal("slate"), v.literal("comment")),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed")),
  }).index("by_status", ["status"])
    .index("by_targetId", ["targetId"]),
});
