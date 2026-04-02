import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCommissionForDeal = query({
  args: { deal_id: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("commissions")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.deal_id))
      .unique();
  },
});

export const listCommissionsForAgent = query({
  args: { agent_clerk_id: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me) return [];

    // CEO can query any agent; agent can only query themselves
    const targetId =
      me.role === "ceo" && args.agent_clerk_id
        ? args.agent_clerk_id
        : me.clerk_user_id;

    return await ctx.db
      .query("commissions")
      .withIndex("by_agent_id", (q) => q.eq("agent_id", targetId))
      .collect();
  },
});

export const listAllCommissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") return [];
    return await ctx.db.query("commissions").collect();
  },
});
