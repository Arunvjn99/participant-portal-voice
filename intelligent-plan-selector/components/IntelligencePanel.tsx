import React from 'react';
import { PlanData, UserProfile } from '../types';
import { Shield, Sparkles, User, Briefcase, Calendar, Target } from 'lucide-react';

interface GuidancePanelProps {
  user: UserProfile;
  selectedPlan: PlanData | null;
}

export const GuidancePanel: React.FC<GuidancePanelProps> = ({ user, selectedPlan }) => {
  return (
    <div className="space-y-6">
      
      {/* 1. User Profile Snapshot */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
         <div className="flex items-center justify-between mb-4">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Profile</h3>
           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
             <User size={14} className="text-slate-500" />
           </div>
         </div>
         
         <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Current Age</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                 <Calendar size={12} className="text-slate-400" /> {user.age}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Annual Salary</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                 <Briefcase size={12} className="text-slate-400" /> {user.salary}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Risk Profile</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                 <Target size={12} className={user.riskProfile === 'Moderate' ? 'text-blue-500' : 'text-slate-400'} /> 
                 {user.riskProfile}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Retirement Age</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                 <span className="text-slate-400 font-serif italic">R</span> {user.retirementAge}
              </p>
            </div>
         </div>
      </div>

      {/* 2. AI Guidance Context */}
      {selectedPlan && (
        <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 transition-all duration-300">
           <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700">Why this fits you</h3>
           </div>
           
           <p className="text-sm text-indigo-900/80 leading-relaxed mb-3">
             {selectedPlan.isRecommended ? (
               <span>
                 Based on your salary of <strong>{user.salary}</strong> and <strong>{user.age}</strong> years of age, 
                 locking in a tax rate now creates the most efficient compound growth curve for your 
                 <strong> {user.goal.toLowerCase()}</strong> goal.
               </span>
             ) : (
               <span>
                 This option prioritizes <strong>short-term flexibility</strong>. 
                 It may be suitable if you expect your tax bracket to be significantly lower in retirement 
                 or need to maximize current take-home pay.
               </span>
             )}
           </p>
           
           <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-medium">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
             Analysis based on your inputs
           </div>
        </div>
      )}

      {/* 3. Advisor Safety Net */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-50"></div>
        
        <h3 className="text-sm font-bold text-slate-900 mb-1">Need help deciding?</h3>
        <p className="text-xs text-slate-500 mb-4">Talk to a specialist to walk through your options.</p>
        
        <div className="flex items-center gap-3 mb-4">
           <div className="relative">
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=32" alt="Advisor" className="w-full h-full object-cover" />
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
           </div>
           <div>
             <p className="text-xs font-bold text-slate-800">Sarah Jenkins</p>
             <p className="text-[10px] text-slate-400">Retirement Specialist</p>
           </div>
        </div>

        <button className="w-full py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors">
          Schedule a 15-min call
        </button>
      </div>

    </div>
  );
};
