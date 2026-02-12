-- Agent System - Extracted from ACTIVATE_ALL.sql
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cursor_cli', 'openhands', 'custom')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'stuck', 'offline')),
  current_project_id UUID,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  capabilities JSONB,
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
  depends_on UUID[],
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

ALTER TABLE public.agent_tasks ADD CONSTRAINT fk_agent_tasks_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.agent_tasks ADD CONSTRAINT fk_agent_tasks_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.agents ADD CONSTRAINT fk_agents_project FOREIGN KEY (current_project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.agent_logs ADD CONSTRAINT fk_agent_logs_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;
ALTER TABLE public.agent_logs ADD CONSTRAINT fk_agent_logs_task FOREIGN KEY (task_id) REFERENCES public.agent_tasks(id) ON DELETE SET NULL;
ALTER TABLE public.agent_logs ADD CONSTRAINT fk_agent_logs_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.project_agent_tracking ADD CONSTRAINT fk_project_agent_tracking_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.project_agent_tracking ADD CONSTRAINT fk_project_agent_tracking_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.project_agent_tracking ADD CONSTRAINT fk_project_agent_tracking_milestone FOREIGN KEY (current_milestone_id) REFERENCES public.milestones(id) ON DELETE SET NULL;

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_agent_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read agents" ON public.agents;
CREATE POLICY "Anyone can read agents" ON public.agents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert agents" ON public.agents;
CREATE POLICY "Only admins can insert agents" ON public.agents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can update agents" ON public.agents;
CREATE POLICY "Only admins can update agents" ON public.agents FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete agents" ON public.agents;
CREATE POLICY "Only admins can delete agents" ON public.agents FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their project tasks" ON public.agent_tasks;
CREATE POLICY "Clients can read their project tasks" ON public.agent_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id INNER JOIN public.profiles ON clients.email = profiles.email WHERE projects.id = agent_tasks.project_id AND profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can read all tasks" ON public.agent_tasks;
CREATE POLICY "Admins can read all tasks" ON public.agent_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify tasks" ON public.agent_tasks;
CREATE POLICY "Only admins can modify tasks" ON public.agent_tasks FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their project logs" ON public.agent_logs;
CREATE POLICY "Clients can read their project logs" ON public.agent_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id INNER JOIN public.profiles ON clients.email = profiles.email WHERE projects.id = agent_logs.project_id AND profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can read all logs" ON public.agent_logs;
CREATE POLICY "Admins can read all logs" ON public.agent_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Only admins can insert logs" ON public.agent_logs;
CREATE POLICY "Only admins can insert logs" ON public.agent_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their project tracking" ON public.project_agent_tracking;
CREATE POLICY "Clients can read their project tracking" ON public.project_agent_tracking FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id INNER JOIN public.profiles ON clients.email = profiles.email WHERE projects.id = project_agent_tracking.project_id AND profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can modify tracking" ON public.project_agent_tracking;
CREATE POLICY "Admins can modify tracking" ON public.project_agent_tracking FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE OR REPLACE FUNCTION public.update_agents_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agents_updated_at ON public.agents;
CREATE TRIGGER trigger_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_agents_updated_at();

CREATE OR REPLACE FUNCTION public.update_tracking_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tracking_updated_at ON public.project_agent_tracking;
CREATE TRIGGER trigger_tracking_updated_at BEFORE UPDATE ON public.project_agent_tracking FOR EACH ROW EXECUTE FUNCTION public.update_tracking_updated_at();

INSERT INTO public.agents (name, type, status, capabilities, max_parallel_tasks) VALUES ('Cursor-Agent-1', 'cursor_cli', 'idle', '["frontend","backend","fullstack","components","pages","styling"]'::JSONB, 1) ON CONFLICT DO NOTHING;

-- Verify insert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.agents WHERE name = 'Cursor-Agent-1') THEN
    RAISE NOTICE '✅ Cursor-Agent-1 inserted successfully!';
  ELSE
    RAISE NOTICE '❌ Cursor-Agent-1 NOT inserted!';
  END IF;
END $$;

SELECT '====================================' as result;
SELECT 'Agent System: Created successfully!' as result;
SELECT '====================================' as result;
