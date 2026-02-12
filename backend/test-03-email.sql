-- Email Tracking - Extracted from ACTIVATE_ALL.sql
-- Run this in Supabase SQL Editor

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
  metadata JSONB DEFAULT '{}',
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_project_id ON public.email_logs(project_id);

ALTER TABLE public.email_logs ADD CONSTRAINT fk_email_logs_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read all email logs" ON public.email_logs;
CREATE POLICY "Admins can read all email logs" ON public.email_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their email logs" ON public.email_logs;
CREATE POLICY "Clients can read their email logs" ON public.email_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id WHERE clients.email = email_logs.to_email));

DROP POLICY IF EXISTS "Only admins can insert email logs" ON public.email_logs;
CREATE POLICY "Only admins can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

SELECT '====================================' as result;
SELECT 'Email Tracking: Created successfully!' as result;
SELECT '====================================' as result;
