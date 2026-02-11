'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Loader2, Upload as UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { createClientIntake } from '@/lib/supabase';

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Client info
    fullName: '',
    email: '',
    companyName: '',
    industry: '',

    // Project info
    projectName: '',
    projectType: 'portfolio' as 'portfolio' | 'ecommerce' | 'saas' | 'custom',
    description: '',
    features: [] as string[],
    timelineRange: '2-4',
    budgetRange: '8-12',
  });

  const availableFeatures = [
    'Authentication & User Accounts',
    'Payment Processing (Stripe)',
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
    'Multi-language Support',
    'Email Notifications',
    'Search Functionality',
  ];

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push('/dashboard');
  };

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // Create client intake and project
      const result = await createClientIntake({
        email: formData.email,
        fullName: formData.fullName,
        companyName: formData.companyName,
        industry: formData.industry,
      });

      // Note: For now, we're just creating the client record
      // In the next phase (3B), we'll create the project and generate a quote
      // For now, we'll show success and the project will be visible after manual setup

      setLoading(false);
      setStep(5);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to submit project');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <h1 className="font-serif text-xl font-bold">Project Intake</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  s <= step
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-800 rounded-full">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Client Information */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Your Information</h2>
              <p className="text-gray-400">Let us know how to contact you</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Acme Inc. (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select an industry</option>
                  <option value="Technology">Technology</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Hospitality">Hospitality & Restaurants</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Creative Services">Creative Services</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!formData.fullName || !formData.email}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Project Details
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Project Details */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Project Details</h2>
              <p className="text-gray-400">Tell us about your project</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="E.g., Company Website, Online Store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="portfolio">Portfolio Website</option>
                  <option value="ecommerce">E-commerce Store</option>
                  <option value="saas">SaaS Application</option>
                  <option value="custom">Custom Platform</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Describe your project in detail. What are your goals? Who is your target audience? What makes your product or service unique?"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.projectName || !formData.description}
                className="flex-1 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Features
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Features */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Features</h2>
              <p className="text-gray-400">Select the features you need (optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFeatures.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    formData.features.includes(feature)
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-[#0f0f0f] border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                      formData.features.includes(feature)
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'bg-transparent border-gray-600'
                    }`}>
                      {formData.features.includes(feature) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span>{feature}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
              >
                Next: Timeline & Budget
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Timeline & Budget */}
        {step === 4 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Timeline & Budget</h2>
              <p className="text-gray-400">Your expectations help us provide accurate quotes</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Desired Timeline
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: '2-4', label: '2-4 weeks' },
                    { value: '4-8', label: '4-8 weeks' },
                    { value: '8-12', label: '8-12 weeks' },
                    { value: '12+', label: '12+ weeks' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, timelineRange: option.value as any })}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        formData.timelineRange === option.value
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'bg-[#0f0f0f] border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Budget Range (in thousands)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: '8-12', label: '€8k - €12k' },
                    { value: '15-25', label: '€15k - €25k' },
                    { value: '25-50', label: '€25k - €50k' },
                    { value: '50-100', label: '€50k+' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, budgetRange: option.value as any })}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        formData.budgetRange === option.value
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'bg-[#0f0f0f] border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Project'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center py-20 animate-fadeIn">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
            <h2 className="font-serif text-3xl font-bold mb-4">Project Submitted!</h2>
            <p className="text-xl text-gray-400 mb-8">
              Your project request has been received. Our AI will generate a personalized quote for you soon, and we'll be in touch with next steps.
            </p>
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
