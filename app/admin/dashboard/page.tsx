'use client';

import { useEffect, useState } from 'react';
import { getAllProjects, getProjectStats } from '@/lib/supabase';
import { StatCard } from '@/components/admin/StatCard';
import { ProjectCard, Project } from '@/components/admin/ProjectCard';
import { Users, FileText, DollarSign, CheckCircle } from 'lucide-react';

interface Stats {
  total: number;
  new: number;
  quoted: number;
  confirmed: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, projectsData] = await Promise.all([
          getProjectStats(),
          getAllProjects(),
        ]);

        setStats(statsData);
        setRecentProjects(projectsData!.slice(0, 5)); // Show 5 most recent
      } catch (err: any) {
        console.error('Error loading admin dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Overview of your agency's projects and performance</p>
          </div>
          <a
            href="/admin/analytics"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            📊 Analytics
          </a>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              label="Total Projects"
              value={stats.total}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="New Requests"
              value={stats.new}
              icon={Users}
              color="orange"
            />
            <StatCard
              label="Awaiting Approval"
              value={stats.quoted}
              icon={DollarSign}
              color="yellow"
            />
            <StatCard
              label="Confirmed"
              value={stats.confirmed}
              icon={CheckCircle}
              color="green"
            />
          </div>
        )}

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
            <a
              href="/admin/projects"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all →
            </a>
          </div>

          {recentProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No projects yet. Projects will appear here when clients submit intake forms.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
