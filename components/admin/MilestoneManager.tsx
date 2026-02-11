'use client';

import { useState, useEffect } from 'react';
import {
  getMilestones,
  createMilestone,
  updateMilestoneStatus,
  updateMilestone,
  deleteMilestone,
  type Milestone,
} from '@/lib/supabase';
import { Plus, Trash2, Edit, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';

interface MilestoneManagerProps {
  projectId: string;
}

export default function MilestoneManager({ projectId }: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const data = await getMilestones(projectId);
      setMilestones(data);
    } catch (err: any) {
      console.error('Error loading milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || saving) return;

    try {
      setSaving(true);

      const newMilestone = await createMilestone(projectId, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        due_date: formData.due_date || undefined,
      });

      setMilestones((prev) => [...prev, newMilestone]);
      setFormData({ name: '', description: '', due_date: '' });
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Error creating milestone:', err);
      alert('Failed to create milestone: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMilestone || !formData.name.trim() || saving) return;

    try {
      setSaving(true);

      const updated = await updateMilestone(editingMilestone.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        due_date: formData.due_date || undefined,
      });

      setMilestones((prev) =>
        prev.map((m) => (m.id === editingMilestone.id ? updated : m))
      );
      setEditingMilestone(null);
      setFormData({ name: '', description: '', due_date: '' });
    } catch (err: any) {
      console.error('Error updating milestone:', err);
      alert('Failed to update milestone: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (milestone: Milestone, newStatus: Milestone['status']) => {
    try {
      const updated = await updateMilestoneStatus(milestone.id, newStatus);
      setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? updated : m)));
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (milestone: Milestone) => {
    if (!confirm(`Delete milestone "${milestone.name}"?`)) return;

    try {
      await deleteMilestone(milestone.id);
      setMilestones((prev) => prev.filter((m) => m.id !== milestone.id));
    } catch (err: any) {
      console.error('Error deleting milestone:', err);
      alert('Failed to delete milestone: ' + err.message);
    }
  };

  const startEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      name: milestone.name,
      description: milestone.description || '',
      due_date: milestone.due_date || '',
    });
    setShowAddForm(false);
  };

  const statusColors: Record<Milestone['status'], string> = {
    pending: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-600',
    completed: 'bg-green-100 text-green-600',
    blocked: 'bg-red-100 text-red-600',
  };

  const statusIcons: Record<Milestone['status'], any> = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
    blocked: AlertCircle,
  };

  const progress =
    milestones.length > 0
      ? Math.round((milestones.filter((m) => m.status === 'completed').length / milestones.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Project Milestones</h2>
          <p className="text-sm text-gray-500 mt-1">{milestones.length} milestones • {progress}% complete</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingMilestone(null);
            setFormData({ name: '', description: '', due_date: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {/* Progress Bar */}
      {milestones.length > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingMilestone) && (
        <form onSubmit={editingMilestone ? handleEditSubmit : handleAddSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg animate-fadeIn">
          <h3 className="font-medium text-gray-900 mb-3">{editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Milestone name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                placeholder="Brief description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : editingMilestone ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMilestone(null);
                  setFormData({ name: '', description: '', due_date: '' });
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">No milestones yet</p>
          <p className="text-sm mt-1">Add milestones to track project progress</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const StatusIcon = statusIcons[milestone.status];
            return (
              <div
                key={milestone.id}
                className={`p-4 rounded-lg border transition-all ${
                  milestone.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : milestone.status === 'blocked'
                    ? 'bg-red-50 border-red-200'
                    : milestone.status === 'in_progress'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={`w-5 h-5 ${statusColors[milestone.status].split(' ')[1]}`} />
                      <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[milestone.status]}`}
                      >
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {milestone.due_date && (
                        <span>
                          Due: {new Date(milestone.due_date).toLocaleDateString('en-GB')}
                        </span>
                      )}
                      {milestone.status === 'completed' && milestone.completed_at && (
                        <span>
                          Completed: {new Date(milestone.completed_at).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Status Change Button */}
                    <select
                      value={milestone.status}
                      onChange={(e) => handleStatusChange(milestone, e.target.value as Milestone['status'])}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    <button
                      onClick={() => startEdit(milestone)}
                      className="p-2 text-gray-500 hover:text-cyan-500 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(milestone)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
