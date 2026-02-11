# Phase 3 Implementation Roadmap - Detail

## Build Order & Dependencies

### Phase 3A: Admin Dashboard (Foundation) - START HERE
**Why First:** You need visibility before you can manage anything

**Dependencies:** None

**Pages to Build:**
1. `/admin/dashboard` - Overview (stats, recent projects)
2. `/admin/projects` - List all projects with filters
3. `/admin/projects/[id]` - Detailed project view

**Components:**
- ProjectCard (list view)
- ProjectStatusBadge (status indicator)
- StatCard (overview metrics)
- ProjectFilterBar (filter by status, type)

**Data Functions:**
- `getAllProjects()` - Retrieve all projects from Supabase
- `getProjectStats()` - Calculate overview metrics
- `filterProjects(filters)` - Filter project list

---

### Phase 3C: Client Intake Form Fix - SECOND
**Why Second:** Client can actually submit requests before we process them

**Dependencies:** Phase 3A (to see what comes in)

**Changes Required:**
1. Fix `app/client/intake/page.tsx` to save to Supabase
2. Add form validation
3. Store in `projects` and `clients` tables
4. Update `project.status` to 'intake'
5. Redirect to success/confirmation page

**Data Flows:**
```
Form submit → createClient() → createProject() → updateProfiles()
```

**Supabase Functions to Add:**
```typescript
// lib/supabase.ts additions
export async function createClientIntake(data: IntakeData) {
  // Create client record
  // Create project record
  // Return project ID
}
```

---

### Phase 3B: AI Quote Generation - THIRD
**Why Third:** Now we have projects to quote

**Dependencies:** Phase 3C (projects exist in database)

**Parts to Build:**
1. `lib/quote-generator.ts` - Quote calculation logic
   - Base rates by project type
   - Complexity multipliers
   - Feature-based adjustments
   - Timeline estimation

2. `/admin/projects/[id]/quote` - Quote review page
   - Show AI-generated quote
   - Allow manual edits
   - Generate detailed breakdown
   - Approve/Regenerate buttons

3. Quote breakdown API/Function
   - Save to `projects.quote_amount_cents`
   - Create rows in `quote_breakdowns` table

**Algorithm (v1 - Formula-based):**
```typescript
const quote = {
  portfolio: { min: 8000, max: 12000, baseWeeks: 2 },
  ecommerce: { min: 15000, max: 25000, baseWeeks: 4 },
  saas: { min: 25000, max: 50000, baseWeeks: 8 },
  custom: { min: 50000, max: 100000, baseWeeks: 12 },
};

function calculateQuote(project) {
  const base = getBaseRate(project.type, project.complexity);
  const features = calculateFeatureCosts(project.features);
  const total = base + features;

  return {
    amount: total,
    breakdown: [
      { phase: 'design', component: 'UI/UX', days: 10, rate: 500, amount: 5000 },
      { phase: 'development', component: 'Frontend & Backend', days: 15, rate: 500, amount: 7500 },
      // ... more breakdown rows
    ],
  };
}
```

---

### Phase 3D: Client Messaging System - FOURTH
**Why Fourth:** Clients can ask questions about quotes

**Dependencies:** Phase 3B (quotes exist to discuss)

**Pages:**
1. `/client/projects/[id]/messages` - Client view
2. `/admin/projects/[id]/messages` - Admin view (same data, different UI)

**Components:**
- MessageThread (chat interface)
- MessageInput (input field + send button)
- MessageBubble (agent vs client styling)
- RealTimeSubscription (auto-updates)

**Supabase Real-time:**
```typescript
// Subscribe to project messages
supabase
  .channel(`project-${projectId}-messages`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `project_id=eq.${projectId}`,
  }, (payload) => {
    // Add new message to chat
  })
  .subscribe();
```

---

### Phase 3E: Project Tracking - FIFTH
**Why Fifth:** Track work after quote accepted

**Dependencies:** Phase 3B (projects confirmed) + Phase 3D (client can see updates)

**Pages:**
1. `/client/projects/[id]` - Client project view (status, milestones)
2. `/admin/projects/[id]/roadmap` - Admin project management

**Components:**
- ProgressBar (overall progress %)
- MilestoneCard (individual milestone with status)
- StatusBadge (current pipeline stage)
- TimelineView (milestone dates)

**Pipeline States:**
```
intake → quoted → confirmed → design → development → qa → deployment → completed
```

**Milestone Management:**
- Admin can create/edit/delete milestones
- Admin updates milestone status (pending → in_progress → completed)
- Clients see read-only progress

---

## Implementation Order (Detailed)

### Sprint 1: Admin Dashboard (1-2h)
```
1. Build /admin/dashboard page (overview stats)
2. Build /admin/projects page (list all projects)
3. Build /admin/projects/[id] page (detailed view)
4. Add ProjectCard component
5. Add ProjectStatusBadge component
6. Add StatCard component
7. Create getAllProjects() in lib/supabase.ts
8. Test: You can see all projects in admin dashboard
```

### Sprint 2: Intake Form Fix (1-2h)
```
1. Fix app/client/intake/page.tsx submit handler
2. Add createClientIntake() to lib/supabase.ts
3. Add form validation
4. Save to clients table
5. Save to projects table
6. Create success/confirmation page
7. Test: Client can submit project → shows in admin dashboard
```

### Sprint 3: Quote Generator v1 (2-3h)
```
1. Build lib/quote-generator.ts (formula-based)
2. Add calculateQuote() function
3. Add generateQuoteBreakdown() function
4. Build /admin/projects/[id]/quote page
5. Add approve/regenerate buttons
6. Save quote to database
7. Create quote breakdown rows
8. Test: System generates quote for project
```

### Sprint 4: Messaging System (2-3h)
```
1. Build MessageThread component (chat UI)
2. Build MessageInput component
3. Build MessageBubble component
4. Create sendMessage() in lib/supabase.ts
5. Add real-time subscription for messages
6. Build /client/projects/[id]/messages page
7. Build /admin/projects/[id]/messages page
8. Add unread indicator
9. Test: Real-time messaging works
```

### Sprint 5: Project Tracking (2-3h)
```
1. Build ProgressBar component
2. Build MilestoneCard component
3. Build TimelineView component
4. Create createMilestone() in lib/supabase.ts
5. Create updateMilestoneStatus() in lib/supabase.ts
6. Build /client/projects/[id] page (status, milestones)
7. Build /admin/projects/[id]/roadmap page
8. Add milestone edit UI (admin only)
9. Test: Admin can manage milestones, clients see progress
```

---

## Success Test Cases

### Phase 3 Complete When:
- [ ] Client submits intake form → appears in admin dashboard ✅
- [ ] Admin clicks "Generate Quote" → shows breakdown
- [ ] Admin approves quote → client notified
- [ ] Client sends message → admin sees it in real-time
- [ ] Admin updates milestone → client sees progress
- [ ] End-to-end: Intake → Quote → Confirmed → Tracking → Messaging

---

## Let's Start With Sprint 1: Admin Dashboard
