import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listActivitiesForLead = query({
  args: { lead_id: v.id("leads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("activities")
      .withIndex("by_lead_id", (q) => q.eq("lead_id", args.lead_id))
      .order("desc")
      .collect();
  },
});

export const logActivity = mutation({
  args: {
    lead_id: v.id("leads"),
    type: v.union(
      v.literal("call"),
      v.literal("whatsapp"),
      v.literal("email"),
      v.literal("viewing"),
      v.literal("note"),
      v.literal("stage_change")
    ),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return await ctx.db.insert("activities", {
      lead_id: args.lead_id,
      agent_id: identity.subject,
      type: args.type,
      notes: args.notes,
      created_at: Date.now(),
    });
  },
});
