/**
 * Analytics Service
 * Collects and analyzes metrics across all systems
 */

import { supabase } from '../supabase';
import { CronJobStatus, CronJob } from '@/lib/cron/cron-service';
import { SocialPost } from '@/lib/social/social-service';

type Category = 'AI' | 'web_dev' | 'frameworks' | 'tools' | 'techNews' | 'business';

// Internal reference
const db = supabase!;

// ============================================
// TYPES
// ============================================

export interface PlatformStats {
  platform: string;
  posts: number;
  scheduled: number;
  posted: number;
  pending: number;
  failed: number;
  impressions: number;
  likes: number;
  shares: number;
  engagement_rate: string;
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  workingAgents: number;
  idleAgents: number;
  stuckAgents: number;
  tasksCompleted: number;
  tasksInProgress: number;
  avgCompletionTime: number | null;
  successRate: string;
}

export interface SystemHealth {
  database: boolean;
  socialMedia: boolean;
  agents: boolean;
  cronJobs: boolean;
  apiEndpoints: boolean;
  lastCheck: string;
}

export interface DailyStats {
  date: string;
  postsCreated: number;
  postsPosted: number;
  agentTasksCompleted: number;
  emailsSent: number;
  cronJobsExecuted: number;
  systemErrors: number;
}

export interface AnalyticsOverview {
  systemHealth: SystemHealth;
  socialMedia: PlatformStats[];
  agentPerformance: AgentStats;
  recentActivity: {
    posts: string[];
    agentTasks: string[];
    emails: string[];
    cronJobs: string[];
    errors: string[];
  };
  trends: {
    dates: string[];
    postsByDate: { date: string, count: number }[];
    agentTasksByDate: { date: string, count: number, completionTime: number }[];
    systemErrorsByDate: { date: string, count: number }[];
  };
}

// ============================================
// SYSTEM HEALTH CHECK
// ============================================

export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const checks = await Promise.all([
      checkDatabase(),
      checkSocialMedia(),
      checkAgents(),
      checkCronJobs(),
      checkAPIEndpoints(),
    ]);

    const health: SystemHealth = {
      database: checks[0],
      socialMedia: checks[1],
      agents: checks[2],
      cronJobs: checks[3],
      apiEndpoints: checks[4],
      lastCheck: new Date().toISOString(),
    };

    return health;
  } catch (error: any) {
    console.error('[Analytics] Failed system health check:', error);
    return {
      database: false,
      socialMedia: false,
      agents: false,
      cronJobs: false,
      apiEndpoints: false,
      lastCheck: new Date().toISOString(),
    };
  }
}

async function checkDatabase(): Promise<boolean> {
  try {
    const { data } = await db.from('profiles').select('count').limit(1).single();
    return data?.count !== undefined;
  } catch (error) {
    console.error('[Analytics] Database check failed:', error);
    return false;
  }
}

async function checkSocialMedia(): Promise<boolean> {
  try {
    const { data } = await db.from('social_posts').select('count').limit(1).single();
    return data?.count !== undefined;
  } catch (error) {
    console.error('[Analytics] Social media check failed:', error);
    return false;
  }
}

async function checkAgents(): Promise<boolean> {
  try {
    const { data } = await db.from('agents').select('count').limit(1).single();
    return data?.count !== undefined;
  } catch (error) {
    console.error('[Analytics] Agents check failed:', error);
    return false;
  }
}

async function checkCronJobs(): Promise<boolean> {
  try {
    const { data } = await db.from('cron_jobs').select('count').limit(1).single();
    return data?.count !== undefined;
  } catch (error) {
    console.error('[Analytics] Cron jobs check failed:', error);
    return false;
  }
}

async function checkAPIEndpoints(): Promise<boolean> {
  try {
    // Check if essential API routes exist by querying them
    const [cronStatus, socialApi, agentApi] = await Promise.all([
      fetch(new URL('/api/cron/status', window.location.origin)).then(r => r.ok),
      fetch(new URL('/api/social/posts', window.location.origin)).then(r => r.ok),
      db.from('agent_tasks').select('count').limit(1).single().then(r => !r.error),
    ]);

    return cronStatus && socialApi && agentApi;
  } catch (error) {
    console.error('[Analytics] API endpoints check failed:', error);
    return false;
  }
}

// ============================================
// SOCIAL MEDIA ANALYTICS
// ============================================

export async function getSocialMediaStats(): Promise<PlatformStats[]> {
  try {
    const platforms = ['twitter', 'facebook', 'linkedin', 'instagram'];

    const stats: PlatformStats[] = [];

    for (const platform of platforms) {
      const result = await getPlatformStatsByPlatform(platform);
      stats.push(result);
    }

    return stats;
  } catch (error: any) {
    console.error('[Analytics] Error fetching social media stats:', error);
    return [];
  }
}

async function getPlatformStatsByPlatform(platform: string): Promise<PlatformStats> {
  const platformMap: Record<string, string> = {
    twitter: 'Twitter (X)',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
  };

  try {
    // Get post counts by status
    const { data: posts } = await db
      .from('social_posts')
      .select('*')
      .eq('platform', platform)
      .order('created_at', { ascending: false });

    // Get analytics for each post
    const postIds = posts?.map((p: any) => p.id) || [];

    let totalImpressions = 0;
    let totalLikes = 0;
    let totalShares = 0;
    let totalEngagement = 0;
    let successfulPosts = 0;

    if (postIds.length > 0) {
      const { data: analyticsData } = await db
        .from('social_analytics')
        .select('*')
        .in('post_id', postIds)
        .order('recorded_at', { ascending: false });

      if (analyticsData) {
        for (const analytics of analyticsData) {
          totalImpressions += analytics.impressions || 0;
          totalLikes += analytics.likes || 0;
          totalShares += analytics.shares || 0;
          totalEngagement += analytics.likes || 0;
        }
      }

      successfulPosts = posts?.filter((p: any) => p.status === 'posted').length || 0;
    }

    const total = posts?.length || 0;
    const posted = successfulPosts;
    const pending = total - posted;
    const failed = posts?.filter((p: any) => p.status === 'failed').length || 0;
    const scheduled = posts?.filter((p: any) => p.status === 'approved' || p.status === 'scheduled').length || 0;

    // Calculate engagement rate
    const engagementRate = totalImpressions > 0
      ? ((totalEngagement / totalImpressions) * 100).toFixed(2) + '%'
      : '0%';

    return {
      platform: platformMap[platform] || platform,
      posts: total,
      scheduled,
      posted,
      pending,
      failed,
      impressions: totalImpressions,
      likes: totalLikes,
      shares: totalShares,
      engagement_rate: engagementRate,
    } as PlatformStats;
  } catch (error: any) {
    console.error(`[Analytics] Error fetching stats for ${platform}:`, error);
    return {
      platform: platform,
      posts: 0,
      scheduled: 0,
      posted: 0,
      pending: 0,
      failed: 0,
      impressions: 0,
      likes: 0,
      shares: 0,
      engagement_rate: '0%',
    } as PlatformStats;
  }
}

// ============================================
// AGENT PERFORMANCE ANALYTICS
// ============================================

export async function getAgentStats(): Promise<AgentStats> {
  try {
    // Get all agents
    const { data: agents } = await db.from('agents').select('*');

    if (!agents || agents.length === 0) {
      return noAgentStats();
    }

    const statusCounts = {
      idle: 0,
      working: 0,
      stuck: 0,
      offline: 0,
    };

    for (const agent of agents) {
      if (agent.status in statusCounts) {
        statusCounts[agent.status as keyof typeof statusCounts]++;
      }
    }

    // Get agent tasks
    const { data: tasks } = await db
      .from('agent_tasks')
      .select('*')
      .order('completed_at', { ascending: false });

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t: any) => t.status === 'completed') || [];
    const inProgressTasks = tasks?.filter((t: any) => t.status === 'in_progress') || [];
    const failedTasks = tasks?.filter((t: any) => t.status === 'failed') || [];

    const completedDurations = completedTasks.map((t: any) => t.duration_ms);
    const avgCompletionTime = completedDurations.length > 0
      ? completedDurations.reduce((sum: number, d: number) => sum + d, 0) / completedDurations.length
      : null;

    const successRate = totalTasks > 0
      ? ((completedTasks.length / totalTasks) * 100).toFixed(1) + '%'
      : '0%';

    return {
      totalAgents: agents.length,
      activeAgents: statusCounts.working,
      workingAgents: statusCounts.working,
      idleAgents: statusCounts.idle,
      stuckAgents: statusCounts.stuck,
      tasksCompleted: completedTasks.length,
      tasksInProgress: inProgressTasks.length,
      avgCompletionTime: avgCompletionTime
        ? Math.round(avgCompletionTime / 1000) // ms to seconds
        : null,
      successRate,
    } as AgentStats;
  } catch (error: any) {
    console.error('[Analytics] Error fetching agent stats:', error);
    return noAgentStats();
  }
}

function noAgentStats(): AgentStats {
  return {
    totalAgents: 0,
    activeAgents: 0,
    workingAgents: 0,
    idleAgents: 0,
    stuckAgents: 0,
    tasksCompleted: 0,
    tasksInProgress: 0,
    avgCompletionTime: null,
    successRate: '0%',
  };
}

// ============================================
// CRON JOB ANALYTICS
// ============================================

export async function getCronJobStats(): Promise<{
  total: number;
  enabled: number;
  running: number;
  avgDuration: number | null;
  successRate: string;
}> {
  try {
    const { data: jobs } = await db.from('cron_jobs').select('*');

    if (!jobs || jobs.length === 0) {
      return {
        total: 0,
        enabled: 0,
        running: 0,
        avgDuration: null,
        successRate: '0%',
      };
    }

    const total = jobs.length;
    const enabled = jobs.filter((j: any) => j.enabled).length;
    const running = jobs.filter((j: any) => j.status === 'running').length;

    // Calculate average duration for completed jobs
    const completedJobs = jobs.filter((j: any) => j.status === 'completed');
    const completedDurations = completedJobs.map((j: any) => j.last_duration_ms).filter((d: any) => d !== null);
    const avgDuration = completedDurations.length > 0
      ? completedDurations.reduce((sum: number, d: number) => sum + d, 0) / completedDurations.length
      : null;

    // Calculate success rate
    const totalRuns = jobs.reduce((sum: any, j: any) => sum + j.runs_count, 0);
    const totalSuccess = jobs.reduce((sum: any, j: any) => sum + j.success_count, 0);
    const successRate = totalRuns > 0 ? ((totalSuccess / totalRuns) * 100).toFixed(1) + '%' : '0%';

    return {
      total,
      enabled,
      running,
      avgDuration: avgDuration ? Math.round(avgDuration / 1000) : null,
      successRate,
    };
  } catch (error: any) {
    console.error('[Analytics] Error fetching cron job stats:', error);
    return {
      total: 0,
      enabled: 0,
      running: 0,
      avgDuration: null,
      successRate: '0%',
    };
  }
}

// ============================================
// RECENT ACTIVITY
// ============================================

export async function getRecentActivity(): Promise<{
  posts: string[];
  agentTasks: string[];
  emails: string[];
  cronJobs: string[];
  errors: string[];
}> {
  try {
    const [posts, agentTasks, emails, cronJobs, errors] = await Promise.all([
      getRecentPosts(5),
      getRecentAgentTasks(5),
      Promise.resolve([] as string[]), // Placeholder for emails
      getRecentCronJobs(5),
      getRecentErrors(5),
    ]);

    return {
      posts: posts,
      agentTasks,
      emails: emails,
      cronJobs,
      errors,
    };
  } catch (error: any) {
    console.error('[Analytics] Error fetching recent activity:', error);
    return {
      posts: [],
      agentTasks: [],
      emails: [],
      cronJobs: [],
      errors: [],
    };
  }
}

export async function getRecentPosts(count: number): Promise<string[]> {
  const { data } = await db
    .from('social_posts')
    .select('id, platform, content, created_at')
    .order('created_at', { ascending: false })
    .limit(count)
    .order('created_at', { ascending: false });

  return data?.map((p: any) => {
    const platformEmoji: Record<string, string> = {
      twitter: '🐦',
      facebook: '📘',
      linkedin: '💼',
      instagram: '🎨',
    };
    return `${platformEmoji[p.platform] || '📱'} ${p.content.substring(0, 50)}...`;
  }) || [];
}

export async function getRecentAgentTasks(count: number): Promise<string[]> {
  const { data } = await db
    .from('agent_tasks')
    .select('id, type, description, status, completed_at, duration_ms')
    .order('completed_at', { ascending: false })
    .eq('status', 'completed')
    .limit(count);

  return data?.map((task: any) => {
    const typeEmoji: Record<string, string> = {
      create_repo: '📁',
      init_project: '⚙️',
      generate_component: '🧩',
      generate_page: '📄',
      implement_feature: '✨',
      run_tests: '✅',
      deploy_preview: '🌐',
      await_review: '⏳',
      complete_project: '✅',
    };
    const durationText = task.duration_ms ? `${(task.duration_ms / 1000).toFixed(1)}s` : 'N/A';
    return `${typeEmoji[task.type] || '🤖'} ${task.description.substring(0, 60)}... (${durationText})`;
  }) || [];
}

export async function getRecentCronJobs(count: number): Promise<string[]> {
  const { data } = await db
    .from('cron_jobs')
    .select('name, status, last_run, last_error, runs_count, success_count, failure_count')
    .order('last_run', { ascending: false })
    .limit(count);

  return data?.map((job: any) => {
    const statusEmoji: Record<string, string> = {
      idle: '💤',
      running: '⚙️',
      completed: '✅',
      failed: '❌',
      paused: '⏸️',
    };
    const successRate = job.runs_count > 0
      ? ((job.success_count / job.runs_count) * 100).toFixed(1) + '%'
      : '0%';
    return `${statusEmoji[job.status || 'idle']} ${job.name}: ${
      job.last_run ? new Date(job.last_run).toLocaleString() : 'Never run'
    } (${job.runs_count} runs, ${successRate}% success rate)`;
  }) || [];
}

export async function getRecentErrors(count: number): Promise<string[]> {
  const { data } = await db
    .from('research_logs')
    .select('*')
    .eq('success', false)
    .order('started_at', { ascending: false })
    .limit(count);

  return data?.map((log: any) => {
    const typeEmoji: Record<string, string> = {
      trend_search: '🔍',
      news_scan: '📰',
      agent_task_execution: '🤖',
      social_media_post: '📱',
      agent_heartbeat: '💓',
      health_check: '❤', // Health check failed
    };
    return `${typeEmoji[log.research_type || 'unknown']} ${log.started_at
      .substring(0, 19)}: ${log.error?.substring(0, 50)}...`;
  }) || [];
}

// ============================================
// TRENDS OVER TIME
// ============================================

export async function getDailyStats(days: number = 7): Promise<{
  dates: string[];
  stats: DailyStats[];
}> {
  const dates: string[] = [];
  const stats: DailyStats[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    dates.push(dateStr);

    // Count posts created on this date
    const { count: postsCreated } = await db
      .from('social_posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${dateStr}T00:00:00Z`)
      .lt('created_at', `${dateStr}T23:59:59Z`);

    // Count posts posted on this date
    const { count: postsPosted } = await db
      .from('social_posts')
      .select('*', { count: 'exact', head: true })
      .gte('posted_at', `${dateStr}T00:00:00Z`)
      .lt('posted_at', `${dateStr}T23:59:59Z`);

    // Count agent tasks completed on this date
    const { count: agentTasksCompleted } = await db
      .from('agent_tasks')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', `${dateStr}T00:00:00Z`)
      .lt('completed_at', `${dateStr}T23:59:59Z`);

    // Count cron jobs executed on this date
    const { count: cronJobsExecuted } = await db
      .from('cron_jobs')
      .select('*', { count: 'exact', head: true })
      .gte('last_run', `${dateStr}T00:00:00Z`)
      .lt('last_run', `${dateStr}T23:59:59Z`)
      .eq('status', 'completed');

    stats.push({
      date: dateStr,
      postsCreated: postsCreated || 0,
      postsPosted: postsPosted || 0,
      agentTasksCompleted: agentTasksCompleted || 0,
      emailsSent: 0, // TODO: Add email tracking
      cronJobsExecuted: cronJobsExecuted || 0,
      systemErrors: 0, // TODO: Track system errors
    });
  }

  return {
    dates,
    stats,
  };
}

export async function getTrendsOverTime(days: number = 7): Promise<{
  dates: string[];
  postsByDate: { date: string; count: number; }[];
  agentTasksByDate: { date: string; count: number; completionTime: number; }[];
  systemErrorsByDate: { date: string; count: number; }[];
}> {
  const { dates: dates } = await getDailyStats(days);

  // Aggregate social posts by date
  const postsByDate = dates.map(date => ({
    date,
    count: 0,
  }));

  // Aggregate agent tasks by date (plus completion times)
  const agentTasksByDate = dates.map(date => ({
    date,
    count: 0,
    completionTime: 0,
  }));

  // Aggregate system errors by date
  const systemErrorsByDate = dates.map(date => ({
    date,
    count: 0,
  }));

  // TODO: Add actual data aggregation when tables have more populated

  return {
    dates,
    postsByDate,
    agentTasksByDate,
    systemErrorsByDate,
  };
}

// ============================================
// OVERVIEW DASHBOARD
// ============================================

export async function getAnalyticsOverview(days: number = 7): Promise<AnalyticsOverview> {
  const [
    systemHealth,
    socialMedia,
    agentPerformance,
    { posts, agentTasks, emails, cronJobs, errors },
    trends,
  ] = await Promise.all([
    getSystemHealth(),
    getSocialMediaStats(),
    getAgentStats(),
    getRecentActivity(),
    getTrendsOverTime(days),
  ]);

  return {
    systemHealth,
    socialMedia,
    agentPerformance,
    recentActivity: {
      posts,
      agentTasks,
      emails,
      cronJobs,
      errors,
    },
    trends,
  };
}
