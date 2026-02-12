'use client';

import React, { useEffect, useState } from 'react';

import { getAnalyticsOverview } from '@/lib/analytics/analytics-service';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    loadOverview();
    // Refresh every 30s
    const interval = setInterval(loadOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadOverview() {
    setLoading(true);
    try {
      const data = await getAnalyticsOverview();
      setOverview(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Return empty overview on error
      setOverview({
        systemHealth: {
          database: false,
          socialMedia: false,
          agents: false,
          cronJobs: false,
          apiEndpoints: false,
          lastCheck: '',
        },
        socialMedia: [],
        agentPerformance: {
          totalAgents: 0,
          activeAgents: 0,
          workingAgents: 0,
          idleAgents: 0,
          stuckAgents: 0,
          tasksCompleted: 0,
          tasksInProgress: 0,
          avgCompletionTime: null,
          successRate: '0%',
        },
        recentActivity: { posts: [], agentTasks: [], emails: [], cronJobs: [], errors: [] },
        trends: { dates: [], postsByDate: [], agentTasksByDate: [], systemErrorsByDate: [] },
      });
    } finally {
      setLoading(false);
    }
  }

  function getHealthDot(healthy: boolean): string {
    return healthy ? '🟢' : '🔴';
  }

  function getStatusColor(healthy: boolean): string {
    return healthy ? 'text-green-600' : 'text-red-600';
  }

  if (loading || !overview) {
    return (
      <div className="animate-pulse flex items-center justify-center min-h-screen">
        Loading analytics dashboard...
      </div>
    );
  }

  const { systemHealth, socialMedia, agentPerformance, recentActivity, trends } = overview;

  return (
    <div className="space-y-6 p-6">
      {/* System Health */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">System Status</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`border rounded-lg p-4 ${getStatusColor(systemHealth?.database)}`}>
            <div className="font-semibold">Database</div>
            <div className="text-2xl text-right">{getHealthDot(systemHealth?.database)}</div>
          </div>
          <div className={`border rounded-lg p-4 ${getStatusColor(systemHealth?.socialMedia)}`}>
            <div className="font-semibold">Social Media</div>
            <div className="text-right text-2xl">{getHealthDot(systemHealth?.socialMedia)}</div>
          </div>
          <div className={`border rounded-lg p-4 ${getStatusColor(systemHealth?.agents)}`}>
            <div className="font-semibold">Agents</div>
            <div className="text-right text-2xl">{getHealthDot(systemHealth?.agents)}</div>
          </div>
          <div className={`border rounded-lg p-4 ${getStatusColor(systemHealth?.apiEndpoints)}`}>
            <div className="font-semibold">API Endpoints</div>
            <div className="text-right text-2xl">{getHealthDot(systemHealth?.apiEndpoints)}</div>
          </div>
        </div>
      </div>

      {/* Social Media Stats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Social Media Stats</h2>
        </div>
        <div className="p-6">
          <strong>Posts:</strong> {socialMedia.reduce((sum: number, p: any) => sum + p.posts, 0)} total
          <strong>Engagement:</strong> {socialMedia.reduce((sum: number, p: any) => sum + p.likes + p.shares, 0)} interactions
        </div>

        <div className="space-y-3">
          {socialMedia.map((stat: any) => {
            const engagementColor =
              parseFloat(stat.engagement_rate) >= 5 ? 'text-green-600' :
              parseFloat(stat.engagement_rate) >= 3 ? 'text-cyan-600' :
              parseFloat(stat.engagement_rate) >= 1 ? 'text-gray-500' : 'text-gray-400';
            return (
              <div key={stat.platform} className="border border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">{stat.platform}</h3>
                  <span className="text-2xl">{getHealthDot(stat.posted > 0)}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Posted:</span>
                    <strong>{stat.posted} / {stat.posts}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Waiting:</span>
                    <strong>{stat.scheduled}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Failed:</span>
                    <div className={`font-semibold ${stat.failed > 0 ? 'text-red' : 'text-gray-500'}`}>
                      {stat.failed}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className="text-gray-600">Impressions:</span>
                    <div className={`font-semibold text-sm ${engagementColor}`}>
                      {stat.impressions?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-gray-500">
                      / {stat.impressions || '0'} total
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className="text-gray-600">Likes:</span>
                    <div className={`font-semibold text-sm ${engagementColor}`}>
                      {stat.likes?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-gray-500">
                      / {stat.likes || '0'} total
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Stats */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Agent Stats</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 mb-6">
          <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-4">
            <div className="text-sm text-cyan-800">Total Agents</div>
            <div className="text-3xl font-bold text-cyan-900 mt-1">
              {agentPerformance.totalAgents}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-800">Working</div>
            <div className="text-3xl font-bold text-blue-900 mt-1">
              {agentPerformance.activeAgents}
            </div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-sm text-green-800">Idle</div>
            <div className="text-3xl font-bold text-green-900 mt-1">
              {agentPerformance.idleAgents}
            </div>
          </div>
          <div className="bg-red-50 border-red-100 rounded-lg p-4">
            <div className="text-sm text-red-800">Stuck</div>
            <div className="text-3xl font-bold text-red-900 mt-1">
              {agentPerformance.stuckAgents}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="text-gray-600">Tasks Completed:</span>
            <div className="font-semibold text-gray-900">
              {agentPerformance.tasksCompleted}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Success Rate:</span>
            <div className={`font-semibold ${
              parseFloat(agentPerformance.successRate) >= 90
                ? 'text-green-600'
                : parseFloat(agentPerformance.successRate) >= 70
                ? 'text-cyan-600'
                : 'text-yellow-600'
            }`}>
              {agentPerformance.success_rate}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.posts?.length ? recentActivity.posts.map((line: string, i: number) => (
            <div key={i} className="text-sm text-gray-600 font-mono">
              📱 {line}
            </div>
          )) : (
            <p className="text-gray-500">No recent activity yet.</p>
          )}
        </div>
      </div>

      {/* System Errors */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">System Status</h2>
        </div>
        <div className="p-6">
          <span className="text-green-600">✅ All systems operational</span>
          <span className="text-gray-500 ml-4">
            Last check: {systemHealth?.last_check ? new Date(systemHealth.last_check).toLocaleTimeString() : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}
