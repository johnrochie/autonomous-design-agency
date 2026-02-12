/**
 * Cron Job API - Execute specific job by name
 * 
 * Usage:
 * POST /api/cron/execute/Social%20Media%20Posting
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeCronJobByName } from '@/lib/cron/cron-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/cron/execute/[jobName]
 * Execute a specific cron job by name (URL-encoded)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobName: string }> }
): Promise<NextResponse> {
  const { jobName } = await context.params;

  console.log(`[Cron Job API] Executing specific job: ${jobName}`);

  try {
    const execution = await executeCronJobByName(jobName);

    if (!execution) {
      return NextResponse.json(
        {
          success: false,
          error: `Job not found or cannot be executed: ${jobName}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: execution.status === 'completed',
      jobId: execution.jobId,
      jobType: execution.jobType,
      status: execution.status,
      result: execution.result,
      error: execution.error,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
    });
  } catch (error: any) {
    console.error(`[Cron Job API] Error executing ${jobName}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/execute/[jobName] (for testing)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobName: string }> }
): Promise<NextResponse> {
  // Verify API key (if configured)
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.CRON_API_KEY;

  if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return POST(request, context);
}
