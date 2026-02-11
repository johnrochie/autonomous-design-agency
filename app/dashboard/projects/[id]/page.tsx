'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages, getCurrentUser, getClientProjects } from '@/lib/supabase';
import MessagePanel from '@/components/shared/MessagePanel';
import MilestoneViewer from '@/components/shared/MilestoneViewer';
import { ArrowLeft, FileText } from 'lucide-react';
import { formatAmount } from '@/lib/quote-generator';

interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  sender_type: 'client' | 'agent';
  content: string;
  read_at: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string | null;
  features?: any;
  timeline_range?: string | null;
  budget_range?: string | null;
  quote_amount_cents?: number | null;
  quote_status?: string | null;
  created_at: string;
  updated_at: string;
}

export default function ClientProjectPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  useEffect(() => {
    async function resolveParams() {
      let actualParams: { id: string };
      if (params instanceof Promise) {
        actualParams = await params;
      } else {
        actualParams = params as { id: string };
      }

      const projectId = actualParams?.id;
      setResolvedId(projectId);

      if (!projectId || projectId === 'undefined') {
        setError('Project ID not found');
        setLoading(false);
        return;
      }

      try {
        await loadProject(projectId);
        await loadUser();
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    resolveParams();
  }, [params]);

  const loadProject = async (projectId: string) => {
    const projects = await getClientProjects(currentUser?.email);
    const found = (projects || []).find((p: any) => p.id === projectId);

    if (!found) {
      throw new Error('Project not found');
    }

    setProject(found);
  };

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const typeLabels: Record<string, string> = {
    portfolio: 'Portfolio Website',
    ecommerce: 'E-commerce Store',
    saas: 'SaaS Application',
    custom: 'Custom Platform',
  };

  const statusLabels: Record<string, string> = {
    intake: 'Intake Review',
    quoted: 'Quote Sent',
    confirmed: 'Confirmed',
    design: 'In Design',
    development: 'In Development',
    qa: 'Quality Assurance',
    deployment: 'Deployment',
    completed: 'Completed',
    paused: 'Paused',
  };

  const createdAt = project
    ? new Date(project.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-400 font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <p className="text-gray-400">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="font-serif text-lg font-bold">Project Details</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-white mb-2">{project.name}</h1>
              <p className="text-gray-400">{typeLabels[project.type] || project.type}</p>
            </div>
            <div
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                project.status === 'completed'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-cyan-500/10 text-cyan-400'
              }`}
            >
              {statusLabels[project.status] || project.status}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Created {createdAt} • Last updated {new Date(project.updated_at).toLocaleDateString('en-GB')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Info & Messages */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {project.description && (
              <div className="bg-[#1a1a1a] p-6 rounded-2xl">
                <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Description
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {/* Features */}
            {project.features && Array.isArray(project.features) && project.features.length > 0 && (
              <div className="bg-[#1a1a1a] p-6 rounded-2xl">
                <h2 className="font-serif text-xl font-bold mb-3">Features Required</h2>
                <ul className="space-y-2">
                  {project.features.map((feature: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-cyan-400 mr-2 mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quote Info */}
            {project.quote_amount_cents && (
              <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 p-6 rounded-2xl">
                <h2 className="font-serif text-xl font-bold mb-3">Quote</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {formatAmount(project.quote_amount_cents)}
                    </p>
                  </div>
                  {project.timeline_range && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Estimated Timeline</p>
                      <p className="text-lg font-semibold text-white">{project.timeline_range} weeks</p>
                    </div>
                  )}
                  {project.quote_status && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Status</p>
                      <p className="text-lg font-semibold capitalize text-white">{project.quote_status}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Panel */}
            <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="font-serif text-xl font-bold">Messages</h2>
                <p className="text-sm text-gray-400 mt-1">Communicate with your project manager</p>
              </div>
              <div className="h-[400px]">
                {currentUser && resolvedId && (
                  <MessagePanel
                    projectId={resolvedId}
                    currentUserId={currentUser.id}
                    currentUserType="client"
                    isClientView={true}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Milestones */}
          <div className="space-y-6">
            {/* Active Milestones */}
            {resolvedId && <MilestoneViewer projectId={resolvedId} />}
          </div>
        </div>
      </main>
    </div>
  );
}
