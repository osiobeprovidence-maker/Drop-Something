import { mutation } from "./_generated/server";

export const clearAll = mutation({
  handler: async (ctx) => {
    // 1. Clear all creators
    const creators = await ctx.db.query("creators").collect();
    for (const creator of creators) {
      await ctx.db.delete(creator._id);
    }

    // 2. Clear all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // 3. Clear all related tables
    const tables = ["links", "memberships", "goals", "products", "tips", "follows"] as const;
    for (const table of tables) {
      const records = await ctx.db.query(table as any).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    return "All database records cleared!";
  },
});
