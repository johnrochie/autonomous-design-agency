'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle, Zap, Clock, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  projectName: string;
  projectType: 'portfolio' | 'ecommerce' | 'saas' | 'custom';
  description: string;
  features: string[];
  timeline: string;
  budget: string;
  examplesSites: string;
  companyName: string;
  industry: string;
  logo?: string;
  brandColors?: string;
}

export default function IntakePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    projectType: 'portfolio',
    description: '',
    features: [],
    timeline: '4-6',
    budget: '10-15',
    examplesSites: '',
    companyName: '',
    industry: '',
    logo: undefined,
    brandColors: '',
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

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Submit to Supabase projects table, trigger quote generation
    console.log('Intake Form Data:', formData);

    setTimeout(() => {
      setLoading(false);
      alert('Form submitted! This will create a project record and trigger AI quote generation.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
            <h1 className="font-serif text-xl font-bold">
              New Project Intake
            </h1>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= stepNum
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {stepNum <= step && <CheckCircle className="w-5 h-5" />}
                  {step > stepNum && stepNum}
                </div>
                {stepNum < 5 && (
                  <div className="w-16 sm:w-24 h-1 mx-2 sm:mx-4 bg-gray-800 rounded-full">
                    <div
                      className={`h-full rounded-full bg-cyan-500 transition-all duration-300 ${
                        step > stepNum ? '' : 'bg-cyan-500 opacity-100'
                      }`}
                      style={{ width: step > stepNum ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:flex justify-between mt-4 text-sm text-gray-400">
            <span className={step >= 1 ? 'text-cyan-400' : ''}>Project Overview</span>
            <span className={step >= 2 ? 'text-cyan-400' : ''}>Requirements</span>
            <span className={step >= 3 ? 'text-cyan-400' : ''}>Timeline & Budget</span>
            <span className={step >= 4 ? 'text-cyan-400' : ''}>Review & Submit</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="space-y-8 animate-in">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6">
                Tell us about your project
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="E.g., Company Website"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="portfolio">Portfolio Website</option>
                    <option value="ecommerce">E-commerce Store</option>
                    <option value="saas">SaaS/Web Application</option>
                    <option value="custom">Custom Platform</option>
                  </select>
                  {formData.projectType === 'portfolio' && (
                    <div className="mt-2 bg-[#1a1a1a] p-4 rounded-lg border border-cyan-500/30">
                      <p className="text-sm text-cyan-400">
                        <Info className="w-4 h-4 inline mr-1" />
                        Starting at €8,000 | 2-4 week delivery
                      </p>
                    </div>
                  )}
                  {formData.projectType === 'ecommerce' && (
                    <div className="mt-2 bg-[#1a1a1a] p-4 rounded-lg border border-cyan-500/30">
                      <p className="text-sm text-cyan-400">
                        <Info className="w-4 h-4 inline mr-1" />
                        Starting at €15,000 | 4-8 week delivery
                      </p>
                    </div>
                  )}
                  {formData.projectType === 'saas' && (
                    <div className="mt-2 bg-[#1a1a1a] p-4 rounded-lg border border-cyan-500/30">
                      <p className="text-sm text-cyan-400">
                        <Info className="w-4 h-4 inline mr-1" />
                        Starting at €25,000 | 8-12 week delivery
                      </p>
                    </div>
                  )}
                  {formData.projectType === 'custom' && (
                    <div className="mt-2 bg-[#1a1a1a] p-4 rounded-lg border border-cyan-500/30">
                      <p className="text-sm text-cyan-400">
                        <Info className="w-4 h-4 inline mr-1" />
                        Starting at €50,000 | 12+ week delivery
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    placeholder="Describe your project, goals, target audience, and any specific requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Features Needed <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableFeatures.map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => handleFeatureToggle(feature)}
                        className={`px-4 py-3 rounded-lg border text-left transition-all ${
                          formData.features.includes(feature)
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <CheckCircle className={`w-4 h-4 mr-2 ${formData.features.includes(feature) ? 'text-cyan-400' : 'text-gray-600'}`} />
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div></div>
                <button
                  onClick={handleNext}
                  disabled={!formData.projectName || !formData.description}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6">
                Timeline & Budget
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-cyan-400" />
                    Preferred Timeline
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: '2-4', label: '2-4 weeks', desc: 'Portfolio sites' },
                      { value: '4-8', label: '4-8 weeks', desc: 'E-commerce' },
                      { value: '8-12', label: '8-12 weeks', desc: 'SaaS apps' },
                      { value: '12+', label: '12+ weeks', desc: 'Custom platforms' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setFormData({ ...formData, timeline: option.value })}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.timeline === option.value
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <p className="font-semibold text-lg">{option.label}</p>
                        <p className="text-sm text-gray-400 mt-1">{option.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-cyan-400" />
                    Budget Range
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: '8-12', label: '€8,000 - €12,000' },
                      { value: '10-15', label: '€10,000 - €15,000' },
                      { value: '15-25', label: '€15,000 - €25,000' },
                      { value: '25-50', label: '€25,000 - €50,000' },
                      { value: '50-100', label: '€50,000 - €100,000' },
                      { value: '100+', label: '€100,000+' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setFormData({ ...formData, budget: option.value })}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.budget === option.value
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <p className="font-semibold">{option.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Example Websites You Like <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.examplesSites}
                    onChange={(e) => setFormData({ ...formData, examplesSites: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="https://example-site.com, https://another-site.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-700 text-gray-400 hover:border-gray-600 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6">
                Additional Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="E.g., Technology, Healthcare, Retail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brand Colors (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.brandColors}
                    onChange={(e) => setFormData({ ...formData, brandColors: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="E.g., #00bcd4 (cyan), #ffffff (white)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Logo Upload (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
                    <input type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" className="hidden" id="logo-upload" />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UploadLabel />
                        <span>Click to upload or drag and drop</span>
                        <span className="text-xs text-gray-500">PNG, JPG, SVG up to 10MB</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-700 text-gray-400 hover:border-gray-600 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6">
                Review & Submit
              </h2>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">Project Overview</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {formData.projectName}</p>
                    <p><strong>Type:</strong> {formData.projectType}</p>
                    <p><strong>Timeline:</strong> {formData.timeline} weeks</p>
                    <p><strong>Budget:</strong> €{formData.budget},000</p>
                  </div>
                </div>

                {formData.companyName && (
                  <div>
                    <h3 className="font-semibold text-cyan-400 mb-2">Company Details</h3>
                    <p className="text-sm">{formData.companyName}</p>
                    <p className="text-sm text-gray-400">{formData.industry}</p>
                  </div>
                )}

                {formData.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-cyan-400 mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.description && (
                  <div>
                    <h3 className="font-semibold text-cyan-400 mb-2">Description</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                )}

                {formData.examplesSites && (
                  <div>
                    <h3 className="font-semibold text-cyan-400 mb-2">Example Sites</h3>
                    <p className="text-sm text-gray-300">{formData.examplesSites}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-700 text-gray-400 hover:border-gray-600 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Zap className="w-5 h-5" />
                    Submit & Get Quote
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-20 animate-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">
              Project Submitted!
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              We're generating your personalized quote now. You'll receive it via email within 24 hours.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800 mt-12">
        © 2026 Autonomous Design Agency. AI-powered development, human-reviewed quality.
      </footer>
    </div>
  );
}

function UploadLabel() {
  return <UploadLabel />;
}

<UploadLabel />