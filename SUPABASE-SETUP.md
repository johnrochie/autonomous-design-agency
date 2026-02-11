# Supabase Setup Guide

## Step 1: Create Supabase Project

1. **Visit Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Log in with your GitHub account

2. **Create New Project**
   - Click "+ New Project"
   - **Organization:** Select your organization
   - **Name:** `autonomous-design-agency`
   - **Database Password:** Generate strong password (SAVE THIS!)
   - **Region:** Choose nearest region (e.g., `EU West (Dublin)` if available)
   - **Pricing Plan:** Choose Free tier (500MB database)
   - Click "Create new project"
   - Wait 1-2 minutes for project to initialize

---

## Step 2: Get Project Credentials

After project creation, go to **Settings → API**:

Save these credentials for Vercel environment variables:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (KEEP SECRET!)
```

**Do not commit service_role key to any public repository!**

---

## Step 3: Run Database Schema

1. **Open SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in left sidebar
   - Click "New query"

2. **Run Schema**
   - Copy contents of `supabase/schema.sql`
   - Paste into SQL Editor
   - Click "Run" (▶) or press `Cmd/Ctrl + Enter`
   - Verify all tables created successfully

3. **Verify Tables**
   - Go to "Table Editor" in left sidebar
   - You should see: `profiles`, `clients`, `projects`, `invoices`, `messages`, `assets`, `milestones`, `quote_breakdowns`

---

## Step 4: Configure Authentication

### Email Templates (Optional but Recommended)

Go to **Authentication → Email Templates** and customize:

1. **Confirm Signup**: Customize welcome email
2. **Reset Password**: Password reset template
3. **Email Change**: Email change confirmation

### Auth Providers

**Enable GitHub OAuth (Optional):**
- Go to **Authentication → Providers**
- Enable GitHub
- Add GitHub OAuth credentials from GitHub Developer Settings

---

## Step 5: Set Up Storage (For Client Assets)

1. **Create Bucket**
   - Go to "Storage" in left sidebar
   - Click "Create new bucket"
   - **Name:** `client-assets`
   - **Public:** No (private for security)
   - **File Size Limit:** 50MB
   - Click "Create bucket"

2. **Configure Bucket Policies**
   - Click bucket to open it
   - Click "Policies"
   - Add policy to allow authenticated users to upload/download:
   ```sql
   create policy "Authenticated users can upload files"
   on storage.objects for insert
   to authenticated
   with check (bucket_id = 'client-assets');

   create policy "Authenticated users can download own files"
   on storage.objects for select
   to authenticated
   using (bucket_id = 'client-assets');
   ```

---

## Step 6: Enable Real-Time (For Messages)

1. **Go to Database Replication**
   - In Supabase dashboard, go to **Database → Replication**

2. **Enable Real-Time for Messages**
   - Find `messages` table
   - Click toggle to enable real-time replication
   - Click "Save Replication Configuration"

3. **Test Real-Time**
   - Use Supabase JS client to subscribe to messages:
   ```typescript
   supabase
     .channel('messages')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
       console.log('New message:', payload);
     })
     .subscribe();
   ```

---

## Step 7: Configure Environment Variables

In your Vercel project or `.env.local`, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Only for server-side code (never use in client code!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 8: Test Database Connection

Create a test script to verify connection:

```typescript
// test-supabase-connection.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful!', data);
  }
}

testConnection();
```

Run: `npx ts-node test-supabase-connection.ts`

---

## Step 9: Create Admin User

1. **Sign Up in Your App**
   - Visit your deployed app (localhost or Vercel)
   - Sign up with email: `admin@autonomousdesignagency.ie`
   - Use strong password

2. **Grant Admin Role**
   - In Supabase dashboard, go to "Table Editor"
   - Open `profiles` table
   - Find your email
   - Change `role` to `admin`

3. **Alternatively, Run SQL:**
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@autonomousdesignagency.ie';
   ```

---

## Step 10: Set Up Row Level Security (RLS)

The `schema.sql` file already includes RLS policies. Verify:

1. **Go to Database → RLS Policies**
   - You should see policies for all tables
   - Each table should have: `SELECT`, `INSERT`, `UPDATE` policies

2. **Test RLS**
   - Log out of Supabase dashboard
   - Try accessing data from client app (should fail if not authenticated)
   - Log in → data should be accessible

---

## Troubleshooting

**Connection Timeouts:**
- Check Supabase status: https://status.supabase.com
- Verify database URL is correct
- Check firewall rules (if Vercel fails to connect)

**RLS Blocking Queries:**
- Ensure user is authenticated before querying
- Check `profiles` table for user record
- Verify RLS policies are not too restrictive

**Real-Time Not Working:**
- Confirm real-time is enabled for table
- Check database replication settings
- Verify subscription is active in client code

**Storage Upload Fails:**
- Check bucket size limits
- Verify storage policies allow uploads
- Check file size (< 50MB default)

---

## Dashboard Access

Add these to your bookmarks:

- **Supabase Dashboard:** https://supabase.com/dashboard
- **SQL Editor:** [Project Dashboard] → SQL Editor
- **Table Viewer:** [Project Dashboard] → Table Editor
- **Authentication Logs:** [Project Dashboard] → Authentication → User Management
- **Real-Time Logs:** [Project Dashboard] → Database → Replication

---

## Pricing (as of 2026)

**Free Tier:**
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- 50,000 MAU (Monthly Active Users)
- Real-time enabled

**Pro Tier ($25/month):**
- 8GB database storage
- 100GB file storage
- 250GB bandwidth
- 100,000 MAU
- Daily backups
- More powerful instances

For a design agency, **Free Tier suffices for early testing**. Upgrade to Pro when approaching limits.

---

*Last Updated: 2026-02-11*
