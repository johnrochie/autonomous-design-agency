'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllCronJobs, getCronJobLogs, getCronJobStats, CronJob, CronJobLog } from '@/lib/cron/cron-service';

export default function CronJobMonitor() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [logs, setLogs] = useState<CronJobLog[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<CronJobLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadJobLogs(selectedJob.id);
    }
  }, [selectedJob]);

  async function loadJobs() {
    setLoading(true);
    setError(null);
    try {
      const allJobs = await getAllCronJobs();
      setJobs(allJobs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadJobLogs(jobId: string) {
    try {
      const jobLogs = await getCronJobLogs(jobId, 20);
      setSelectedLogs(jobLogs);
    } catch (err: any) {
      console.error('Error loading job logs:', err);
    }
  }

  async function handleExecuteJob(jobName: string) {
    setExecuting(prev => new Set(prev).add(jobName));

    try {
      const response = await fetch(`/api/cron/execute/${encodeURIComponent(jobName)}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await loadJobs();
        if (selectedJob?.name === jobName) {
          await loadJobLogs(selectedJob.id);
        }
      } else {
        alert(`Execution failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setExecuting(prev => {
        const next = new Set(prev);
        next.delete(jobName);
        return next;
      });
      await loadJobs();
    }
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      idle: 'bg-gray-100 text-gray-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      social_media_post: 'Social Media',
      agent_task_execution: 'Agent Tasks',
      email_send: 'Email Sending',
      analytics_report: 'Analytics Report',
      agent_heartbeat: 'Agent Heartbeat',
      health_check: 'Health Check',
      backup: 'Backup',
      cleanup: 'Cleanup',
    };
    return labels[type] || type.replace(/_/g, ' ');
  }

  function getFrequencyLabel(frequency: string): string {
    return frequency.replace(/_/g, ' ');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <p className="text-gray-600">Automated job execution</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg">⚠</span>
            <div>
              <div className="font-semibold text-red-800">Error</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Jobs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Enabled</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {jobs.filter(j => j.enabled).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Running</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {jobs.filter(j => j.status === 'running').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {jobs.length > 0
              ? ((jobs.reduce((sum, j) => sum + j.runs_count, 0) > 0
                  ? ((jobs.reduce((sum, j) => sum + j.success_count, 0) /
                    jobs.reduce((sum, j) => sum + j.runs_count, 0)) * 100).toFixed(0)
                  : '0')
                + '%')
              : '-'}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Scheduled Jobs</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading cron jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500">No cron jobs configured</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    selectedJob?.id === job.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{job.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        {!job.enabled && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Type:</span> {getTypeLabel(job.job_type)}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {getFrequencyLabel(job.frequency)}
                        </div>
                        <div>
                          <span className="font-medium">Runs:</span> {job.runs_count}
                        </div>
                        <div>
                          <span className="font-medium">Success Rate:</span> {job.runs_count > 0
                            ? ((job.success_count / job.runs_count) * 100).toFixed(1) + '%'
                            : '-'}
                        </div>
                      </div>
                      {(job.last_run || job.last_error || job.next_run) && (
                        <div className="mt-3 text-xs">
                          {job.last_run && (
                            <div className="text-gray-500">
                              <span className="font-medium">Last Run:</span>{' '}
                              {new Date(job.last_run).toLocaleString()}
                            </div>
                          )}
                          {job.last_error && (
                            <div className="text-red-600">
                              <span className="font-medium">Error:</span> {job.last_error}
                            </div>
                          )}
                          {job.next_run && (
                            <div className="text-gray-500">
                              <span className="font-medium">Next Run:</span>{' '}
                              {new Date(job.next_run).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExecuteJob(job.name); }}
                        disabled={
                          executing.has(job.name) ||
                          !job.enabled ||
                          job.status === 'running'
                        }
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {executing.has(job.name) ? 'Running...' : 'Execute Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Job Details */}
      {selectedJob && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              {selectedJob.name} - Execution Logs
            </h2>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {selectedLogs.length === 0 ? (
              <p className="text-gray-500">No execution logs yet</p>
            ) : (
              <div className="space-y-3">
                {selectedLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`border-l-2 ${
                      log.status === 'completed'
                        ? 'border-green-500'
                        : log.status === 'running'
                        ? 'border-blue-500'
                        : 'border-red-500'
                    } pl-4`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium uppercase ${
                        log.status === 'completed'
                          ? 'text-green-600'
                          : log.status === 'running'
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.started_at).toLocaleString()}
                      </span>
                    </div>
                    {log.output && (
                      <p className="text-sm text-gray-700">{log.output}</p>
                    )}
                    {log.error && (
                      <p className="text-sm text-red-600">{log.error}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Duration: {log.duration_ms ? `${log.duration_ms}ms` : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
