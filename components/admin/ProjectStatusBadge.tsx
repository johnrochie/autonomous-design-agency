import { Badge } from '../shared/Badge';

type ProjectStatus = 'intake' | 'quoted' | 'confirmed' | 'design' | 'development' | 'qa' | 'deployment' | 'completed' | 'paused';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  intake: { label: 'New Request', variant: 'info' },
  quoted: { label: 'Quoted', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  design: { label: 'In Design', variant: 'info' },
  development: { label: 'In Development', variant: 'info' },
  qa: { label: 'QA Testing', variant: 'warning' },
  deployment: { label: 'Deploying', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  paused: { label: 'Paused', variant: 'error' },
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.intake;

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
