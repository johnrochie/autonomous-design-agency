'use client';

import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}

import dynamic from 'next/dynamic';

// Dynamically import with no SSR to avoid Supabase initialization issues
const AnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard'),
  { ssr: false }
);
