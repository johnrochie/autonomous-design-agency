'use client';

import React, { useState, useEffect } from 'react';
import { generateSocialPost } from '@/lib/social/content-generator';
import {
  createSocialPost,
  CreatePostInput,
  SocialPlatform,
  GeneratedPost,
  SocialPost,
  ContentTopic,
} from '@/lib/social/social-service';
import { supabase } from '@/lib/supabase';

export default function CreatePostGenerator() {
  const [platform, setPlatform] = useState<SocialPlatform>('twitter');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [generated, setGenerated] = useState<GeneratedPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      // TODO: Load from database
      setTopics([
        'AI Web Development',
        'Autonomous Agents',
        'No-Code/Low-Code',
        'SaaS Trends',
        'Tech Innovation',
      ]);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  }

  async function handleGenerate() {
    if (!topic.trim()) return;

    setLoading(true);
    setGenerated(null);

    try {
      const post = await generateSocialPost(platform, topic, context || undefined);
      setGenerated(post);
    } catch (error: any) {
      console.error('Error generating post:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    if (!generated) return;

    setPosting(true);

    try {
      const input: CreatePostInput = {
        platform: generated.platform,
        content: generated.content,
        hashtags: generated.hashtags,
        ai_generated: true,
        scheduled_at: generated.suggested_schedule, // Schedule at suggested time
        created_by: await getCurrentUserId(),
      };

      const post = await createSocialPost(input);
      const postId = post.id;

      // Auto-approve since AI generated it
      try {
        const { approvePost } = await import('@/lib/social/social-service');
        await approvePost(postId, generated.suggested_schedule);
      } catch (error) {
        console.error('Error auto-approving post:', error);
      }

      setGenerated(null);
      setTopic('');
      setContext('');

      alert('Post created and scheduled! 🚀');
    } catch (error: any) {
      console.error('Error posting:', error);
      alert('Error: ' + error.message);
    } finally {
      setPosting(false);
    }
  }

  async function getCurrentUserId(): Promise<string> {
    if (!supabase) return '';
    const result = await supabase.auth.getUser();
    return result.data?.user?.id || '';
  }

  function getPlatformLabel(platform: SocialPlatform): string {
    const labels: Record<SocialPlatform, string> = {
      twitter: 'Twitter (X)',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
    };
    return labels[platform];
  }

  function getPlatformColor(platform: SocialPlatform): string {
    const colors: Record<SocialPlatform, string> = {
      twitter: 'bg-black text-white hover:bg-gray-900',
      facebook: 'bg-blue-600 text-white hover:bg-blue-700',
      linkedin: 'bg-blue-700 text-white hover:bg-blue-800',
      instagram: 'bg-pink-500 text-white hover:bg-pink-600',
    };
    return colors[platform];
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Generate AI Social Media Post</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Platform selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="twitter">Twitter (X)</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          {/* Topic input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., AI Web Development"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Context input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Context (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add more details about the topic..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={2}
            />
          </div>
        </div>

        {/* Generate button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className={`px-6 py-2 ${getPlatformColor(platform)} rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {loading ? 'Generating...' : 'Generate Post'}
          </button>

          {/* Topic suggestions */}
          <div className="flex gap-2 flex-wrap">
            {topics.slice(0, 5).map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated post preview */}
      {generated && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Generated Post for {getPlatformLabel(generated.platform)}
              </h3>
              <p className="text-sm text-gray-600">
                AI Confidence: {(generated.confidence * 100).toFixed(0)}% • 
                Confidence: {generated.confidence > 0.8 ? 'High ✅' : 'Medium ⚠️'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformColor(generated.platform)}`}>
              {getPlatformLabel(generated.platform)}
            </span>
          </div>

          {/* Post content */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-gray-900 whitespace-pre-line">{generated.content}</p>
            {generated.hashtags.length > 0 && (
              <p className="mt-2 text-cyan-600">
                {generated.hashtags.map(tag => tag).join(' ')}
              </p>
            )}
          </div>

          {/* Post stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Scheduled:</span>
                <span>{new Date(generated.suggested_schedule).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Suggested Time:</span>
                <span>{new Date(generated.suggested_schedule).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Character Count:</span>
                <span>{generated.content.length}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePost}
              disabled={posting}
              className={`px-6 py-2 ${getPlatformColor(generated.platform)} rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {posting ? 'Creating...' : 'Create & Schedule Post'}
            </button>
            <button
              onClick={() => setGenerated(null)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-2 border border-cyan-500 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
