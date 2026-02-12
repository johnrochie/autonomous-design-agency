# Autonomous Design Agency - Production Launch Guide

## Executive Summary

**Status:** MVP Ready for Test Clients ✅
**Launch Date:** 2026-02-12
**Live URL:** https://autonomous-design-agency.vercel.app/
**GitHub:** https://github.com/johnrochie/autonomous-design-agency

---

## What's Built & Working ✅

### Core Features (Phase 1-3 Complete)

| Feature | Status | URL/Location |
|---------|--------|--------------|
| **Client Portal** | ✅ Working | `/auth/signup`, `/auth/login` |
| Client Intake Form | ✅ Working | `/client/intake` (4-step) |
| Client Dashboard | ✅ Working | `/dashboard` |
| Client Project Details | ✅ Working | `/dashboard/projects/[id]` |
| **Admin Operations** | ✅ Working | `/admin/dashboard` |
| Admin Projects List | ✅ Working | `/admin/projects` |
| Admin Project Details | ✅ Working | `/admin/projects/[id]` |
| AI Quote Generator | ✅ Working | Admin project detail → "Generate AI Quote" |
| Quote Approval/Rejection | ✅ Working | Admin project detail |
| **Real-Time Messaging** | ✅ Working | Project detail pages both portals |
| **Milestone Tracking** | ✅ Working | Admin manager + Client viewer |

### Technical Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **Authentication** | ✅ Working | Supabase auth, signup/login/logout |
| **Database** | ✅ Working | PostgreSQL on Supabase, 9 tables |
| **Real-Time Subscriptions** | ✅ Working | Supabase real-time for messages |
| **Email Integration** | 📧 Ready | SendGrid configured, awaiting API key |
| **Payment Integration** | ✅ Test Mode | Stripe Connect (test keys) |
| **Testing** | ✅ Working | 25 tests passing, pre-commit hooks |
| **CI/CD** | ✅ Working | GitHub Actions (test on push) |
| **Deployment** | ✅ Live | Vercel, auto-deploy on git push |

---

## Before Production: Config Checklist

### 1. Supabase Configuration ✅ (Done)
- [x] Project created: `qhxegwncevstdpwpktgm`
- [x] Tables created (9 tables)
- [x] Row Level Security (RLS) enabled and configured
- [x] Real-time subscriptions enabled for messages
- [x] Admin role assigned to johnrochie86@gmail.com
- [x] Email confirmation disabled (for testing)

### 2. SendGrid Email Setup 📧 (Partially Complete)

**Status:** Email infrastructure built, awaiting API key

**Tasks:**
- [ ] Create SendGrid account: https://sendgrid.com/
- [ ] Generate API key and add to Vercel environment variables
- [ ] Set up sender authentication (single sender or domain)
- [ ] Test email sending
- [ ] Verify emails deliver to inbox (not spam)

**Files created:**
- `lib/email.ts` - Email functions (5 email types)
- `app/api/emails/quote/route.ts` - API endpoint for email sending
- `docs/SENDGRID-SETUP.md` - Complete setup guide

**Environment variables needed:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx.xxxxxx
FROM_EMAIL=info@autonomousdesignagency.ie
FROM_NAME=Autonomous Design Agency
```

### 3. Stripe Configuration 💳 (Test Mode Ready)

**Status:** Integration built, test keys only

**Current state:**
- [x] Stripe Checkout sessions configured (`lib/stripe.ts`)
- [x] Invoice model in database
- [x] Payment tracking in codebase
- [ ] Live API keys (currently test only)
- [ ] Stripe Connect account application (for driver payouts)

**For Production (Later):**
- [ ] Switch to live API keys
- [ ] Complete Connect application
- [ ] Add live webhook endpoint
- [ ] Test live payment flow

### 4. Domain & Branding (Optional for MVP)

**Status:** Using Vercel URL (acceptable for beta/soft launch)

**Future setup:**
- [ ] Buy domain: autonomousdesignagency.ie (or similar)
- [ ] Configure DNS settings
- [ ] Connect domain to Vercel
- [ ] Auto-SSL certificate (Vercel handles this)

**Current URL:** `https://autonomousdesign-agency.vercel.app/`
**Acceptable for:** 10-20 test clients, beta phase

### 5. Monitoring & Backups (Good to Have)

**Status:** Manual monitoring (Supabase dashboard + Vercel logs)

**Future setup:**
- [ ] Automated daily backups (Supabase backups)
- [ ] Error tracking (Sentry or similar)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Analytics (Vercel Analytics + custom event tracking)

---

## Launch Options

### Option A: MVP Soft Launch (Recommended for Now)

**Launch immediately** with current state:

**Pros:**
- Start generating feedback immediately
- 1-2 free/friend test clients
- No additional setup required
- Iterate faster based on real usage

**Cons:**
- No automated email notifications (manual emails from you)
- Test Stripe mode only (no real payments, accept cash/test)
- Vercel URL (less professional)
- Manual backups (Supabase has built-in backups anyway)

**Timeline:** Start **today** ✅
**Effort:** 0 hours (already ready)

---

### Option B: Full Production Launch

**Finish Phase 4 before launch:**

**Work needed:**
- SendGrid setup (2-3 hours)
- Custom domain purchase + DNS (1 hour)
- Stripe live mode (2-3 hours)
- Automated backups and monitoring (2-3 hours)
- Testing and verification (2-3 hours)

**Total:** ~10-15 hours additional work

**Timeline:** Ready in **2-3 days**

**Pros:**
- Professional from day 1
- Automated everything (emails, payments, backups)
- Custom domain (branding)
- Monitoring and alerts

**Cons:**
- Delays learning from real clients
- More upfront investment

---

## Recommended Launch Strategy: Hybrid Approach

**Phase 1 (Week 1): MVP Soft Launch**
- Take 1-2 free/friend test clients
- Use current Vercel URL
- Manual emails for notifications
- Test Stripe (no actual payments yet)
- Gather feedback, iterate

**Phase 2 (Week 2-3): Infrastructure Upgrade**
- SendGrid email automation (2-3 hours)
- Custom domain (1 hour)
- Stripe live mode (2-3 hours)
- Start charging real clients

**Phase 3 (Week 4+): Scale**
- Add push notifications
- Advanced monitoring
- Optimize based on real data

---

## First Client Onboarding Checklist

### For Each New Client

**1. Client Signs Up:**
- [ ] Client visits `/auth/signup`
- [ ] Client fills: email, password, name
- [ ] Admin verifies: client appears in Supabase dashboard

**2. Client Submits Project:**
- [ ] Client visits `/client/intake`
- [ ] Completes 4-step form (info → details → features → timeline)
- [ ] Client submits form → Creates client + project records

**3. Admin Generates Quote:**
- [ ] Admin visits `/admin/projects`
- [ ] Clicks project → Project detail page
- [ ] Clicks "Generate AI Quote" → Quote appears
- [ ] Admin reviews breakdown
- [ ] Admin clicks "Approve & Confirm" (or "Reject Quote")

**4. Admin Sets Up Milestones:**
- [ ] Admin scrolls to "Project Milestones"
- [ ] Clicks "Add Milestone" → Enters name
- [ ] Adds description and due date (optional)
- [ ] Admin adds 5-10 milestones covering full project

**5. Messaging & Updates:**
- [ ] Admin sends welcome message in Messages panel
- [ ] Client replies, communication continues
- [ ] Admin updates milestones as work progresses
- [ ] Admin changes project status (confirmed → design → development, etc.)

---

## Admin Dashboard Quick Reference

**Admin Dashboard:** https://autonomous-design-agency.vercel.app/admin/dashboard

**Key Actions:**
1. **View All Projects:** `/admin/projects` → Stats + list
2. **Manage Project:** Click project → `/admin/projects/[id]`
3. **Generate Quote:** Scroll to Quote section → "Generate AI Quote"
4. **Approve Quote:** Click "Approve & Confirm" button
5. **Add Milestones:** Scroll to Milestones → "Add Milestone"
6. **Send Messages:** Scroll to Messages → Type and send
7. **Update Status:** Use status dropdown in right column

---

## Common Operations

### Create a New Project Manually (Admin)

**Step 1:** In Supabase SQL Editor, add client:
```sql
INSERT INTO public.clients (email, full_name, company_name, industry)
VALUES (
  'client@example.com',
  'Jane Smith',
  'Example Inc',
  'Technology'
);
```

**Step 2:** Add project:
```sql
INSERT INTO public.projects (
  client_id,
  name,
  type,
  status,
  description,
  features
)
VALUES (
  (SELECT id FROM public.clients WHERE email = 'client@example.com'),
  'Example Portfolio Website',
  'portfolio',
  'intake',
  'Create a modern portfolio website for Jane Smith...',
  '["Contact Forms", "Blog", "Photo Gallery"]'::jsonb
);
```

**Then:** Admin can manage (add milestones, generate quote, send messages)

### Reset a Project (Delete + Recreate)

**In Supabase SQL Editor:**
```sql
-- Delete project (cascades: messages, milestones,_quote_breakdowns)
DELETE FROM public.projects WHERE name = 'Example Project';
```

---

## Email Flow (Once SendGrid Configured)

**Email triggers:**

| Event | Email Type | Recipient |
|-------|-----------|-----------|
| Client signs up | Welcome email | Client |
| Quote generated/approved | Quote notification | Client |
| Project status changes | Project update | Client |
| Milestone completed | Milestone achievement | Client |
| New message (optional, future) | Message notification | Other party |

**Email templates:** See `lib/email.ts`

**Customization:** Edit HTML in `lib/email.ts`

---

## Performance Metrics to Track

**Client-side (from Supabase + Vercel):**
- New clients per week
- Submissions per week
- Conversion rate: signup → project submission
- Quote approval rate
- Average project completion time

**Technical metrics:**
- Page load times (average under 2s)
- API error rate (target < 1%)
- Email delivery rate (target > 98%)
- Stripe success rate (target > 95%)

---

## Pricing & Revenue Tracking

**For MVP (no real payments):**
- Free projects for friends/family
- Track quote amounts manually (spreadsheet)
- Estimate revenue potential

**For Production:**
- Use Stripe live mode
- Automatic payment tracking in database
- Revenue dashboard (add to admin dashboard later)

---

## Troubleshooting Guide

**Issue: Client can't sign up**
- Check Supabase auth enabled
- Check email confirmation (disabled currently)
- Try different browser or incognito mode

**Issue: Admin dashboard empty**
- Check you're logged in as admin
- Verify admin role in Supabase: `SELECT * FROM public.profiles WHERE email = 'johnrochie@...'`
- Check RLS policies allow admins to see projects

**Issue: Quote generation fails**
- Check Supabase quote_generator functions
- Check browser console for errors
- Check Supabase logs

**Issue: Messages not sending**
- Check real-time subscription (should show console logs)
- Check messages table in Supabase
- Verify client_id matches

**Issue: Milestones not visible to clients**
- Check RLS policies for milestones table
- Verify project_id matches
- Clear browser cache and refresh

---

## Success Criteria (Week 1-2)

**Technical:**
- ✅ All 5 Phase 3 features working
- [ ] SendGrid emails delivering
- [ ] At least 1 test client completes full flow (signup → project → quote → milestones)

**Business:**
- [ ] 1-2 free/friend clients on-boarded
- [ ] 1 full project completed (or in progress)
- [ ] Client feedback collected
- [ ] Lessons documented for iteration

**Next Steps (After Week 1):**
- [ ] SendGrid live (2-3 hours)
- [ ] Custom domain (1 hour)
- [ ] Stripe live mode (2-3 hours)
- [ ] Start charging real clients

---

## Contact & Support

**Admin Email:** johnrochie86@gmail.com (you)
**Client Support:** support@autonomousdesignagency.ie (once configured)
**GitHub Issue Tracker:** https://github.com/johnrochie/autonomous-design-agency/issues

**Supabase Dashboard:** https://app.supabase.com/project/qhxegwncevstdpwpktgm
**Vercel Dashboard:** https://vercel.com/johnrocie/autonomous-design-agency

---

## Summary

**Status:** Ready for **test clients right now** 🚀

**Live and working:**
- Authentication (Supabase)
- Client portal (intake, dashboard, project details)
- Admin operations (dashboard, quotes, messages, milestones)
- Real-time messaging
- AI quote generation

**Infrastructure ready (awaiting config):**
- SendGrid email notifications
- Stripe live payments

**Next immediate action:** Start onboarding 1-2 test clients manually

You're ready to go, John —— 🤖

---

*Last updated: 2026-02-12*
