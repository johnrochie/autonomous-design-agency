'use client';

import React, { useState } from 'react';
import { activateAgentOnProject } from '@/lib/agent-manager';

interface ActivateAgentButtonProps {
  projectId: string;
  projectStatus: string;
  agentStatus?: string;
  onActivated?: () => void;
}

export default function ActivateAgentButton({
  projectId,
  projectStatus,
  agentStatus,
  onActivated,
}: ActivateAgentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Only show button if project is approved/waiting and agent not active
  const canActivate =
    ['approved', 'confirmed'].includes(projectStatus) &&
    !agentStatus ||
    agentStatus === 'idle';

  async function handleActivate() {
    setLoading(true);
    setResult(null);

    const activationResult = await activateAgentOnProject(projectId);

    setResult({
      success: activationResult.success,
      message: activationResult.message,
    });

    if (activationResult.success && onActivated) {
      onActivated();
    }

    setLoading(false);
  }

  if (!canActivate) {
    // Show agent status instead
    if (agentStatus) {
      const statusColors: Record<string, string> = {
        analyzing: 'bg-blue-100 text-blue-800',
        planning: 'bg-yellow-100 text-yellow-800',
        working: 'bg-cyan-100 text-cyan-800',
        waiting_review: 'bg-purple-100 text-purple-800',
        done: 'bg-green-100 text-green-800',
        stuck: 'bg-red-100 text-red-800',
        escalate: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Agent Status</div>
              <div className="mt-1 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[agentStatus] || 'bg-gray-100 text-gray-800'}`}>
                  {agentStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            {agentStatus === 'waiting_review' && (
              <div className="text-sm text-cyan-600 font-medium">
                Your review needed
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            Activate Autonomous Agent
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Start the autonomous development process. An AI agent will:
          </p>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>• Create GitHub repository</li>
            <li>• Initialize Next.js 16 project</li>
            <li>• Generate components and pages</li>
            <li>• Deploy preview to Vercel</li>
            <li>• Wait for your review at milestones</li>
          </ul>
        </div>
        <div className="ml-4">
          <button
            onClick={handleActivate}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Starting...' : 'Activate Agent'}
          </button>
        </div>
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✓ Agent Activated' : '✗ Failed'}
          </div>
          <div className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600 text-lg">⚠</span>
          <div className="text-sm text-yellow-800">
            <strong>Important:</strong> The agent will create a new GitHub repository
            and deploy to Vercel. Please ensure you have sufficient quota and
            permissions.
          </div>
        </div>
      </div>
    </div>
  );
}
