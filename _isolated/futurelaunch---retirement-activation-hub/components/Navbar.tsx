import React from 'react';
import { Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                F
            </div>
            <span className="font-display font-bold text-lg text-slate-800 tracking-tight">FutureLaunch</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors">Why Enroll?</a>
            <a href="#" className="text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors">Plan Details</a>
            <a href="#" className="text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors">Resources</a>
        </div>

        <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-xs text-slate-400">Status</p>
                <p className="text-sm font-semibold text-slate-700">Pre-Enrollment</p>
             </div>
             <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden">
                <Menu size={24} />
             </button>
        </div>
      </div>
    </nav>
  );
};
