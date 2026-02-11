'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, LogOut, FileText, CreditCard, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getClientProjects } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  updated: string;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;

    async function loadProjects() {
      try {
        setIsLoading(true);
        if (!user?.email) return;
        const projects = await getClientProjects(user.email);
        setProjects((projects || []).map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          status: p.status,
          progress: calculateProgress(p.status),
          updated: new Date(p.updated_at).toLocaleDateString(),
        })));
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const statusColors: Record<string, string> = {
    intake: 'bg-yellow-500/10 text-yellow-500',
    design: 'bg-blue-500/10 text-blue-500',
    development: 'bg-purple-500/10 text-purple-500',
    qa: 'bg-orange-500/10 text-orange-500',
    deployment: 'bg-cyan-500/10 text-cyan-500',
    completed: 'bg-green-500/10 text-green-500',
  };

  const calculateProgress = (status: string) => {
    const statusMap: Record<string, number> = {
      intake: 10,
      quoted: 20,
      confirmed: 25,
      design: 40,
      development: 60,
      qa: 80,
      deployment: 90,
      completed: 100,
      paused: 0,
    };
    return statusMap[status] || 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-serif text-xl font-bold gradient-text">
              Autonomous Design Agency
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-2">
              Welcome back, {user.user_metadata?.full_name || 'there'}!
            </h1>
            <p className="text-gray-400">
              Your autonomous design projects are underway
            </p>
          </div>
          <Link
            href="/client/intake"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
          >
            New Project
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] p-6 rounded-2xl">
                  <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-800 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#1a1a1a] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <FolderKanban className="w-5 h-5 text-cyan-400" />
                  <span className="text-2xl font-bold">{projects.length}</span>
                </div>
                <p className="text-gray-400 text-sm">Active Projects</p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Completed</p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span className="text-2xl font-bold">
                    {projects.filter(p => p.status !== 'completed').length}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">In Progress</p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <span className="text-2xl font-bold">0</span>
                </div>
                <p className="text-gray-400 text-sm">Messages</p>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">Recent Projects</h2>
              {projects.length === 0 ? (
                <div className="bg-[#1a1a1a] p-12 rounded-2xl text-center">
                  <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-gray-300 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">Start your first project with autonomous AI</p>
                  <Link
                    href="/client/intake"
                    className="inline-block px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Start New Project
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="block bg-[#1a1a1a] p-6 rounded-2xl hover:border-cyan-500/50 border border-transparent transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-cyan-400">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-400">{project.type}</p>
                        </div>
                        <div className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-400">
                          {project.status}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {project.updated}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
