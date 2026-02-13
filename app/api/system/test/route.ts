import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // System status object
    const status: any = {
      timestamp: new Date().toISOString(),
      system: {
        database: false,
        agents: false,
        socialMedia: false,
        cronJobs: false,
        emailTracking: false,
        trendResearch: false,
      },
      tables: {} as Record<string, boolean>,
      seedData: {} as Record<string, any>,
      errors: [] as string[],
    };

    // CHECK 1: Database connection
    try {
      const { data, error } = await supabase!.from('profiles').select('count').limit(1);
      status.system.database = !error;
      if (error) status.errors.push(`Database: ${error.message}`);
    } catch (e: any) {
      status.errors.push(`Database connection: ${String(e)}`);
    }

    // CHECK 2: Agent tables
    const agentTables = ['agents', 'agent_tasks', 'agent_logs', 'project_agent_tracking'];
    for (const table of agentTables) {
      try {
        const { data, error } = await supabase!.from(table).select('count').limit(1);
        status.tables[table] = !error && data !== null;
        if (!error && !status.system.agents) status.system.agents = true;
      } catch (e) {
        status.tables[table] = false;
      }
    }

    // CHECK 3: Social media tables
    const socialTables = ['social_posts', 'social_analytics', 'brand_guidelines', 'content_topics'];
    for (const table of socialTables) {
      try {
        const { data, error } = await supabase!.from(table).select('count').limit(1);
        status.tables[table] = !error && data !== null;
        if (!error && !status.system.socialMedia) status.system.socialMedia = true;
      } catch (e) {
        status.tables[table] = false;
      }
    }

    // CHECK 4: Email tracking table
    try {
      const { data, error } = await supabase!.from('email_logs').select('count').limit(1);
      status.tables['email_logs'] = !error && data !== null;
      status.system.emailTracking = !error && data !== null;
    } catch (e) {
      status.tables['email_logs'] = false;
    }

    // CHECK 5: Cron job tables
    const cronTables = ['cron_jobs', 'cron_job_logs'];
    for (const table of cronTables) {
      try {
        const { data, error } = await supabase!.from(table).select('count').limit(1);
        status.tables[table] = !error && data !== null;
        if (!error && !status.system.cronJobs) status.system.cronJobs = true;
      } catch (e) {
        status.tables[table] = false;
      }
    }

    // CHECK 6: Trend research tables
    const trendTables = ['trending_topics', 'research_logs'];
    for (const table of trendTables) {
      try {
        const { data, error } = await supabase!.from(table).select('count').limit(1);
        status.tables[table] = !error && data !== null;
        if (!error && !status.system.trendResearch) status.system.trendResearch = true;
      } catch (e) {
        status.tables[table] = false;
      }
    }

    // CHECK 7: Seed data - Agents
    try {
      const { data, error } = await supabase!.from('agents').select('id').limit(1);
      status.seedData.agents = data && data.length > 0;
    } catch (e) {
      status.seedData.agents = false;
    }

    // CHECK 8: Seed data - Cron jobs
    try {
      const { data, error } = await supabase!.from('cron_jobs').select('id');
      status.seedData.cronJobs = data && data.length >= 6;
      if (data) status.seedData.cronJobCount = data.length;
    } catch (e) {
      status.seedData.cronJobs = false;
    }

    // CHECK 9: Seed data - Brand guidelines
    try {
      const { data, error } = await supabase!.from('brand_guidelines').select('id');
      status.seedData.brandGuidelines = data && data.length >= 4;
      if (data) status.seedData.brandGuidelineCount = data.length;
    } catch (e) {
      status.seedData.brandGuidelines = false;
    }

    // CHECK 10: Seed data - Content topics
    try {
      const { data, error } = await supabase!.from('content_topics').select('id');
      status.seedData.contentTopics = data && data.length >= 3;
      if (data) status.seedData.contentTopicCount = data.length;
    } catch (e) {
      status.seedData.contentTopics = false;
    }

    // Overall health calculation
    const totalChecks = 14; // 6 systems + 8 seed data checks
    const passedChecks = Object.values(status.system).filter((v: any) => v).length +
      Object.values(status.seedData).filter((v: any) => v).length;
    const healthPercent = Math.round((passedChecks / totalChecks) * 100);

    status.health = {
      overall: healthPercent >= 80 ? 'healthy' : healthPercent >= 50 ? 'degraded' : 'unhealthy',
      percent: healthPercent,
      checksPassed: passedChecks,
      checksTotal: totalChecks,
    };

    // Determine activation status
    const allSystemsReady = Object.values(status.system).every((v: any) => v);
    const allSeedDataReady = Object.values(status.seedData).every((v: any) => v);

    status.activation = {
      ready: allSystemsReady && allSeedDataReady,
      systemsReady: allSystemsReady,
      seedDataReady: allSeedDataReady,
      message: allSystemsReady && allSeedDataReady
        ? 'System is fully activated and ready!'
        : allSystemsReady
        ? 'Tables created, but seed data missing. Run ACTIVATE_ALL.sql again.'
        : 'System not fully activated. Run ACTIVATE_ALL.sql in Supabase SQL Editor.',
    };

    return NextResponse.json(status, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'System check failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
