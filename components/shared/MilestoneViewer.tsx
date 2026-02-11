'use client';

import { useEffect, useState } from 'react';
import { getMilestones, getMilestoneProgress, type Milestone } from '@/lib/supabase';
import { CheckCircle2, Clock, AlertCircle, Circle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface MilestoneViewerProps {
  projectId: string;
}

export default function MilestoneViewer({ projectId }: MilestoneViewerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [progress, setProgress] = useState<{
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    pending: number;
    percentage: number;
  }>({
    total: 0,
    completed: 0,
    inProgress: 0,
    blocked: 0,
    pending: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [milestoneData, progressData] = await Promise.all([
        getMilestones(projectId),
        getMilestoneProgress(projectId),
      ]);
      setMilestones(milestoneData);
      setProgress(progressData);
    } catch (err: any) {
      console.error('Error loading milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<Milestone['status'], { bg: string; icon: string }> = {
    pending: { bg: 'bg-gray-100', icon: 'text-gray-400' },
    in_progress: { bg: 'bg-blue-100', icon: 'text-blue-500' },
    completed: { bg: 'bg-green-100', icon: 'text-green-500' },
    blocked: { bg: 'bg-red-100', icon: 'text-red-500' },
  };

  const statusIcons: Record<Milestone['status'], any> = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
    blocked: AlertCircle,
  };

  const statusLabels: Record<Milestone['status'], string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked',
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] p-6 rounded-2xl">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="font-serif text-xl font-bold">Project Progress</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl">
      {/* Header with Progress */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-800 mb-6">
        <Target className="w-5 h-5 text-cyan-400" />
        <h2 className="font-serif text-xl font-bold">Project Progress</h2>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-8">
          <Circle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 font-medium">No milestones defined yet</p>
          <p className="text-gray-500 text-sm mt-1">Your project manager will add milestones soon</p>
        </div>
      ) : (
        <>
          {/* Overall Progress Card */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-xl p-6 mb-6 text-center">
            <div className="text-5xl font-bold text-cyan-400 mb-2">{progress.percentage}%</div>
            <div className="text-gray-400 text-sm">Complete</div>
            <div className="w-full bg-gray-800 rounded-full h-3 mt-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-400">{progress.completed} Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-400">{progress.inProgress} In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <span className="text-gray-400">{progress.pending} Pending</span>
              </div>
            </div>
          </div>

          {/* Milestones List */}
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const StatusIcon = statusIcons[milestone.status];
              const delay = index * 0.1;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay, duration: 0.3 }}
                  className={`p-4 rounded-xl border ${
                    milestone.status === 'completed'
                      ? 'bg-green-500/10 border-green-500/30'
                      : milestone.status === 'blocked'
                      ? 'bg-red-500/10 border-red-500/30'
                      : milestone.status === 'in_progress'
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-[#1a1a1a] border-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full ${statusColors[milestone.status].bg} flex items-center justify-center`}
                    >
                      <StatusIcon className={`w-5 h-5 ${statusColors[milestone.status].icon}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{milestone.name}</h4>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            milestone.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : milestone.status === 'blocked'
                              ? 'bg-red-500/20 text-red-400'
                              : milestone.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {statusLabels[milestone.status]}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {milestone.due_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Due: {new Date(milestone.due_date).toLocaleDateString('en-GB')}</span>
                          </div>
                        )}
                        {milestone.status === 'completed' && milestone.completed_at && (
                          <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              Completed: {new Date(milestone.completed_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Complete Badge */}
                    {milestone.status === 'completed' && (
                      <div className="flex-shrink-0">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
                          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
