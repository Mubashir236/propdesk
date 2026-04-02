import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.query("company_settings").first();
  },
});

export const upsertSettings = mutation({
  args: {
    commission_rate_sales: v.float64(),
    commission_rate_rental: v.float64(),
    default_agent_split: v.float64(),
    target_monthly_revenue: v.float64(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") throw new Error("Unauthorized");

    const existing = await ctx.db.query("company_settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("company_settings", args);
    }
  },
});
