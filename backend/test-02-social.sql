-- Social Media - Extracted from ACTIVATE_ALL.sql
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter','facebook','linkedin','instagram')),
  content TEXT NOT NULL,
  hashtags TEXT[],
  media_urls TEXT[],
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
  metadata JSONB DEFAULT '{}',
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
  trend_sources TEXT[],
  last_researched TIMESTAMP WITH TIME ZONE,
  research_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON public.social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON public.social_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_ready_to_post ON public.social_posts(scheduled_at, status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_social_analytics_post_id ON public.social_analytics(social_post_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_recorded_at ON public.social_analytics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_topics_trend_score ON public.content_topics(trend_score DESC) WHERE trend_score > 0;
CREATE INDEX IF NOT EXISTS idx_content_topics_last_researched ON public.content_topics(last_researched DESC);

ALTER TABLE public.social_analytics ADD CONSTRAINT fk_social_analytics_post FOREIGN KEY (social_post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE;
ALTER TABLE public.social_posts ADD CONSTRAINT fk_social_posts_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;

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

CREATE OR REPLACE FUNCTION public.update_social_posts_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_social_posts_updated_at ON public.social_posts;
CREATE TRIGGER trigger_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_social_posts_updated_at();

INSERT INTO public.brand_guidelines (key_name, value, metadata) VALUES
  ('voice_style', 'professional, innovative, tech-forward', '{"emoji": true}'),
  ('hashtags', '#AI #WebDev #Autonomous', '{"required": ["#AI", "#Autonomous"]}'),
  ('topics_to_avoid', 'politics, religion', '{"strict": true}'),
  ('posting_schedule_twitter', '09:00, 12:00, 15:00, 18:00', '{"timezone": "Europe/Dublin"}'),
  ('posting_schedule_facebook', '10:00, 14:00, 19:00', '{"timezone": "Europe/Dublin"}'),
  ('auto_approve_confidence', '0.8', '{"enabled": false}')
ON CONFLICT (key_name) DO NOTHING;

INSERT INTO public.content_topics (topic, priority) VALUES ('AI Web Development', 10), ('Autonomous Agents', 9), ('No-Code/Low-Code', 8), ('SaaS Trends', 7), ('Tech Innovation', 9), ('Digital Transformation', 8), ('Client success stories', 6) ON CONFLICT (topic) DO NOTHING;

SELECT '====================================' as result;
SELECT 'Social Media: Created successfully!' as result;
SELECT '====================================' as result;
