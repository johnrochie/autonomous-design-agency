-- Trend Research System - Database Schema Extensions
-- Run in Supabase SQL Editor to add trend tracking

-- ============================================
-- UPDATE CONTENT_TOPICS TABLE - Add trend tracking
-- ============================================

-- Add trend scoring columns
ALTER TABLE public.content_topics
ADD COLUMN IF NOT EXISTS trend_score REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS trend_sources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_researched TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS research_notes TEXT;

-- Add index for trending topics
CREATE INDEX IF NOT EXISTS idx_content_topics_trend_score
  ON public.content_topics(trend_score DESC)
  WHERE trend_score > 0;

CREATE INDEX IF NOT EXISTS idx_content_topics_last_researched
  ON public.content_topics(last_researched DESC);

-- ============================================
-- TRENDING TOPICS TABLE - Track trending searches
-- ============================================
CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  search_query TEXT,
  trend_score REAL DEFAULT 0,
  search_volume INTEGER DEFAULT 0,
  sources_found INTEGER DEFAULT 0,
  last_trended TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trending_days INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('AI', 'web_dev', 'frameworks', 'tools', 'tech_news', 'business')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index: Query by trend score and category
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON public.trending_topics(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON public.trending_topics(category, trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_search_volume ON public.trending_topics(search_volume DESC);

-- ============================================
-- RESEARCH LOGS TABLE - Track research history
-- ============================================
CREATE TABLE IF NOT EXISTS public.research_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_type TEXT NOT NULL CHECK (research_type IN ('trend_search', 'news_scan', 'competitor_analysis')),
  search_query TEXT,
  results_found INTEGER,
  topics_extracted TEXT[],
  sources TEXT[],
  relevance_score REAL,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index: Query research logs
CREATE INDEX IF NOT EXISTS idx_research_logs_type ON public.research_logs(research_type);
CREATE INDEX IF NOT EXISTS idx_research_logs_started_at ON public.research_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_logs_success ON public.research_logs(success);

-- ============================================
-- SEED INITIAL TRENDING TOPICS
-- ============================================
INSERT INTO public.trending_topics (keyword, category, trend_score, search_volume)
VALUES
  ('AI web development', 'AI', 1.0, 1000),
  ('autonomous agents', 'AI', 0.9, 850),
  ('cursor IDE', 'tools', 0.8, 750),
  ('nextjs 16', 'frameworks', 0.85, 900),
  ('supabase', 'tools', 0.75, 700),
  ('no-code web development', 'web_dev', 0.9, 800),
  ('AI automation', 'AI', 0.95, 950),
  ('typescript web dev', 'tools', 0.7, 650),
  ('SaaS development', 'business', 0.8, 780),
  ('web development 2026', 'web_dev', 0.85, 850)
ON CONFLICT (keyword) DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Update topic trend score
CREATE OR REPLACE FUNCTION public.update_topic_trend_score(
  p_topic_id UUID,
  p_trend_score REAL,
  p_research_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.content_topics
  SET
    trend_score = p_trend_score,
    last_researched = NOW(),
    research_notes = COALESCE(p_research_notes, research_notes)
  WHERE id = p_topic_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Log research execution
CREATE OR REPLACE FUNCTION public.log_research(
  p_research_type TEXT,
  p_search_query TEXT,
  p_results_found INTEGER,
  p_topics_extracted TEXT[],
  p_sources TEXT[],
  p_relevance_score REAL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.research_logs (
    research_type,
    search_query,
    results_found,
    topics_extracted,
    sources,
    relevance_score,
    metadata
  )
  VALUES (
    p_research_type,
    p_search_query,
    p_results_found,
    p_topics_extracted,
    p_sources,
    p_relevance_score,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get trending topics by category
CREATE OR REPLACE FUNCTION public.get_trending_topics(
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  keyword TEXT,
  trend_score REAL,
  search_volume INTEGER,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tt.id,
    tt.keyword,
    tt.trend_score,
    tt.search_volume,
    tt.category
  FROM public.trending_topics tt
  WHERE
    (p_category IS NULL OR tt.category = p_category)
    AND tt.trend_score > 0
  ORDER BY tt.trend_score DESC, tt.search_volume DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_trending_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trending_topics_updated_at BEFORE UPDATE
  ON public.trending_topics FOR EACH ROW
  EXECUTE FUNCTION public.update_trending_topics_updated_at();

-- ============================================
-- COMPLETED
-- ============================================
SELECT 'Trend research system database extensions created successfully' as status;
