import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { FloatingCards } from './FloatingCards';
import { AIAssistantInput } from './AIAssistantInput';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen pt-24 pb-12 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 overflow-hidden">
      
      {/* Left Content */}
      <div className="flex-1 w-full relative z-10 flex flex-col justify-center">
        
        {/* Micro Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 w-fit mb-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Enrollment Window Open</span>
        </div>

        {/* Greeting & Headline */}
        <h2 className="text-xl md:text-2xl font-medium text-slate-500 mb-2">
          Good Morning, Brian
        </h2>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
          Let's build your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
            future, together.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg text-slate-500 max-w-lg leading-relaxed mb-8">
          You're one step away from activating your 401(k). We've simplified everything so you can focus on what matters.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
            Start My Enrollment
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:border-slate-300">
            <Compass size={18} />
            Explore My Options
          </button>
        </div>

        {/* Embedded AI Assistant */}
        <AIAssistantInput />

      </div>

      {/* Right Visuals */}
      <div className="flex-1 w-full h-full min-h-[500px] relative">
         <FloatingCards />
         
         {/* Mobile Fallback Graphic (Only visible on small screens) */}
         <div className="lg:hidden w-full aspect-square bg-gradient-to-br from-brand-100 to-blue-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="text-center p-8">
               <h3 className="text-3xl font-bold text-brand-900 mb-2">$1.2M</h3>
               <p className="text-brand-700">Projected Future Value</p>
            </div>
         </div>
      </div>

    </section>
  );
};
