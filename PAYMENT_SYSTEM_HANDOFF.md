# Payment Request System - Handoff Documentation

This document provides all the information needed to add a payment request system to the Sunday Planning System application.

---

## 📋 Project Overview

**Application Name:** Sunday Planning System (GIGABRANDS Content Submission System)  
**Purpose:** Internal dashboard for managing content submissions, agencies, OKRs, and team workflows  
**Current Features:**
- Dashboard for content approval/rejection
- Agency management with Slack notifications
- OKR tracking
- ClickUp integration
- Slack bot integration
- Content submission forms

---

## 🔗 Repository & Deployment

### GitHub Repository
- **URL:** https://github.com/gigabrain-lgtm/sunday-planning-system
- **Branch:** `main`
- **Access:** You'll need to clone this repository or be added as a collaborator

### Digital Ocean Deployment
- **Platform:** DigitalOcean App Platform
- **Database:** PostgreSQL (needle-movers-db)
- **Database Connection String:** Available in Digital Ocean environment variables as `DATABASE_URL`
- **Auto-Deploy:** Enabled (pushes to `main` trigger automatic deployment)
- **Deployment Time:** ~3-4 minutes

### Environment Variables (Already Set in Digital Ocean)
- `DATABASE_URL` - PostgreSQL connection string
- `CLICKUP_API_KEY` - ClickUp API integration
- `SLACK_BOT_TOKEN` - Slack bot for notifications
- `JWT_SECRET` - Authentication
- `OAUTH_SERVER_URL` - OAuth integration
- `AIRTABLE_API_KEY` - Airtable integration
- `AIRTABLE_BASE_ID` - Airtable base

**Note:** All credentials are already configured in Digital Ocean. Contact the project owner for access.

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 19.1.1
- **Routing:** Wouter 3.3.5
- **UI Library:** Radix UI + Tailwind CSS 4.1.14
- **State Management:** TanStack Query (React Query) 5.90.2
- **API Client:** tRPC 11.6.0
- **Forms:** React Hook Form 7.64.0
- **Notifications:** Sonner 2.0.7
- **Icons:** Lucide React 0.453.0

### Backend
- **Runtime:** Node.js (Express 4.21.2)
- **API:** tRPC 11.6.0 (type-safe API)
- **Database ORM:** Drizzle ORM 0.44.5
- **Database:** PostgreSQL (via pg 8.16.3)
- **Authentication:** JWT (jose 6.1.0)
- **Validation:** Zod 4.1.12

### Build Tools
- **Bundler:** Vite 7.1.7 (frontend), esbuild 0.25.0 (backend)
- **TypeScript:** 5.9.3
- **Package Manager:** pnpm 10.4.1

---

## 📁 Project Structure

```
sunday-planning-system/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components (17 pages)
│   │   │   ├── Dashboard.tsx        # Main dashboard
│   │   │   ├── OrgChart.tsx         # Agencies management
│   │   │   ├── ExternalSubmissions.tsx  # Content submission form
│   │   │   ├── OKRDashboard.tsx     # OKR tracking
│   │   │   └── ...
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Layout components (Sidebar, etc.)
│   │   │   └── ui/           # Radix UI components
│   │   ├── lib/              # Utilities and tRPC client
│   │   └── data/             # Static data (orgChart.ts)
│   └── index.html
│
├── server/                    # Backend Express + tRPC server
│   ├── _core/                # Core server setup
│   │   ├── index.ts          # Server entry point
│   │   ├── trpc.ts           # tRPC setup
│   │   └── env.ts            # Environment variables
│   ├── routers.ts            # Main tRPC router (ALL API ENDPOINTS)
│   ├── db.ts                 # Database helper functions
│   ├── dashboard.ts          # Dashboard logic
│   ├── clickup.ts            # ClickUp API integration
│   ├── slack.ts              # Slack API integration
│   ├── orgChart.ts           # Agency data management
│   └── ...
│
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Database schema (Drizzle ORM)
│   ├── 0009_agencies_table.sql  # Latest migration
│   └── ...
│
├── shared/                    # Shared types and constants
│   └── types.ts
│
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
└── DEPLOYMENT.md             # Deployment guide
```

---

## 🎯 Where to Add Payment Request System

### Recommended Approach

#### 1. **Create New Page Component**
Location: `client/src/pages/PaymentRequests.tsx`

This should include:
- List of payment requests (table or cards)
- "New Payment Request" button
- Payment request form (dialog/modal)
- Status badges (Pending, Approved, Rejected, Paid)
- Filter/search functionality

#### 2. **Add Route to App**
File: `client/src/App.tsx`

Add route:
```tsx
<Route path="/payment-requests" component={PaymentRequests} />
```

#### 3. **Add to Sidebar Navigation**
File: `client/src/components/layout/Sidebar.tsx`

Add menu item:
```tsx
{
  name: "Payment Requests",
  path: "/payment-requests",
  icon: DollarSign, // from lucide-react
}
```

#### 4. **Create Database Schema**
File: `drizzle/schema.ts`

Add table:
```typescript
export const paymentRequests = pgTable("payment_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  requesterId: varchar("requesterId", { length: 255 }).notNull(),
  requesterName: varchar("requesterName", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "Travel", "Software", "Marketing"
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected, paid
  approvedBy: varchar("approvedBy", { length: 255 }),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
```

#### 5. **Create Migration**
File: `drizzle/0010_payment_requests.sql`

```sql
CREATE TABLE IF NOT EXISTS "payment_requests" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "requesterId" varchar(255) NOT NULL,
  "requesterName" varchar(255) NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "currency" varchar(3) DEFAULT 'USD' NOT NULL,
  "description" text NOT NULL,
  "category" varchar(100),
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "approvedBy" varchar(255),
  "approvedAt" timestamp,
  "paidAt" timestamp,
  "receiptUrl" varchar(500),
  "notes" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
```

#### 6. **Add Database Helper Functions**
File: `server/db.ts`

Add functions:
```typescript
export async function createPaymentRequest(data: InsertPaymentRequest) { ... }
export async function getAllPaymentRequests() { ... }
export async function getPaymentRequestById(id: number) { ... }
export async function updatePaymentRequestStatus(id: number, status: string, approvedBy?: string) { ... }
export async function deletePaymentRequest(id: number) { ... }
```

#### 7. **Add tRPC API Endpoints**
File: `server/routers.ts`

Add router:
```typescript
paymentRequests: router({
  getAll: protectedProcedure.query(async () => {
    return await db.getAllPaymentRequests();
  }),
  
  create: protectedProcedure
    .input(z.object({
      amount: z.number(),
      description: z.string(),
      category: z.string().optional(),
      receiptUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createPaymentRequest({
        ...input,
        requesterId: ctx.user.id,
        requesterName: ctx.user.name,
      });
    }),
    
  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await db.updatePaymentRequestStatus(
        input.id,
        'approved',
        ctx.user.id
      );
    }),
    
  reject: protectedProcedure
    .input(z.object({ id: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      return await db.updatePaymentRequestStatus(input.id, 'rejected');
    }),
    
  markPaid: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.updatePaymentRequestStatus(input.id, 'paid');
    }),
}),
```

---

## 🔐 Authentication

The app uses JWT-based authentication. Current user is available in tRPC context:
```typescript
ctx.user // { id: string, name: string, email: string }
```

Use `protectedProcedure` for endpoints that require authentication.

---

## 🎨 UI Components Available

The app uses Radix UI + Tailwind. Available components:
- `Button`, `Input`, `Label`, `Select`, `Dialog`, `Card`
- `Table`, `Badge`, `Tabs`, `Tooltip`, `Dropdown`
- `toast` from Sonner for notifications

Example usage:
```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

toast.success("Payment request submitted!");
```

---

## 📝 Development Workflow

### 1. Clone Repository
```bash
git clone https://github.com/gigabrain-lgtm/sunday-planning-system.git
cd sunday-planning-system
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Environment Variables
Create `.env` file with database connection string

### 4. Run Development Server
```bash
pnpm dev
```

### 5. Make Changes
- Add page component
- Add database schema
- Add tRPC endpoints
- Test locally

### 6. Commit and Push
```bash
git add .
git commit -m "Add payment request system"
git push origin main
```

### 7. Auto-Deploy
- Digital Ocean automatically deploys on push to `main`
- Wait 3-4 minutes for deployment
- Check deployment status in Digital Ocean dashboard

---

## 🗄️ Database Access

### Run Migration Manually (if needed)
```bash
cd /path/to/sunday-planning-system
DATABASE_URL="<get from Digital Ocean env vars>" node run-migration.js
```

### Database Tables Currently in Use
- `users` - User accounts
- `weekly_plannings` - Weekly planning data
- `manifestations` - Manifestation tracking
- `key_result_objective_mappings` - OKR mappings
- `visualizations` - Visualization data
- `sleep_sessions` - Sleep tracking
- `agencies` - Agency overrides (recently added)
- `standup_stats` - Standup statistics

---

## 🔔 Slack Integration (Optional)

If you want to send Slack notifications for payment requests:

File: `server/slack.ts`

Add function:
```typescript
export async function postPaymentRequestNotification(
  channelId: string,
  requesterName: string,
  amount: number,
  description: string
) {
  // Similar to postContentApprovalNotification
}
```

Slack Bot Token is already configured in Digital Ocean environment variables.

---

## 📊 Example: Similar Feature (Content Approval)

For reference, the content approval system works like this:

1. **Page:** `client/src/pages/Dashboard.tsx`
2. **API Endpoints:** `server/routers.ts` (dashboard router)
3. **Database:** Tasks stored in ClickUp (external)
4. **Slack Notifications:** `server/slack.ts` (`postContentApprovalNotification`)

You can follow a similar pattern for payment requests!

---

## 🚀 Deployment Notes

- **Automatic:** Push to `main` triggers deployment
- **Manual Migration:** Use `run-migration.js` script if needed
- **Database:** Already set up and running
- **Environment Variables:** Already configured in Digital Ocean
- **No additional setup needed** - just code and push!

---

## 📞 Support

If you need help:
1. Check existing code in `Dashboard.tsx` and `OrgChart.tsx` for patterns
2. Review `server/routers.ts` for API endpoint examples
3. Look at `drizzle/schema.ts` for database schema examples
4. Test locally before pushing to production

---

## ✅ Checklist for Payment Request System

- [ ] Create `PaymentRequests.tsx` page component
- [ ] Add route to `App.tsx`
- [ ] Add sidebar menu item
- [ ] Create database schema in `drizzle/schema.ts`
- [ ] Create migration SQL file
- [ ] Add database helper functions in `server/db.ts`
- [ ] Add tRPC endpoints in `server/routers.ts`
- [ ] Test locally
- [ ] Commit and push to `main`
- [ ] Verify deployment in Digital Ocean
- [ ] Test in production

---

**Good luck! The codebase is well-structured and follows consistent patterns. Feel free to reference existing features for guidance.** 🎉
