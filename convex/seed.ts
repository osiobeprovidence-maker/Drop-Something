import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedMockData = mutation({
  handler: async (ctx) => {
    // 1. Create a dummy user for the creators
    const dummyUserId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@dropsomething.com",
      tokenIdentifier: "admin-token-123",
    });

    const mockCreators = [
      {
        username: "alexrivera",
        name: "Alex Rivera",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        coverImage: "https://picsum.photos/seed/alex-cover/1200/400",
        bio: "Creating digital art & tutorials for aspiring artists.",
        category: "Designers",
        supporters: 1240,
        pageStyle: "hybrid" as const,
        totalRevenue: 124500,
        supporterCount: 128,
        links: [
          { title: "My Portfolio", url: "https://portfolio.com" },
          { title: "Instagram", url: "https://instagram.com/alex" },
        ],
        memberships: [
          { title: "Supporter", price: 2000, description: "Access to my process and early bird tutorials." },
        ],
        goals: [
          { title: "New Studio Microphone", targetAmount: 150000, currentAmount: 85000 },
        ],
        products: [
          { title: "Digital Art Pack", description: "10 high-res wallpapers for your devices.", price: 2500, type: "digital" as const },
        ],
      },
      {
        username: "sarahdev",
        name: "Sarah Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        coverImage: "https://picsum.photos/seed/sarah-cover/1200/400",
        bio: "Open source developer building tools for the web.",
        category: "Developers",
        supporters: 890,
        pageStyle: "hybrid" as const,
        totalRevenue: 89000,
        supporterCount: 89,
        links: [
          { title: "GitHub", url: "https://github.com/sarah" },
          { title: "Twitter", url: "https://twitter.com/sarahdev" },
        ],
        memberships: [
          { title: "Sponsor", price: 5000, description: "Monthly support for open source maintenance." },
        ],
        goals: [
          { title: "Upgrade CI Server", targetAmount: 200000, currentAmount: 120000 },
        ],
        products: [
          { title: "Advanced React Course", description: "Master React with real-world projects.", price: 15000, type: "digital" as const },
        ],
      },
    ];

    for (const data of mockCreators) {
      const { links, memberships, goals, products, ...creatorData } = data;
      
      const creatorId = await ctx.db.insert("creators", {
        ...creatorData,
        userId: dummyUserId,
      });

      for (const link of links) {
        await ctx.db.insert("links", { ...link, creatorId });
      }
      for (const membership of memberships) {
        await ctx.db.insert("memberships", { ...membership, creatorId });
      }
      for (const goal of goals) {
        await ctx.db.insert("goals", { ...goal, creatorId });
      }
      for (const product of products) {
        await ctx.db.insert("products", { ...product, creatorId });
      }
    }

    return "Seed complete!";
  },
});
