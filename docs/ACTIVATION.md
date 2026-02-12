# Autonomous Design Agency - Activation Guide

**Complete setup for full autonomous operation**

---

## 🎯 What You're Setting Up

After activation, your system will:
- Run autonomous agents to build websites
- Send automatic client emails (SendGrid)
- Post to social media automatically
- Research trending topics every 6 hours
- Generate analytics reports daily

---

## 📋 Prerequisites

- [ ] Supabase account and project created
- [ ] cron-job.org account created
- [ ] SendGrid account created (optional, for emails)

---

## 🗄️ Step 1: Run Database Schemas (10-15 min)

### Go to Supabase SQL Editor
1. Open: `https://supabase.com/dashboard`
2. Click your project: `autonomous-design-agency`
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**

### Run all 6 schemas (in order)

**Schema 1: Agent System**
```bash
# On your computer:
cat /home/jr/.openclaw/workspace/autonomous-design-agency/backend/schema-agents.sql
```
→ Select ALL → Copy → Paste in Supabase → Click **Run**
→ ✅ Should see: `Autonomous Agent System database schema created successfully`

**Schema 2: Social Media**
```bash
cat /home/jr/.openclaw/workspace/autonomous-design-agency/backend/schema-social-media.sql
```
→ Paste → Run
→ ✅ Should see: `Social media bot database schema created successfully`

**Schema 3: Email Tracking**
```bash
cat /home/jr/.openclaw/workspace/autonomous-design-agency/backend/schema-email-tracking.sql
```
→ Paste → Run
→ ✅ Should see: `Email tracking schema created successfully`

**Schema 4: Cron Jobs**
```bash
cat /home/jr/.openclaw/workspace/autonomous-design-agency/backend/schema-cron-jobs.sql
```
→ Paste → Run
→ ✅ Should see: `Cron job system database schema created successfully`

**Schema 5: Trend Research**
```bash
cat /home/jr/.openclaw/workspace/autonomous-design-agency/backend/schema-trend-research.sql
```
→ Paste → Run
→ ✅ Should see: `Trend research system database extensions created successfully`

**Schema 6: Cron Trend Update**
```bash
cat /home/jr/.openclaw/workspace/autonomous-design-agency/backend/schema-cron-trend-update.sql
```
→ Paste → Run
→ ✅ Should see: `Trend research job added to cron jobs`

---

## ✅ Step 2: Verify Database Setup (2 min)

After running all schemas, verify:

1. In Supabase left sidebar, click **"Database"** → **"Tables"**
2. **You should see these tables:**

**Agent System:**
- ✅ `agents`
- ✅ `agent_tasks`
- ✅ `agent_logs`
- ✅ `project_agent_tracking`

**Social Media:**
- ✅ `social_posts`
- ✅ `social_analytics`
- ✅ `brand_guidelines`
- ✅ `content_topics`

**Email:**
- ✅ `email_logs`

**Cron Jobs:**
- ✅ `cron_jobs`
- ✅ `cron_job_logs`

**Trend Research:**
- ✅ `trending_topics`
- ✅ `research_logs`

**If you see all 14 tables** → Database setup complete! 🎉

---

## 🕐 Step 3: Cron Job Setup Already Done ✅

You've already set up cron-job.org! The job is:
- URL: `https://autonomous-design-agency.vercel.app/api/cron/execute`
- Schedule: Every hour

**Status:** ✅ Active

---

## 📧 Step 4: SendGrid Setup (10 min)

If you want automatic emails:

1. **Create Sender:**
   - Go to SendGrid → Settings → Sender Identity
   - Add your email address → Click **"Create"**
   - Verify by clicking link in email

2. **Create API Key:**
   - Settings → API Keys → Create API Key
   - Name: `Autonomous Design Agency`
   - Permissions: Mail Send (at minimum)
   - Click **Create & View** → Copy the key

3. **Add to Vercel:**
   - Go to: https://vercel.com/dashboard
   - Open project: `autonomous-design-agency`
   - Settings → Environment Variables
   - Add: `SENDGRID_API_KEY` = paste your key
   - Click **Save** → Auto-deploys

---

## 🐦 Step 5: Social Media APIs (Optional - 20 min)

For automated posting:

### Twitter/X
1. Go to: https://developer.twitter.com
2. Create app → Get credentials:
   - Bearer Token
   - Consumer Key & Secret
   - Access Token & Secret
3. Add to Vercel:
   - `TWITTER_BEARER_TOKEN`
   - `TWITTER_CONSUMER_KEY`
   - `TWITTER_CONSUMER_SECRET`
   - `TWITTER_ACCESS_TOKEN`

### Facebook
1. Go to: https://developers.facebook.com
2. Create app → Get credentials:
   - Page Access Token
   - Page ID
3. Add to Vercel:
   - `FACEBOOK_PAGE_ACCESS_TOKEN`
   - `FACEBOOK_PAGE_ID`

---

## 🧪 Step 6: Test the System

### Verify Cron Jobs Work
Go to: `https://autonomous-design-agency.vercel.app/api/cron/status`

**Should JSON like this:**
```json
{
  "jobs": [
    {
      "name": "Social Media Posting",
      "status": "idle",
      "enabled": true
    },
    {
      "name": "Trend Research",
      "status": "idle",
      "enabled": true
    },
    ...
  ]
}
```

### Verify Agents Created
Run this in Supabase SQL Editor:
```sql
SELECT name, type, status FROM public.agents;
```

**Should see:**
- `Cursor-Agent-1` | `cursor_cli` | `idle`

### Verify Analytics Works
Go to: `https://autonomous-design-agency.vercel.app/admin/analytics`

**Should see:** System health dashboard with all systems operational 🔋

---

## 🎉 You're Live!

After completing Steps 1-4, your system is fully autonomous:

- ✅ Agents ready for activation on projects
- ✅ Cron jobs running automatically
- ✅ Emails sending to clients (SendGrid)
- ✅ Analytics dashboard live
- ✅ Trend research every 6 hours
- ✅ Social posts auto-generated

**Your role:** Just review AI work and approve key milestones! 🚀

---

## 🆘 Troubleshooting

### Schema errors when running
→ Copy error message and verify file
→ Check that previous schema ran successfully
→ Run in order (1 → 2 → 3 → 4 → 5 → 6)

### Tables not appearing
→ Check Supabase → Database → Tables
→ Wait 30 seconds and refresh
→ Verify the schema showed "created successfully"

### Cron jobs not firing
→ Check cron-job.org dashboard
→ Verify URL is correct (https://autonomous-design-agency.vercel.app/api/cron/execute)
→ Check job is "enabled" not "paused"

### Emails not sending
→ Verify SendGrid API key in Vercel
→ Check SendGrid dashboard for delivery logs
→ Email logs in Supabase: `SELECT * FROM public.email_logs;`

---

## 📞 Need Help?

1. **Schema errors:** Copy/paste error message → I'll fix
2. **Missing tables:** I'll help recreate them
3. **API issues:** I'll verify credentials

**Good luck! 🚀**
