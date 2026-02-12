-- Email Tracking Schema
-- Run in Supabase SQL Editor to add email delivery tracking

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('welcome', 'quote', 'project_update', 'milestone_completion', 'agent_escalation', 'custom')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_project_id ON public.email_logs(project_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read all email logs" ON public.email_logs;
CREATE POLICY "Admins can read all email logs" ON public.email_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Clients can read their email logs" ON public.email_logs;
CREATE POLICY "Clients can read their email logs" ON public.email_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects INNER JOIN public.clients ON projects.client_id = clients.id WHERE clients.email = email_logs.to_email));

DROP POLICY IF EXISTS "Only admins can insert email logs" ON public.email_logs;
CREATE POLICY "Only admins can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.log_email(p_to_email TEXT, p_subject TEXT, p_type TEXT, p_status TEXT DEFAULT 'queued', p_project_id UUID DEFAULT NULL, p_metadata JSONB DEFAULT '{}') RETURNS UUID AS $$
DECLARE v_log_id UUID;
BEGIN
  INSERT INTO public.email_logs (to_email, subject, type, status, project_id, metadata) VALUES (p_to_email, p_subject, p_type, p_status, p_project_id, p_metadata) RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_email_status(p_log_id UUID, p_status TEXT) RETURNS VOID AS $$
BEGIN
  UPDATE public.email_logs SET status = p_status, sent_at = CASE WHEN p_status = 'sent' THEN NOW() ELSE sent_at END, delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END, opened_at = CASE WHEN p_status = 'opened' THEN NOW() ELSE opened_at END, clicked_at = CASE WHEN p_status = 'clicked' THEN NOW() ELSE clicked_at END, failed_at = CASE WHEN p_status = 'failed' THEN NOW() ELSE failed_at END WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Email tracking schema created successfully' as status;
