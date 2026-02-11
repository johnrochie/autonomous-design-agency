'use client';

import { useState, useEffect, useRef } from 'react';
import { sendMessage, getMessages, markMessagesAsRead, subscribeToMessages } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  sender_type: 'client' | 'agent';
  content: string;
  read_at: string | null;
  created_at: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  } | null;
}

interface MessagePanelProps {
  projectId: string;
  currentUserId: string;
  currentUserType: 'client' | 'agent';
  isClientView?: boolean;
}

export default function MessagePanel({
  projectId,
  currentUserId,
  currentUserType,
  isClientView = false,
}: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [projectId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (isClientView) {
      // Client: Mark messages as read when viewing
      markAsRead();
    }

    const channel = subscribeToMessages(projectId, (payload: any) => {
      console.log('New message received:', payload);
      if (payload.eventType === 'INSERT') {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();

        if (isClientView && payload.new.sender_type === 'agent') {
          // Mark incoming agent messages as read for client
          markAsRead();
        }
      }
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [projectId, isClientView]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(projectId);
      setMessages(data);
    } catch (err: any) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(projectId, currentUserId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);

      const sent = await sendMessage(
        projectId,
        currentUserId,
        currentUserType,
        newMessage.trim()
      );

      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
      scrollToBottom();
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg
              className="w-12 h-12 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-2">Start a conversation about this project</p>
          </div>
        ) : (
          messages.map((message, idx) => {
            const isOwnMessage = message.sender_id === currentUserId;
            const senderName = message.profiles?.full_name || message.profiles?.email || 'Unknown';
            const senderRole = message.profiles?.role || '';

            return (
              <div
                key={message.id || `msg-${idx}`}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white font-medium ${
                      isOwnMessage
                        ? 'bg-cyan-500'
                        : senderRole === 'admin'
                        ? 'bg-purple-500'
                        : 'bg-gray-500'
                    }`}
                  >
                    {senderName.charAt(0).toUpperCase()}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`mx-3 px-4 py-3 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-cyan-500 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      {/* Sender name for incoming messages */}
                      {!isOwnMessage && (
                        <span className="text-xs font-semibold mb-1 text-gray-600">
                          {senderName}
                          {senderRole === 'admin' && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                              Admin
                            </span>
                          )}
                        </span>
                      )}

                      {/* Message content */}
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>

                      {/* Timestamp */}
                      <span
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-cyan-100' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
