'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjectById, updateProjectStatus } from '@/lib/supabase';
import { ProjectStatusBadge } from '@/components/admin/ProjectStatusBadge';

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
  estimated_completion?: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    email: string;
    full_name?: string | null;
    company_name?: string | null;
    industry?: string | null;
  } | null;
  quote_breakdowns?: Array<{
    id: string;
    phase: string;
    component: string;
    description?: string | null;
    estimated_days?: number | null;
    rate_per_day?: number | null;
    amount_cents: number;
  }>;
}

const statusOptions = [
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

const typeLabels: Record<string, string> = {
  portfolio: 'Portfolio Site',
  ecommerce: 'E-commerce',
  saas: 'SaaS Platform',
  custom: 'Custom Platform',
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const data = await getProjectById(params.id);
        setProject(data as Project);
      } catch (err: any) {
        console.error('Error loading project:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Update project status to "${newStatus}"?`)) return;

    try {
      setSaving(true);
      const updated = await updateProjectStatus(params.id, newStatus);
      setProject({ ...project!, ...updated });
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading project: {error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  const quoteEur = project.quote_amount_cents ? (project.quote_amount_cents / 100).toLocaleString('en-IE') : 'Not quoted';
  const createdAt = new Date(project.created_at).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to all projects
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-2 text-gray-600">{typeLabels[project.type] || project.type}</p>
            </div>
            <ProjectStatusBadge status={project.status as any} />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Created {createdAt}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {project.description && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {/* Features */}
            {project.features && Array.isArray(project.features) && project.features.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Features Required</h2>
                <ul className="space-y-2">
                  {project.features.map((feature: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quote Breakdown */}
            {project.quote_breakdowns && project.quote_breakdowns.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Quote Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Phase</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Component</th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-gray-500">Days</th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-gray-500">Rate</th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-gray-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {project.quote_breakdowns.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-sm text-gray-900 capitalize">{item.phase}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{item.component}</td>
                          <td className="px-3 py-2 text-sm text-gray-600 text-right">{item.estimated_days || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-600 text-right">
                            {item.rate_per_day ? `€${(item.rate_per_day / 100).toFixed(0)}/day` : '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900 font-medium text-right">
                            €{(item.amount_cents / 100).toLocaleString('en-IE')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status & Client Info */}
          <div className="space-y-6">
            {/* Status Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Status</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Status
                  </label>
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {saving && (
                  <p className="text-sm text-gray-600">Updating...</p>
                )}
              </div>
            </div>

            {/* Quote Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Quote</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">€{quoteEur}</span>
                </div>
                {project.quote_status && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quote Status:</span>
                    <span className="capitalize">{project.quote_status}</span>
                  </div>
                )}
                {project.timeline_range && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-semibold">{project.timeline_range} weeks</span>
                  </div>
                )}
                {project.budget_range && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Range:</span>
                    <span className="font-semibold">€{project.budget_range}k</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Info */}
            {project.clients && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h2>
                <div className="space-y-2 text-sm">
                  {project.clients.full_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{project.clients.full_name}</span>
                    </div>
                  )}
                  {project.clients.company_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{project.clients.company_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{project.clients.email}</span>
                  </div>
                  {project.clients.industry && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">{project.clients.industry}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
