import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          role: 'client' | 'admin';
        };
        Insert: {
          id: string;
          created_at?: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          role: 'client' | 'admin';
        };
        Update: {
          id: string;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          role?: 'client' | 'admin';
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          project_name: string;
          project_type: 'portfolio' | 'ecommerce' | 'saas' | 'custom';
          status: 'intake' | 'design' | 'development' | 'qa' | 'deployment' | 'completed';
          budget_range: string;
          timeline_weeks: number;
          description: string;
          requirements: object;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          client_id: string;
          project_name: string;
          project_type: 'portfolio' | 'ecommerce' | 'saas' | 'custom';
          budget_range: string;
          timeline_weeks: number;
          description: string;
          requirements?: object;
          status?: 'intake' | 'design' | 'development' | 'qa' | 'deployment' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id: string;
          client_id?: string;
          project_name?: string;
          project_type?: 'portfolio' | 'ecommerce' | 'saas' | 'custom';
          status?: 'intake' | 'design' | 'development' | 'qa' | 'deployment' | 'completed';
          budget_range?: string;
          timeline_weeks?: number;
          description?: string;
          requirements?: object;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          project_id: string;
          amount: number;
          status: 'draft' | 'pending' | 'approved' | 'rejected';
          deposit_amount: number;
          terms: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          amount: number;
          deposit_amount: number;
          terms: string;
          status?: 'draft' | 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id: string;
          project_id?: string;
          amount?: number;
          status?: 'draft' | 'pending' | 'approved' | 'rejected';
          deposit_amount?: number;
          terms?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          project_id: string;
          invoice_number: string;
          amount: number;
          status: 'pending' | 'paid' | 'overdue';
          due_date: string;
          paid_at: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          invoice_number: string;
          amount: number;
          due_date: string;
          status?: 'pending' | 'paid' | 'overdue';
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id: string;
          project_id?: string;
          invoice_number?: string;
          amount?: number;
          status?: 'pending' | 'paid' | 'overdue';
          due_date?: string;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
      };
      communications: {
        Row: {
          id: string;
          project_id: string;
          type: 'email' | 'status_update' | 'requirement' | 'approval';
          subject: string;
          body: string;
          from: string;
          to: string;
          status: 'sent' | 'read' | 'replied';
          created_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          type: 'email' | 'status_update' | 'requirement' | 'approval';
          subject: string;
          body: string;
          from: string;
          to: string;
          status?: 'sent' | 'read' | 'replied';
          created_at?: string;
        };
        Update: {
          id: string;
          project_id?: string;
          type?: 'email' | 'status_update' | 'requirement' | 'approval';
          subject?: string;
          body?: string;
          from?: string;
          to?: string;
          status?: 'sent' | 'read' | 'replied';
          created_at?: string;
        };
      };
    };
  };
};
