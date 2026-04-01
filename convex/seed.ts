import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedMockData = mutation({
  handler: async (ctx) => {
    // Check if data already exists
    const existingCreators = await ctx.db.query("creators").collect();
    if (existingCreators.length > 0) {
      return "Data already exists. Use reset mutation first if you want to reseed.";
    }

    // 1. Create a dummy user for the creators
    const dummyUserId = await ctx.db.insert("users", {
      name: "Admin User",
      username: "admin_user",
      email: "admin@dropsomething.com",
      role: "user",
      tokenIdentifier: "admin-token-123",
    });

    const mockCreators = [
      // Official platform creator
      {
        username: "dropsomething",
        name: "DropSomething",
        avatar: "https://raw.githubusercontent.com/your-repo/logo/main/dropsomething-avatar.png",
        coverImage: "https://picsum.photos/seed/dropsomething-cover/1200/400",
        bio: "Official DropSomething account — news, updates, and featured posts from the platform.",
        category: "Platform",
        supporters: 0,
        pageStyle: "support" as const,
        totalRevenue: 0,
        supporterCount: 0,
        links: [],
        memberships: [],
        goals: [],
        products: [],
      },
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
      {
        username: "writer_joe",
        name: "Joe Penna",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joe",
        coverImage: "https://picsum.photos/seed/joe-cover/1200/400",
        bio: "Weekly essays on philosophy, tech, and the future.",
        category: "Writers",
        supporters: 750,
        pageStyle: "hybrid" as const,
        totalRevenue: 45000,
        supporterCount: 75,
        links: [
          { title: "Substack", url: "https://joe.substack.com" },
        ],
        memberships: [
          { title: "Premium Newsletter", price: 1000, description: "Exclusive weekly deep-dives." },
        ],
        goals: [],
        products: [
          { title: "The Modern Stoic", description: "My debut ebook on philosophy.", price: 3000, type: "digital" as const },
        ],
      },
      {
        username: "pod_hub",
        name: "PodHub Community",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pod",
        coverImage: "https://picsum.photos/seed/pod-cover/1200/400",
        bio: "A community for independent podcasters to share resources.",
        category: "Communities",
        supporters: 2100,
        pageStyle: "hybrid" as const,
        totalRevenue: 210000,
        supporterCount: 210,
        links: [
          { title: "Discord Server", url: "https://discord.gg/podhub" },
        ],
        memberships: [
          { title: "Community Member", price: 2000, description: "Access to private forums and events." },
        ],
        goals: [
          { title: "Host Annual Meetup", targetAmount: 500000, currentAmount: 150000 },
        ],
        products: [],
      },
      {
        username: "maya_cooks",
        name: "Maya's Kitchen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
        coverImage: "https://picsum.photos/seed/maya-cover/1200/400",
        bio: "Sharing traditional recipes with a modern twist.",
        category: "Content Creators",
        supporters: 560,
        pageStyle: "hybrid" as const,
        totalRevenue: 56000,
        supporterCount: 56,
        links: [
          { title: "YouTube Channel", url: "https://youtube.com/mayacooks" },
        ],
        memberships: [
          { title: "Recipe Club", price: 1500, description: "New recipes every week + shopping lists." },
        ],
        goals: [],
        products: [
          { title: "Handmade Apron", description: "Durable and stylish kitchen companion.", price: 8000, type: "physical" as const },
        ],
      },
      {
        username: "tech_tips",
        name: "TechTips Daily",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
        coverImage: "https://picsum.photos/seed/tech-cover/1200/400",
        bio: "Daily bite-sized tech news and productivity hacks.",
        category: "Content Creators",
        supporters: 1500,
        pageStyle: "hybrid" as const,
        totalRevenue: 150000,
        supporterCount: 150,
        links: [
          { title: "Twitter", url: "https://twitter.com/techtips" },
        ],
        memberships: [
          { title: "Insider", price: 1000, description: "Ad-free experience and weekly summary." },
        ],
        goals: [
          { title: "New Camera Gear", targetAmount: 300000, currentAmount: 210000 },
        ],
        products: [],
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
