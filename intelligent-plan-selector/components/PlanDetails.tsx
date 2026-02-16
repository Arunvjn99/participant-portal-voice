import React from 'react';
import { PlanData, UserProfile } from '../types';
import { Check, X, TrendingUp, ShieldCheck, Unlock, Activity, Lock, User, Briefcase, Calendar } from 'lucide-react';

interface PlanDetailsProps {
  plan: PlanData;
  user: UserProfile;
}

export const PlanDetails: React.FC<PlanDetailsProps> = ({ plan, user }) => {
  if (!plan.isEligible) {
    return (
      <div className="animate-fade-in h-full">
        <div className="p-6 rounded-2xl bg-white/50 border border-slate-200 shadow-sm flex flex-col items-center text-center h-full justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
             <Lock size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Plan Unavailable</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
            {plan.ineligibilityReason || "This plan is not available for your current profile."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* 0. Profile Context Snippet */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <User size={12} /> Your Details
         </h4>
         <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col justify-center">
               <div className="flex items-center gap-1.5 mb-1">
                  <User size={10} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Age</span>
               </div>
               <div className="text-sm font-bold text-slate-700">{user.age}</div>
            </div>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col justify-center">
               <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={10} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Retiring At</span>
               </div>
               <div className="text-sm font-bold text-slate-700">{user.retirementAge}</div>
            </div>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col justify-center">
               <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase size={10} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Salary</span>
               </div>
               <div className="text-sm font-bold text-slate-700">{user.salary}</div>
            </div>
         </div>
      </div>

      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
           Plan Overview
        </h4>
        <p className="text-lg font-medium text-slate-800 leading-snug mb-4">
          {plan.emotionalCopy}
        </p>
        
        {/* Analysis HUD Mini */}
        <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
           
           <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Activity size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Match Score</span>
                 </div>
                 <span className="text-xl font-bold text-indigo-600">{plan.confidenceScore}%</span>
              </div>
              
              <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-indigo-100">
                   <div 
                     className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                     style={{ width: `${plan.confidenceScore}%` }}
                   />
              </div>

              <p className="text-[11px] text-indigo-900/70 leading-relaxed">
                 {plan.isRecommended 
                   ? "Excellent for growing your money tax-free." 
                   : "Better for keeping more money in your paycheck today."}
              </p>
           </div>
        </div>
      </div>

      {/* 2. Metrics Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] space-y-5">
          <MetricRow 
            icon={<TrendingUp size={14} />}
            label="Growth"
            value={plan.metrics.growth > 90 ? 'Maximum' : 'Stable'}
            score={plan.metrics.growth}
            color="bg-indigo-500"
          />
          <MetricRow 
            icon={<ShieldCheck size={14} />}
            label="Tax Benefits"
            value={plan.metrics.taxEfficiency > 90 ? 'Tax-Free' : 'Pay Later'}
            score={plan.metrics.taxEfficiency}
            color="bg-emerald-500"
          />
          <MetricRow 
            icon={<Unlock size={14} />}
            label="Access to Money"
            value={plan.metrics.flexibility > 3 ? 'Easy' : 'Hard'}
            score={plan.metrics.flexibility * 20}
            color="bg-blue-500"
          />
      </div>

      {/* 3. Trade-offs & Benefits */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] space-y-6">
         <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Pros
            </h5>
            <ul className="space-y-2.5">
              {plan.features.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-slate-600 text-xs">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span><strong className="text-slate-800">{f.label}:</strong> {f.value}</span>
                </li>
              ))}
            </ul>
         </div>

         <div className="w-full h-px bg-slate-100"></div>

         <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Cons
            </h5>
            <ul className="space-y-2.5">
               <li className="flex gap-2.5 text-slate-500 text-xs">
                  <X size={14} className="text-slate-400 shrink-0" />
                  <span>{plan.id === 'roth-401k' ? 'You don\'t get a tax break today' : 'You pay taxes when you take money out'}</span>
               </li>
            </ul>
         </div>
      </div>

    </div>
  );
};

const MetricRow: React.FC<{ icon: React.ReactNode; label: string; value: string; score: number; color: string }> = ({ 
  icon, label, value, score, color 
}) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-bold text-slate-900">{value}</span>
      </div>
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
         <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  </div>
);