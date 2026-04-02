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

export const listRentalListings = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { me, role } = await getCallerRole(ctx);
    if (!me) return [];

    let listings;
    if (args.status) {
      listings = await ctx.db
        .query("rental_listings")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .collect();
    } else {
      listings = await ctx.db.query("rental_listings").collect();
    }

    if (role === "agent") {
      return listings.filter((l: any) =>
        l.assigned_agent_ids.includes(me.clerk_user_id)
      );
    }
    return listings;
  },
});

export const getRentalListing = query({
  args: { id: v.id("rental_listings") },
  handler: async (ctx, args) => {
    const { me, role } = await getCallerRole(ctx);
    if (!me) return null;
    const listing = await ctx.db.get(args.id);
    if (!listing) return null;
    if (
      role === "agent" &&
      !listing.assigned_agent_ids.includes(me.clerk_user_id)
    )
      return null;
    return listing;
  },
});

export const createRentalListing = mutation({
  args: {
    ref_no: v.string(),
    title_en: v.string(),
    type: v.string(),
    bedrooms: v.string(),
    annual_rent_aed: v.float64(),
    area_sqft: v.float64(),
    community: v.string(),
    area: v.string(),
    available_from: v.float64(),
    payment_freq: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("viewing_arranged"),
      v.literal("rented"),
      v.literal("renewal_pending"),
      v.literal("vacant")
    ),
    assigned_agent_ids: v.array(v.string()),
    photo_storage_ids: v.array(v.string()),
    ejari_number: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return await ctx.db.insert("rental_listings", args);
  },
});

export const updateRentalListing = mutation({
  args: {
    id: v.id("rental_listings"),
    title_en: v.optional(v.string()),
    type: v.optional(v.string()),
    bedrooms: v.optional(v.string()),
    annual_rent_aed: v.optional(v.float64()),
    area_sqft: v.optional(v.float64()),
    community: v.optional(v.string()),
    area: v.optional(v.string()),
    available_from: v.optional(v.float64()),
    payment_freq: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("viewing_arranged"),
        v.literal("rented"),
        v.literal("renewal_pending"),
        v.literal("vacant")
      )
    ),
    assigned_agent_ids: v.optional(v.array(v.string())),
    ejari_number: v.optional(v.string()),
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

export const assignAgentsToListing = mutation({
  args: {
    listing_id: v.id("rental_listings"),
    agent_ids: v.array(v.string()),
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
    await ctx.db.patch(args.listing_id, { assigned_agent_ids: args.agent_ids });
  },
});
