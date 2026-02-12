-- Social Media Bot - Database Schema
-- Run in Supabase SQL Editor to add social media platform infrastructure

-- ============================================
-- SOCIAL POSTS TABLE - Queue and track all posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'instagram')),
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  post_id_external TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_approval',
    'approved',
    'scheduled',
    'posted',
    'failed',
    'rejected'
  )),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index: Query posts by status and scheduled time
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON public.social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON public.social_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_created_by ON public.social_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_social_posts_ready_to_post ON public.social_posts(scheduled_at, status) WHERE status = 'approved' AND scheduled_at <= NOW() + INTERVAL '1 hour';

-- ============================================
-- SOCIAL ANALYTICS TABLE - Track engagement metrics
-- ============================================
CREATE TABLE IF NOT EXISTS public.social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_social_analytics_post_id ON public.social_analytics(social_post_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_recorded_at ON public.social_analytics(recorded_at DESC);

-- ============================================
-- BRAND GUIDELINES TABLE - Configure brand voice and settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.brand_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.brand_guidelines (key_name, value, metadata)
VALUES
  ('voice_style', 'professional, innovative, tech-forward', '{"emoji": true, "casual_level": 0.7}'),
  ('hashtags', '#AI #WebDev #Autonomous #Tech #Innovation', '{"required": ["#AI", "#Autonomous"]}'),
  ('topics_to_avoid', 'politics, religion, controversial topics', '{"strict": true}'),
  ('posting_schedule_twitter', '09:00, 12:00, 15:00, 18:00', '{"timezone": "Europe/Dublin", "frequency": "4/day"}'),
  ('posting_schedule_facebook', '10:00, 14:00, 19:00', '{"timezone": "Europe/Dublin", "frequency": "3/day"}'),
  ('auto_approve_confidence', '0.8', '{"threshold": 0.8, "enabled": false}')
ON CONFLICT (key_name) DO NOTHING;

-- ============================================
-- CONTENT TOPICS TABLE - For AI content generation
-- ============================================
CREATE TABLE IF NOT EXISTS public.content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.content_topics (topic, priority)
VALUES
  ('AI Web Development', 10),
  ('Autonomous Agents', 9),
  ('No-Code/Low-Code', 8),
  ('SaaS Trends', 7),
  ('Tech Innovation', 9),
  ('Digital Transformation', 8),
  ('Client success stories', 6)
ON CONFLICT (topic) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;

-- SOCIAL POSTS
DROP POLICY IF EXISTS "Admins can read all posts" ON public.social_posts;
CREATE POLICY "Admins can read all posts" ON public.social_posts FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert posts" ON public.social_posts;
CREATE POLICY "Admins can insert posts" ON public.social_posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can update posts" ON public.social_posts;
CREATE POLICY "Admins can update posts" ON public.social_posts FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete posts" ON public.social_posts;
CREATE POLICY "Admins can delete posts" ON public.social_posts FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- SOCIAL ANALYTICS
DROP POLICY IF EXISTS "Admins can manage analytics" ON public.social_analytics;
CREATE POLICY "Admins can manage analytics" ON public.social_analytics FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- BRAND GUIDELINES
DROP POLICY IF EXISTS "Anyone can read brand guidelines" ON public.brand_guidelines;
CREATE POLICY "Anyone can read brand guidelines" ON public.brand_guidelines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify brand guidelines" ON public.brand_guidelines;
CREATE POLICY "Only admins can modify brand guidelines" ON public.brand_guidelines FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- CONTENT TOPICS
DROP POLICY IF EXISTS "Anyone can read content topics" ON public.content_topics;
CREATE POLICY "Anyone can read content topics" ON public.content_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify content topics" ON public.content_topics;
CREATE POLICY "Only admins can modify content topics" ON public.content_topics FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.create_social_post(p_platform TEXT, p_content TEXT, p_hashtags TEXT[] DEFAULT '{}', p_media_urls TEXT[] DEFAULT '{}', p_ai_generated BOOLEAN DEFAULT false, p_created_by UUID DEFAULT NULL) RETURNS UUID AS $$
DECLARE v_post_id UUID;
BEGIN
  INSERT INTO public.social_posts (platform, content, hashtags, media_urls, ai_generated, created_by) VALUES (p_platform, p_content, p_hashtags, p_media_urls, p_ai_generated, p_created_by) RETURNING id INTO v_post_id;
  RETURN v_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_post_status(p_post_id UUID, p_status TEXT, p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL) RETURNS VOID AS $$
BEGIN
  UPDATE public.social_posts SET status = p_status, scheduled_at = COALESCE(p_scheduled_at, scheduled_at), posted_at = CASE WHEN p_status = 'posted' THEN NOW() ELSE posted_at END, failed_at = CASE WHEN p_status = 'failed' THEN NOW() ELSE failed_at END, updated_at = NOW() WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.log_social_analytics(p_social_post_id UUID, p_impressions INTEGER DEFAULT 0, p_likes INTEGER DEFAULT 0, p_comments INTEGER DEFAULT 0, p_shares INTEGER DEFAULT 0, p_retweets INTEGER DEFAULT 0, p_bookmarks INTEGER DEFAULT 0, p_clicks INTEGER DEFAULT 0) RETURNS UUID AS $$
DECLARE v_analytics_id UUID; v_engagement_rate NUMERIC;
BEGIN
  IF p_impressions > 0 THEN v_engagement_rate := (p_likes::NUMERIC + p_comments::NUMERIC + p_shares::NUMERIC) / p_impressions::NUMERIC; ELSE v_engagement_rate := 0; END IF;
  INSERT INTO public.social_analytics (social_post_id, platform, impressions, likes, comments, shares, retweets, bookmarks, clicks, engagement_rate) SELECT p_social_post_id, sp.platform, p_impressions, p_likes, p_comments, p_shares, p_retweets, p_bookmarks, p_clicks, v_engagement_rate FROM public.social_posts sp WHERE sp.id = p_social_post_id RETURNING id INTO v_analytics_id;
  RETURN v_analytics_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_brand_guideline(p_key_name TEXT) RETURNS TEXT AS $$ BEGIN RETURN value FROM public.brand_guidelines WHERE key_name = p_key_name; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_brand_guideline(p_key_name TEXT, p_value TEXT) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.brand_guidelines (key_name, value) VALUES (p_key_name, p_value) ON CONFLICT (key_name) DO UPDATE SET value = p_value, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_social_posts_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_social_posts_updated_at ON public.social_posts;
CREATE TRIGGER trigger_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_social_posts_updated_at();

SELECT 'Social media bot database schema created successfully' as status;
