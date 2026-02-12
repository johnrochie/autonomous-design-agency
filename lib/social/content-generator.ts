/**
 * AI Content Generator for Social Media
 * Uses AI to generate platform-specific social media content
 */

import type {SocialPlatform, ContentTopic, GeneratedPost, BrandConfig} from './types';

// Mock AI client (will use real AI in production)
// This is a placeholder that works without API keys - uses template-based generation
class AIContentGenerator {
  private brandConfig: BrandConfig | null = null;

  async initializeBrandConfig(): Promise<BrandConfig> {
    // TODO: Load from database brand_guidelines table
    // For now, return defaults
    return {
      emoji_enabled: true,
      casual_level: 7, // Pretty casual
      required_hashtags: ['#AI', '#Autonomous'],
      topics_to_avoid: ['politics', 'religion', 'controversial topics'],
      auto_approve_threshold: 0.8,
      posting_times: {
        twitter: ['09:00', '12:00', '15:00', '18:00'],
        facebook: ['10:00', '14:00', '19:00'],
        linkedin: ['09:00', '12:00', '17:00'],
        instagram: ['10:00', '13:00', '19:00', '21:00'],
      },
    };
  }

  /**
   * Generate a social media post
   */
  async generatePost(
    platform: SocialPlatform,
    topic: string,
    context?: string
  ): Promise<GeneratedPost> {
    // Initialize brand config if needed
    if (!this.brandConfig) {
      this.brandConfig = await this.initializeBrandConfig();
    }

    const config = this.brandConfig;

    // Generate platform-specific content
    const content = await this.generateContent(platform, topic, context, config);
    const hashtags = await this.generateHashtags(platform, topic, config);

    // Calculate confidence (mock - will use real AI later)
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0

    // Suggest optimal posting time
    const suggestedSchedule = this.suggestPostTime(platform, config);

    return {
      platform,
      content,
      hashtags,
      confidence,
      suggested_schedule: suggestedSchedule,
    };
  }

  /**
   * Generate multiple posts
   */
  async generateMultiplePosts(
    platform: SocialPlatform,
    topics: ContentTopic[],
    count: number = 1
  ): Promise<GeneratedPost[]> {
    const posts: GeneratedPost[] = [];
    const shuffledTopics = this.shuffleArray([...topics]);

    for (let i = 0; i < Math.min(count, shuffledTopics.length); i++) {
      const post = await this.generatePost(platform, shuffledTopics[i].topic);
      posts.push(post);
      
      // Track usage
      await this.updateTopicUsage(shuffledTopics[i].id);
    }

    return posts;
  }

  /**
   * Generate platform-specific content
   */
  private async generateContent(
    platform: SocialPlatform,
    topic: string,
    context: string | undefined,
    config: BrandConfig
  ): Promise<string> {
    const emoji = config.emoji_enabled ? this.getRandomEmoji() : '';
    const tone = config.casual_level >= 7 ? '😊' : '';

    // Platform-specific templates (placeholder - will use real AI)
    const templates: Record<SocialPlatform, string[]> = {
      twitter: [
        `{topic} is changing everything {emoji}. Here's how we're using it at Autonomous Design Agency...`,
        `Just built something incredible with {topic} {emoji}. AI truly is the future of web dev.`,
        `POV: You're watching {topic} revolutionize web development {tone}`,
        `{topic} isn't just hype. Here's a real use case we built today.`,
        `The future is autonomous. {topic} makes it possible. Here's how...`,
      ],
      facebook: [
        `We just launched something amazing using {topic} {emoji}.\n\nThe results? Incredible. Here's what we learned...`,
        `{topic} is transforming the way we build websites. Check out this recent project where we used autonomous AI agents...`,
        `Game-changing moment: {topic} is now ready for production.\n\nHere's how it works and why it matters for your business.`,
      ],
      linkedin: [
        `{topic} isn't just a trend - it's the future of software development.\n\nAt Autonomous Design Agency, we've built a system where AI agents autonomously develop production websites...`,
        `I'm excited to announce our latest breakthrough with {topic}.\n\nWe've achieved 90% autonomous web development. Here's how it works...`,
        `Professional web development is being transformed by {topic}.\n\nHere's how businesses are leveraging autonomous AI agents...`,
      ],
      instagram: [
        `🚀 {topic} in action! Check out this autonomous agent building a production website... #AI #Autonomous #WebDev`,
        `POV: You're witnessing {topic} revolutionize web development. Built entirely by AI agents. 💡`,
        `The future is autonomous. {topic} makes it possible. Here's how we built this website in 1 week...`,
      ],
    };

    const templatesForPlatform = templates[platform] || templates.twitter;
    const template = templatesForPlatform[Math.floor(Math.random() * templatesForPlatform.length)];

    // Replace placeholders
    let content = template.replace(/\{topic\}/g, topic);

    // Add context if provided
    if (context && platform === 'facebook') {
      content += `\n\n${context}`;
    }

    return content;
  }

  /**
   * Generate relevant hashtags
   */
  private async generateHashtags(
    platform: SocialPlatform,
    topic: string,
    config: BrandConfig
  ): Promise<string[]> {
    const topicTag = topic.split(' ').join('');
    const tag = topicTag.charAt(0).toUpperCase() + topicTag.slice(1);

    const platformTags: Record<SocialPlatform, string[]> = {
      twitter: ['#AI', '#Autonomous', '#WebDev', '#Tech', `#${tag}`, '#Innovation'],
      facebook: ['#AI', '#Autonomous', '#WebDevelopment', `#${topic}`, '#TechInnovation'],
      linkedin: ['#AI', '#Autonomous', '#WebDevelopment', '#Tech', '#DigitalTransformation'],
      instagram: ['#AI', '#Autonomous', '#WebDev', `#${topic}`, '#Tech', '#Innovation', '#WebDevelopment'],
    };

    const baseTags = platformTags[platform] || platformTags.twitter;

    // Add required hashtags from config
    const requiredTags = config.required_hashtags;

    // Combine and deduplicate
    const allTags = [...new Set([...baseTags, ...requiredTags])];

    // Platform-specific limits
    const maxHashtags: Record<SocialPlatform, number> = {
      twitter: 3, // Twitter has 280 char limit, fewer hashtags
      facebook: 5,
      linkedin: 3,
      instagram: 10, // Instagram allows many hashtags
    };

    return allTags.slice(0, maxHashtags[platform]);
  }

  /**
   * Suggest optimal posting time based on schedule
   */
  private suggestPostTime(platform: SocialPlatform, config: BrandConfig): string {
    const times = config.posting_times[platform];
    const today = new Date();
    const time = times[Math.floor(Math.random() * times.length)];
    const [hours, minutes] = time.split(':').map(Number);
    
    today.setHours(hours, minutes, 0, 0);
    
    // If time has passed, schedule for tomorrow
    if (today < new Date()) {
      today.setDate(today.getDate() + 1);
    }

    return today.toISOString();
  }

  /**
   * Get random emoji
   */
  private getRandomEmoji(): string {
    const emojis = ['🚀', '✨', '💡', '🎯', '⚡', '🔥', '💪', '🤖', '✅', '🌟'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  /**
   * Shuffle array randomly
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Update topic usage statistics (placeholder)
   */
  private async updateTopicUsage(topicId: string): Promise<void> {
    // TODO: Update last_used and usage_count in database
    console.log(`[AI] Updated topic usage: ${topicId}`);
  }
}

// Export singleton instance
export const aiContentGenerator = new AIContentGenerator();

// Export for convenience (now re-exported from social-service.ts)
export type {ContentTopic} from './types';

// Export helper functions
export async function generateSocialPost(
  platform: SocialPlatform,
  topic: string,
  context?: string
): Promise<GeneratedPost> {
  return aiContentGenerator.generatePost(platform, topic, context);
}

export async function generateMultipleSocialPosts(
  platform: SocialPlatform,
  topics: ContentTopic[],
  count: number = 1
): Promise<GeneratedPost[]> {
  return aiContentGenerator.generateMultiplePosts(platform, topics, count);
}
