import React from 'react';
import { PlanMetrics } from '../types';

interface ImpactMetersProps {
  metrics: PlanMetrics;
}

export const ImpactMeters: React.FC<ImpactMetersProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
      
      {/* Growth Potential - Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth Potential</span>
        </div>
        <div className="h-12 bg-slate-50 rounded-lg relative overflow-hidden flex items-end p-1 border border-slate-100">
          <div 
            className="w-full bg-indigo-500/10 rounded-md transition-all duration-500 ease-out relative"
            style={{ height: `${metrics.growth}%` }}
          >
             <div className="absolute inset-0 bg-indigo-500 opacity-20"></div>
             {/* Animated top line */}
             <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 opacity-50 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Tax Efficiency - Circular Meter */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tax Efficiency</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${metrics.taxEfficiency}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[9px] font-bold text-slate-700">{metrics.taxEfficiency}%</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 leading-tight">
            {metrics.taxEfficiency > 90 ? 'Tax-Free Withdrawals' : metrics.taxEfficiency > 70 ? 'Tax-Deferred' : 'Taxed Earnings'}
          </span>
        </div>
      </div>

      {/* Flexibility - Dot Scale */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Liquidity</span>
        </div>
        <div className="flex items-center h-10 gap-1.5">
          {[1, 2, 3, 4, 5].map((dot) => (
             <div 
               key={dot}
               className={`
                 h-2.5 w-2.5 rounded-full transition-all duration-300
                 ${dot <= metrics.flexibility ? 'bg-blue-400 scale-100' : 'bg-slate-200 scale-75'}
               `}
             />
          ))}
          <span className="ml-2 text-xs text-slate-500">
             {metrics.flexibility < 3 ? 'Restricted' : 'Flexible'}
          </span>
        </div>
      </div>

    </div>
  );
};
