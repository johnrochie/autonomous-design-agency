'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, FileText, CreditCard, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  type: string;
  status: 'intake' | 'design' | 'development' | 'qa' | 'deployment' | 'completed';
  progress: number;
  updated: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Simulate loading projects
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: 'Corporate Website',
          type: 'Portfolio',
          status: 'development',
          progress: 65,
          updated: '2 hours ago',
        },
        {
          id: '2',
          name: 'E-commerce Store',
          type: 'E-commerce',
          status: 'design',
          progress: 30,
          updated: '1 day ago',
        },
        {
          id: '3',
          name: 'SaaS Dashboard',
          type: 'SaaS',
          status: 'completed',
          progress: 100,
          updated: '3 days ago',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const statusColors = {
    intake: 'bg-yellow-500/10 text-yellow-500',
    design: 'bg-blue-500/10 text-blue-500',
    development: 'bg-purple-500/10 text-purple-500',
    qa: 'bg-orange-500/10 text-orange-500',
    deployment: 'bg-cyan-500/10 text-cyan-500',
    completed: 'bg-green-500/10 text-green-500',
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-serif text-xl font-bold gradient-text">
              Autonomous Design Agency
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
          <Link
            href="/client/intake"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
          >
            New Project
          </Link>
        </div>

        {/* Stats */}
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
            {/* Quick Stats */}
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

            {/* Recent Projects */}
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">Recent Projects</h2>
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
