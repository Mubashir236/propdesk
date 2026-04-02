# PropDesk — Setup Guide

## Prerequisites
- Node.js 18+
- A Convex account (convex.dev)
- A Clerk account (clerk.dev)

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Set Up Convex

```bash
npx convex dev
```

This will:
- Prompt you to log in / create a project
- Generate `convex/_generated/` (api.ts, server.ts, dataModel.ts)
- Output your `VITE_CONVEX_URL`

---

## 3. Set Up Clerk

1. Go to https://clerk.dev → create a new application
2. Copy your **Publishable Key** (starts with `pk_test_…`)
3. In Clerk Dashboard → **JWT Templates** → create a template named `convex`
4. Copy the **Issuer URL** (looks like `https://your-app.clerk.accounts.dev`)

---

## 4. Configure Environment

Edit `.env.local`:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

In Convex Dashboard → Settings → **Environment Variables**, add:
```
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

---

## 5. Seed Initial CEO User

After first login, open the Convex dashboard and manually update the first user's `role` from `"agent"` to `"ceo"` in the `users` table. All subsequent users will be agents by default.

---

## 6. Run Development Server

```bash
npm run dev
```

This runs **both** Convex (real-time backend) and Vite (frontend) concurrently.

Open [http://localhost:5173](http://localhost:5173)

---

## File Structure

```
propdesk/
├── convex/                     # Backend (Convex serverless)
│   ├── schema.ts               # All table definitions
│   ├── users.ts                # User management
│   ├── sales.ts                # Sales listings CRUD
│   ├── rentals.ts              # Rental listings CRUD
│   ├── offplan.ts              # Off-plan projects + units
│   ├── leads.ts                # Lead management + pipeline
│   ├── activities.ts           # Activity timeline
│   ├── deals.ts                # Deals + commission trigger
│   ├── commissions.ts          # Commission queries
│   ├── notifications.ts        # In-app notifications
│   ├── settings.ts             # Company settings
│   └── auth.config.ts          # Clerk JWT configuration
│
└── src/
    ├── components/
    │   ├── Analytics/           # CommissionBarChart, DealDonutChart
    │   ├── Dashboard/           # KpiCard, AgentGrid
    │   ├── Layout/              # AppShell, Sidebar, Header
    │   ├── Listings/            # PropertyCard, PropertyForm
    │   ├── OffPlan/             # UnitMatrix
    │   ├── Pipeline/            # KanbanBoard, LeadCard
    │   ├── Shared/              # StatusBadge, AssignAgentModal
    │   └── ui/                  # shadcn/ui primitives
    │
    └── pages/
        ├── DashboardPage.tsx
        ├── SalesPage.tsx / SalesDetailPage.tsx / SalesNewPage.tsx
        ├── RentalsPage.tsx / RentalsDetailPage.tsx
        ├── OffPlanPage.tsx / OffPlanDetailPage.tsx
        ├── LeadsPage.tsx / LeadDetailPage.tsx
        ├── AnalyticsPage.tsx
        ├── TeamPage.tsx / AgentDetailPage.tsx
        └── SettingsPage.tsx
```

---

## Role System

| Feature | CEO | Agent |
|---------|-----|-------|
| See all agents' data | ✓ | ✗ |
| Create listings | ✓ | ✗ |
| Assign agents | ✓ | ✗ |
| Team page | ✓ | ✗ |
| Commission settings | ✓ | ✗ |
| Own leads/listings | ✓ | ✓ |
| Log activities | ✓ | ✓ |
| Create leads | ✓ | ✓ |
| View analytics | All | Personal |
