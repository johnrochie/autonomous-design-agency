/**
 * Cron Job API - Execute all due jobs
 * This works as a webhook endpoint for any cron service
 * 
 * External cron services can call: /api/cron/execute
 * Vercel Cron: Can schedule this route
 * cron-job.org: Full control over schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeDueCronJobs } from '@/lib/cron/cron-service';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CronJobResponse {
  success: boolean;
  executed: number;
  successful: number;
  failed: number;
  jobs: string[];
  executed_at: string;
  duration_ms: number;
}

/**
 * POST /api/cron/execute
 * Execute all cron jobs that are due
 * Can be called by any cron service
 */
export async function POST(request: NextRequest): Promise<NextResponse<CronJobResponse>> {
  const startTime = Date.now();
  const jobId = Math.random().toString(36).substring(7);

  console.log(`[Cron Job API] Execution started: ${jobId} at ${new Date().toISOString()}`);

  try {
    const result = await executeDueCronJobs();

    const durationMs = Date.now() - startTime;

    console.log(`[Cron Job API] Execution completed: ${jobId} in ${durationMs}ms`);
    console.log(`[Cron Job API] Result: ${result.executed} executed, ${result.successful} successful, ${result.failed} failed, jobs: ${result.jobs.join(', ')}`);

    return NextResponse.json({
      success: true,
      ...result,
      executed_at: new Date().toISOString(),
      duration_ms: durationMs,
    } as CronJobResponse);
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    console.error(`[Cron Job API] Execution failed: ${jobId} - ${error.message}`, error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        executed_at: new Date().toISOString(),
        duration_ms: durationMs,
      } as any,
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/execute (for testing/debugging)
 * Same as POST, but allows GET requests
 */
export async function GET(request: NextRequest): Promise<NextResponse<CronJobResponse>> {
  // Verify API key (if configured)
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.CRON_API_KEY;

  if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' } as any,
      { status: 401 }
    );
  }

  // Call POST handler
  return POST(request);
}
