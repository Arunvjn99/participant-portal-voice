import React from 'react';
import { UserProfile, PlanData } from '../types';
import { Activity, MessageCircle, Lock, Target } from 'lucide-react';

interface ContextPanelProps {
  user: UserProfile;
  selectedPlan: PlanData;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ user, selectedPlan }) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Personalized Analysis HUD */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        
        {/* Abstract animated background - Red for locked, Indigo for active */}
        <div className={`
          absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-colors duration-500
          ${selectedPlan.isEligible ? 'bg-indigo-500/5 group-hover:bg-indigo-500/10' : 'bg-slate-500/5'}
        `}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className={`w-2 h-2 rounded-full animate-pulse ${selectedPlan.isEligible ? 'bg-green-500' : 'bg-slate-300'}`}></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personalized Analysis</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 mb-2">
            {selectedPlan.isEligible ? "Projected Impact" : "Eligibility Status"}
          </h3>
          
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
             {selectedPlan.isEligible 
                ? <span>Based on salary <strong className="text-slate-800">{user.salary}</strong> and goal age <strong className="text-slate-800">{user.retirementAge}</strong>.</span>
                : <span>This plan is incompatible with your current income profile.</span>
             }
          </p>

          <div className="space-y-4">
             {selectedPlan.isEligible ? (
               <>
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                       <span>Strategic Fit</span>
                       <span>{selectedPlan.confidenceScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                         style={{ width: `${selectedPlan.confidenceScore}%` }}
                       />
                    </div>
                 </div>

                 <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/50">
                    <div className="flex gap-3">
                       <Activity size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                       <p className="text-xs text-indigo-900 font-medium">
                         {selectedPlan.isRecommended 
                           ? "Maximizes tax-free compound growth." 
                           : "Prioritizes short-term cash flow."}
                       </p>
                    </div>
                 </div>
               </>
             ) : (
               <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex gap-3">
                 <Lock size={14} className="text-slate-400 mt-0.5 shrink-0" />
                 <p className="text-xs text-slate-500 font-medium">
                   Income limits prevent contribution to this plan type.
                 </p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* 2. Advisor Connection */}
      <div className="bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
        <div className="p-4 flex items-center gap-3">
           <div className="relative">
             <img src="https://i.pravatar.cc/150?img=32" alt="Advisor" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
           </div>
           <div>
             <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
             <p className="text-[10px] text-slate-500">Wealth Advisor • Online</p>
           </div>
        </div>
        <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
           <span className="text-xs font-semibold text-slate-600">Ask a question</span>
           <MessageCircle size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
        </button>
      </div>

    </div>
  );
};