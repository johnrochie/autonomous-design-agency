-- Verify all Phase 4 tables were created successfully
-- Run this in Supabase SQL Editor

SELECT '=== PHASE 4 TABLES CREATED ===' as info;

SELECT 
  'agents' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agents') as created
UNION ALL
SELECT 'agent_tasks', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_tasks')
UNION ALL
SELECT 'agent_logs', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_logs')
UNION ALL
SELECT 'project_agent_tracking', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_agent_tracking')
UNION ALL
SELECT 'social_posts', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_posts')
UNION ALL
SELECT 'social_analytics', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_analytics')
UNION ALL
SELECT 'brand_guidelines', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brand_guidelines')
UNION ALL
SELECT 'content_topics', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_topics')
UNION ALL
SELECT 'email_logs', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_logs')
UNION ALL
SELECT 'cron_jobs', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cron_jobs')
UNION ALL
SELECT 'cron_job_logs', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cron_job_logs')
UNION ALL
SELECT 'trending_topics', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trending_topics')
UNION ALL
SELECT 'research_logs', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'research_logs');

SELECT '=== COUNTS ===' as info;
SELECT 
  COUNT(*) as total_phase4_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'agents', 'agent_tasks', 'agent_logs', 'project_agent_tracking',
    'social_posts', 'social_analytics', 'brand_guidelines', 'content_topics',
    'email_logs', 'cron_jobs', 'cron_job_logs', 'trending_topics', 'research_logs'
  );
