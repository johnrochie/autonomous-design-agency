-- Cron Job System - Database Schema
-- Run in Supabase SQL Editor to add cron job automation tracking

-- ============================================
-- CRON JOBS TABLE - Track scheduled and running jobs
-- ============================================
CREATE TABLE IF NOT EXISTS public.cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL CHECK (job_type IN (
    'social_media_post',
    'agent_task_execution',
    'email_send',
    'analytics_report',
    'agent_heartbeat',
    'health_check',
    'backup',
    'cleanup'
  )),
  frequency TEXT NOT NULL CHECK (frequency IN (
    'every_minute',
    'every_5_minutes',
    'every_15_minutes',
    'every_hour',
    'every_6_hours',
    'every_12_hours',
    'daily',
    'weekly',
    'monthly'
  )),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN (
    'idle',
    'running',
    'completed',
    'failed',
    'paused'
  )),
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

-- Index: Query cron jobs by status and next run time
CREATE INDEX IF NOT EXISTS idx_cron_jobs_status ON public.cron_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_enabled ON public.cron_jobs(enabled, next_run);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON public.cron_jobs(next_run) WHERE enabled = true AND status IN ('idle', 'completed');
CREATE INDEX IF NOT EXISTS idx_cron_jobs_job_type ON public.cron_jobs(job_type);

-- ============================================
-- CRON JOB LOGS TABLE - Track job execution history
-- ============================================
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_job_id UUID NOT NULL REFERENCES public.cron_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  duration_ms INTEGER,
  output TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Index: Query job logs by cron job and time range
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_cron_job_id ON public.cron_job_logs(cron_job_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status ON public.cron_job_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_started_at ON public.cron_job_logs(started_at DESC);

-- ============================================
-- SEED CRON JOBS
-- ============================================
INSERT INTO public.cron_jobs (
  name,
  job_type,
  frequency,
  status,
  next_run,
  config
) VALUES
  (
    'Social Media Posting',
    'social_media_post',
    'every_hour',
    'idle',
    NOW(),
    '{"platforms": ["twitter", "facebook"], "batch_size": 10}'
  ),
  (
    'Agent Task Execution',
    'agent_task_execution',
    'every_5_minutes',
    'idle',
    NOW(),
    '{"max_parallel_agents": 3, "task_timeout_minutes": 15}'
  ),
  (
    'Email Sending',
    'email_send',
    'every_hour',
    'idle',
    NOW(),
    '{"batch_size": 50, "retry_failed": true}'
  ),
  (
    'Analytics Report',
    'analytics_report',
    'daily',
    'idle',
    NOW() + INTERVAL '1 day',
    '{"include_platforms": ["twitter", "facebook", "linkedin"], "days": 7}'
  ),
  (
    'Agent Heartbeat',
    'agent_heartbeat',
    'every_15_minutes',
    'idle',
    NOW(),
    '{"timeout_minutes": 30}'
  ),
  (
    'Health Check',
    'health_check',
    'every_15_minutes',
    'idle',
    NOW(),
    '{}'
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Cron Jobs RLS - Admins full access
CREATE POLICY "Admins can manage cron jobs"
  ON public.cron_jobs FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Cron Job Logs RLS - Admins full access
CREATE POLICY "Admins can manage cron job logs"
  ON public.cron_job_logs FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Update cron job status
CREATE OR REPLACE FUNCTION public.update_cron_job_status(
  p_job_id UUID,
  p_status TEXT,
  p_next_run TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.cron_jobs
  SET
    status = p_status,
    last_run = NOW(),
    duration_ms = p_duration_ms,
    last_error = p_error,
    runs_count = runs_count + 1,
    success_count = CASE WHEN p_status = 'completed' THEN success_count + 1 ELSE success_count END,
    failure_count = CASE WHEN p_status = 'failed' THEN failure_count + 1 ELSE failure_count END,
    last_success = CASE WHEN p_status = 'completed' THEN NOW() ELSE last_success END,
    next_run = COALESCE(p_next_run, next_run),
    updated_at = NOW()
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Log cron job execution
CREATE OR REPLACE FUNCTION public.log_cron_job(
  p_job_id UUID,
  p_status TEXT,
  p_output TEXT DEFAULT NULL,
  p_error TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_duration_ms INTEGER;
BEGIN
  -- Calculate duration if job completed
  SELECT EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000 INTO v_duration_ms
  FROM public.cronJob_logs
  WHERE cron_job_id = p_job_id
    AND id = (SELECT MAX(id) FROM public.cron_job_logs WHERE cron_job_id = p_job_id);

  INSERT INTO public.cron_job_logs (
    cron_job_id,
    status,
    output,
    error,
    metadata
  )
  VALUES (
    p_job_id,
    p_status,
    p_output,
    p_error,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate next run time
CREATE OR REPLACE FUNCTION public.calculate_next_run(
  p_frequency TEXT,
  p_last_run TIMESTAMP WITH TIME ZONE
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_next_run TIMESTAMP WITH TIME ZONE;
BEGIN
  CASE p_frequency
    WHEN 'every_minute' THEN
      v_next_run := p_last_run + INTERVAL '1 minute';
    WHEN 'every_5_minutes' THEN
      v_next_run := p_last_run + INTERVAL '5 minutes';
    WHEN 'every_15_minutes' THEN
      v_next_run := p_last_run + INTERVAL '15 minutes';
    WHEN 'every_hour' THEN
      v_next_run := p_last_run + INTERVAL '1 hour';
    WHEN 'every_6_hours' THEN
      v_next_run := p_last_run + INTERVAL '6 hours';
    WHEN 'every_12_hours' THEN
      v_next_run := p_last_run + INTERVAL '12 hours';
    WHEN 'daily' THEN
      v_next_run := p_last_run + INTERVAL '1 day';
    WHEN 'weekly' THEN
      v_next_run := p_last_run + INTERVAL '1 week';
    WHEN 'monthly' THEN
      v_next_run := p_last_run + INTERVAL '1 month';
    ELSE
      v_next_run := p_last_run + INTERVAL '1 hour'; -- Default
  END CASE;

  RETURN v_next_run;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update updated_at for cron_jobs
-- ============================================
CREATE OR REPLACE FUNCTION public.update_cron_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cron_jobs_updated_at BEFORE UPDATE
  ON public.cron_jobs FOR EACH ROW
  EXECUTE FUNCTION public.update_cron_jobs_updated_at();

-- ============================================
-- COMPLETED
-- ============================================
SELECT 'Cron job system database schema created successfully' as status;
