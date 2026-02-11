import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Return null during build time when env vars are not available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth functions
export async function signUp(email: string, password: string, fullName: string) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return user;
}

export async function getCurrentUserProfile() {
  if (!supabase) throw new Error('Supabase client not initialized');
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    // Profile might not exist yet, create it
    console.log('Profile not found, creating...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        role: 'client',
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return newProfile;
  }

  return data;
}

export async function resetPassword(email: string) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw error;
  }
}

// Database functions
export async function getClientProjects(clientEmail: string) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createProject(projectData: any) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createClientIntake(clientData: any) {
  if (!supabase) throw new Error('Supabase client not initialized');

  // First, create or get client record
  let client;

  // Check if client already exists
  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('email', clientData.email)
    .single();

  if (existingClient) {
    client = existingClient;
  } else {
    // Create new client
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        email: clientData.email,
        full_name: clientData.fullName,
        company_name: clientData.companyName,
        industry: clientData.industry,
      })
      .select()
      .single();

    if (clientError) throw clientError;
    client = newClient;
  }

  // Create project record
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      client_id: client.id,
      name: clientData.projectName,
      type: clientData.projectType,
      status: 'intake',
      description: clientData.description,
      features: clientData.features || [],
      timeline_range: clientData.timelineRange,
      budget_range: clientData.budgetRange,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  return { client, project };
}

// Update project (used when generating quote)
export async function updateProject(projectId: string, updates: any) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Generate and save quote for a project
 */
export async function generateProjectQuote(projectId: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  // Import quote generator
  const { calculateQuote } = await import('./quote-generator');

  // Get project data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError) throw projectError;
  if (!project) throw new Error('Project not found');

  // Calculate quote
  const quote = calculateQuote({
    type: project.type as any,
    description: project.description,
    features: project.features || [],
    timelineRange: project.timeline_range || undefined,
    budgetRange: project.budget_range || undefined,
  });

  // Update project with quote amount and status
  const { data: updatedProject, error: updateError } = await supabase
    .from('projects')
    .update({
      quote_amount_cents: quote.amountCents,
      quote_status: 'pending',
      status: 'quoted',
    })
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Insert quote breakdown rows
  const { error: breakdownError } = await supabase
    .from('quote_breakdowns')
    .insert(
      quote.breakdown.map((item) => ({
        project_id: projectId,
        phase: item.phase,
        component: item.component,
        description: item.description,
        estimated_days: item.estimatedDays,
        rate_per_day: item.ratePerDay,
        amount_cents: item.amountCents,
      }))
    );

  if (breakdownError) throw breakdownError;

  return {
    project: updatedProject,
    quote,
  };
}

/**
 * Approve quote
 */
export async function approveQuote(projectId: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('projects')
    .update({
      quote_status: 'accepted',
      status: 'confirmed',
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Reject quote
 */
export async function rejectQuote(projectId: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('projects')
    .update({
      quote_status: 'rejected',
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Real-time subscriptions
export function subscribeToMessages(projectId: string | null, callback: (payload: any) => void) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  if (!projectId) return null;

  const channel = supabase
    .channel(`messages:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

// ========================
// Admin Functions
// ========================

// Get all projects (admin only)
export async function getAllProjects() {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Get project stats for dashboard
export async function getProjectStats() {
  if (!supabase) throw new Error('Supabase client not initialized');

  const [allProjectsResult, newProjectsResult, quotedProjectsResult, confirmedProjectsResult] = await Promise.all([
    supabase.from('projects').select('id, status', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'intake'),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'quoted'),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
  ]);

  return {
    total: allProjectsResult.count || 0,
    new: newProjectsResult.count || 0,
    quoted: quotedProjectsResult.count || 0,
    confirmed: confirmedProjectsResult.count || 0,
  };
}

// Get single project by ID
export async function getProjectById(projectId: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) {
    throw new Error(`Invalid project ID format: ${projectId}`);
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (*),
      quote_breakdowns (*)
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    // Better error message
    console.error('getProjectById error:', error);
    throw new Error(`Failed to load project: ${error.message || error.code}`);
  }

  return data;
}

// Update project status
export async function updateProjectStatus(projectId: string, status: string) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Filter projects by criteria
export async function filterProjects(filters: { status?: string; type?: string }) {
  if (!supabase) throw new Error('Supabase client not initialized');

  let query = supabase
    .from('projects')
    .select(`
      *,
      clients (*)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
