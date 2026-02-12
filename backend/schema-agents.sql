-- Autonomous Agent System - Database Schema (FIXED NO IF NOT EXISTS ON POLICIES)
-- Run in Supabase SQL Editor to add agent tracking

-- ============================================
-- AGENT TASKS TABLE - Task queue for agents (CREATE FIRST)
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'create_repo',
    'init_project',
    'generate_component',
    'generate_page',
    'implement_feature',
    'run_tests',
    'deploy_preview',
    'await_review',
    'deploy_production',
    'complete_project',
    'setup_environment',
    'install_dependencies',
    'configure_tailwind',
    'optimize_images',
    'add_seo_metadata',
    'run_linter',
    'check_build',
    'fix_errors',
    'git_commit',
    'git_push',
    'create_pr',
    'merge_pr',
    'preview_ready',
    'production_ready'
  )),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'completed', 'failed', 'escalated')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  depends_on UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  result JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3
);

-- ============================================
-- AGENTS TABLE - Agent pool management (CREATE SECOND)
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cursor_cli', 'openhands', 'custom')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'stuck', 'offline')),
  current_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  capabilities JSONB[] DEFAULT '{}',
  max_parallel_tasks INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AGENT LOGS TABLE - Agent activity tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'success', 'debug')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROJECT AGENT TRACKING TABLE - Track agent per project
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_agent_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN (
    'idle',
    'analyzing',
    'planning',
    'working',
    'waiting_review',
    'iterating',
    'completing',
    'done',
    'stuck',
    'failed',
    'escalate',
    'human_intervention',
    'resume'
  )),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  current_milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  milestones_completed INTEGER DEFAULT 0,
  milestones_total INTEGER DEFAULT 0,
  agent_logs JSONB[] DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON public.agent_tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_project ON public.agent_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON public.agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_next_task ON public.agent_tasks(agent_id, status, priority) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON public.agents(type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON public.agent_logs(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_project ON public.agent_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_level ON public.agent_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_agent_tracking_project ON public.project_agent_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_project_agent_tracking_agent ON public.project_agent_tracking(agent_id);
CREATE INDEX IF NOT EXISTS idx_project_agent_tracking_status ON public.project_agent_tracking(status);

-- ============================================
-- ROW LEVEL SECURITY - Enable
-- ============================================
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_agent_tracking ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY - Policies
-- ============================================

-- AGENTS
DROP POLICY IF EXISTS "Anyone can read agents" ON public.agents;
CREATE POLICY "Anyone can read agents" ON public.agents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert agents" ON public.agents;
CREATE POLICY "Only admins can insert agents" ON public.agents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Only admins can update agents" ON public.agents;
CREATE POLICY "Only admins can update agents" ON public.agents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Only admins can delete agents" ON public.agents;
CREATE POLICY "Only admins can delete agents" ON public.agents FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- AGENT TASKS
DROP POLICY IF EXISTS "Clients can read their project tasks" ON public.agent_tasks;
CREATE POLICY "Clients can read their project tasks" ON public.agent_tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects
    INNER JOIN public.clients ON projects.client_id = clients.id
    INNER JOIN public.profiles ON clients.user_id = profiles.id
    WHERE projects.id = agent_tasks.project_id AND profiles.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can read all tasks" ON public.agent_tasks;
CREATE POLICY "Admins can read all tasks" ON public.agent_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Only admins can modify tasks" ON public.agent_tasks;
CREATE POLICY "Only admins can modify tasks" ON public.agent_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- AGENT LOGS
DROP POLICY IF EXISTS "Clients can read their project logs" ON public.agent_logs;
CREATE POLICY "Clients can read their project logs" ON public.agent_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects
    INNER JOIN public.clients ON projects.client_id = clients.id
    INNER JOIN public.profiles ON clients.user_id = profiles.id
    WHERE projects.id = agent_logs.project_id AND profiles.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can read all logs" ON public.agent_logs;
CREATE POLICY "Admins can read all logs" ON public.agent_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Only admins can insert logs" ON public.agent_logs;
CREATE POLICY "Only admins can insert logs" ON public.agent_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- PROJECT AGENT TRACKING
DROP POLICY IF EXISTS "Clients can read their project tracking" ON public.project_agent_tracking;
CREATE POLICY "Clients can read their project tracking" ON public.project_agent_tracking FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects
    INNER JOIN public.clients ON projects.client_id = clients.id
    INNER JOIN public.profiles ON clients.user_id = profiles.id
    WHERE projects.id = project_agent_tracking.project_id AND profiles.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can modify tracking" ON public.project_agent_tracking;
CREATE POLICY "Admins can modify tracking" ON public.project_agent_tracking FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_agent_heartbeat(p_agent_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.agents SET last_heartbeat = NOW(), updated_at = NOW() WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.add_agent_log(
  p_agent_id UUID,
  p_task_id UUID DEFAULT NULL,
  p_project_id UUID,
  p_level TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.agent_logs (agent_id, task_id, project_id, level, message, metadata)
  VALUES (p_agent_id, p_task_id, p_project_id, p_level, p_message, p_metadata)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.find_next_task(p_agent_id UUID)
RETURNS TABLE (
  task_id UUID,
  project_id UUID,
  type TEXT,
  description TEXT,
  priority TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as task_id,
    t.project_id,
    t.type,
    t.description,
    t.priority
  FROM public.agent_tasks t
  WHERE t.agent_id = p_agent_id AND t.status = 'queued'
  ORDER BY t.priority DESC, t.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_agent_tracking(
  p_project_id UUID,
  p_status TEXT,
  p_current_milestone_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.project_agent_tracking
  SET status = p_status, current_milestone_id = p_current_milestone_id, updated_at = NOW()
  WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agents_updated_at ON public.agents;
CREATE TRIGGER trigger_agents_updated_at BEFORE UPDATE
  ON public.agents FOR EACH ROW
  EXECUTE FUNCTION public.update_agents_updated_at();

CREATE OR REPLACE FUNCTION public.update_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tracking_updated_at ON public.project_agent_tracking;
CREATE TRIGGER trigger_tracking_updated_at BEFORE UPDATE
  ON public.project_agent_tracking FOR EACH ROW
  EXECUTE FUNCTION public.update_tracking_updated_at();

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO public.agents (name, type, status, capabilities, max_parallel_tasks)
VALUES (
  'Cursor-Agent-1',
  'cursor_cli',
  'idle',
  ARRAY['frontend', 'backend', 'fullstack', 'components', 'pages', 'styling']::JSONB[],
  1
)
ON CONFLICT DO NOTHING;

SELECT 'Autonomous Agent System database schema created successfully' as status;
