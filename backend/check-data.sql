-- Check each data source separately
-- Run each query one at a time

-- 1. Check agents
SELECT 'AGENTS CHECK' as section;
SELECT name, type, status FROM public.agents;

-- 2. Check cron jobs  
SELECT 'CRON JOBS CHECK' as section;
SELECT name, job_type, enabled FROM public.cron_jobs ORDER BY id;

-- 3. Check brand guidelines
SELECT 'BRAND GUIDELINES CHECK' as section;
SELECT key_name, value FROM public.brand_guidelines LIMIT 3;

-- 4. Check trending topics
SELECT 'TRENDING TOPICS CHECK' as section;
SELECT keyword, category, trend_score FROM public.trending_topics LIMIT 5;
