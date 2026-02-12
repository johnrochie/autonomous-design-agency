-- Cron Job Schema Update - Add Trend Research Job
-- Run in Supabase SQL Editor to add trend research to cron jobs

-- ============================================
-- ADD TREND RESEARCH JOB TYPE
-- ============================================

ALTER TABLE public.cron_jobs DROP CONSTRAINT IF EXISTS cron_jobs_job_type_check;

ALTER TABLE public.cron_jobs
ADD CONSTRAINT cron_jobs_job_type_check
CHECK (job_type IN (
  'trend_research',
  'social_media_post',
  'agent_task_execution',
  'email_send',
  'analytics_report',
  'agent_heartbeat',
  'health_check',
  'backup',
  'cleanup'
));

ALTER TABLE public.cron_jobs
ALTER COLUMN frequency
SET DATA TYPE TEXT
CHECK (frequency IN (
  'every_minute',
  'every_5_minutes',
  'every_15_minutes',
  'every_hour',
  'every_3_hours',
  'every_6_hours',
  'every_12_hours',
  'daily',
  'weekly',
  'monthly'
));

-- ============================================
-- INSERT TREND RESEARCH JOB
-- ============================================
INSERT INTO public.cron_jobs (
  name,
  job_type,
  frequency,
  status,
  next_run,
  config
)
VALUES
  (
    'Trend Research',
    'trend_research',
    'every_6_hours',
    'idle',
    NOW(),
    '{
      "categories": ["AI", "web_dev", "frameworks", "tools", "tech_news", "business"],
      "search_queries_per_category": 3,
      "trend_score_threshold": 0.5,
      "research_sources": ["techcrunch", "medium", "hackernews"]
    }'
  )
ON CONFLICT (name) DO UPDATE
SET
  config = EXCLUDED.config,
  enabled = true,
  frequency = 'every_6_hours';

-- ============================================
-- COMPLETED
-- ============================================
SELECT 'Trend research job added to cron jobs' as status;
