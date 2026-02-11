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
  // First, create client record
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      email: clientData.email,
      full_name: clientData.fullName,
      company_name: clientData.companyName,
      industry: clientData.industry,
    })
    .select()
    .single();

  if (clientError) {
    // Client might already exist
    console.log('Client already exists, fetching...');
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('email', clientData.email)
      .single();

    if (!existingClient) {
      throw clientError;
    }

    return existingClient;
  }

  return client;
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
