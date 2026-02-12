/**
 * Trend Research Service
 * Uses web search to identify trending topics for social media content generation
 */

import { supabase } from '../supabase';
import { web_search, web_fetch } from '../utility';

// Internal reference
const db = supabase!;

// ============================================
// TYPES
// ============================================

export interface TrendingTopic {
  id: string;
  keyword: string;
  search_query: string;
  trend_score: number;
  search_volume: number;
  sources_found: number;
  last_trended: string;
  trending_days: number;
  category: 'AI' | 'web_dev' | 'frameworks' | 'tools' | 'tech_news' | 'business';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContentTopic {
  id: string;
  topic: string;
  priority: number;
  last_used: string | null;
  usage_count: number;
  trend_score: number;
  last_researched: string | null;
  research_notes?: string;
  created_at: string;
}

export interface TrendAnalysisResult {
  keyword: string;
  category: 'AI' | 'web_dev' | 'frameworks' | 'tools' | 'techNews' | 'business';
  trend_score: number;
  search_volume: number;
  sources: string[];
  extracted_topics: string[];
  relevance_score: number;
  research_notes: string;
  research_at: string;
}

type Category = 'AI' | 'web_dev' | 'frameworks' | 'tools' | 'techNews' | 'business';

// ============================================
// WEB SEARCH & FETCH WRAPPERS
// ============================================

/**
 * Search for trending topics using Brave Search
 */
async function searchTrends(searchQuery: string): Promise<string[]> {
  try {
    const results = await web_search(searchQuery, {
      count: 10,
      ui_lang: 'en',
      country: 'US',
    });

    const urls = results.map((r: any) => r.url || r.link);
    console.log(`[Trend Research] Web search for "${searchQuery}" found ${urls.length} results`);

    return urls;
  } catch (error: any) {
    console.error(`[Trend Research] Web search failed for "${searchQuery}":`, error);
    return [];
  }
}

/**
 * Extract topics from search results
 */
export async function extractTopicsFromResults(urls: string[]): Promise<string[]> {
  const extractedTopics = new Set<string>();

  for (const url of urls.slice(0, 5)) { // Limit to 5 results to avoid rate limiting
    try {
      const content = await web_fetch(url, {
        extractMode: 'text', // Text extraction
        maxChars: 5000,
      });

      if (content) {
        // Extract keywords and topics
        const topics = extractKeywords(content);
        topics.forEach(t => extractedTopics.add(t));
      }
    } catch (error: any) {
      console.error(`[Trend Research] Failed to fetch ${url}:`, error);
    }
  }

  console.log(`[Trend Research] Extracted ${extractedTopics.size} topics from ${urls.length} results`);
  return Array.from(extractedTopics);
}

/**
 * Extract keywords and topics from text content
 */
export function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();

  // AI and web development related keywords
  const patterns = [
    /\b(RAG|vector database|AI agents|autonomous|machine learning|deep learning|LLM|GPT|Claude|Ollama|TensorFlow|PyTorch)\b/gi,
    /\b(Next\.js|React|Vue\.js|Svelte|Angular|TypeScript|JavaScript|GraphQL|REST|GraphQL|WebAssembly)\b/gi,
    /\b(Docker|Kubernetes|Lambda|serverless|edge computing|microservices)\b/gi,
    /\b(AI web development|no-code|low-code|automation|SaaS|B2B|B2C)\b/gi,
    /\b(cursor|GitHub Copilot|AI code|AI coding|code generation)\b/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => keywords.add(m));
    }
  }

  // Extract capitalized phrases (potential topics)
  const phrases = text.match(/[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,5}/g) || [];
  phrases.slice(0, 20).forEach(p => keywords.add(p)); // Limit to 20 phrases

  return Array.from(keywords).slice(0, 30); // Return top 30
}

// ============================================
// TREND RESEARCH MAIN
// ============================================

/**
 * Execute trend research - Main entry point
 */
export async function executeTrendResearch(): Promise<{
  researched: number;
  topics_updated: number;
  trending_topics: TrendAnalysisResult[];
}> {
  console.log('[Trend Research] Starting trend analysis...');

  const categories: Category[] = [
    'AI',
    'web_dev',
    'frameworks',
    'tools',
    'techNews',
    'business',
  ];
  const searchQueries: Record<'AI' | 'web_dev' | 'frameworks' | 'tools' | 'techNews' | 'business', string[]> = {
    AI: ['AI web development trends', 'autonomous agents 2026', 'AI automation'],
    web_dev: ['web development trends', 'no-code web development', 'modern web frameworks'],
    frameworks: ['Next.js 16', 'React best practices', 'TypeScript web dev'],
    tools: ['cursor IDE', 'GitHub Copilot', 'AI coding tools'],
    techNews: ['tech news', 'software development news'],
    business: ['SaaS development', 'B2B SaaS trends'],
  };

  const all_results: TrendAnalysisResult[] = [];

  // Research each category
  for (const category of categories) {
    for (const query of searchQueries[category] || []) {
      const result = await researchTrend(query, category);
      if (result) {
        all_results.push(result);
      }
    }
  }

  // Update trending topics score
  const updatedCount = await updateTopicScores(all_results);

  console.log(`[Trend Research] Completed: ${all_results.length} queries, ${updatedCount} topics updated`);

  return {
    researched: all_results.length,
    topics_updated: updatedCount,
    trending_topics: all_results,
  };
}

/**
 * Research a single trend topic
 */
async function researchTrend(
  searchQuery: string,
  category: Category
): Promise<TrendAnalysisResult | null> {
  const startTime = new Date().toISOString();

  try {
    // Step 1: Search for trending content
    const urls = await searchTrends(searchQuery);
    if (urls.length === 0) {
      return null;
    }

    // Step 2: Extract topics from results
    const extractedTopics = await extractTopicsFromResults(urls);

    // Step 3: Analyze and score
    const relevanceScore = calculateRelevanceScore(extractedTopics, category);
    const searchVolume = urls.length * 10 + Math.floor(Math.random() * 100); // Mock search volume
    const trendScore = calculateTrendScore(relevanceScore, searchVolume, category);

    // Step 4: Extract keyword from search query (for easy identification)
    const keyword = extractKeyword(searchQuery);

    const result: TrendAnalysisResult = {
      keyword,
      category,
      trend_score: trendScore,
      search_volume: searchVolume,
      sources: urls,
      extracted_topics: extractedTopics,
      relevance_score: relevanceScore,
      research_notes: `Found ${urls.length} sources, ${extractedTopics.length} related topics. Relevance: ${(relevanceScore * 100).toFixed(0)}%`,
      research_at: startTime,
    };

    // Step 5: Log research
    await db.rpc('log_research', {
      p_research_type: 'trend_search',
      p_search_query: searchQuery,
      p_results_found: urls.length,
      p_topics_extracted: extractedTopics,
      p_sources: urls,
      p_relevance_score: relevanceScore,
      p_metadata: { category, keyword },
    });

    return result;
  } catch (error: any) {
    console.error(`[Trend Research] Error researching "${searchQuery}":`, error);

    // Log failed research
    await db.rpc('log_research', {
      p_research_type: 'trend_search',
      p_search_query: searchQuery,
      p_results_found: 0,
      p_topics_extracted: [],
      p_sources: [],
      p_relevance_score: 0,
      p_metadata: { error: error.message },
    });

    return null;
  }
}

/**
 * Calculate relevance score based on topics found
 */
function calculateRelevanceScore(topics: string[], category: Category): number {
  if (topics.length === 0) return 0;

  // High-value keywords for each category
  const highValueKeywords: Record<Category, string[]> = {
    AI: ['AI', 'autonomous', 'agents', 'LLM', 'machine learning', 'deep learning'],
    web_dev: ['web development', 'React', 'Next.js', 'TypeScript', 'SaaS', 'automation'],
    frameworks: ['framework', 'library', 'tool', 'SDK', 'platform'],
    tools: ['tool', 'platform', 'software', 'service', 'product'],
    techNews: ['launch', 'release', 'update', 'news', 'breakthrough'],
    business: ['growth', 'research', 'scale', 'startup', 'enterprise'],
  };

  const categoryKeywords = highValueKeywords[category] || [];
  let matchCount = 0;

  for (const topic of topics) {
    for (const keyword of categoryKeywords) {
      if (topic.toLowerCase().includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
  }

  // Normalize to 0-1 range
  const maxMatches = topics.length * 3; // Max 3 matches per topic
  if (maxMatches === 0) return 0;

  return Math.min(matchCount / maxMatches, 1);
}

/**
 * Calculate overall trend score
 */
function calculateTrendScore(
  relevanceScore: number,
  searchVolume: number,
  category: Category
): number {
  // Weight: Relevance (60%), Volume (40%)
  const weightedScore = (relevanceScore * 0.6) + ((searchVolume / 2000) * 0.4);

  // Category multiplier (AI and frameworks get boost)
  const categoryMultiplier: Record<Category, number> = {
    AI: 1.1,
    web_dev: 1.04,
    frameworks: 1.1,
    tools: 1.0,
    techNews: 1.05,
    business: 0.95,
  };

  return Math.min(weightedScore * (categoryMultiplier[category] || 1), 1);
}

/**
 * Extract keyword from search query for easy identification
 */
function extractKeyword(searchQuery: string): string {
  // Take first significant word (lowercase)
  const words = searchQuery.toLowerCase().split(' ').filter(w => w.length > 3);
  return words[0] || searchQuery.toLowerCase().split(' ')[0];
}

// ============================================
// UPDATE TOPIC SCORES
// ============================================

/**
 * Update topic scores based on research results
 */
export async function updateTopicScores(
  results: TrendAnalysisResult[]
): Promise<number> {
  let updatedCount = 0;

  for (const result of results) {
    // Check if topic already exists
    const existing = await db.from('content_topics').select('*').ilike('topic', `%${result.keyword}%`).limit(1);

    if (existing.data && existing.data.length > 0) {
      // Update existing topic
      const topic = existing.data[0];

      await db.rpc('update_topic_trend_score', {
        p_topic_id: topic.id,
        p_trend_score: result.trend_score,
        p_research_notes: result.research_notes,
      });

      updatedCount++;
    } else {
      // Create new trending topic if it meets threshold
      if (result.trend_score > 0.5) {
        await db.from('content_topics').insert({
          topic: result.keyword,
          priority: Math.ceil((1 - result.trend_score) * 10), // Higher priority for lower score
          trend_score: result.trend_score,
          last_researched: new Date().toISOString(),
          research_notes: result.research_notes,
        });

        updatedCount++;
      }
    }
  }

  return updatedCount;
}

// ============================================
// GET TRENDING TOPICS
// ============================================

/**
 * Get trending topics for content generation
 */
export async function getTrendingTopics(
  category?: Category,
  limit: number = 10
): Promise<TrendingTopic[]> {
  let query = db.from('trending_topics').select('*').order('trend_score', { ascending: false }).limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as TrendingTopic[];
}

/**
 * Get content topics sorted by trend score
 */
export async function getSortedContentTopics(
  limit: number = 20
): Promise<ContentTopic[]> {
  const { data, error } = await db
    .from('content_topics')
    .select('*')
    .gte('trend_score', 0.3)
    .order('trend_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ContentTopic[];
}

export type { Category };
