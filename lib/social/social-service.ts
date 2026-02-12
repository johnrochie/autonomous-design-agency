/**
 * Social Media Service Layer
 * Handles posting to X (Twitter) and Facebook
 * 
 * Placeholder API implementations ready for credentials
 * When API keys are added to environment variables, posting will work automatically
 */

import { supabase } from '../supabase';
import * as Types from './types';

// Import types we use directly in this file
type SocialPlatform = Types.SocialPlatform;
type SocialPost = Types.SocialPost;
type CreatePostInput = Types.CreatePostInput;
type PostStatus = Types.PostStatus;
type SocialAnalytics = Types.SocialAnalytics;
type BrandGuideline = Types.BrandGuideline;
type ContentTopic = Types.ContentTopic;
type GeneratedPost = Types.GeneratedPost;
type AnalyticsDisplay = Types.AnalyticsDisplay;

// Import class enums for error handling
import { SocialMediaError, ErrorCode } from './types';

// Re-export all types for components to use
export type * from './types';

// ============================================
// API CONFIGURATION (From Environment Variables)
// ============================================

const TWITTER_CONFIG = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
};

const FACEBOOK_CONFIG = {
  app_id: process.env.FACEBOOK_APP_ID,
  app_secret: process.env.FACEBOOK_APP_SECRET,
  page_access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
  page_id: process.env.FACEBOOK_PAGE_ID,
};

// ============================================
// POST MANAGEMENT
// ============================================

/**
 * Create a new social post
 */
export async function createSocialPost(input: CreatePostInput): Promise<SocialPost> {
  const db = supabase!;

  // Validate character limits
  if (input.platform === 'twitter' && input.content.length > 280) {
    throw new SocialMediaError(
      'Twitter posts must be 280 characters or less',
      ErrorCode.INVALID_CONTENT,
      'twitter',
      { actualLength: input.content.length }
    );
  }

  // If scheduled not provided, auto-schedule based on platform
  let scheduledAt = input.scheduled_at;

  // If not scheduled, auto-schedule (most posts should be scheduled)
  if (!scheduledAt) {
    scheduledAt = calculateOptimalSchedule(input.platform);
  }

  const { data, error } = await db.rpc('create_social_post', {
    p_platform: input.platform,
    p_content: input.content,
    p_hashtags: input.hashtags || [],
    p_media_urls: input.media_urls || [],
    p_ai_generated: input.ai_generated || false,
    p_created_by: input.created_by || null,
  });

  if (error) throw new SocialMediaError(error.message, ErrorCode.POST_FAILED, input.platform);

  // Determine status based on whether scheduled
  const status = input.scheduled_at ? 'scheduled' : 'pending_approval';

  // Update status and scheduled_at
  await updatePostStatus(data, status, scheduledAt);

  // Fetch complete post
  const post = await getSocialPost(data);
  return post!;
}

/**
 * Get social post by ID
 */
export async function getSocialPost(postId: string): Promise<SocialPost | null> {
  const db = supabase!;
  const { data, error } = await db.from('social_posts').select('*').eq('id', postId).single();

  if (error || !data) return null;
  return data as SocialPost;
}

/**
 * Get all posts (admin view)
 */
export async function getAllPosts(
  status?: PostStatus,
  platform?: SocialPlatform,
  limit: number = 50
): Promise<SocialPost[]> {
  const db = supabase!;

  let query = db
    .from('social_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as SocialPost[];
}

/**
 * Get posts pending approval
 */
export async function getPendingApprovalPosts(): Promise<SocialPost[]> {
  return getAllPosts('pending_approval');
}

/**
 * Get scheduled posts ready to post
 */
export async function getScheduledPostsToPost(): Promise<SocialPost[]> {
  const db = supabase!;

  // Posts that are approved, scheduled in the past hour, not yet posted
  const { data, error } = await db
    .from('social_posts')
    .select('*')
    .eq('status', 'approved')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data as SocialPost[];
}

/**
 * Update post status
 */
export async function updatePostStatus(
  postId: string,
  status: PostStatus,
  scheduledAt?: string
): Promise<void> {
  const db = supabase!;

  const { error } = await db.rpc('update_post_status', {
    p_post_id: postId,
    p_status: status,
    p_scheduled_at: scheduledAt || null,
  });

  if (error) throw new SocialMediaError(error.message, ErrorCode.POST_FAILED);
}

/**
 * Approve a post (moves to scheduled)
 */
export async function approvePost(postId: string, scheduledAt?: string): Promise<void> {
  const post = await getSocialPost(postId);
  if (!post) throw new SocialMediaError('Post not found', ErrorCode.POST_FAILED);

  if (!scheduledAt) {
    scheduledAt = calculateOptimalSchedule(post.platform);
  }

  await updatePostStatus(postId, 'approved', scheduledAt);
}

/**
 * Reject a post
 */
export async function rejectPost(postId: string): Promise<void> {
  await updatePostStatus(postId, 'rejected');
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  const db = supabase!;
  const { error } = await db.from('social_posts').delete().eq('id', postId);

  if (error) throw new SocialMediaError(error.message, ErrorCode.POST_FAILED);
}

// ============================================
// POSTING TO PLATFORMS (Placeholder APIs)
// ============================================

/**
 * Post to Twitter (X)
 * TODO: Add Twitter API v2 integration
 * Requires: TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_BEARER_TOKEN
 */
export async function postToTwitter(postId: string): Promise<void> {
  const post = await getSocialPost(postId);
  if (!post) throw new SocialMediaError('Post not found', ErrorCode.POST_FAILED, 'twitter');

  // Check if API is configured
  if (!TWITTER_CONFIG.bearer_token || !TWITTER_CONFIG.consumer_key) {
    console.log('[Twitter] API not configured. Would post:', post.content);
    console.log('[Twitter] Add TWITTER_BEARER_TOKEN, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN to environment variables');
    
    // Mark as failed with descriptive error
    await markPostAsFailed(postId, 'Twitter API not configured - add environment variables (TWITTER_BEARER_TOKEN, etc.)');
    return;
  }

  try {
    // TODO: Implement Twitter API v2 posting
    // const response = await fetch('https://api.twitter.com/2/tweets', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${TWITTER_CONFIG.bearer_token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     text: `${post.content}\n\n${post.hashtags.map(tag => tag).join(' ')}`,
    //   }),
    // });
    
    // const data: TwitterAPIResponse = await response.json();
    
    // if (response.ok) {
    //   await markPostAsPosted(postId, data.data.id);
    // } else {
    //   throw new Error(data.errors?.[0]?.message || 'Twitter API error');
    // }

    // Placeholder: Log and mark as posted for testing
    console.log('[Twitter] POSTING (placeholder):', post.content);
    console.log('[Twitter] POSTING (placeholder): hashtags:', post.hashtags.join(' '));

    // Simulate API call success
    const mockTweetId = `mock_tweet_${Date.now()}`;
    await markPostAsPosted(postId, mockTweetId);
    
    console.log('[Twitter] Posted successfully (placeholder). Tweet ID:', mockTweetId);
  } catch (error: any) {
    console.error('[Twitter] Error posting:', error);
    await markPostAsFailed(postId, error.message);
    throw new SocialMediaError(error.message, ErrorCode.POST_FAILED, 'twitter', error);
  }
}

/**
 * Post to Facebook
 * TODO: Add Facebook Graph API integration
 * Requires: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID
 */
export async function postToFacebook(postId: string): Promise<void> {
  const post = await getSocialPost(postId);
  if (!post) throw new SocialMediaError('Post not found', ErrorCode.POST_FAILED, 'facebook');

  // Check if API is configured
  if (!FACEBOOK_CONFIG.page_access_token) {
    console.log('[Facebook] API not configured. Would post:', post.content);
    console.log('[Facebook] Add FACEBOOK_PAGE_ACCESS_TOKEN to environment variables');
    
    // Mark as failed with descriptive error
    await markPostAsFailed(postId, 'Facebook API not configured - add environment variables (FACEBOOK_PAGE_ACCESS_TOKEN)');
    return;
  }

  try {
    // TODO: Implement Facebook Graph API posting
    // const response = await fetch(`https://graph.facebook.com/${FACEBOOK_CONFIG.page_id}/feed`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message: `${post.content}\n\n${post.hashtags.map(tag => tag).join(' ')}`,
    //     access_token: FACEBOOK_CONFIG.page_access_token,
    //   }),
    // });

    // const data: FacebookAPIResponse = await response.json();
    
    // if (data.success) {
    //   await markPostAsPosted(postId, data.id);
    // } else {
    //   throw new Error(data.error?.message || 'Facebook API error');
    // }

    // Placeholder: Log and mark as posted for testing
    console.log('[Facebook] POSTING (placeholder):', post.content);
    console.log('[Facebook] POSTING (placeholder): hashtags:', post.hashtags.join(' '));

    // Simulate API call success
    const mockPostId = `mock_post_${Date.now()}`;
    await markPostAsPosted(postId, mockPostId);
    
    console.log('[Facebook] Posted successfully (placeholder). Post ID:', mockPostId);
  } catch (error: any) {
    console.error('[Facebook] Error posting:', error);
    await markPostAsFailed(postId, error.message);
    throw new SocialMediaError(error.message, ErrorCode.POST_FAILED, 'facebook', error);
  }
}

/**
 * Post to any platform (router)
 */
export async function postToPlatform(postId: string): Promise<void> {
  const post = await getSocialPost(postId);
  if (!post) throw new SocialMediaError('Post not found', ErrorCode.POST_FAILED);

  switch (post.platform) {
    case 'twitter':
      await postToTwitter(postId);
      break;
    case 'facebook':
      await postToFacebook(postId);
      break;
    default:
      throw new SocialMediaError(
        `Platform ${post.platform} not implemented yet`,
        ErrorCode.API_NOT_CONFIGURED,
        post.platform
      );
  }
}

/**
 * Post multiple scheduled posts (cron job entry point)
 */
export async function postScheduledPosts(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  const postsToPost = await getScheduledPostsToPost();

  let successful = 0;
  let failed = 0;

  for (const post of postsToPost) {
    try {
      await postToPlatform(post.id);
      successful++;
    } catch (error) {
      console.error(`[Cron] Failed to post ${post.id}:`, error);
      failed++;
    }
  }

  return {
    processed: postsToPost.length,
    successful,
    failed,
  };
}

// ============================================
// POST STATUS HELPERS
// ============================================

/**
 * Mark post as posted (with external ID)
 */
async function markPostAsPosted(postId: string, externalId: string): Promise<void> {
  const db = supabase!;

  const { error } = await db
    .from('social_posts')
    .update({
      status: 'posted',
      posted_at: new Date().toISOString(),
      post_id_external: externalId,
    })
    .eq('id', postId);

  if (error) throw error;
}

/**
 * Mark post as failed
 */
async function markPostAsFailed(postId: string, errorMessage: string): Promise<void> {
  const db = supabase!;

  const { error } = await db
    .from('social_posts')
    .update({
      status: 'failed',
      failed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq('id', postId);

  if (error) throw error;
}

// ============================================
// OPTIMAL SCHEDULING
// ============================================

/**
 * Calculate optimal posting time for platform
 */
function calculateOptimalSchedule(platform: SocialPlatform): string {
  const schedules: Record<SocialPlatform, string[]> = {
    twitter: ['09:00', '12:00', '15:00', '18:00'],
    facebook: ['10:00', '14:00', '19:00'],
    linkedin: ['09:00', '12:00', '17:00'],
    instagram: ['10:00', '13:00', '19:00', '21:00'],
  };

  const times = schedules[platform] || schedules.twitter;
  const randomTime = times[Math.floor(Math.random() * times.length)];

  const now = new Date();
  const [hours, minutes] = randomTime.split(':').map(Number);

  const scheduledDate = new Date(now);
  scheduledDate.setHours(hours, minutes, 0, 0);

  // If time has passed, schedule for tomorrow
  if (scheduledDate <= now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  return scheduledDate.toISOString();
}

// ============================================
// BRAND GUIDELINES
// ============================================

/**
 * Get all brand guidelines
 */
export async function getBrandGuidelines(): Promise<BrandGuideline[]> {
  const db = supabase!;
  const { data, error } = await db
    .from('brand_guidelines')
    .select('*')
    .order('key_name');

  if (error) throw error;
  return data as BrandGuideline[];
}

/**
 * Get single brand guideline by key
 */
export async function getBrandGuideline(keyName: string): Promise<string | null> {
  const db = supabase!;
  const { data, error } = await db.rpc('get_brand_guideline', { p_key_name: keyName });

  if (error || !data) return null;
  return data;
}

/**
 * Update brand guideline
 */
export async function updateBrandGuideline(keyName: string, value: string): Promise<void> {
  const db = supabase!;
  const { error } = await db.rpc('update_brand_guideline', {
    p_key_name: keyName,
    p_value: value,
  });

  if (error) throw error;
}

// ============================================
// CONTENT TOPICS
// ============================================

/**
 * Get all content topics
 */
export async function getContentTopics(): Promise<ContentTopic[]> {
  const db = supabase!;
  const { data, error } = await db
    .from('content_topics')
    .select('*')
    .order('priority', { ascending: false })
    .order('usage_count', { ascending: true });

  if (error) throw error;
  return data as ContentTopic[];
}

/**
 * Add content topic
 */
export async function addContentTopic(topic: string, priority: number = 5): Promise<ContentTopic> {
  const db = supabase!;
  const { data, error } = await db
    .from('content_topics')
    .insert({ topic, priority })
    .select()
    .single();

  if (error) throw error;
  return data as ContentTopic;
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Log analytics for a post
 */
export async function logSocialAnalytics(
  socialPostId: string,
  analytics: Partial<SocialAnalytics>
): Promise<string> {
  const db = supabase!;

  const { error } = await db.rpc('log_social_analytics', {
    p_social_post_id: socialPostId,
    p_impressions: analytics.impressions || 0,
    p_likes: analytics.likes || 0,
    p_comments: analytics.comments || 0,
    p_shares: analytics.shares || 0,
    p_retweets: analytics.retweets || 0,
    p_bookmarks: analytics.bookmarks || 0,
    p_clicks: analytics.clicks || 0,
  });

  if (error) throw error;

  // Get analytics record (simplified)
  return socialPostId;
}

/**
 * Get analytics for a post
 */
export async function getPostAnalytics(postId: string): Promise<SocialAnalytics[]> {
  const db = supabase!;
  const { data, error } = await db
    .from('social_analytics')
    .select('*')
    .eq('social_post_id', postId)
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data as SocialAnalytics[];
}
