'use client';

import { useEffect, useState } from 'react';
import { getAllProjects, filterProjects } from '@/lib/supabase';
import { ProjectCard, Project } from '@/components/admin/ProjectCard';
import { ProjectStatusBadge } from '@/components/admin/ProjectStatusBadge';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'intake', label: 'New Request' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'design', label: 'In Design' },
  { value: 'development', label: 'In Development' },
  { value: 'qa', label: 'QA Testing' },
  { value: 'deployment', label: 'Deploying' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'custom', label: 'Custom' },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadProjects = async (filters: { status?: string; type?: string } = {}) => {
    try {
      setLoading(true);
      const data = filters.status || filters.type
        ? await filterProjects(filters)
        : await getAllProjects();

      setProjects(data! as Project[]);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (statusFilter || typeFilter) {
      loadProjects({ status: statusFilter, type: typeFilter });
    } else {
      loadProjects();
    }
  }, [statusFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
          <p className="mt-2 text-gray-600">Manage all agency projects from one place</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(statusFilter || typeFilter) && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
              <span className="text-gray-600">Showing {projects.length} projects</span>
            </div>
          )}
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-600">Error loading projects: {error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No projects found.</p>
            <p className="text-sm text-gray-500">
              Projects will appear here when clients submit intake forms.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
