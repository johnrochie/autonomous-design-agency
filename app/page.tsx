import Link from 'next/link';
import { ArrowRight, Zap, Shield, Clock, Fingerprint } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6">
            Autonomous Design
            <span className="gradient-text"> Agency</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Full-service web development, delivered by AI, human-reviewed for quality.
            Premium websites in weeks, not months.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="group px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-medium transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-b from-[#000000] to-[#0f0f0f]" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>

          <p className="text-gray-400 text-center mb-16 text-lg max-w-2xl mx-auto">
            AI does 99% of the work. Human review ensures quality and security.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#1a1a1a] p-6 rounded-2xl card-hover">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">AI-Powered</h3>
              <p className="text-gray-400 leading-relaxed">
                99% automated development with proven AI tools like Cursor CLI and OpenHands
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl card-hover">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Secure</h3>
              <p className="text-gray-400 leading-relaxed">
                GDPR compliant, encrypted data, no AI training on client data
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl card-hover">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Websites delivered in weeks, not months. Parallel AI agents work 24/7
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl card-hover">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <Fingerprint className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Quality First</h3>
              <p className="text-gray-400 leading-relaxed">
                Automated testing, security scanning, and code review before delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding bg-gradient-to-b from-[#0f0f0f] to-[#000000]" id="pricing">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="gradient-text">Pricing</span>
          </h2>

          <p className="text-gray-400 text-center mb-16 text-lg max-w-2xl mx-auto">
            High-value, low-volume. 2-4 projects per quarter.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Portfolio',
                price: '€8,000',
                time: '2-4 weeks',
                desc: 'Complete website with animations and contact form',
              },
              {
                name: 'E-commerce',
                price: '€15,000',
                time: '4-8 weeks',
                desc: 'Online store with payments, inventory, and order management',
              },
              {
                name: 'SaaS App',
                price: '€25,000',
                time: '8-12 weeks',
                desc: 'Web application with user auth and dashboards',
              },
              {
                name: 'Custom',
                price: '€50,000+',
                time: '12+ weeks',
                desc: 'Complex platforms with industry-specific features',
              },
            ].map((tier) => (
              <div key={tier.name} className="bg-[#1a1a1a] p-6 rounded-2xl card-hover border border-gray-800">
                <h3 className="font-serif text-xl font-bold mb-2">{tier.name}</h3>
                <p className="gradient-text text-3xl font-bold mb-2">{tier.price}</p>
                <p className="text-gray-400 text-sm mb-4">{tier.time}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-b from-[#000000] to-[#0f0f0f]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Get Started</span>?
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            Create your account and tell us about your project. We'll send you a quote within 24 hours.
          </p>

          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding bg-[#0f0f0f] border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Autonomous Design Agency. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            AI-powered development, human-reviewed quality.
          </p>
        </div>
      </footer>
    </main>
  );
}
