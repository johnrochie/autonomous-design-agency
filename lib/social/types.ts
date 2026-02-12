/**
 * Social Media Bot Types
 * Types for autonomous social media posting
 */

// ============================================
// PLATFORM ENUMERATIONS
// ============================================

export type SocialPlatform = 'twitter' | 'facebook' | 'linkedin' | 'instagram';

export type PostStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'posted'
  | 'failed'
  | 'rejected';

export type ContentPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// ============================================
// SOCIAL POST TYPES
// ============================================

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  media_urls: string[];
  post_id_external: string | null;
  status: PostStatus;
  scheduled_at: string | null;
  posted_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  ai_generated: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  platform: SocialPlatform;
  content: string;
  hashtags?: string[];
  media_urls?: string[];
  ai_generated?: boolean;
  created_by?: string;
  scheduled_at?: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface SocialAnalytics {
  id: string;
  social_post_id: string;
  platform: SocialPlatform;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  retweets: number;
  bookmarks: number;
  clicks: number;
  engagement_rate: string; // NUMERIC from Postgres
  recorded_at: string;
}

export interface AnalyticsDisplay {
  totalPosts: number;
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: string;
  topPerformingPosts: {
    postId: string;
    content: string;
    platform: SocialPlatform;
    engagement_rate: string;
  }[];
  platformBreakdown: {
    platform: SocialPlatform;
    posts: number;
    impressions: number;
    engagement: string;
  }[];
}

// ============================================
// BRAND GUIDELINES TYPES
// ============================================

export interface BrandGuideline {
  id: string;
  key_name: string;
  value: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BrandSettings {
  voice_style: string;
  hashtags: string;
  topics_to_avoid: string;
  posting_schedule_twitter: string;
  posting_schedule_facebook: string;
  auto_approve_confidence: string;
}

export interface BrandConfig {
  emoji_enabled: boolean;
  casual_level: number; // 0-10, 0 = formal, 10 = casual
  required_hashtags: string[];
  topics_to_avoid: string[];
  auto_approve_threshold: number; // 0-1, above this = auto-approve
  posting_times: {
    twitter: string[];
    facebook: string[];
    linkedin: string[];
    instagram: string[];
  };
}

// ============================================
// CONTENT GENERATION TYPES
// ============================================

export interface ContentTopic {
  id: string;
  topic: string;
  priority: ContentPriority;
  last_used: string | null;
  usage_count: number;
  created_at: string;
}

export interface GeneratedPost {
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  confidence: number; // 0-1, how confident AI is
  suggested_schedule: string;
}

export interface ContentGenerationStrategy {
  platform: SocialPlatform;
  topics: string[];
  brand_voice: string;
  max_length: number;
  use_emoji: boolean;
}

// ============================================
// API INTEGRATION TYPES (Placeholder)
// ============================================

export interface TwitterAPIResponse {
  data: {
    id: string;
    text: string;
    created_at: string;
  };
  errors?: {
    code: number;
    message: string;
  }[];
}

export interface FacebookAPIResponse {
  id: string;
  success: boolean;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export interface SocialMediaAPIConfig {
  twitter: {
    consumer_key: string;
    consumer_secret: string;
    access_token: string;
    access_token_secret: string;
  } | null;
  facebook: {
    app_id: string;
    app_secret: string;
    page_access_token: string;
    page_id: string;
  } | null;
}

// ============================================
// CALENDAR TYPES
// ============================================

export interface CalendarDay {
  date: string;
  posts: {
    id: string;
    platform: SocialPlatform;
    content: string;
    status: PostStatus;
    scheduled_at: string;
  }[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: Map<string, CalendarDay>;
}

// ============================================
// APPROVAL QUEUE TYPES
// ============================================

export interface PendingPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  ai_generated: boolean;
  created_at: string;
  confidence: number; // AI confidence score
}

export interface ApprovalAction {
  post_id: string;
  action: 'approve' | 'reject' | 'schedule';
  scheduled_at?: string;
}

// ============================================
// ERROR TYPES
// ============================================

export class SocialMediaError extends Error {
  code: string;
  platform?: SocialPlatform;
  details?: any;

  constructor(message: string, code: string, platform?: SocialPlatform, details?: any) {
    super(message);
    this.name = 'SocialMediaError';
    this.code = code;
    this.platform = platform;
    this.details = details;
  }
}

export enum ErrorCode {
  API_NOT_CONFIGURED = 'API_NOT_CONFIGURED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_CONTENT = 'INVALID_CONTENT',
  POST_FAILED = 'POST_FAILED',
  ANTHROPIC_ERROR = 'ANTHROPIC_ERROR',
  GENERATION_FAILED = 'GENERATION_FAILED',
}

// ============================================
// CRON JOB TYPES
// ============================================

export interface CronJobSchedule {
  name: string;
  frequency: string;
  last_run: string;
  next_run: string;
  status: 'idle' | 'running' | 'failed';
}

export interface PostQueueJob {
  job_id: string;
  posts_to_post: string[];
  scheduled_times: string[];
}
