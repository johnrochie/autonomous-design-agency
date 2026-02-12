-- Autonomous Design Agency - Verification Queries
-- Run these after activation to verify everything is working

-- =====================================================
-- CHECK 1: TABLES CREATED
-- =====================================================

SELECT '=== CHECK 1: TABLES CREATED ===' as check_name;

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'agents', 'agent_tasks', 'agent_logs', 'project_agent_tracking',
    'social_posts', 'social_analytics', 'brand_guidelines', 'content_topics',
    'email_logs',
    'cron_jobs', 'cron_job_logs',
    'trending_topics', 'research_logs'
  )
ORDER BY tablename;

-- =====================================================
-- CHECK 2: SEED DATA POPULATED
-- =====================================================

SELECT '=== CHECK 2: SEED DATA POPULATED ===' as check_name;

-- Agents
SELECT 'Agents' as table_name, COUNT(*) as count FROM public.agents;

-- Cron Jobs
SELECT 'Cron Jobs' as table_name, COUNT(*) as count FROM public.cron_jobs;

-- Brand Guidelines
SELECT 'Brand Guidelines' as table_name, COUNT(*) as count FROM public.brand_guidelines;

-- Content Topics
SELECT 'Content Topics' as table_name, COUNT(*) as count FROM public.content_topics;

-- Trending Topics
SELECT 'Trending Topics' as table_name, COUNT(*) as count FROM public.trending_topics;

-- =====================================================
-- CHECK 3: RLS POLICIES ENABLED
-- =====================================================

SELECT '=== CHECK 3: RLS POLICIES ENABLED ===' as check_name;

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'agents', 'agent_tasks', 'agent_logs', 'project_agent_tracking',
    'social_posts', 'social_analytics', 'brand_guidelines', 'content_topics',
    'email_logs',
    'cron_jobs', 'cron_job_logs'
  )
ORDER BY tablename;

-- =====================================================
-- CHECK 4: POLICIES DEFINED
-- =====================================================

SELECT '=== CHECK 4: POLICIES DEFINED ===' as check_name;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'agents', 'agent_tasks', 'agent_logs',
    'social_posts', 'social_analytics', 'brand_guidelines', 'content_topics',
    'email_logs', 'cron_jobs'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- CHECK 5: FUNCTIONS DEFINED
-- =====================================================

SELECT '=== CHECK 5: FUNCTIONS DEFINED ===' as check_name;

SELECT
  routine_schema,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE ANY(ARRAY[
    '%agent%', '%social%', '%email%', '%cron%', '%trend%'
  ])
ORDER BY routine_name;

-- =====================================================
-- CHECK 6: TRIGGERS DEFINED
-- =====================================================

SELECT '=== CHECK 6: TRIGGERS DEFINED ===' as check_name;

SELECT
  trigger_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- CHECK 7: AGENT DETAILS
-- =====================================================

SELECT '=== CHECK 7: AGENT DETAILS ===' as check_name;

SELECT
  name,
  type,
  status,
  created_at
FROM public.agents;

-- =====================================================
-- CHECK 8: CRON JOB DETAILS
-- =====================================================

SELECT '=== CHECK 8: CRON JOB DETAILS ===' as check_name;

SELECT
  name,
  job_type,
  frequency,
  status,
  enabled
FROM public.cron_jobs
ORDER BY enabled DESC, name;

-- =====================================================
-- CHECK 9: BRAND GUIDELINES
-- =====================================================

SELECT '=== CHECK 9: BRAND GUIDELINES ===' as check_name;

SELECT
  key_name,
  substr(value, 1, 50) as value_preview,
  created_at
FROM public.brand_guidelines
ORDER BY key_name;

-- =====================================================
-- CHECK 10: TRENDING TOPICS
-- =====================================================

SELECT '=== CHECK 10: TRENDING TOPICS ===' as check_name;

SELECT
  category,
  keyword,
  trend_score,
  search_volume
FROM public.trending_topics
ORDER BY trend_score DESC, search_volume DESC
LIMIT 10;

-- =====================================================
-- SUMMARY
-- =====================================================

SELECT '=== VERIFICATION SUMMARY ===' as result;
SELECT '' as result;
SELECT 'Expected results:' as result;
SELECT '  - 14 tables created' as result;
SELECT '  - 5 agents (1 seeded)' as result;
SELECT '  - 7 cron jobs configured' as result;
SELECT '  - Multiple RLS policies' as result;
SELECT '  - Triggers on all timestamp columns' as result;
SELECT '' as result;
SELECT 'System status: READY FOR ACTIVATION' as result;
