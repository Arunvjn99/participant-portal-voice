import React from 'react';
import { PlanData } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface PlanDetailProps {
  plan: PlanData;
}

export const PlanDetailPanel: React.FC<PlanDetailProps> = ({ plan }) => {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto text-center md:text-left">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        <div className="flex-1">
           <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.title}</h3>
           <p className="text-slate-500 text-lg leading-relaxed mb-6">
             {plan.description}
           </p>
           
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
              <span className="text-lg">💡</span> {plan.emotionalCopy}
           </div>
        </div>

        <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
           {plan.features.map((feature, i) => (
             <div key={i} className="flex items-center justify-between md:justify-start gap-4 p-3 rounded-lg bg-white/50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">{feature.label}</span>
                <span className="text-sm font-semibold text-slate-800">{feature.value}</span>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};