'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle, Zap, Clock, DollarSign, Info, Upload as UploadIcon } from 'lucide-react';
import Link from 'next/link';

export default function IntakePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'portfolio',
    description: '',
    features: [],
    timeline: '4-6',
    budget: '10-15',
  });

  const availableFeatures = [
    'Authentication & User Accounts',
    'Payment Processing',
    'Content Management System (CMS)',
    'Blog/News Section',
    'Contact Forms & Lead Capture',
    'Image Gallery/Portfolio',
    'Live Chat/Support Widget',
    'Booking System',
    'Inventory Management',
    'Dashboard/Analytics',
    'Real-time Features',
    'Mobile App Integration',
  ];

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(5);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="inline-flex items-center text-cyan-400">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
            <h1 className="font-serif text-xl font-bold">New Project Intake</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="font-serif text-2xl font-bold">Tell us about your project</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="E.g., Company Website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Description</label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Describe your project, goals, target audience..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!formData.projectName || !formData.description}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-20">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="font-serif text-3xl font-bold mb-4">Project Submitted!</h2>
            <p className="text-xl text-gray-400 mb-8">We're generating your personalized quote now.</p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
