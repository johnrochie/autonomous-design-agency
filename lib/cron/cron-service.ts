/**
 * Cron Job Service
 * Manages automated job scheduling and execution
 */

import { supabase } from '../supabase';

// ============================================
// TYPES
// ============================================

export type CronJobType =
  | 'trend_research'
  | 'social_media_post'
  | 'agent_task_execution'
  | 'email_send'
  | 'analytics_report'
  | 'agent_heartbeat'
  | 'health_check'
  | 'backup'
  | 'cleanup';

export type CronJobFrequency =
  | 'every_minute'
  | 'every_5_minutes'
  | 'every_15_minutes'
  | 'every_hour'
  | 'every_3_hours'
  | 'every_6_hours'
  | 'every_12_hours'
  | 'daily'
  | 'weekly'
  | 'monthly';

export type CronJobStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused';

export interface CronJob {
  id: string;
  name: string;
  job_type: CronJobType;
  frequency: CronJobFrequency;
  status: CronJobStatus;
  last_run: string | null;
  next_run: string | null;
  last_success: string | null;
  last_error: string | null;
  last_duration_ms: number | null;
  runs_count: number;
  success_count: number;
  failure_count: number;
  config: Record<string, any>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CronJobLog {
  id: string;
  cron_job_id: string;
  started_at: string;
  completed_at: string | null;
  status: CronJobStatus;
  duration_ms: number | null;
  output: string | null;
  error: string | null;
  metadata: Record<string, any>;
}

export interface CronJobExecution {
  jobId: string;
  jobType: CronJobType;
  startedAt: string;
  completedAt?: string;
  status: CronJobStatus;
  error?: string;
  result?: any;
}

// ============================================
// CRON JOB MANAGEMENT
// ============================================

const db = supabase!;

/**
 * Get all cron jobs
 */
export async function getAllCronJobs(enabled?: boolean): Promise<CronJob[]> {
  let query = db.from('cron_jobs').select('*').order('name');

  if (enabled !== undefined) {
    query = query.eq('enabled', enabled);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as CronJob[];
}

/**
 * Get cron job by ID
 */
export async function getCronJob(jobId: string): Promise<CronJob | null> {
  const { data, error } = await db
    .from('cron_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !data) return null;
  return data as CronJob;
}

/**
 * Get cron job by name
 */
export async function getCronJobByName(jobName: string): Promise<CronJob | null> {
  const { data, error } = await db
    .from('cron_jobs')
    .select('*')
    .eq('name', jobName)
    .single();

  if (error || !data) return null;
  return data as CronJob;
}

/**
 * Update cron job status
 */
export async function updateCronJobStatus(
  jobId: string,
  status: CronJobStatus,
  nextRun?: string,
  durationMs?: number,
  error?: string
): Promise<void> {
  await db.rpc('update_cron_job_status', {
    p_job_id: jobId,
    p_status: status,
    p_next_run: nextRun || null,
    p_duration_ms: durationMs || null,
    p_error: error || null,
  });
}

// ============================================
// CRON JOB EXECUTION
// ============================================

/**
 * Execute a cron job
 */
export async function executeCronJob(job: CronJob): Promise<CronJobExecution> {
  const startTime = Date.now();
  const execution: CronJobExecution = {
    jobId: job.id,
    jobType: job.job_type,
    startedAt: new Date().toISOString(),
    status: 'running',
  };

  try {
    // Mark as running
    await updateCronJobStatus(job.id, 'running');

    // Execute job-specific logic
    const result = await executeJobLogic(job);

    execution.completedAt = new Date().toISOString();
    execution.status = 'completed';
    execution.result = result;

    const durationMs = Date.now() - startTime;

    // Calculate next run
    const nextRun = await calculateNextRun(job.frequency, new Date());

    // Mark as completed
    await updateCronJobStatus(job.id, 'completed', nextRun, durationMs);

    return execution;
  } catch (error: any) {
    execution.completedAt = new Date().toISOString();
    execution.status = 'failed';
    execution.error = error.message;

    // Mark as failed
    await updateCronJobStatus(
      job.id,
      'failed',
      undefined,
      Date.now() - startTime,
      error.message
    );

    return execution;
  }
}

/**
 * Execute job-specific logic
 */
async function executeJobLogic(job: CronJob): Promise<any> {
  console.log(`[Cron Job] Executing: ${job.name} (${job.job_type})`);

  switch (job.job_type) {
    case 'trend_research':
      return await executeTrendResearch(job);

    case 'social_media_post':
      return await executeSocialMediaPosting(job);

    case 'agent_task_execution':
      return await executeAgentTaskExecution(job);

    case 'email_send':
      return await executeEmailSending(job);

    case 'analytics_report':
      return await executeAnalyticsReport(job);

    case 'agent_heartbeat':
      return await executeAgentHeartbeat(job);

    case 'health_check':
      return await executeHealthCheck(job);

    case 'backup':
      return await executeBackup(job);

    case 'cleanup':
      return await executeCleanup(job);

    default:
      throw new Error(`Unknown job type: ${job.job_type}`);
  }
}

/**
 * Social Media Posting Job
 */
async function executeSocialMediaPosting(job: CronJob): Promise<any> {
  // Import dynamically to avoid circular dependencies
  const { postScheduledPosts } = await import('@/lib/social/social-service');

  const result = await postScheduledPosts();

  console.log(`[Cron Job] Social Media Posting: ${result.processed} processed, ${result.successful} successful, ${result.failed} failed`);

  return result;
}

/**
 * Agent Task Execution Job
 */
async function executeAgentTaskExecution(job: CronJob): Promise<any> {
  // Import dynamically
  const { getAllAgents, findNextTask, executeTask } = await import('@/lib/agent-manager');

  const agents = await getAllAgents();
  const maxParallelAgents = job.config.max_parallel_agents || 3;
  const runningAgents = agents.filter(a => a.status === 'working').length;

  if (runningAgents >= maxParallelAgents) {
    return { message: 'Max parallel agents reached', runningAgents, maxParallelAgents };
  }

  // Find idle agents and assign tasks
  const idleAgents = agents.filter(a => a.status === 'idle');
  const results = [];

  for (const agent of idleAgents.slice(0, maxParallelAgents - runningAgents)) {
    const task = await findNextTask(agent.id);
    if (task) {
      const result = await executeTask(task, agent.current_project_id);
      results.push({ agentId: agent.id, taskId: task.id, result });
    }
  }

  console.log(`[Cron Job] Agent Task Execution: ${results.length} tasks executed`);

  return { results };
}

/**
 * Email Sending Job
 */
async function executeEmailSending(job: CronJob): Promise<any> {
  // Import email service when ready
  // For now, placeholder
  console.log('[Cron Job] Email Sending: Sending queued emails...');

  // TODO: Implement email queue processing
  // 1. Fetch pending emails from queue
  // 2. Send via SendGrid
  // 3. Mark as sent/failed

  return {
    message: 'Email sending placeholder',
    note: 'Implement when SendGrid configured',
  };
}

/**
 * Analytics Report Job
 */
async function executeAnalyticsReport(job: CronJob): Promise<any> {
  console.log('[Cron Job] Analytics Report: Generating daily report...');

  // TODO: Implement analytics report generation
  // 1. Gather metrics: posts, engagement, agent performance
  // 2. Create report document
  // 3. Send to admin via email

  return {
    message: 'Analytics report placeholder',
    note: 'Implement detailed analytics reporting',
  };
}

/**
 * Agent Heartbeat Job
 */
async function executeAgentHeartbeat(job: CronJob): Promise<any> {
  console.log('[Cron Job] Agent Heartbeat: Checking agent status...');

  const { updateAgentHeartbeat } = await import('@/lib/agent-manager');
  const { getProjectAgentTracking } = await import('@/lib/agent-manager');

  const workingAgents = await db.from('agents').select('*').eq('status', 'working');

  let stuckAgents = [];

  for (const agent of workingAgents.data as any[]) {
    // Update heartbeat
    await updateAgentHeartbeat(agent.id);

    // Check if agent is stuck (no heartbeat for 30 minutes)
    if (agent.last_heartbeat) {
      const lastHeartbeat = new Date(agent.last_heartbeat);
      const minutesAgo = (Date.now() - lastHeartbeat.getTime()) / 1000 / 60;
      const timeoutMinutes = job.config.timeout_minutes || 30;

      if (minutesAgo > timeoutMinutes) {
        console.warn(`[Cron Job] Agent ${agent.name} stuck (last heartbeat ${minutesAgo.toFixed(0)} minutes ago)`);

        stuckAgents.push({
          id: agent.id,
          name: agent.name,
          last_heartbeat: agent.last_heartbeat,
          minutes_ago: minutesAgo.toFixed(0),
        });

        // Escalate (mark as failed)
        await updateCronJobStatus(agent.id, 'failed', undefined, undefined, 'Agent stuck - no heartbeat');
      }
    }
  }

  if (stuckAgents.length > 0) {
    console.error(`[Cron Job] Heartbeat Check: ${stuckAgents.length} stuck agents detected`);
  }

  return {
    message: 'Heartbeat check completed',
    stuckAgents,
    totalWorkingAgents: workingAgents.data?.length || 0,
  };
}

/**
 * Health Check Job
 */
async function executeHealthCheck(job: CronJob): Promise<any> {
  console.log('[Cron Job] Health Check: System health status...');

  const health = {
    database: false,
    agents: false,
    socialMedia: false,
    email: false,
    cron: true,
    timestamp: new Date().toISOString(),
  };

  // Check database connectivity
  try {
    await db.from('profiles').select('count').limit(1);
    health.database = true;
  } catch (error) {
    console.error('[Cron Job] Health Check: Database connection failed');
  }

  // Check agents
  try {
    const { data } = await db.from('agents').select('count').limit(1);
    if (data) health.agents = true;
  } catch (error) {
    console.error('[Cron Job] Health Check: Agents table check failed');
  }

  // Check social media
  try {
    const { data } = await db.from('social_posts').select('count').limit(1);
    if (data) health.socialMedia = true;
  } catch (error) {
    console.error('[Cron Job] Health Check: Social posts table check failed');
  }

  console.log(`[Cron Job] Health Check: ${JSON.stringify(health, null, 2)}`);

  return health;
}

/**
 * Backup Job
 */
async function executeBackup(job: CronJob): Promise<any> {
  console.log('[Cron Job] Backup: Creating system backup...');

  // TODO: Implement database backup
  // 1. Create backup via Supabase snapshot
  // 2. Backup configuration files
  // 3. Store backup location

  return {
    message: 'Backup placeholder',
    note: 'Implement automated backups',
  };
}

/**
 * Trend Research Job
 */
async function executeTrendResearch(job: CronJob): Promise<any> {
  console.log('[Cron Job] Trend Research: Analyzing trending topics...');

  // Import trend research service
  const { executeTrendResearch: researchTrends } = await import('@/lib/trend/trend-research');

  const result = await researchTrends();

  console.log(`[Cron Job] Trend Research: ${result.researched} quer${result.researched === 1 ? 'y' : 'ies'}, ${result.topics_updated} topics updated`);

  return result;
}

/**
 * Cleanup Job
 */
async function executeCleanup(job: CronJob): Promise<any> {
  console.log('[Cron Job] Cleanup: Cleaning up old data...');

  // TODO: Implement cleanup
  // 1. Delete old logs (> 90 days)
  // 2. Delete failed posts (> 30 days)
  // 3. Cleanup temporary files

  return {
    message: 'Cleanup placeholder',
    note: 'Implement data cleanup',
  };
}

/**
 * Calculate next run time
 */
async function calculateNextRun(
  frequency: CronJobFrequency,
  lastRun: Date
): Promise<string> {
  const result = await db.rpc('calculate_next_run', {
    p_frequency: frequency,
    p_last_run: lastRun.toISOString(),
  });

  if (result.error) throw result.error;

  return result.data as string;
}

// ============================================
// CRON JOB LOGS
// ============================================

/**
 * Get cron job logs
 */
export async function getCronJobLogs(jobId?: string, limit: number = 50): Promise<CronJobLog[]> {
  let query = db
    .from('cron_job_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (jobId) {
    query = query.eq('cron_job_id', jobId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as CronJobLog[];
}

/**
 * Get cron job statistics
 */
export async function getCronJobStats(jobId?: string): Promise<{
  total: number;
  running: number;
  completed: number;
  failed: number;
  avgDuration?: number;
}> {
  let query = db.from('cron_job_logs').select('*');

  if (jobId) {
    query = query.eq('cron_job_id', jobId);
  }

  const { data: logs } = await query;

  if (!logs) {
    return {
      total: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };
  }

  const stats = {
    total: logs.length,
    running: logs.filter((l: any) => l.status === 'running').length,
    completed: logs.filter((l: any) => l.status === 'completed').length,
    failed: logs.filter((l: any) => l.status === 'failed').length,
  } as any;

  // Calculate average duration for completed jobs
  const completedLogs = logs.filter((l: any) => l.status === 'completed' && l.duration_ms);
  if (completedLogs.length > 0) {
    const totalDuration = completedLogs.reduce((sum: number, l: any) => sum + (l.duration_ms || 0), 0);
    stats.avgDuration = Math.round(totalDuration / completedLogs.length);
  }

  return stats;
}

// ============================================
// CRON JOB CONTROLLER (Execute When Webhook Called)
// ============================================

/**
 * Execute all enabled cron jobs that are due
 */
export async function executeDueCronJobs(): Promise<{
  executed: number;
  successful: number;
  failed: number;
  jobs: string[];
}> {
  const now = new Date().toISOString();

  // Find jobs that are:
  // 1. Enabled
  // 2. Not currently running
  // 3. Next run time has passed
  const { data: dueJobs } = await db
    .from('cron_jobs')
    .select('*')
    .eq('enabled', true)
    .in('status', ['idle', 'completed', 'failed'])
    .lte('next_run', now)
    .order('next_run', { ascending: true });

  if (!dueJobs) {
    return {
      executed: 0,
      successful: 0,
      failed: 0,
      jobs: [],
    };
  }

  console.log(`[Cron Job Controller] Executing ${dueJobs.length} due jobs`);

  let successful = 0;
  let failed = 0;
  const executedJobs: string[] = [];

  for (const job of dueJobs as CronJob[]) {
    try {
      const execution = await executeCronJob(job);

      if (execution.status === 'completed') {
        successful++;
      } else {
        failed++;
      }

      executedJobs.push(job.name);
    } catch (error: any) {
      console.error(`[Cron Job Controller] Error executing ${job.name}:`, error);
      failed++;
    }
  }

  return {
    executed: dueJobs.length,
    successful,
    failed,
    jobs: executedJobs,
  };
}

/**
 * Execute a specific cron job by name (webhook endpoint)
 */
export async function executeCronJobByName(jobName: string): Promise<CronJobExecution | null> {
  const job = await getCronJobByName(jobName);

  if (!job) {
    console.error(`[Cron Job Controller] Job not found: ${jobName}`);
    return null;
  }

  if (!job.enabled) {
    console.error(`[Cron Job Controller] Job is disabled: ${jobName}`);
    return null;
  }

  if (job.status === 'running') {
    console.error(`[Cron Job Controller] Job is already running: ${jobName}`);
    return null;
  }

  return executeCronJob(job);
}
