import React from 'react';
import { Rocket, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import logo from '../assets/logo.jpg';

interface WelcomeLandingProps {
  onStart: () => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#183661] via-slate-800 to-[#183661] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 overflow-hidden border-4 border-[#C7B299] shadow-2xl">
            <img src={logo} alt="Job Vision Logo" className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C7B299] to-[#d4c5ad]">VC Insights</span>
          </h1>
          
          <p className="text-xl text-[#C7B299] mb-8 max-w-2xl mx-auto">
            Your AI-powered venture capital intelligence platform. Discover investment trends, track funding rounds, and make data-driven decisions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#C7B299]/20">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C7B299] to-[#a89275] flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Insights</h3>
            <p className="text-[#C7B299] text-sm">
              Access the latest funding data across industries and stages
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#C7B299]/20">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#183661] to-[#2a5080] flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Analytics</h3>
            <p className="text-[#C7B299] text-sm">
              Visualize trends with interactive charts and dashboards
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#C7B299]/20">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C7B299] to-[#a89275] flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Personalized Feed</h3>
            <p className="text-[#C7B299] text-sm">
              Get insights tailored to your investment preferences
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#C7B299] to-[#a89275] rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-[#183661] mb-4">
            Let's Get Started
          </h2>
          <p className="text-[#183661]/80 mb-8 text-lg max-w-xl mx-auto">
            Answer a few questions to personalize your dashboard and unlock insights that matter to you
          </p>
          
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 bg-[#183661] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#2a5080] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Start Your Journey</span>
            <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[#C7B299] text-sm mt-8">
          Takes only 2 minutes • No credit card required • Instant access
        </p>
      </div>
    </div>
  );
};
