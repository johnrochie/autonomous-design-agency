-- Trend Research Cron Job Update - Extracted from ACTIVATE_ALL.sql
-- Run this in Supabase SQL Editor
-- Run AFTER test-04-cron-jobs.sql

INSERT INTO public.cron_jobs (name, job_type, frequency, status, next_run, config)
VALUES ('Trend Research', 'trend_research', 'every_6_hours', 'idle', NOW(), '{"categories": ["AI","web_dev","frameworks","tools","tech_news","business"]}')
ON CONFLICT (name) DO UPDATE SET config = cron_jobs.config, enabled = true, frequency = 'every_6_hours';

SELECT '====================================' as result;
SELECT 'Trend Research Cron Job: Added successfully!' as result;
SELECT '====================================' as result;
