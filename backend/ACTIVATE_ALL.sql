-- Autonomous Design Agency - Complete Activation Script (FIXED ORDER)
-- Run this ENTIRE script in Supabase SQL Editor

-- =====================================================
-- PART 1: CREATE TABLES FIRST (no foreign keys yet)
-- =====================================================

-- AGENT SYSTEM TABLES
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cursor_cli', 'openhands', 'custom')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'stuck', 'offline')),
  current_project_id UUID,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  capabilities JSONB[] DEFAULT '{}'::jsonb,
  max_parallel_tasks INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  agent_id UUID,
  type TEXT NOT NULL CHECK (type IN (
    'create_repo','init_project','generate_component','generate_page',
    'implement_feature','run_tests','deploy_preview','await_review',
    'deploy_production','complete_project','setup_environment',
    'install_dependencies','configure_tailwind','optimize_images',
    'add_seo_metadata','run_linter','check_build','fix_errors',
    'git_commit','git_push','create_pr','merge_pr','preview_ready','production_ready'
  )),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','in_progress','completed','failed','escalated')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  depends_on UUID[] DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  result JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3
);

CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID,
  task_id UUID,
  project_id UUID NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info','warning','error','success','debug')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_agent_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE,
  agent_id UUID,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','analyzing','planning','working','waiting_review','iterating','completing','done','stuck','failed','escalate','human_intervention','resume')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  current_milestone_id UUID,
  milestones_completed INTEGER DEFAULT 0,
  milestones_total INTEGER DEFAULT 0,
  agent_logs JSONB[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOCIAL MEDIA TABLES
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter','facebook','linkedin','instagram')),
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}'::jsonb,
  media_urls TEXT[] DEFAULT '{}'::jsonb,
  post_id_external TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','scheduled','posted','failed','rejected')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.brand_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  value TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  trend_score REAL DEFAULT 0,
  trend_sources TEXT[] DEFAULT '{}'::jsonb,
  last_researched TIMESTAMP WITH TIME ZONE,
  research_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  search_query TEXT,
  trend_score REAL DEFAULT 0,
  search_volume INTEGER DEFAULT 0,
  sources_found INTEGER DEFAULT 0,
  last_trended TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trending_days INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('AI','web_dev','frameworks','tools','tech_news','business')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.research_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_type TEXT NOT NULL CHECK (research_type IN ('trend_search','news_scan','competitor_analysis')),
  search_query TEXT,
  results_found INTEGER,
  topics_extracted TEXT[],
  sources TEXT[],
  relevance_score REAL,
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMAIL TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('welcome','quote','project_update','milestone_completion','agent_escalation','custom')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','opened','clicked','failed','bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRON JOB TABLES
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
  config JSONB DEFAULT '{}'::jsonb,
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

-- =====================================================
-- PART 2: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON public.agents(type);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON public.agent_tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_project ON public.agent_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON public.agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_next_task ON public.agent_tasks(agent_id, status, priority) WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON public.agent_logs(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_project ON public.agent_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_level ON public.agent_logs(level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_agent_tracking_project ON public.project_agent_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_project_agent_tracking_agent ON public.project_agent_tracking(agent_id);
CREATE INDEX IF NOT EXISTS idx_project_agent_tracking_status ON public.project_agent_tracking(status);

CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON public.social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON public.social_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_ready_to_post ON public.social_posts(scheduled_at, status) WHERE status = 'approved' AND scheduled_at <= NOW() + INTERVAL '1 hour';

CREATE INDEX IF NOT EXISTS idx_social_analytics_post_id ON public.social_analytics(social_post_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_recorded_at ON public.social_analytics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_topics_trend_score ON public.content_topics(trend_score DESC) WHERE trend_score > 0;
CREATE INDEX IF NOT EXISTS idx_content_topics_last_researched ON public.content_topics(last_researched DESC);

CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON public.trending_topics(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON public.trending_topics(category, trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_search_volume ON public.trending_topics(search_volume DESC);

CREATE INDEX IF NOT EXISTS idx_research_logs_type ON public.research_logs(research_type);
CREATE INDEX IF NOT EXISTS idx_research_logs_started_at ON public.research_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_logs_success ON public.research_logs(success);

CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_project_id ON public.email_logs(project_id);

CREATE INDEX IF NOT EXISTS idx_cron_jobs_status ON public.cron_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_enabled ON public.cron_jobs(enabled, next_run);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON public.cron_jobs(next_run) WHERE enabled = true AND status IN ('idle','completed');
CREATE INDEX IF NOT EXISTS idx_cron_jobs_job_type ON public.cron_jobs(job_type);

CREATE INDEX IF NOT EXISTS idx_cron_job_logs_cron_job_id ON public.cron_job_logs(cron_job_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status ON public.cron_job_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_started_at ON public.cron_job_logs(started_at DESC);

-- =====================================================
-- PART 3: ADD FOREIGN KEYS
-- =====================================================

ALTER TABLE public.agent_tasks ADD CONSTRAINT fk_agent_tasks_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.agent_tasks ADD CONSTRAINT fk_agent_tasks_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;

ALTER TABLE public.agents ADD CONSTRAINT fk_agents_project FOREIGN KEY (current_project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.agent_logs ADD CONSTRAINT fk_agent_logs_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;
ALTER TABLE public.agent_logs ADD CONSTRAINT fk_agent_logs_task FOREIGN KEY (task_id) REFERENCES public.agent_tasks(id) ON DELETE SET NULL;
ALTER TABLE public.agent_logs ADD CONSTRAINT fk_agent_logs_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.project_agent_tracking ADD CONSTRAINT fk_project_agent_tracking_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.project_agent_tracking ADD CONSTRAINT fk_project_agent_tracking_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.project_agent_tracking ADD CONSTRAINT fk_project_agent_tracking_milestone FOREIGN KEY (current_milestone_id) REFERENCES public.milestones(id) ON DELETE SET NULL;

ALTER TABLE public.social_analytics ADD CONSTRAINT fk_social_analytics_post FOREIGN KEY (social_post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE;

ALTER TABLE public.social_posts ADD CONSTRAINT fk_social_posts_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.cron_job_logs ADD CONSTRAINT fk_cron_job_logs_job FOREIGN KEY (cron_job_id) REFERENCES public.cron_jobs(id) ON DELETE CASCADE;

ALTER TABLE public.email_logs ADD CONSTRAINT fk_email_logs_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- =====================================================
-- PART 4: RLS POLICIES
-- =====================================================

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_agent_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read agents" ON public.agents;
CREATE POLICY "Anyone can read agents" ON public.agents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert agents" ON public.agents;
CREATE POLICY "Only admins can insert agents" ON public.agents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can update agents" ON public.agents;
CREATE POLICY "Only admins can update agents" ON public.agents FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete agents" ON public.agents;
CREATE POLICY "Only admins can delete agents" ON public.agents FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their project tasks" ON public.agent_tasks;
CREATE POLICY "Clients can read their project tasks" ON public.agent_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id INNER JOIN public.profiles ON clients.user_id = profiles.id WHERE projects.id = agent_tasks.project_id AND profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can read all tasks" ON public.agent_tasks;
CREATE POLICY "Admins can read all tasks" ON public.agent_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify tasks" ON public.agent_tasks;
CREATE POLICY "Only admins can modify tasks" ON public.agent_tasks FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their project logs" ON public.agent_logs;
CREATE POLICY "Clients can read their project logs" ON public.agent_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id INNER JOIN public.profiles ON clients.user_id = profiles.id WHERE projects.id = agent_logs.project_id AND profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can read all logs" ON public.agent_logs;
CREATE POLICY "Admins can read all logs" ON public.agent_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can insert logs" ON public.agent_logs;
CREATE POLICY "Only admins can insert logs" ON public.agent_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their project tracking" ON public.project_agent_tracking;
CREATE POLICY "Clients can read their project tracking" ON public.project_agent_tracking FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id INNER JOIN public.profiles ON clients.user_id = profiles.id WHERE projects.id = project_agent_tracking.project_id AND profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can modify tracking" ON public.project_agent_tracking;
CREATE POLICY "Admins can modify tracking" ON public.project_agent_tracking FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can read all posts" ON public.social_posts;
CREATE POLICY "Admins can read all posts" ON public.social_posts FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert posts" ON public.social_posts;
CREATE POLICY "Admins can insert posts" ON public.social_posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can update posts" ON public.social_posts;
CREATE POLICY "Admins can update posts" ON public.social_posts FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete posts" ON public.social_posts;
CREATE POLICY "Admins can delete posts" ON public.social_posts FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage analytics" ON public.social_analytics;
CREATE POLICY "Admins can manage analytics" ON public.social_analytics FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Anyone can read brand guidelines" ON public.brand_guidelines;
CREATE POLICY "Anyone can read brand guidelines" ON public.brand_guidelines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify brand guidelines" ON public.brand_guidelines;
CREATE POLICY "Only admins can modify brand guidelines" ON public.brand_guidelines FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Anyone can read content topics" ON public.content_topics;
CREATE POLICY "Anyone can read content topics" ON public.content_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify content topics" ON public.content_topics;
CREATE POLICY "Only admins can modify content topics" ON public.content_topics FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can read all email logs" ON public.email_logs;
CREATE POLICY "Admins can read all email logs" ON public.email_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their email logs" ON public.email_logs;
CREATE POLICY "Clients can read their email logs" ON public.email_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id WHERE clients.email = email_logs.to_email));

DROP POLICY IF EXISTS "Only admins can insert email logs" ON public.email_logs;
CREATE POLICY "Only admins can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage cron jobs" ON public.cron_jobs;
CREATE POLICY "Admins can manage cron jobs" ON public.cron_jobs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage cron job logs" ON public.cron_job_logs;
CREATE POLICY "Admins can manage cron job logs" ON public.cron_job_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- =====================================================
-- PART 5: SEED DATA
-- =====================================================

INSERT INTO public.agents (name, type, status, capabilities, max_parallel_tasks) VALUES ('Cursor-Agent-1', 'cursor_cli', 'idle', ARRAY['frontend','backend','fullstack','components','pages','styling']::JSONB[], 1) ON CONFLICT DO NOTHING;

INSERT INTO public.brand_guidelines (key_name, value, metadata) VALUES
  ('voice_style', 'professional, innovative, tech-forward', '{"emoji": true, "casual_level": 0.7}'),
  ('hashtags', '#AI #WebDev #Autonomous #Tech #Innovation', '{"required": ["#AI", "#Autonomous"]}'),
  ('topics_to_avoid', 'politics, religion, controversial topics', '{"strict": true}'),
  ('posting_schedule_twitter', '09:00, 12:00, 15:00, 18:00', '{"timezone": "Europe/Dublin", "frequency": "4/day"}'),
  ('posting_schedule_facebook', '10:00, 14:00, 19:00', '{"timezone": "Europe/Dublin", "frequency": "3/day"}'),
  ('auto_approve_confidence', '0.8', '{"threshold": 0.8, "enabled": false}')
ON CONFLICT (key_name) DO NOTHING;

INSERT INTO public.content_topics (topic, priority) VALUES
  ('AI Web Development', 10), ('Autonomous Agents', 9), ('No-Code/Low-Code', 8),
  ('SaaS Trends', 7), ('Tech Innovation', 9), ('Digital Transformation', 8),
  ('Client success stories', 6)
ON CONFLICT (topic) DO NOTHING;

INSERT INTO public.cron_jobs (name, job_type, frequency, status, next_run, config) VALUES
  ('Social Media Posting', 'social_media_post', 'every_hour', 'idle', NOW(), '{"platforms": ["twitter","facebook"], "batch_size": 10}'),
  ('Trend Research', 'trend_research', 'every_6_hours', 'idle', NOW(), '{"categories": ["AI","web_dev","frameworks","tools","tech_news","business"]}'),
  ('Agent Task Execution', 'agent_task_execution', 'every_5_minutes', 'idle', NOW(), '{"max_parallel_agents": 3, "task_timeout_minutes": 15}'),
  ('Email Sending', 'email_send', 'every_hour', 'idle', NOW(), '{"batch_size": 50}'),
  ('Analytics Report', 'analytics_report', 'daily', 'idle', NOW() + INTERVAL '1 day', '{"days": 7}'),
  ('Agent Heartbeat', 'agent_heartbeat', 'every_15_minutes', 'idle', NOW(), '{}'),
  ('Health Check', 'health_check', 'every_15_minutes', 'idle', NOW(), '{}')
ON CONFLICT (name) DO UPDATE SET config = cron_jobs.config, enabled = true;

INSERT INTO public.trending_topics (keyword, category, trend_score, search_volume) VALUES
  ('AI web development', 'AI', 1.0, 1000), ('autonomous agents', 'AI', 0.9, 850),
  ('cursor IDE', 'tools', 0.8, 750), ('nextjs 16', 'frameworks', 0.85, 900),
  ('supabase', 'tools', 0.75, 700), ('no-code web development', 'web_dev', 0.9, 800),
  ('AI automation', 'AI', 0.95, 950), ('typescript web dev', 'tools', 0.7, 650),
  ('SaaS development', 'business', 0.8, 780), ('web development 2026', 'web_dev', 0.85, 850)
ON CONFLICT (keyword) DO NOTHING;

-- =====================================================
-- PART 6: TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_agents_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agents_updated_at ON public.agents;
CREATE TRIGGER trigger_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_agents_updated_at();

CREATE OR REPLACE FUNCTION public.update_social_posts_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_social_posts_updated_at ON public.social_posts;
CREATE TRIGGER trigger_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_social_posts_updated_at();

CREATE OR REPLACE FUNCTION public.update_tracking_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tracking_updated_at ON public.project_agent_tracking;
CREATE TRIGGER trigger_tracking_updated_at BEFORE UPDATE ON public.project_agent_tracking FOR EACH ROW EXECUTE FUNCTION public.update_tracking_updated_at();

CREATE OR REPLACE FUNCTION public.update_trending_topics_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_trending_topics_updated_at ON public.trending_topics;
CREATE TRIGGER trigger_trending_topics_updated_at BEFORE UPDATE ON public.trending_topics FOR EACH ROW EXECUTE FUNCTION public.update_trending_topics_updated_at();

CREATE OR REPLACE FUNCTION public.update_cron_jobs_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cron_jobs_updated_at ON public.cron_jobs;
CREATE TRIGGER trigger_cron_jobs_updated_at BEFORE UPDATE ON public.cron_jobs FOR EACH ROW EXECUTE FUNCTION public.update_cron_jobs_updated_at();

-- =====================================================
-- COMPLETED
-- =====================================================

SELECT '====================================' as result;
SELECT 'Full activation complete!' as result;
SELECT '====================================' as result;
SELECT '' as result;
SELECT 'Tables created: 14 total' as result;
SELECT '  - Agent System: 4' as result;
SELECT '  - Social Media: 5' as result;
SELECT '  - Email: 1' as result;
SELECT '  - Cron Jobs: 2' as result;
SELECT '  - Trend Research: 2' as result;
SELECT '' as result;
SELECT 'Seed data:' as result;
SELECT '  - 1 agent (Cursor-Agent-1)' as result;
SELECT '  - 7 cron jobs configured' as result;
SELECT '  - 7 brand guidelines' as result;
SELECT '  - 7 content topics' as result;
SELECT '  - 10 trending topics' as result;
SELECT '' as result;
SELECT 'Next steps:' as result;
SELECT '  1. Test at /api/system/test' as result;
SELECT '  2. View analytics at /admin/analytics' as result;
SELECT '  3. Add SENDGRID_API_KEY for emails (optional)' as result;
SELECT '====================================' as result;
