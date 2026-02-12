# SQL Schema Testing Guide - Lessons Learned

## The Problem

We failed hard today because:
1. **Jest tests don't validate PostgreSQL syntax** - Only check TypeScript compilation
2. **SQL schemas had circular references** due to `REFERENCES` clauses in `CREATE TABLE`
3. **Combined activation script (ACTIVATE_ALL.sql)** had multiple syntax errors
4. **Individual schemas also had the same FK ordering issues**

## Root Causes

### 1. Circular References
```sql
-- WRONG (causes errors):
CREATE TABLE public.agent_tasks (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,  -- projects MUST exist first
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL     -- agents MUST exist first
);

-- WRONG (agents created AFTER agent_tasks):
CREATE TABLE public.agents (
  current_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL
);

-- ERROR: relation "public.agents" does not exist (agents created later!)
```

### 2. Malformed JSON/Array Defaults
```sql
-- WRONG (syntax errors):
agent_logs JSONB[] DEFAULT '[]',         -- 22P02: malformed array literal
hashtags TEXT[] DEFAULT '{}'::jsonb,     -- Wrong type cast
capabilities JSONB[] DEFAULT '{}'::jsonb   -- Type mismatch 42804

-- CORRECT:
agent_logs JSONB[]                      -- No default
hashtags TEXT[]                         -- No default
metadata JSONB DEFAULT '{}'              -- No type cast needed
```

## The Solution

### Proper Schema Structure

```sql
-- ============================================
-- STEP 1: CREATE TABLES (no foreign keys)
-- ============================================

CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  agent_id UUID,
  -- ... columns ...
);

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_project_id UUID,
  -- ... columns ...
);

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);

-- ============================================
-- STEP 3: ADD FOREIGN KEYS (after tables exist)
-- ============================================

ALTER TABLE public.agent_tasks ADD CONSTRAINT fk_agent_tasks_project
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.agents ADD CONSTRAINT fk_agents_project
  FOREIGN KEY (current_project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- ============================================
-- STEP 4: RLS POLICIES
-- ============================================

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all tasks" ON public.agent_tasks;
CREATE POLICY "Admins can read all tasks" ON public.agent_tasks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================
-- STEP 5: FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_agent_heartbeat(p_agent_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE public.agents SET last_heartbeat = NOW(), updated_at = NOW() WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agents_updated_at ON public.agents;
CREATE TRIGGER trigger_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_agents_updated_at();

-- ============================================
-- STEP 6: SEED DATA
-- ============================================

INSERT INTO public.agents (name, type, status, capabilities, max_parallel_tasks)
VALUES ('Cursor-Agent-1', 'cursor_cli', 'idle', ARRAY['frontend']::JSONB[], 1);
```

## Validation Checklist

Before committing any SQL schema, verify:

### ✓ Syntax Checks
- [ ] No REFERENCES clauses in CREATE TABLE
- [ ] All FKs use ALTER TABLE ... ADD CONSTRAINT
- [ ] No JSONB/JSON arrays with DEFAULT '[]'
- [ ] No casts needed for JSONB DEFAULT '{}'
- [ ] All TEXT[]/UUID[]/JSONB[] have no defaults or proper defaults

### ✓ RLS Policies
- [ ] DROP POLICY IF EXISTS before CREATE POLICY
- [ ] Never use CREATE POLICY IF NOT EXISTS (PostgreSQL doesn't support it)
- [ ] All policy names quoted: "Name Here"
- [ ] All policies referencing auth.uid() have EXISTS subqueries

### ✓ Testing Strategy

**Option A: Local Docker (Recommended)**
```bash
# Start test database
docker run --name test-db -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres:16
docker start test-db

# Create test database
docker exec -i test-db psql -U postgres -c "CREATE DATABASE test"

# Test schema (with mock dependencies)
docker exec -i test-db psql -U postgres -d test < schema-file.sql
```

**Option B: Supabase CLI Local**
```bash
npm install -g supabase
supabase init
supabase start

# Test against local instance
cat schema-file.sql | psql postgresql://postgres:postgres@localhost:54322/postgres
```

**Option C: Production Supabase (LAST RESORT)**
1. Create a separate test project in Supabase
2. Test schemas there (not your main project)
3. Once verified, run on production

### ✓ Common Errors and Fixes

**Error: 42P01: relation "public.X" does not exist**
- Cause: Table X referenced in CREATE TABLE or ALTER TABLE before it was created
- Fix: Ensure all tables are created BEFORE adding FKs that reference them

**Error: 22P02: malformed array literal**
- Cause: `JSONB[] DEFAULT '[]'` or similar
- Fix: Remove DEFAULT from array types, or use proper array literal syntax

**Error: 42804: column is of type X but default expression is of type Y**
- Cause: Wrong default type (e.g., `JSONB[] DEFAULT '{}'`)
- Fix: Remove default or use correct type: `JSONB DEFAULT '{}'`

**Error: 42601: syntax error at or near "IF NOT EXISTS"**
- Cause: `CREATE POLICY IF NOT EXISTS` (not supported)
- Fix: Use `DROP POLICY IF EXISTS` + `CREATE POLICY`

## Quick Test Command

```bash
# After rewriting a schema, test it locally:
cat schema-file.sql | docker exec -i test-db psql -U postgres -d test 2>&1 | grep -E "ERROR|COMPLETED|Successfully"
```

Should return nothing (no errors) or success messages.

## Commit Process

1. Rewrite schema file
2. Test locally against Docker Postgres
3. Fix any errors found
4. Commit with descriptive message
5. Push to GitHub
6. Update docs/ACTIVATION.md

## Future Improvements

1. **Add automated SQL testing to CI/CD**
   - Use Docker to spin up Postgres in tests
   - Run all schemas on every commit
   - Block merge if SQL fails

2. **Create SQL linting rules**
   - Custom linter for PostgreSQL syntax
   - Check for REFERENCES in CREATE TABLE
   - Validate RLS policy syntax

3. **Pre-commit hooks**
   - Run SQL through psql --parse-only
   - Check for common anti-patterns

---

**Remember:** Jest tests ≠ Real database tests. Always validate SQL against actual PostgreSQL before deployment.
