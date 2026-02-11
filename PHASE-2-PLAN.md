# Autonomous Design Agency - Phase 2 Plan

## Phase 1 Recap ✅ (COMPLETE)

**Client Portal Foundation:**
- ✅ Next.js 16 application with TypeScript
- ✅ Landing page with agency overview and pricing
- ✅ Authentication UI (signup/login pages)
- ✅ Client dashboard with project overview
- ✅ Client intake form
- ✅ Supabase client with database schema design
- ✅ Stripe integration for payments
- ✅ Build passing, GitHub repository created
- ✅ Deployment-ready configuration

**Tech Stack:**
- Next.js 16.1.6 (App Router + Turbopack)
- TypeScript
- Tailwind CSS v4 (dark theme)
- Supabase (PostgreSQL + Auth + Real-time)
- Stripe Connect ( payments)
- Lucide React (icons)

---

## Phase 2: Production Deployment & Backend Integration

### Goals
1. Deploy client portal to production (Vercel)
2. Connect to real Supabase project
3. Implement real authentication flow
4. Set up database migrations
5. Build orchestrator coordination layer
6. Implement AI quote generation system

### 2.1 Deployment to Vercel

**Tasks:**
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy production build
- [ ] Test live deployment
- [ ] Set up custom domain (if needed)

**Environment Variables Required:**
```
NEXT_PUBLIC_SUPABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2.2 Supabase Project Setup

**Tasks:**
- [ ] Create Supabase project (Production)
- [ ] Configure authentication settings
- [ ] Run database migrations (schema.sql)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create storage buckets (project assets)
- [ ] Set up real-time subscriptions

**Database Schema:**
```sql
-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'intake',
  description TEXT,
  features JSONB,
  timeline TEXT,
  budget TEXT, -- stored as range '8-12', '15-25', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_checkout_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Messages table (client communication)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  sender TEXT NOT NULL, -- 'client' or 'agent'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table (logos, files)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  type TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Real Authentication Implementation

**Tasks:**
- [ ] Implement Supabase Auth session management
- [ ] Connect signup form to Supabase
- [ ] Connect login form to Supabase
- [ ] Add protected route middleware
- [ ] Implement logout functionality
- [ ] Add user profile management

**Supabase Auth Flow:**
```typescript
// Example: Signup with Supabase
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
    },
  },
});
```

### 2.4 Project Management Features

**Client Portal Features:**
- [ ] View active projects
- [ ] Upload project files/SaaS
- [ ] Send messages to agent
- [ ] View invoices and payments
- [ ] Approve deliverables
- [ ] Schedule meetings

**Admin Dashboard:**
- [ ] View all clients
- [ ] Manage projects
- [ ] AI quote generation interface
- [ ] Payment tracking
- [ ] Agent performance metrics

### 2.5 AI Quote Generation System

**Goal:** Autonomous quote generation based on client intake data.

**System Components:**
1. **Intake Parser** - Extract key requirements from form
2. **Complexity Calculator** - Estimate effort based on type, features, timeline
3. **Pricing Engine** - Calculate quote based on complexity + market rates
4. **Quote Generator** - Generate professional quote document
5. **Review Loop** - Human (John) approves before sending to client

**Complexity Factors:**
- Project type (portfolio: 1x, ecommerce: 1.5x, saas: 2x, custom: 2.5x)
- Feature count (base + 5 days per complex feature)
- Timeline urgency (rush projects: +20%)
- Scope clarity (vague requirements: +30% buffer)

**Quote Generation Logic:**
```
Base Rate:
- Portfolio: €8,000 - €12,000
- E-commerce: €15,000 - €25,000
- SaaS: €25,000 - €50,000
- Custom: €50,000+

Complexity Multiplier:
- Simple website: 1.0x
- Integration-intensive: 1.3x
- Custom architecture: 1.5x
- Multi-platform: 1.8x

Estimated Days:
- Base: 2-4 weeks (portfolio), 4-8 weeks (ecommerce), 8-12 weeks (saas)
- + Features: 5 days per major feature
- Buffer: 20-30%

Final Quote = Base Rate × Complexity Multiplier
```

### 2.6 Orchestrator Coordination Layer

**Goal:** Jarvis coordinates all layers (Client Portal → Design → Development → QA → Deployment).

**Orchestrator Workflow:**
```
1. Client submits intake form
   ↓
2. Orchestrator receives project data
   ↓
3. AI generates quote (Layer 2)
   ↓
4. Human (John) reviews and approves
   ↓
5. Client accepts quote (+ Stripe deposit)
   ↓
6. Design phase activates (frontend-design skill + theme-factory)
   ↓
7. Development phase activates (Cursor CLI primary)
   ↓
8. QA phase activates (Testing Foundation)
   ↓
9. Deployment phase activates (vercel skill)
   ↓
10. Client handoff + ongoing support
```

**Orchestrator System:**
- State machine for project lifecycle
- Task queue for AI agents
- Status tracking dashboard
- Slack/Telegram notifications
- Escalation matrix (for issues beyond AI capability)

---

## Phase 3: Scalable Platform Operations

### Goals (Future)
- [ ] Build admin dashboard for John
- [ ] Implement project templates (portfolio, ecommerce, saas)
- [ ] Create reusable component library
- [ ] Set up monitoring and analytics
- [ ] Implement automated testing pipeline
- [ ] Build client onboarding automation

---

## Priority Order

**Immediate (This Session):**
1. Deploy to Vercel (production URL)
2. Create Supabase project
3. Implement real authentication
4. Test end-to-end client flow

**Short-term (Next Sessions):**
5. Build AI quote generation system
6. Implement project management features
7. Create orchestrator coordination layer

**Medium-term (Week 2):**
8. Build admin dashboard
9. Connect Stripe payments
10. Set up messaging system

---

*Last Updated: 2026-02-11*
*Phase 2 Status: IN PROGRESS*
