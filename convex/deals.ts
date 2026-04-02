import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listDeals = query({
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
    if (!me) return [];

    const deals = await ctx.db.query("deals").collect();
    if (me.role === "agent") {
      return deals.filter((d: any) => d.agent_id === me.clerk_user_id);
    }
    return deals;
  },
});

export const createDeal = mutation({
  args: {
    lead_id: v.id("leads"),
    deal_type: v.union(
      v.literal("sale"),
      v.literal("rental"),
      v.literal("off_plan")
    ),
    property_id: v.string(),
    final_price_aed: v.float64(),
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
    if (!me) throw new Error("User not found");

    const refNo = `DL-${Date.now().toString(36).toUpperCase()}`;
    return await ctx.db.insert("deals", {
      ref_no: refNo,
      lead_id: args.lead_id,
      deal_type: args.deal_type,
      property_id: args.property_id,
      agent_id: me.clerk_user_id,
      final_price_aed: args.final_price_aed,
      status: "in_progress",
      closed_at: 0,
    });
  },
});

export const closeDeal = mutation({
  args: {
    deal_id: v.id("deals"),
    final_price_aed: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const deal = await ctx.db.get(args.deal_id);
    if (!deal) throw new Error("Deal not found");

    const finalPrice = args.final_price_aed ?? deal.final_price_aed;
    const closedAt = Date.now();

    await ctx.db.patch(args.deal_id, {
      status: "closed",
      closed_at: closedAt,
      final_price_aed: finalPrice,
    });

    // Fetch company settings for commission rates
    const settings = await ctx.db.query("company_settings").first();
    const agent = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", deal.agent_id)
      )
      .unique();

    let ratePct = 2; // default
    if (settings) {
      ratePct =
        deal.deal_type === "rental"
          ? settings.commission_rate_rental
          : settings.commission_rate_sales;
    }

    const splitPct = agent?.agent_split_pct ?? 50;
    const totalAed = (finalPrice * ratePct) / 100;
    const agentShareAed = (totalAed * splitPct) / 100;
    const companyShareAed = totalAed - agentShareAed;

    await ctx.db.insert("commissions", {
      deal_id: args.deal_id,
      agent_id: deal.agent_id,
      total_aed: totalAed,
      agent_share_aed: agentShareAed,
      company_share_aed: companyShareAed,
      rate_pct: ratePct,
      split_pct: splitPct,
      calculated_at: closedAt,
    });

    // Update lead status to closed
    await ctx.db.patch(deal.lead_id, { status: "closed" });

    // Notify agent
    await ctx.db.insert("notifications", {
      user_id: deal.agent_id,
      type: "deal_closed",
      message: `Deal closed! Commission: AED ${agentShareAed.toLocaleString()}`,
      related_id: args.deal_id,
      is_read: false,
      created_at: closedAt,
    });
  },
});

export const loseDeal = mutation({
  args: { deal_id: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await ctx.db.patch(args.deal_id, { status: "lost" });
  },
});
