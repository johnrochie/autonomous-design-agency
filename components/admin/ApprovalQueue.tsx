'use client';

import React, { useEffect, useState } from 'react';
import {
  getAllPosts,
  approvePost,
  rejectPost,
  SocialPost,
} from '@/lib/social/social-service';
import Link from 'next/link';

export default function ApprovalQueue() {
  const [pendingPosts, setPendingPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPendingPosts();
  }, []);

  async function loadPendingPosts() {
    setLoading(true);
    try {
      const posts = await getAllPosts('pending_approval');
      setPendingPosts(posts);
    } catch (error) {
      console.error('Error loading pending posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(postId: string) {
    setProcessing(prev => new Set(prev).add(postId));

    try {
      await approvePost(postId);
      await loadPendingPosts();
    } catch (error: any) {
      console.error('Error approving post:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }

  async function handleReject(postId: string) {
    if (!confirm('Reject this post?')) return;

    setProcessing(prev => new Set(prev).add(postId));

    try {
      await rejectPost(postId);
      await loadPendingPosts();
    } catch (error: any) {
      console.error('Error rejecting post:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }

  function getPlatformBadge(platform: string): string {
    const colors: Record<string, string> = {
      twitter: 'bg-black text-white',
      facebook: 'bg-blue-600 text-white',
      linkedin: 'bg-blue-700 text-white',
      instagram: 'bg-pink-500 text-white',
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  }

  function getPlatformLabel(platform: string): string {
    const labels: Record<string, string> = {
      twitter: 'Twitter (X)',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
    };
    return labels[platform] || platform.toUpperCase();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Approval Queue</h2>
          <p className="text-gray-600">Review and approve AI-generated social media posts</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading pending posts...
          </div>
        ) : pendingPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <div>No pending posts</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  {/* Left side - post content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformBadge(post.platform)}`}
                      >
                        {getPlatformLabel(post.platform)}
                      </span>
                      {post.ai_generated && (
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium">
                          AI-Generated
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Post content */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-3">
                      <p className="text-gray-900 whitespace-pre-line">{post.content}</p>
                      {post.hashtags.length > 0 && (
                        <p className="mt-2 text-cyan-600">
                          {post.hashtags.map(tag => tag).join(' ')}
                        </p>
                      )}
                    </div>

                    {/* Post stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Characters:</span>{' '}
                        {post.content.length}
                      </div>
                    </div>
                  </div>

                  {/* Right side - actions */}
                  <div className="ml-6 flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={processing.has(post.id)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing.has(post.id) ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={processing.has(post.id)}
                      className="px-6 py-2 bg-red-100 text-red-800 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {pendingPosts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Pending Posts</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {pendingPosts.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">AI-Generated</div>
            <div className="text-2xl font-bold text-cyan-600 mt-1">
              {pendingPosts.filter(p => p.ai_generated).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Manual Posts</div>
            <div className="text-2xl font-bold text-gray-600 mt-1">
              {pendingPosts.filter(p => !p.ai_generated).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
