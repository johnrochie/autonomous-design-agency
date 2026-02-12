/**
 * Cron Job API - Status and detailed job info
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCronJobs,
  getCronJobLogs,
  getCronJobStats,
  getCronJobByName,
} from '@/lib/cron/cron-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/cron/status
 * Get status of all cron jobs
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const jobs = await getAllCronJobs();

    // Calculate overall stats
    const stats = {
      total: jobs.length,
      enabled: jobs.filter(j => j.enabled).length,
      disabled: jobs.filter(j => !j.enabled).length,
      running: jobs.filter(j => j.status === 'running').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      lastRun: jobs.length > 0
        ? jobs.map((_, index) => jobs[index].last_run).sort().reverse()[0]
        : null,
    };

    return NextResponse.json({
      success: true,
      stats,
      jobs: jobs.map(job => ({
        id: job.id,
        name: job.name,
        type: job.job_type,
        frequency: job.frequency,
        status: job.status,
        enabled: job.enabled,
        last_run: job.last_run,
        next_run: job.next_run,
        last_success: job.last_success,
        runs_count: job.runs_count,
        success_rate: job.runs_count > 0
          ? ((job.success_count / job.runs_count) * 100).toFixed(1)
          : '0',
      })),
    });
  } catch (error: any) {
    console.error('[Cron Job API] Status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
