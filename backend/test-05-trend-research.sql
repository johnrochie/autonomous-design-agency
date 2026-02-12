-- Trend Research - Extracted from ACTIVATE_ALL.sql
-- Run this in Supabase SQL Editor

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
  metadata JSONB DEFAULT '{}',
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
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON public.trending_topics(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON public.trending_topics(category, trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_search_volume ON public.trending_topics(search_volume DESC);
CREATE INDEX IF NOT EXISTS idx_research_logs_type ON public.research_logs(research_type);
CREATE INDEX IF NOT EXISTS idx_research_logs_started_at ON public.research_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_logs_success ON public.research_logs(success);

CREATE OR REPLACE FUNCTION public.update_trending_topics_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_trending_topics_updated_at ON public.trending_topics;
CREATE TRIGGER trigger_trending_topics_updated_at BEFORE UPDATE ON public.trending_topics FOR EACH ROW EXECUTE FUNCTION public.update_trending_topics_updated_at();

INSERT INTO public.trending_topics (keyword, category, trend_score, search_volume) VALUES
  ('AI web development', 'AI', 1.0, 1000), ('autonomous agents', 'AI', 0.9, 850),
  ('cursor IDE', 'tools', 0.8, 750), ('nextjs 16', 'frameworks', 0.85, 900),
  ('supabase', 'tools', 0.75, 700), ('no-code web development', 'web_dev', 0.9, 800),
  ('AI automation', 'AI', 0.95, 950), ('typescript web dev', 'tools', 0.7, 650),
  ('SaaS development', 'business', 0.8, 780), ('web development 2026', 'web_dev', 0.85, 850)
ON CONFLICT (keyword) DO NOTHING;

SELECT '====================================' as result;
SELECT 'Trend Research: Created successfully!' as result;
SELECT '====================================' as result;
