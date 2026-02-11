# Fix RLS Policy Infinite Recursion

## Error Message
```
infinite recursion detected in policy for relation "profiles"
```

This happens when you try to submit the client intake form.

## Root Cause

The RLS (Row Level Security) policies for the `profiles` table are self-referential:

```sql
-- PROBLEMATIC (causes recursion):
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
                                                                                                                    ↑
                                                    This subquery triggers the policy again!
```

**Problem:** Checking the role requires querying the profiles table, but the query must pass through the same policy, creating infinite recursion.

## Solution

Run this SQL script in Supabase SQL Editor:

```sql
-- Drop problematic policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Replace with non-recursive policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );

-- Verify fix
SELECT id, email, full_name, role, created_at
FROM public.profiles
ORDER BY created_at DESC;
```

## Quick Fix - Run This in Supabase SQL Editor

Copy and paste this entire script:

```sql
-- Fix all RLS policies with infinite recursion

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- PROJECTS
DROP POLICY IF EXISTS "Clients can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;

CREATE POLICY "Clients can view own projects" ON public.projects FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients
    WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  ) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all projects" ON public.projects FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- INVOICES
DROP POLICY IF EXISTS "Clients can view own invoices" ON public.invoices;
CREATE POLICY "Clients can view own invoices" ON public.invoices FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = invoices.project_id
    AND p.client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1))
  ) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- MESSAGES
DROP POLICY IF EXISTS "Clients can view messages for own projects" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Clients can view messages for own projects" ON public.messages FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = messages.project_id
    AND p.client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1))
  ) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ASSETS
DROP POLICY IF EXISTS "Clients can view assets for own projects" ON public.assets;
CREATE POLICY "Clients can view assets for own projects" ON public.assets FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = assets.project_id
    AND p.client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1))
  ) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- MILESTONES
DROP POLICY IF EXISTS "Clients can view milestones for own projects" ON public.milestones;
CREATE POLICY "Clients can view milestones for own projects" ON public.milestones FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = milestones.project_id
    AND p.client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1))
  ) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- QUOTE BREAKDOWNS
DROP POLICY IF EXISTS "Only admins can view quote breakdowns" ON public.quote_breakdowns;
DROP POLICY IF EXISTS "Only admins can insert quote breakdowns" ON public.quote_breakdowns;
CREATE POLICY "Only admins can view quote breakdowns" ON public.quote_breakdowns FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can insert quote breakdowns" ON public.quote_breakdowns FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Verify fixes
SELECT 'Profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Clients', COUNT(*) FROM public.clients;
```

## After Fix

1. Reload the intake form page
2. Fill out and submit a project
3. Should work without error

## What Should Happen

✅ Project created in `projects` table
✅ Client record created/updated in `clients` table
✅ Status = 'intake'
✅ No recursion errors

## Verify Fix Worked

In Supabase SQL Editor:

```sql
SELECT id, name, type, status, created_at
FROM public.projects
ORDER BY created_at DESC
LIMIT 5;
```

You should see your submitted project(s).
