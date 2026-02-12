/**
 * Autonomous Agent Manager
 * Coordinates agents, tasks, and project autonomy
 */

import { supabase } from './supabase';
import { updateMilestoneStatus } from './supabase';

// Internal reference: supabase is guaranteed to be initialized for agent operations in production
// Use non-null assertion (!) since env vars are required for production
const db = supabase!;

// ============================================
// TYPES
// ============================================

export interface Agent {
  id: string;
  name: string;
  type: 'cursor_cli' | 'openhands' | 'custom';
  status: 'idle' | 'working' | 'stuck' | 'offline';
  current_project_id: string | null;
  current_task_id: string | null;
  last_heartbeat: string | null;
  capabilities: string[];
  max_parallel_tasks: number;
}

export interface AgentTask {
  id: string;
  project_id: string;
  agent_id: string | null;
  type: TaskType;
  description: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  depends_on: string[];
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  result: any;
  error: string | null;
  retry_count: number;
  max_retries?: number;
}

export type TaskType =
  | 'create_repo'
  | 'init_project'
  | 'generate_component'
  | 'generate_page'
  | 'implement_feature'
  | 'run_tests'
  | 'deploy_preview'
  | 'await_review'
  | 'deploy_production'
  | 'complete_project'
  | 'setup_environment'
  | 'install_dependencies'
  | 'configure_tailwind'
  | 'optimize_images'
  | 'add_seo_metadata'
  | 'run_linter'
  | 'check_build'
  | 'fix_errors'
  | 'git_commit'
  | 'git_push'
  | 'create_pr'
  | 'merge_pr'
  | 'preview_ready'
  | 'production_ready';

export interface ProjectAgentTracking {
  id: string;
  project_id: string;
  agent_id: string | null;
  status: 'idle' | 'analyzing' | 'planning' | 'working' | 'waiting_review' | 'iterating' | 'completing' | 'done' | 'stuck' | 'failed' | 'escalate' | 'human_intervention' | 'resume';
  started_at: string | null;
  completed_at: string | null;
  current_milestone_id: string | null;
  milestones_completed: number;
  milestones_total: number;
  agent_logs: any[];
}

export interface AgentLog {
  id: string;
  agent_id: string;
  task_id: string | null;
  project_id: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'debug';
  message: string;
  metadata: any;
  created_at: string;
}

// ============================================
// AGENT POOL MANAGEMENT
// ============================================

/**
 * Get all agents
 */
export async function getAllAgents(): Promise<Agent[]> {
  const { data, error } = await db
    .from('agents')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Agent[];
}

/**
 * Get agent by ID
 */
export async function getAgentById(agentId: string): Promise<Agent | null> {
  const { data, error } = await db
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (error) throw error;
  return data as Agent;
}

/**
 * Find idle agent by capability
 */
export async function findIdleAgentByCapability(capability: string): Promise<Agent | null> {
  const { data, error } = await db
    .from('agents')
    .select('*')
    .eq('status', 'idle')
    .contains('capabilities', capability)
    .order('name', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as Agent;
}

/**
 * Find any idle agent
 */
export async function findIdleAgent(): Promise<Agent | null> {
  const { data, error } = await db
    .from('agents')
    .select('*')
    .eq('status', 'idle')
    .order('name', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as Agent;
}

/**
 * Update agent status
 */
export async function updateAgentStatus(
  agentId: string,
  status: Agent['status'],
  currentProjectId?: string,
  currentTaskId?: string
): Promise<void> {
  const update: any = { status };
  if (currentProjectId !== undefined) update.current_project_id = currentProjectId;
  if (currentTaskId !== undefined) update.current_task_id = currentTaskId;

  await db.from('agents').update(update).eq('id', agentId);
}

/**
 * Update agent heartbeat
 */
export async function updateAgentHeartbeat(agentId: string): Promise<void> {
  const { error } = await db.rpc('update_agent_heartbeat', { p_agent_id: agentId });
  if (error) throw error;
}

// ============================================
// TASK MANAGEMENT
// ============================================

/**
 * Create task for project
 */
export async function createTask(task: Omit<AgentTask, 'id' | 'created_at' | 'started_at' | 'completed_at' | 'result' | 'error' | 'retry_count'>): Promise<AgentTask> {
  const { data, error } = await db
    .from('agent_tasks')
    .insert({
      project_id: task.project_id,
      agent_id: task.agent_id,
      type: task.type,
      description: task.description,
      status: task.status,
      priority: task.priority,
      depends_on: task.depends_on,
      max_retries: task.max_retries || 3,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AgentTask;
}

/**
 * Get tasks for project
 */
export async function getTasksForProject(projectId: string): Promise<AgentTask[]> {
  const { data, error } = await db
    .from('agent_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as AgentTask[];
}

/**
 * Get tasks for agent
 */
export async function getTasksForAgent(agentId: string): Promise<AgentTask[]> {
  const { data, error } = await db
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as AgentTask[];
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: AgentTask['status'],
  result?: any,
  error?: string
): Promise<void> {
  const update: any = {
    status,
  };

  if (status === 'in_progress' && !update.started_at) {
    update.started_at = new Date().toISOString();
  } else if (status === 'completed' || status === 'failed' || status === 'escalated') {
    update.completed_at = new Date().toISOString();
  }

  if (result !== undefined) update.result = result;
  if (error !== undefined) update.error = error;

  await db.from('agent_tasks').update(update).eq('id', taskId);
}

/**
 * Find next task for agent
 */
export async function findNextTask(agentId: string): Promise<AgentTask | null> {
  const { data, error } = await db.rpc('find_next_task', { p_agent_id: agentId });

  if (error || !data || !data[0]) return null;

  // Get full task details
  const taskId = data[0].task_id;
  const { data: task } = await db.from('agent_tasks').select('*').eq('id', taskId).single();

  return task as AgentTask;
}

// ============================================
// AGENT TRACKING
// ============================================

/**
 * Get agent tracking for project
 */
export async function getProjectAgentTracking(projectId: string): Promise<ProjectAgentTracking | null> {
  const { data, error } = await db
    .from('project_agent_tracking')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    agent_logs: (data.agent_logs || []) as any[],
  } as ProjectAgentTracking;
}

/**
 * Create agent tracking for project
 */
export async function createProjectAgentTracking(projectId: string): Promise<ProjectAgentTracking> {
  const { data, error } = await db
    .from('project_agent_tracking')
    .insert({
      project_id: projectId,
      status: 'idle',
      milestones_completed: 0,
      milestones_total: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    agent_logs: (data.agent_logs || []) as any[],
  } as ProjectAgentTracking;
}

/**
 * Update project agent status
 */
export async function updateProjectAgentStatus(
  projectId: string,
  status: ProjectAgentTracking['status']
): Promise<void> {
  await db.rpc('update_agent_tracking', {
    p_project_id: projectId,
    p_status: status,
  });
}

// ============================================
// AGENT LOGS
// ============================================

/**
 * Add agent log
 */
export async function addAgentLog(
  agentId: string,
  projectId: string,
  level: AgentLog['level'],
  message: string,
  metadata: any = {},
  taskId?: string
): Promise<void> {
  await db.rpc('add_agent_log', {
    p_agent_id: agentId,
    p_task_id: taskId || null,
    p_project_id: projectId,
    p_level: level,
    p_message: message,
    p_metadata: metadata,
  });
}

/**
 * Get agent logs for project
 */
export async function getAgentLogsForProject(projectId: string, limit: number = 100): Promise<AgentLog[]> {
  const { data, error } = await db
    .from('agent_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AgentLog[];
}

// ============================================
// AGENT ACTIVATION (CORE ORCHESTRATION)
// ============================================

/**
 * Activate agent on approved project
 */
export async function activateAgentOnProject(projectId: string): Promise<{
  success: boolean;
  agentId: string | null;
  message: string;
}> {
  try {
    // 1. Find idle agent
    const agent = await findIdleAgent();
    if (!agent) {
      return {
        success: false,
        agentId: null,
        message: 'No idle agents available. Please wait or add more agents.',
      };
    }

    // 2. Get project details
    const { data: project } = await db
      .from('projects')
      .select('*, clients(*)')
      .eq('id', projectId)
      .single();

    if (!project) {
      return {
        success: false,
        agentId: null,
        message: 'Project not found',
      };
    }

    // 3. Create or get tracking
    let tracking = await getProjectAgentTracking(projectId);
    if (!tracking) {
      tracking = await createProjectAgentTracking(projectId);
    }

    // 4. Update agent status to working
    await updateAgentStatus(agent.id, 'working', projectId);
    await updateProjectAgentStatus(projectId, 'analyzing');

    // 5. Log activation
    await addAgentLog(
      agent.id,
      projectId,
      'info',
      `Agent activated for project "${project.name}" (Client: ${project.clients?.full_name})`
    );

    // 6. Create initial tasks (setup phase)
    await createInitialTasks(projectId, agent.id, project as any);

    return {
      success: true,
      agentId: agent.id,
      message: `Agent "${agent.name}" activated for project "${project.name}". Creating tasks...`,
    };
  } catch (error: any) {
    console.error('Error activating agent:', error);
    return {
      success: false,
      agentId: null,
      message: `Error: ${error.message}`,
    };
  }
}

/**
 * Create initial tasks for project setup phase
 */
async function createInitialTasks(projectId: string, agentId: string, project: any): Promise<void> {
  const tasks = [
    {
      type: 'create_repo' as TaskType,
      description: 'Create GitHub repository',
      priority: 'high' as const,
      depends_on: [],
    },
    {
      type: 'init_project' as TaskType,
      description: 'Initialize Next.js 16 project',
      priority: 'high' as const,
      depends_on: [],
    },
    {
      type: 'install_dependencies' as TaskType,
      description: 'Install Tailwind CSS v4 and dependencies',
      priority: 'high' as const,
      depends_on: ['init_project'],
    },
    {
      type: 'configure_tailwind' as TaskType,
      description: 'Configure Tailwind CSS with brand colors',
      priority: 'medium' as const,
      depends_on: ['install_dependencies'],
    },
    {
      type: 'deploy_preview' as TaskType,
      description: 'Deploy preview to Vercel',
      priority: 'medium' as const,
      depends_on: ['configure_tailwind'],
    },
    {
      type: 'await_review' as TaskType,
      description: 'Await human review of initial setup',
      priority: 'high' as const,
      depends_on: ['deploy_preview'],
    },
  ];

  // Create tasks with dependencies
  const taskMap = new Map<string, string>();

  for (const task of tasks) {
    const dependsOnIds = task.depends_on
      .map((dep) => taskMap.get(dep))
      .filter((id): id is string => !!id);

    const createdTask = await createTask({
      project_id: projectId,
      agent_id: agentId,
      type: task.type,
      description: task.description,
      status: 'queued',
      priority: task.priority,
      depends_on: dependsOnIds,
    });

    taskMap.set(task.type, createdTask.id);
  }

  await addAgentLog(
    agentId,
    projectId,
    'success',
    `Created ${tasks.length} initial tasks for project setup`
  );
}

/**
 * Escalate agent to human
 */
export async function escalateAgent(
  agentId: string,
  taskId: string,
  projectId: string,
  reason: string
): Promise<void> {
  // Update agent status to escalate
  await updateAgentStatus(agentId, 'stuck');
  await updateTaskStatus(taskId, 'escalated', null, reason);
  await updateProjectAgentStatus(projectId, 'escalate');

  // Log escalation
  await addAgentLog(
    agentId,
    projectId,
    'error',
    `Agent escalated to human attention: ${reason}`,
    { taskId, escalatedAt: new Date().toISOString() }
  );

  // TODO: Send notification to admin (email, push, etc.)
  console.log(`[ESCALATION] Agent ${agentId} stuck on task ${taskId}: ${reason}`);
}

/**
 * Resume agent after human intervention
 */
export async function resumeAgent(
  agentId: string,
  projectId: string
): Promise<void> {
  await updateAgentStatus(agentId, 'working');
  await updateProjectAgentStatus(projectId, 'resume');

  await addAgentLog(
    agentId,
    projectId,
    'info',
    `Agent resumed by human after intervention`
  );
}

/**
 * Complete project via agent
 */
export async function completeProjectViaAgent(
  agentId: string,
  projectId: string
): Promise<void> {
  await updateAgentStatus(agentId, 'idle');
  await updateProjectAgentStatus(projectId, 'done');

  await addAgentLog(
    agentId,
    projectId,
    'success',
    `Project completed successfully by agent`,
    { completedAt: new Date().toISOString() }
  );

  // TODO: Send completion notification to client
  console.log(`[COMPLETE] Project ${projectId} completed by agent ${agentId}`);
}

// ============================================
// CURSOR CLI INTEGRATION (Placeholder)
// ============================================

/**
 * Execute Cursor CLI task
 * This is a placeholder for the actual integration
 * In production, this would:
 * 1. Create tmux session
 * 2. Execute cursor agent run -p "prompt"
 * 3. Capture output
 * 4. Parse results
 * 5. Return code
 */
export async function executeCursorCliTask(task: AgentTask, project: any): Promise<{
  success: boolean;
  output: string;
  filesCreated?: string[];
  error?: string;
}> {
  // Placeholder: In production, integrate with Cursor CLI
  console.log(`[CURSOR] Executing task ${task.type}: ${task.description}`);

  await addAgentLog(
    task.agent_id!,
    task.project_id,
    'info',
    `Executing Cursor CLI task: ${task.type}`,
    { taskId: task.id }
  );

  // Placeholder: Simulate successful execution
  // In production: tmux skill + cursor agent command
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    output: 'Cursor CLI execution successful (placeholder)',
    filesCreated: [],
  };
}

/**
 * Execute task via agent
 */
export async function executeTask(task: AgentTask, project: any): Promise<{
  success: boolean;
  result: any;
  error?: string;
}> {
  try {
    // Mark task as in progress
    await updateTaskStatus(task.id, 'in_progress');

    // Execute task
    const result = await executeCursorCliTask(task, project);

    if (result.success) {
      // Mark task as completed
      await updateTaskStatus(task.id, 'completed', result);
      return { success: true, result };
    } else {
      // Mark task as failed
      await updateTaskStatus(task.id, 'failed', null, result.error);
      return { success: false, result: null, error: result.error };
    }
  } catch (error: any) {
    await updateTaskStatus(task.id, 'failed', null, error.message);
    return { success: false, result: null, error: error.message };
  }
}
