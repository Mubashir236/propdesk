import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getCallerRole(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return { me: null, role: null };
  const me = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q: any) =>
      q.eq("clerk_user_id", identity.subject)
    )
    .unique();
  return { me, role: me?.role ?? null };
}

export const listLeads = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { me, role } = await getCallerRole(ctx);
    if (!me) return [];

    let leads;
    if (args.status) {
      leads = await ctx.db
        .query("leads")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .collect();
    } else {
      leads = await ctx.db.query("leads").collect();
    }

    if (role === "agent") {
      return leads.filter(
        (l: any) => l.assigned_agent_id === me.clerk_user_id
      );
    }
    return leads;
  },
});

export const getLead = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    const { me, role } = await getCallerRole(ctx);
    if (!me) return null;
    const lead = await ctx.db.get(args.id);
    if (!lead) return null;
    if (role === "agent" && lead.assigned_agent_id !== me.clerk_user_id)
      return null;
    return lead;
  },
});

export const createLead = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    nationality: v.string(),
    lead_type: v.union(
      v.literal("buyer"),
      v.literal("tenant"),
      v.literal("investor")
    ),
    source: v.string(),
    budget_min: v.float64(),
    budget_max: v.float64(),
    property_type_pref: v.string(),
    area_pref: v.string(),
    timeline: v.string(),
    notes: v.string(),
    assigned_agent_id: v.optional(v.string()),
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

    const refNo = `LD-${Date.now().toString(36).toUpperCase()}`;
    return await ctx.db.insert("leads", {
      ref_no: refNo,
      name: args.name,
      phone: args.phone,
      email: args.email,
      nationality: args.nationality,
      lead_type: args.lead_type,
      source: args.source,
      budget_min: args.budget_min,
      budget_max: args.budget_max,
      property_type_pref: args.property_type_pref,
      area_pref: args.area_pref,
      timeline: args.timeline,
      status: "new",
      assigned_agent_id: args.assigned_agent_id ?? me.clerk_user_id,
      notes: args.notes,
    });
  },
});

export const updateLeadStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("viewing_scheduled"),
      v.literal("offer_made"),
      v.literal("negotiating"),
      v.literal("closed"),
      v.literal("lost")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const lead = await ctx.db.get(args.id);
    if (!lead) throw new Error("Lead not found");

    const prevStatus = lead.status;
    await ctx.db.patch(args.id, { status: args.status });

    // Log stage change activity
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();

    await ctx.db.insert("activities", {
      lead_id: args.id,
      agent_id: identity.subject,
      type: "stage_change",
      notes: `Status changed from ${prevStatus} to ${args.status}`,
      created_at: Date.now(),
    });

    // Notify assigned agent if changed by CEO
    if (me?.role === "ceo" && lead.assigned_agent_id) {
      await ctx.db.insert("notifications", {
        user_id: lead.assigned_agent_id,
        type: "lead_status_changed",
        message: `Lead ${lead.name} status updated to ${args.status}`,
        related_id: args.id,
        is_read: false,
        created_at: Date.now(),
      });
    }
  },
});

export const assignLeadToAgent = mutation({
  args: {
    lead_id: v.id("leads"),
    agent_clerk_id: v.string(),
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
    await ctx.db.patch(args.lead_id, {
      assigned_agent_id: args.agent_clerk_id,
    });

    const lead = await ctx.db.get(args.lead_id);
    await ctx.db.insert("notifications", {
      user_id: args.agent_clerk_id,
      type: "lead_assigned",
      message: `New lead assigned: ${lead?.name}`,
      related_id: args.lead_id,
      is_read: false,
      created_at: Date.now(),
    });
  },
});

export const updateLead = mutation({
  args: {
    id: v.id("leads"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    nationality: v.optional(v.string()),
    budget_min: v.optional(v.float64()),
    budget_max: v.optional(v.float64()),
    property_type_pref: v.optional(v.string()),
    area_pref: v.optional(v.string()),
    timeline: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const { id, ...patch } = args;
    const filteredPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredPatch);
  },
});
