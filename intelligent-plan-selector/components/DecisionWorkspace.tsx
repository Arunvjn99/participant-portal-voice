import React from 'react';
import { PlanData } from '../types';
import { Check, X, TrendingUp, ShieldCheck, Unlock, Lock } from 'lucide-react';

interface DecisionWorkspaceProps {
  plan: PlanData;
}

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = ({ plan }) => {
  
  // 1. Ineligible View State
  if (!plan.isEligible) {
    return (
      <div className="w-full animate-fade-in px-4 md:px-0 flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Lock size={24} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {plan.title} is not available
        </h2>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
          {plan.ineligibilityReason || "You are currently not eligible for this plan based on your profile criteria."}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          Talk to an advisor if you believe this is an error
        </div>
      </div>
    );
  }

  // 2. Eligible View State (Standard)
  return (
    <div className="w-full animate-fade-in px-4 md:px-0">
      
      {/* Strategic Identity */}
      <div className="text-center mb-12">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
          {plan.isRecommended ? 'Recommended Path' : 'Alternative Path'}
        </h2>
        <p className="text-xl md:text-3xl text-slate-800 font-medium leading-tight max-w-2xl mx-auto">
          {plan.emotionalCopy}
        </p>
      </div>

      {/* Indicators Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
         <IndicatorBox 
           icon={<TrendingUp size={18} />}
           label="Growth Potential"
           value={plan.metrics.growth > 90 ? 'Maximum' : 'Stable'}
           score={plan.metrics.growth}
           color="bg-indigo-500"
         />
         <IndicatorBox 
           icon={<ShieldCheck size={18} />}
           label="Tax Efficiency"
           value={plan.metrics.taxEfficiency > 90 ? 'Tax-Free' : 'Deferred'}
           score={plan.metrics.taxEfficiency}
           color="bg-emerald-500"
         />
         <IndicatorBox 
           icon={<Unlock size={18} />}
           label="Liquidity"
           value={plan.metrics.flexibility > 3 ? 'Flexible' : 'Restricted'}
           score={plan.metrics.flexibility * 20}
           color="bg-blue-500"
         />
      </div>

      {/* Deep Dive Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto border-t border-slate-200 py-10">
        
        <div className="space-y-6">
           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
             Why Choose This
           </h3>
           <ul className="space-y-4">
             {plan.features.map((f, i) => (
               <li key={i} className="flex gap-3 text-slate-600 text-sm group">
                 <div className="mt-0.5 p-0.5 rounded-full bg-emerald-100 text-emerald-600">
                   <Check size={10} strokeWidth={3} />
                 </div>
                 <span className="group-hover:text-slate-900 transition-colors">
                   <strong className="font-semibold text-slate-800">{f.label}:</strong> {f.value}
                 </span>
               </li>
             ))}
           </ul>
        </div>

        <div className="space-y-6">
           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
             Trade-offs
           </h3>
           <ul className="space-y-4">
             <TradeOffItem text={plan.id === 'roth-401k' ? 'No immediate tax deduction' : 'Withdrawals taxed as income'} />
             <TradeOffItem text={plan.id === 'roth-401k' ? 'Lower take-home pay today' : 'RMDs required at age 73'} />
           </ul>
        </div>

      </div>
    </div>
  );
};

const IndicatorBox: React.FC<{ icon: React.ReactNode; label: string; value: string; score: number; color: string }> = ({ 
  icon, label, value, score, color 
}) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-slate-900">{value}</span>
        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
        </div>
      </div>
    </div>
  </div>
);

const TradeOffItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex gap-3 text-slate-500 text-sm">
     <div className="mt-0.5 p-0.5 rounded-full bg-slate-100 text-slate-400">
       <X size={10} strokeWidth={3} />
     </div>
     <span>{text}</span>
  </li>
);