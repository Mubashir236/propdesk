// Analytics helper queries
import { query } from "./_generated/server";

// Summary stats for the dashboard/analytics page
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me) return null;

    const isCeo = me.role === "ceo";

    const allDeals = await ctx.db.query("deals").collect();
    const deals = isCeo
      ? allDeals
      : allDeals.filter((d: any) => d.agent_id === me.clerk_user_id);

    const allLeads = await ctx.db.query("leads").collect();
    const leads = isCeo
      ? allLeads
      : allLeads.filter((l: any) => l.assigned_agent_id === me.clerk_user_id);

    const allComms = await ctx.db.query("commissions").collect();
    const comms = isCeo
      ? allComms
      : allComms.filter((c: any) => c.agent_id === me.clerk_user_id);

    return {
      total_deals: deals.length,
      closed_deals: deals.filter((d: any) => d.status === "closed").length,
      total_leads: leads.length,
      closed_leads: leads.filter((l: any) => l.status === "closed").length,
      total_commission: comms.reduce((s: number, c: any) => s + c.total_aed, 0),
      agent_commission: comms.reduce((s: number, c: any) => s + c.agent_share_aed, 0),
    };
  },
});
