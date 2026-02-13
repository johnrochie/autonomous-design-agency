// Client can accept or decline their quote
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function QuoteActions({ projectId, projectStatus, quoteStatus }: { projectId: string; projectStatus?: string; quoteStatus?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await supabase
        .from('projects')
        .update({
          status: 'confirmed',
          quote_status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);

      // Refresh the page after 1.5 seconds
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to accept quote');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this quote? The project will be cancelled.')) {
      return;
    }

    setDeclining(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await supabase
        .from('projects')
        .update({
          status: 'cancelled',
          quote_status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);

      // Refresh after 1.5 seconds
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to decline quote');
    } finally {
      setDeclining(false);
    }
  };

  // Don't show buttons if already confirmed, cancelled, or not quoted yet
  if (!projectStatus || projectStatus === 'confirmed' || projectStatus === 'cancelled' || projectStatus !== 'quoted') {
    return null;
  }

  if (success) {
    return (
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
        <p className="text-green-400 font-medium">Updated successfully!</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl">
      <h3 className="font-serif text-lg font-bold mb-4">Take Action on Quote</h3>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-700/30 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          {accepting ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Accept Quote
            </>
          )}
        </button>

        <button
          onClick={handleDecline}
          disabled={declining}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700/30 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          {declining ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <>
              <X className="w-4 h-4" />
              Decline Quote
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-gray-400 mt-3 text-center">
        Accepting this quote will begin work on your project.
      </p>
    </div>
  );
}
