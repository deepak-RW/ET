import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStartingBalance = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    return profile?.starting_balance || 0;
  },
});

export const updateStartingBalance = mutation({
  args: { balance: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, { starting_balance: args.balance });
    } else {
      await ctx.db.insert("profiles", { userId, starting_balance: args.balance });
    }
  },
});
