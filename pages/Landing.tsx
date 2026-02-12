
import React, { useState } from 'react';
import Auth from './Auth';
import { User } from '../types';

interface LandingProps {
  onLogin: (user: User) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [authRole, setAuthRole] = useState<'User' | 'Admin' | 'Donor'>('User');

  const triggerAuth = (role: 'User' | 'Admin' | 'Donor') => {
    setAuthRole(role);
    setShowAuth(true);
    setShowAbout(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showAbout) {
    return (
      <div className="bg-[#0b0f1a] min-h-screen text-white p-6 md:p-20 relative animate-in fade-in duration-700">
        <button
          onClick={() => setShowAbout(false)}
          className="fixed top-12 right-12 z-50 bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-xl transition group"
        >
          <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-w-5xl mx-auto space-y-20">
          <div className="space-y-6">
            <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-sm italic">The Block-Aid Manifesto</p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
              Reinventing <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Survival.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 backdrop-blur-md">
              <h3 className="text-2xl font-black mb-4">The Challenge</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Traditional disaster relief is crippled by bureaucracy. Aid takes weeks to reach the field, and billions are lost to mismanagement. In a catastrophe, seconds cost lives.
              </p>
            </div>
            <div className="bg-indigo-600/20 p-10 rounded-[40px] border border-indigo-500/30 backdrop-blur-md">
              <h3 className="text-2xl font-black text-blue-400 mb-4">The Innovation</h3>
              <p className="text-slate-200 leading-relaxed font-medium">
                Block-Aid merges the **EfficientB0 Deep Learning model** and **Gemini AI Visual Forensics** with the **Ethereum Blockchain**. Our neural network classifies damage into Low, Medium, and High severity for instant verification.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-3xl font-black italic">The Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
                <h4 className="font-black text-xl">EfficientB0 Audit Layer</h4>
                <p className="text-slate-500 text-sm">
                  Utilizing the EfficientB0 architecture to autonomously categorize disaster damage (Low/Medium/High) with precision, coupled with Gemini's fraud detection capabilities.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                <h4 className="font-black text-xl">Rapid Approval</h4>
                <p className="text-slate-500 text-sm">
                  Authorized Admins sign off on verified reports via multi-signature hooks, triggering automated smart contract execution.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl">💰</div>
                <h4 className="font-black text-xl">Direct ETH Payouts</h4>
                <p className="text-slate-500 text-sm">
                  Funds move directly from donor-funded pools to verified victim wallets. Total transparency, zero leakages.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-20 border-t border-white/5">
            <button
              onClick={() => setShowAbout(false)}
              className="px-12 py-5 bg-white text-slate-900 rounded-3xl font-black text-xl hover:scale-105 transition active:scale-95 shadow-2xl shadow-white/10"
            >
              Enter the Ecosystem
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowAuth(false)}
          className="fixed top-6 left-6 z-50 text-slate-400 hover:text-white flex items-center gap-2 font-bold transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
        <Auth onLogin={onLogin} initialRole={authRole} />
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f1a] text-white min-h-screen selection:bg-teal-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-[#0b0f1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight">Block-Aid</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#impact" className="hover:text-white transition">Impact</a>
            <button
              onClick={() => setShowAbout(true)}
              className="hover:text-white transition"
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* USER */}
            <button
              onClick={() => triggerAuth('User')}
              className="px-5 py-2 text-sm font-bold 
      bg-blue-600/10 text-blue-400 
      border border-blue-500/30 
      rounded-lg 
      hover:bg-blue-600/20 transition"
            >
              User
            </button>

            {/* ADMIN */}
            <button
              onClick={() => triggerAuth('Admin')}
              className="px-5 py-2 text-sm font-bold 
      bg-teal-600 text-white 
      rounded-lg 
      hover:bg-teal-700 transition"
            >
              Admin
            </button>

            {/* DONOR */}
            <button
              onClick={() => triggerAuth('Donor')}
              className="px-5 py-2 text-sm font-bold 
      bg-amber-600 text-white 
      rounded-lg 
      shadow-lg shadow-amber-500/30 
      hover:bg-amber-700 transition"
            >
              Donor
            </button>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            Block-<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">Aid</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-slate-400 mb-8 uppercase tracking-[0.3em]">AI-Powered Disaster Relief</p>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Leveraging artificial intelligence and blockchain technology to create transparent, efficient disaster relief management systems that save lives and rebuild communities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => triggerAuth('User')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-black text-lg shadow-xl shadow-blue-600/25 transform hover:scale-105 transition active:scale-95"
            >
              Report Disaster
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="w-full sm:w-auto px-8 py-4 border border-slate-700 rounded-xl font-black text-lg hover:bg-white/5 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#090d16]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            How <span className="text-blue-500">Block-Aid</span> Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProcessCard step="1" title="Disaster Detection" desc="AI models detect and analyze disaster events in real-time using satellite imagery and sensor data." />
            <ProcessCard step="2" title="Impact Assessment" desc="Advanced algorithms calculate severity levels and affected area for quick decision-making." />
            <ProcessCard step="3" title="Resource Allocation" desc="Optimize distribution of relief resources using blockchain-verified smart contracts." />
            <ProcessCard step="4" title="Transparent Tracking" desc="Track every transaction and resource movement on an immutable blockchain ledger." />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            Powerful <span className="text-teal-400">Features</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI Severity Prediction"
              desc="Machine learning models predict disaster severity and resource requirements with 95%+ accuracy."
            />
            <FeatureCard
              icon="🔗"
              title="Blockchain Verification"
              desc="Every transaction is verified and immutable, ensuring complete transparency in relief distribution."
            />
            <FeatureCard
              icon="📊"
              title="Real-Time Monitoring"
              desc="Live dashboards show disaster progression, resource allocation, and impact metrics."
            />
            <FeatureCard
              icon="💰"
              title="Smart Contracts"
              desc="Automated fund distribution reduces overhead and ensures resources reach those in need faster."
            />
            <FeatureCard
              icon="🌍"
              title="Global Coverage"
              desc="Support for multiple disaster types across different geographical regions worldwide."
            />
            <FeatureCard
              icon="🔒"
              title="Enterprise Security"
              desc="Military-grade encryption and multi-signature authentication for sensitive operations."
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 px-6 bg-[#090d16]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            Our <span className="text-blue-500">Impact</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center mb-24">
            <StatItem val="98%" label="Accuracy Rate" />
            <StatItem val="150+" label="Regions Covered" />
            <StatItem val="$10M+" label="Relief Distributed" />
            <StatItem val="50K+" label="Lives Impacted" />
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl shadow-blue-600/20">
            <h3 className="text-3xl md:text-5xl font-black mb-6">Ready to Make a Difference?</h3>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10">
              Join the Block-Aid network and help coordinate disaster relief efforts with transparency and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => triggerAuth('User')} className="w-full sm:w-auto px-10 py-4 bg-white text-blue-600 rounded-xl font-black text-lg hover:bg-slate-50 transition shadow-xl">
                Report Disaster
              </button>
              <button
                onClick={() => setShowAbout(true)}
                className="w-full sm:w-auto px-10 py-4 border-2 border-white/30 rounded-xl font-black text-lg hover:bg-white/10 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <FooterCol title="Product" links={['Features', 'Pricing', 'Security', 'Roadmap']} />
            <FooterCol title="Resources" links={['Documentation', 'API Reference', 'Blog', 'Support']} />
            <FooterCol title="Legal" links={['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Us']} />
            <FooterCol title="Company" links={['About Us', 'Careers', 'Blog', 'Press']} />
          </div>
          <div className="pt-12 border-t border-white/5 text-center text-slate-500 text-sm">
            © 2026 Block-Aid. Decentralized Disaster Relief for a Better World. Built with blockchain technology for transparency and trust.
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProcessCard = ({ step, title, desc }: { step: string; title: string; desc: string }) => (
  <div className="bg-[#111827] border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/30 transition group">
    <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {step}
    </div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="bg-[#111827] border border-white/5 p-8 rounded-[2rem] hover:bg-[#1f2937]/50 transition group">
    <div className="text-4xl mb-6">{icon}</div>
    <h3 className="text-xl font-bold mb-4 group-hover:text-teal-400 transition-colors">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatItem = ({ val, label }: { val: string; label: string }) => (
  <div>
    <div className="text-4xl md:text-5xl font-black text-blue-500 mb-2">{val}</div>
    <div className="text-slate-500 font-bold text-sm uppercase tracking-widest">{label}</div>
  </div>
);

const FooterCol = ({ title, links }: { title: string; links: string[] }) => (
  <div className="space-y-6">
    <h4 className="font-black text-white">{title}</h4>
    <ul className="space-y-4">
      {links.map(link => (
        <li key={link}>
          <a href="#" className="text-slate-500 hover:text-white transition text-sm">{link}</a>
        </li>
      ))}
    </ul>
  </div>
);

export default Landing;
