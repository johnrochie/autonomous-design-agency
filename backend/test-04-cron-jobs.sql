-- Cron Jobs - Extracted from ACTIVATE_ALL.sql
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL CHECK (job_type IN ('trend_research','social_media_post','agent_task_execution','email_send','analytics_report','agent_heartbeat','health_check','backup','cleanup')),
  frequency TEXT NOT NULL CHECK (frequency IN ('every_minute','every_5_minutes','every_15_minutes','every_hour','every_3_hours','every_6_hours','every_12_hours','daily','weekly','monthly')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','running','completed','failed','paused')),
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  last_success TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  last_duration_ms INTEGER,
  runs_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_job_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running','completed','failed')),
  duration_ms INTEGER,
  output TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_cron_jobs_status ON public.cron_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_enabled ON public.cron_jobs(enabled, next_run);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON public.cron_jobs(next_run) WHERE enabled = true AND status IN ('idle','completed');
CREATE INDEX IF NOT EXISTS idx_cron_jobs_job_type ON public.cron_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_cron_job_id ON public.cron_job_logs(cron_job_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status ON public.cron_job_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_started_at ON public.cron_job_logs(started_at DESC);

ALTER TABLE public.cron_job_logs ADD CONSTRAINT fk_cron_job_logs_job FOREIGN KEY (cron_job_id) REFERENCES public.cron_jobs(id) ON DELETE CASCADE;

ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage cron jobs" ON public.cron_jobs;
CREATE POLICY "Admins can manage cron jobs" ON public.cron_jobs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage cron job logs" ON public.cron_job_logs;
CREATE POLICY "Admins can manage cron job logs" ON public.cron_job_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE OR REPLACE FUNCTION public.update_cron_jobs_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cron_jobs_updated_at ON public.cron_jobs;
CREATE TRIGGER trigger_cron_jobs_updated_at BEFORE UPDATE ON public.cron_jobs FOR EACH ROW EXECUTE FUNCTION public.update_cron_jobs_updated_at();

INSERT INTO public.cron_jobs (name, job_type, frequency, status, next_run, config) VALUES
  ('Social Media Posting', 'social_media_post', 'every_hour', 'idle', NOW(), '{"platforms": ["twitter","facebook"], "batch_size": 10}'),
  ('Trend Research', 'trend_research', 'every_6_hours', 'idle', NOW(), '{"categories": ["AI","web_dev","frameworks","tools","tech_news","business"]}'),
  ('Agent Task Execution', 'agent_task_execution', 'every_5_minutes', 'idle', NOW(), '{"max_parallel_agents": 3}'),
  ('Email Sending', 'email_send', 'every_hour', 'idle', NOW(), '{"batch_size": 50}'),
  ('Analytics Report', 'analytics_report', 'daily', 'idle', NOW() + INTERVAL '1 day', '{"days": 7}'),
  ('Agent Heartbeat', 'agent_heartbeat', 'every_15_minutes', 'idle', NOW(), '{}'),
  ('Health Check', 'health_check', 'every_15_minutes', 'idle', NOW(), '{}')
ON CONFLICT (name) DO UPDATE SET config = cron_jobs.config, enabled = true;

SELECT '====================================' as result;
SELECT 'Cron Jobs: Created successfully!' as result;
SELECT '====================================' as result;
