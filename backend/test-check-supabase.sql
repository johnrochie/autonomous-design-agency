-- Check what tables exist in Supabase before running Phase 4 schemas
-- Run this FIRST in Supabase SQL Editor

SELECT '=== EXISTING TABLES ===' as info;
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT '=== COUNTING PHASE 1-3 TABLES ===' as info;
SELECT
  COUNT(*) as total_tables,
  COUNT(*) FILTER (WHERE table_name = 'clients') as has_clients,
  COUNT(*) FILTER (WHERE table_name = 'projects') as has_projects,
  COUNT(*) FILTER (WHERE table_name = 'milestones') as has_milestones,
  COUNT(*) FILTER (WHERE table_name = 'messages') as has_messages
FROM information_schema.tables
WHERE table_schema = 'public';

SELECT '=== CHECKING FOR PHASE 4 TABLES ===' as info;
SELECT
  COUNT(*) FILTER (WHERE table_name = 'agents') as agents_count,
  COUNT(*) FILTER (WHERE table_name = 'social_posts') as social_posts_count,
  COUNT(*) FILTER (WHERE table_name = 'cron_jobs') as cron_jobs_count
FROM information_schema.tables
WHERE table_schema = 'public';

-- Based on results, run:
-- If count = 4 (base tables): Run test-01 through test-06
-- If count = 0 or very few: You may need Phase 1-3 schemas first
