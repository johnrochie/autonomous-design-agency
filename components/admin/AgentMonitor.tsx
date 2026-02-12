'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent, AgentTask, AgentLog } from '@/lib/agent-manager';

interface AgentMonitorProps {
  className?: string;
}

export default function AgentMonitor({ className = '' }: AgentMonitorProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      loadAgentTasks(selectedAgent.id);
      loadAgentLogs(selectedAgent.id);
    }
  }, [selectedAgent]);

  async function loadAgents() {
    if (!supabase) {
      setError('Supabase not initialized');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from('agents').select('*').order('name');
    if (error) {
      setError(error.message);
    } else if (data) {
      setAgents(data as Agent[]);
    }
    setLoading(false);
  }

  async function loadAgentTasks(agentId: string) {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setTasks(data as AgentTask[]);
    }
  }

  async function loadAgentLogs(agentId: string) {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error && data) {
      setLogs(data as AgentLog[]);
    }
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      idle: 'bg-green-100 text-green-800',
      working: 'bg-blue-100 text-blue-800',
      stuck: 'bg-red-100 text-red-800',
      offline: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getTaskStatusColor(status: string): string {
    const colors: Record<string, string> = {
      queued: 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      escalated: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getLogLevelColor(level: string): string {
    const colors: Record<string, string> = {
      info: 'text-gray-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      success: 'text-green-600',
      debug: 'text-blue-600',
    };
    return colors[level] || 'text-gray-600';
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Agents List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Agent Pool</h2>
          <p className="text-sm text-gray-600">Real-time agent status</p>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading agents...</p>
          ) : agents.length === 0 ? (
            <p className="text-gray-500">No agents configured</p>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`cursor-pointer border rounded-lg p-4 transition-all hover:shadow-md ${
                    selectedAgent?.id === agent.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            agent.status
                          )}`}
                        >
                          {agent.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Type: {agent.type} • Capabilities: {agent.capabilities.join(', ')}
                      </div>
                    </div>
                    {agent.current_project_id && (
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Working on project</div>
                        <div className="font-mono text-xs text-gray-500">
                          {agent.current_project_id.slice(0, 8)}...
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div>Last heartbeat: {agent.last_heartbeat ? new Date(agent.last_heartbeat).toLocaleString() : 'Never'}</div>
                    <div>Max parallel: {agent.max_parallel_tasks}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <>
          {/* Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Tasks - {selectedAgent.name}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>Total: {tasks.length}</span>
                <span className="text-green-600">Completed: {tasks.filter(t => t.status === 'completed').length}</span>
                <span className="text-blue-600">In Progress: {tasks.filter(t => t.status === 'in_progress').length}</span>
                <span className="text-red-600">Failed: {tasks.filter(t => t.status === 'failed').length}</span>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-gray-500">No tasks assigned</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                            <span className="text-gray-500 text-xs">{task.type}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mt-1">
                            {task.description}
                          </h4>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : task.priority === 'medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div>Created: {new Date(task.created_at).toLocaleString()}</div>
                        {task.started_at && <div>Started: {new Date(task.started_at).toLocaleString()}</div>}
                        {task.completed_at && <div>Completed: {new Date(task.completed_at).toLocaleString()}</div>}
                      </div>
                      {task.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          Error: {task.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Activity Logs - {selectedAgent.name}
              </h3>
              <p className="text-sm text-gray-600">Recent activity</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No activity logs</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium uppercase ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${getLogLevelColor(log.level)}`}>
                        {log.message}
                      </p>
                      {log.task_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Task ID: {log.task_id.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Agents</div>
          <div className="text-2xl font-bold text-cyan-600 mt-1">{agents.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Working Agents</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {agents.filter((a) => a.status === 'working').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Idle Agents</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {agents.filter((a) => a.status === 'idle').length}
          </div>
        </div>
      </div>
    </div>
  );
}
