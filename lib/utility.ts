/**
 * Utility Functions
 * Web search and web fetch using Brave Search API
 */

const BRAVE_SEARCH_API_KEY = process.env.BRAVE_SEARCH_API_KEY || 'BSATi8dULn-yuAuilMXIstwrULnhf8KU';
const BRAVE_SEARCH_API_BASE = 'https://api.search.brave.com/v1';

/**
 * Search the web using Brave Search API
 * Requires BRAVE_SEARCH_API_KEY environment variable
 */
export async function web_search(query: string, options: {
  count?: number;
  country?: string;
  search_lang?: string;
  ui_lang?: string;
} = {}): Promise<any[]> {
  const {
    count = 10,
    country = 'US',
    search_lang = 'en',
    ui_lang = 'en',
  } = options;

  try {
    const params = new URLSearchParams({
      q: query,
      count: count.toString(),
      country,
      search_lang,
    });

    const response = await fetch(`${BRAVE_SEARCH_API_BASE}/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error('[Web Search] API error:', data.error);
      return [];
    }

    const results = data.web?.results || [];

    return results.map((result: any) => {
      return {
        title: result.title,
        url: result.url || result.raw?.url,
        link: result.url || result.raw?.url,
        description: result.description || result.snippet,
        published: result?.published_date,
        domain: result?.domain,
        favicon: result?.favicon,
      };
    });
  } catch (error: any) {
    console.error('[Web Search] Error:', error);
    return [];
  }
}

/**
 * Fetch content from a URL and extract readable text
 * Uses text extraction (strips HTML, returns markdown or plain text)
 */
export async function web_fetch(url: string, options: {
  extractMode?: 'markdown' | 'text';
  maxChars?: number;
} = {}): Promise<string | null> {
  const {
    extractMode = 'text',
    maxChars = 10000,
  } = options;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[Web Fetch] HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();

    // Simple HTML to text conversion (basic)
    const text = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')  // Remove script tags and content
      .replace(/<style[^>]*>.*?<\/style>/gi, '')   // Remove style tags
      .replace(/<[^>]+>/g, ' ')              // Remove HTML tags
      .replace(/\s+/g, ' ')                  // Normalize whitespace
      .trim();

    // Truncate if needed
    const truncated = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

    return truncated;
  } catch (error: any) {
    console.error(`[Web Fetch] Error fetching ${url}:`, error);
    return null;
  }
}
