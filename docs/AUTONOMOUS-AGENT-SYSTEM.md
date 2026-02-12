# Autonomous Agent System - Architecture

## Vision

**"Project approved → Agent activates → Cursor CLI builds → You review → Deploy"**

The autonomous agent system is the core of the business: when a project is approved, an agent picks it up and starts building autonomously.

---

## Architecture Overview

### Three-Layer Agent System

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  Frontend (React/Next.js) - Web dashboard for clients       │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN LAYER                               │
│  Admin Dashboard - Project management, agent oversight        │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│               AGENT COORDINATION LAYER                      │
│  Task Queue, Agent Pool, Progress Tracking, Escalation        │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                 AGENT EXECUTION LAYER                       │
│  Cursor CLI, Git, Vercel, Test Runner, Code Review           │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Manager Agent (Jarvis)

**Role:** Coordinator across all projects, decision-making, client communication

**Responsibilities:**
- Activate agents when projects are approved
- Monitor agent progress and status
- Handle escalations when agents are stuck
- Communicate with clients (messages, updates)
- Final approval gates
- Deploy to production

**Commands:**
- `activate_agent(project_id)` - Assign agent to project
- `monitor_agent(agent_id)` - Check agent status
- `escalate_agent(agent_id, reason)` - Agent stuck, human intervention needed
- `approve_milestone(project_id, milestone_id)` - Human approve milestone
- `deploy_production(project_id)` - Final deploy

---

### 2. Agent Tasks

**What agents actually do:**

**Phase 1: Setup (Autonomous)**
- Create GitHub repo
- Initialize Next.js 16 project
- Install dependencies
- Set up Tailwind CSS v4
- Configure Vercel
- Deploy to preview

**Phase 2: Code Generation (Via Cursor CLI)**
- Generate components based on project requirements
- Build pages (home, about, services, contact)
- Implement features from quote breakdown
- Write API routes
- Connect to Supabase (if needed)
- Add styling and animations

**Phase 3: Testing (Autonomous)**
- Run automated tests
- Check for TypeScript errors
- Verify build passes
- Lint code

**Phase 4: Human Review (Manual)**
- You review preview
- Test functionality
- Provide feedback
- Agent iterates

**Phase 5: Final Polish (Autonomous)**
- Fix issues from feedback
- Optimize performance
- Add metadata (SEO)
- Final test run
- Prepare for deployment

**Phase 6: Deploy (Autonomous)**
- Merge code to main branch
- Deploy to Vercel production
- Send completion notification
- Update project status

---

### 3. Agent Status Lifecycle

```
idle → analyzing → planning → working → waiting_review → iterating → completing → done
  ↓                                              ↓
stuck                                         failed
  ↓                                          (escalate)
escalate → human_intervention → resume → ...
```

**Status Descriptions:**
- `idle` - Waiting for work
- `analyzing` - Analyzing project requirements
- `planning` - Creating task breakdown
- `working` - Executing tasks (Cursor CLI building)
- `waiting_review` - Waiting for human review milestone
- `iterating` - Fixing issues from feedback
- `completing` - Finalizing, preparing for deploy
- `done` - Project completed
- `stuck` - Agent blocked, needs help
- `failed` - Agent failed (e.g., unrecoverable error)
- `escalate` - Awaiting human intervention
- `human_intervention` - Human is helping agent
- `resume` - Agent resumed after human help

---

### 4. Task Queue System

**Tasks are queued for agents:**

```
Task Schema:
{
  id: uuid
  project_id: uuid
  agent_id: uuid
  type: string (setup, generate_component, test, deploy, ...)
  description: string
  status: queued | in_progress | completed | failed
  priority: low | medium | high | urgent
  depends_on: [task_id] (tasks that must complete first)
  created_at: timestamp
  started_at: timestamp
  completed_at: timestamp
  result: object (output from task)
  error: string (if failed)
  retry_count: number
}
```

**Task Types:**
- `create_repo` - Create GitHub repository
- `init_project` - Initialize Next.js project
- `generate_component` - Generate React component via Cursor CLI
- `generate_page` - Generate page via Cursor CLI
- `implement_feature` - Implement feature from quote breakdown
- `run_tests` - Run test suite
- `deploy_preview` - Deploy preview to Vercel
- `await_review` - Wait for human review
- `deploy_production` - Deploy to production
- `complete_project` - Mark project complete

---

### 5. Agent Pool Management

**Multiple agents can run in parallel:**

```
Agent Schema:
{
  id: uuid
  name: string (e.g., "Cursor-Agent-1")
  type: cursor_cli | openhands | custom
  status: idle | working | stuck | offline
  current_project_id: uuid | null
  current_task_id: uuid | null
  last_heartbeat: timestamp
  capabilities: string[] (frontend, backend, fullstack, ...)
  max_parallel_tasks: number (default 1)
  created_at: timestamp
}
```

**Agent Types:**
- `cursor_cli` - Frontend development agent
- `openhands` (future, if re-enabled) - Full-stack multi-agent system
- `custom` - Custom agent implementation

---

### 6. Project Tracking & Milestones

**Each project has milestones:**

```
Project Agent Tracking:
{
  project_id: uuid
  agent_id: uuid
  status: idle | active | completed | failed
  started_at: timestamp
  completed_at: timestamp | null
  current_milestone_id: uuid | null
  milestones_completed: number
  milestones_total: number
  agent_logs: [
    {
      timestamp: timestamp
      level: info | warning | error | success
      message: string
      metadata: object
    }
  ]
}
```

---

### 7. Escalation System

**When agents get stuck:**

**Escalation Triggers:**
- Task fails 3+ times
- Timeout (no progress after X minutes)
- Error rate exceeds threshold
- Agent explicitly signals stuck

**Escalation Flow:**
```
Agent Stuck
    ↓
Log error to agent_logs
    ↓
Notify manager (Jarvis)
    ↓
Manager tries to resolve automatically (e.g., retry, alternative approach)
    ↓
If can't resolve → Escalate to human (John)
    ↓
John receives notification
    ↓
John intervenes manually
    ↓
John signals agent to resume
    ↓
Agent continues from last checkpoint
```

---

### 8. Agent Monitoring Dashboard

**Admin dashboard shows:**
- All agents and their status
- Currently running projects
- Agent progress bars
- Recent agent logs
- Escalations requiring attention
- Performance metrics (tasks completed, average time)

---

### 9. GitHub & Vercel Integration

**Automated Git workflow:**
```bash
# Agent executes
git clone repo
git checkout -b feature/task-name
cursor agent run -p "Generate contact form component"
git add .
git commit -m "feat: Add contact form component"
git push origin feature/task-name
# Auto PR created
# Auto review
# Auto merge (if tests pass)
```

**Automated Vercel deployment:**
```bash
# Agent executes
vercel preview --yes  # Deploy preview URL
# Agent waits for review URL ready
# Agent sends preview URL to client
# After human approval:
vercel --prod  # Deploy to production
```

---

### 10. Cursor CLI Integration

**How agents use Cursor CLI:**

**Option A: Direct Command Execution**
```bash
# Agent executes in tmux session
cursor agent run -p "Generate a modern contact form with validation"
cursor agent run -p "Style the contact form to match the brand colors"
```

**Cursor CLI output:**
- Generated code
- Files created/modified
- Build status
- Errors (if any)

**Agent parsing:**
- Cursor CLI success → Mark task completed
- Cursor CLI error → Log error, possibly retry or escalate

**Option B: Tmux Session Control** (tmux skill already available)
```bash
# Agent uses tmux to control Cursor CLI
tmux new-session -d -s cursor-agent-$PROJECT_ID
tmux send-keys -t cursor-agent-$PROJECT_ID "cd /path/to/project" C-m
tmux send-keys -t cursor-agent-$PROJECT_ID "cursor agent run -p '...'" C-m
# Agent waits for completion
# Agent scrapes output via tmux capture-pane
```

---

## Implementation Plan

### Phase 1: Backend Infrastructure (Database Schema)

**New Tables:**
- `agents` - Agent pool management
- `agent_tasks` - Task queue
- `agent_logs` - Agent activity logs
- `project_agent_tracking` - Track agent per project

### Phase 2: Cursor CLI Integration Layer

**Functions:**
- `runCursorAgent(task)` - Execute Cursor CLI for task
- `parseCursorOutput(output)` - Parse Cursor output
- `handleCursorError(error)` - Handle Cursor errors

### Phase 3: Agent Manager (Orchestrator)

**Functions:**
- `activateAgent(projectId)` - Start agent on project
- `assignTask(agentId, taskId)` - Assign task to agent
- `monitorAgent(agentId)` - Check agent status
- `escalateAgent(agentId, reason)` - Escalate to human
- `completeTask(taskId)` - Mark task completed
- `handleStuckAgent(agentId)` - Handle agent errors

### Phase 4: Frontend Dashboard

**Components:**
- AgentMonitor - Show all agents, status, current tasks
- AgentLogs - Agent activity log viewer
- TaskQueue - Show queued tasks, priorities
- ProjectAgentProgress - Show agent progress on project
- Escalations - Show escalations needing attention

### Phase 5: Autonomous Workflow

**End-to-end flow:**
1. Project approved → Agent activates
2. Agent analyzes project → Creates tasks
3. Agent executes tasks via Cursor CLI
4. Agent updates progress in dashboard
5. Agent waits for human review at milestones
6. Human reviews → Agent continues/fixed
7. Agent completes → Deploy to production

---

### Phase 6: Testing & Iteration

**Test scenarios:**
- Activate agent → Verify agent creates repo
- Generate component → Verify Cursor CLI output
- Stuck agent → Verify escalation works
- Human review → Verify agent resumes correctly
- Full project flow → Verify end-to-end autonomy

---

## Success Criteria

**Technical:**
- ✅ Agent activates on project approval
- ✅ Agent creates GitHub repo
- ✅ Agent generates components via Cursor CLI
- ✅ Agent deploys preview to Vercel
- ✅ Agent escalates when stuck
- ✅ Human review works at milestones
- ✅ Agent completes full project autonomously
- ✅ 90%+ tasks completed without human intervention

**Business:**
- ✅ Client receives URL within 2 hours of approval
- ✅ Project costs 80-90% less than traditional (AI vs human hours)
- ✅ Client can review progress in real-time dashboard
- ✅ Quality maintained (human review gates, automated tests)
- ✅ You spend 10-20% of time (vs 100% manually)

---

## Open Questions & Decisions

1. **Cursor CLI limits:** How many parallel Cursor agents can run? Need to test.
2. **Agent timeout:** How long to wait before escalating? Start with 15 minutes.
3. **Milestone approval:** Should agent wait for approval after each milestone or continue? Start with: wait after major milestones.
4. **Agent fallback:** If Cursor CLI fails, what then? Escalate to human for now, add backup agents later.
5. **Code review:** Auto-review or human review? Start with automated tests, human review at milestones.

---

## Non-Technical Notes

**This is the core value:**
> "Autonomous design, human craft"

You don't write code. Agents do. You review, approve, and deploy.

**Your time:**
- 10-20% oversight
- Human review gates
- Client communication
- Strategic decisions

**Agent time:**
- 80-90% actual work
- Code generation, testing, deployment
- Iterating based on feedback

**Result:**
- Higher volume (2-4 projects/quarter vs 1 manually)
- Lower cost (AI vs human hours)
- Consistent quality (automated tests + human gates)
- Scalable (add more agents = more projects)

---

*Last updated: 2026-02-12*
