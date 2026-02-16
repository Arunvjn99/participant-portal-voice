import React from 'react';
import { PlanMetrics, PlanTheme } from '../types';

interface ImpactStripProps {
  metrics: PlanMetrics;
  theme: PlanTheme;
}

export const ImpactStrip: React.FC<ImpactStripProps> = ({ metrics, theme }) => {
  const themeColors = {
    violet: 'bg-indigo-500',
    blue: 'bg-blue-500',
    slate: 'bg-slate-500',
  };

  const activeColor = themeColors[theme];

  return (
    <div className="w-full grid grid-cols-3 gap-4 md:gap-12 py-6 border-t border-slate-200/50 backdrop-blur-sm">
      
      {/* Growth */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</span>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${activeColor}`}
            style={{ width: `${metrics.growth}%` }}
          />
        </div>
      </div>

      {/* Tax Efficiency */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tax Efficiency</span>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${activeColor}`}
            style={{ width: `${metrics.taxEfficiency}%` }}
          />
        </div>
      </div>

      {/* Flexibility */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flexibility</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((dot) => (
             <div 
               key={dot}
               className={`h-1.5 w-full rounded-full transition-all duration-300 ${dot <= metrics.flexibility ? activeColor : 'bg-slate-100'}`}
             />
          ))}
        </div>
      </div>

    </div>
  );
};