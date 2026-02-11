import { formatDistanceToNow } from 'date-fns';
import { Calendar, DollarSign, User } from 'lucide-react';
import Link from 'next/link';
import { ProjectStatusBadge } from './ProjectStatusBadge';

export interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string | null;
  created_at: string;
  clients?: {
    full_name?: string | null;
    email?: string | null;
    company_name?: string | null;
  } | null;
  quote_amount_cents?: number | null;
  timeline_range?: string | null;
}

interface ProjectCardProps {
  project: Project;
}

const typeLabels: Record<string, string> = {
  portfolio: 'Portfolio Site',
  ecommerce: 'E-commerce',
  saas: 'SaaS Platform',
  custom: 'Custom Platform',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const quoteEur = project.quote_amount_cents ? (project.quote_amount_cents / 100).toLocaleString('en-IE') : 'Not quoted';
  const timeAgo = formatDistanceToNow(new Date(project.created_at), { addSuffix: true });

  return (
    <Link href={`/admin/projects/${project.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{typeLabels[project.type] || project.type}</p>
          </div>
          <ProjectStatusBadge status={project.status as any} />
        </div>

        {project.description && (
          <p className="text-gray-700 text-sm mt-3 line-clamp-2">{project.description}</p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">
              {project.clients?.company_name || project.clients?.full_name || project.clients?.email || 'Unknown'}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{timeAgo}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span>€{quoteEur}</span>
          </div>
        </div>

        {project.timeline_range && (
          <div className="mt-2 text-xs text-gray-500">
            Timeline: {project.timeline_range} weeks
          </div>
        )}
      </div>
    </Link>
  );
}
