-- Quick check: Do these tables exist?
-- Run this in Supabase SQL Editor

SELECT 
  'clients' as table_nm,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'clients'
  ) as exists
UNION ALL
SELECT 
  'profiles' as table_nm,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  )
UNION ALL
SELECT 
  'projects' as table_nm,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'projects'
  )
UNION ALL
SELECT 
  'milestones' as table_nm,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'milestones'
  );
