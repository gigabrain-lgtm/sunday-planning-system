# Hiring System Integration Guide

## 🎯 Objective
Integrate the hiring system into the Sunday Planning application so it appears as a tab in the sidebar and shares the same deployment, database, and authentication.

---

## 📋 Project Overview

**Main Application:** Sunday Planning System  
**GitHub Repository:** https://github.com/gigabrain-lgtm/sunday-planning-system  
**Branch:** `main`  
**Deployment:** Digital Ocean App Platform  
**Database:** PostgreSQL (shared with main app)

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + tRPC
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** Tailwind CSS + shadcn/ui components
- **Deployment:** Digital Ocean App Platform (auto-deploy from `main` branch)

### Current Structure
```
sunday-planning-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Agencies.tsx
│   │   │   ├── PaymentRequestsAdmin.tsx
│   │   │   └── ... (add Hiring pages here)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Sidebar.tsx  # ⚠️ Add "Hiring" link here
│   │   │   └── ui/              # shadcn components
│   │   ├── App.tsx              # ⚠️ Add hiring routes here
│   │   └── lib/
│   │       └── trpc.ts
│   └── index.html
├── server/                    # Backend
│   ├── routers.ts            # ⚠️ Add hiring router here
│   ├── db.ts                 # Database functions
│   ├── slack.ts              # Slack integrations
│   └── _core/
│       └── env.ts
├── drizzle/                  # Database
│   ├── schema.ts             # ⚠️ Add hiring tables here
│   └── migrations/           # SQL migrations
└── package.json

```

---

## 🚀 Integration Steps

### Step 1: Add Database Schema

Add hiring-related tables to `drizzle/schema.ts`:

```typescript
// Example hiring tables
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 255 }),
  status: varchar("status", { length: 50 }).default("open"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  resumeUrl: varchar("resumeUrl", { length: 500 }),
  jobPostingId: integer("jobPostingId").references(() => jobPostings.id),
  status: varchar("status", { length: 50 }).default("applied"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

Create migration file in `drizzle/`:
```sql
-- drizzle/0014_hiring_tables.sql
CREATE TABLE IF NOT EXISTS "job_postings" (
  "id" serial PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "description" text,
  "department" varchar(255),
  "status" varchar(50) DEFAULT 'open',
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "candidates" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50),
  "resumeUrl" varchar(500),
  "jobPostingId" integer REFERENCES "job_postings"("id"),
  "status" varchar(50) DEFAULT 'applied',
  "createdAt" timestamp DEFAULT now() NOT NULL
);
```

### Step 2: Add Database Functions

Add to `server/db.ts`:

```typescript
// Hiring database functions
export async function createJobPosting(data: any) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  
  const [posting] = await dbInstance
    .insert(jobPostings)
    .values(data)
    .returning();
  return posting;
}

export async function getAllJobPostings() {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  
  return await dbInstance.select().from(jobPostings);
}

export async function createCandidate(data: any) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  
  const [candidate] = await dbInstance
    .insert(candidates)
    .values(data)
    .returning();
  return candidate;
}

export async function getCandidatesByJobPosting(jobPostingId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  
  return await dbInstance
    .select()
    .from(candidates)
    .where(eq(candidates.jobPostingId, jobPostingId));
}
```

### Step 3: Add Backend API Router

Add to `server/routers.ts` (before the closing `export const appRouter`):

```typescript
  hiring: router({
    // Job Postings
    createJobPosting: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        department: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createJobPosting(input);
      }),

    getAllJobPostings: protectedProcedure
      .query(async () => {
        return await db.getAllJobPostings();
      }),

    // Candidates
    createCandidate: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        resumeUrl: z.string().optional(),
        jobPostingId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCandidate(input);
      }),

    getCandidatesByJobPosting: protectedProcedure
      .input(z.object({ jobPostingId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCandidatesByJobPosting(input.jobPostingId);
      }),
  }),
```

### Step 4: Add Frontend Pages

Create `client/src/pages/Hiring.tsx`:

```typescript
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Plus, Users, Briefcase } from "lucide-react";

export default function Hiring() {
  const { data: jobPostings, isLoading } = trpc.hiring.getAllJobPostings.useQuery();

  return (
    <Sidebar>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hiring</h1>
            <p className="text-gray-500 mt-1">Manage job postings and candidates</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Job Posting
          </Button>
        </div>

        {/* Add your hiring UI here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobPostings?.map((job) => (
            <div key={job.id} className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{job.department}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {job.status}
                </span>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  View Candidates
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
```

### Step 5: Add Route to App

Update `client/src/App.tsx`:

```typescript
import Hiring from "./pages/Hiring";

// Inside the Routes component:
<Route path="/hiring" element={<Hiring />} />
```

### Step 6: Add Sidebar Link

Update `client/src/components/layout/Sidebar.tsx`:

```typescript
import { Users } from "lucide-react"; // Add to imports

// Add to navigation items:
<Link
  to="/hiring"
  className={cn(
    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
    location.pathname === "/hiring"
      ? "bg-primary text-primary-foreground"
      : "text-gray-700 hover:bg-gray-100"
  )}
>
  <Users className="h-5 w-5" />
  <span>Hiring</span>
</Link>
```

---

## 🗄️ Database Connection

**Connection String:** Already configured in Digital Ocean environment variables as `DATABASE_URL`

**To run migrations manually:**
```bash
cd /home/ubuntu/sunday-planning-system
export DATABASE_URL="<get from Digital Ocean>"
node run-migration.js
```

Or create a migration script similar to the payment system.

---

## 🔐 Authentication

The app uses a simple authentication system:
- Protected routes require login
- Use `protectedProcedure` for admin-only endpoints
- Use `publicProcedure` for candidate-facing endpoints (like job applications)

---

## 🎨 UI Components

Use existing shadcn/ui components:
- `Button`, `Dialog`, `Input`, `Label`, `Badge`, `Select`, etc.
- Located in `client/src/components/ui/`
- Follow existing patterns from other pages

---

## 📤 Deployment

### Automatic Deployment
1. Push to `main` branch
2. Digital Ocean automatically deploys
3. Takes ~3-4 minutes
4. Migrations run automatically (if configured)

### Manual Migration
If migrations don't run automatically:
1. Get `DATABASE_URL` from Digital Ocean
2. Run migration script (see database section above)

---

## ✅ Integration Checklist

- [ ] Add hiring tables to `drizzle/schema.ts`
- [ ] Create migration SQL file
- [ ] Add database functions to `server/db.ts`
- [ ] Add hiring router to `server/routers.ts`
- [ ] Create `Hiring.tsx` page component
- [ ] Add route to `App.tsx`
- [ ] Add "Hiring" link to `Sidebar.tsx`
- [ ] Test locally
- [ ] Commit and push to `main`
- [ ] Verify deployment
- [ ] Run migrations if needed

---

## 🔗 Useful Links

- **GitHub Repo:** https://github.com/gigabrain-lgtm/sunday-planning-system
- **Existing Handoff Doc:** See `PAYMENT_SYSTEM_HANDOFF.md` for reference
- **Digital Ocean:** App Platform → sunday-planning-system

---

## 💡 Tips

1. **Follow existing patterns** - Look at `PaymentRequestsAdmin.tsx` and `Dashboard.tsx` for examples
2. **Use tRPC** - All API calls use tRPC (see `client/src/lib/trpc.ts`)
3. **Reuse components** - Don't recreate UI components, use existing ones
4. **Test locally first** - Run `npm run dev` before pushing
5. **Check console** - Digital Ocean deployment logs show errors

---

## 🆘 Need Help?

- Check existing pages for patterns
- Database functions are in `server/db.ts`
- API routes are in `server/routers.ts`
- UI components are in `client/src/components/ui/`

---

**Ready to integrate! Follow the steps above and the hiring system will be seamlessly added to the Sunday Planning app.** 🚀
