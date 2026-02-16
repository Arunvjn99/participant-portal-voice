import React from 'react';
import { PlanData } from '../types';
import { Lock, Sparkles, CheckCircle2, Trophy } from 'lucide-react';

interface PlanRailProps {
  plans: PlanData[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const PlanRail: React.FC<PlanRailProps> = ({ plans, selectedId, onSelect }) => {
  return (
    <div className="w-full relative z-10">
      <div className="flex flex-col gap-5">
        {plans.map((plan) => (
          <HorizontalTile 
            key={plan.id} 
            plan={plan} 
            isSelected={selectedId === plan.id} 
            onSelect={() => onSelect(plan.id)} 
          />
        ))}
      </div>
    </div>
  );
};

const HorizontalTile: React.FC<{ plan: PlanData; isSelected: boolean; onSelect: () => void }> = ({ 
  plan, 
  isSelected, 
  onSelect 
}) => {
  const { isEligible, isRecommended } = plan;

  return (
    <div 
      onClick={onSelect}
      className={`
        relative w-full rounded-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden border group
        ${!isEligible 
          ? `opacity-60 bg-slate-50 border-transparent grayscale-[0.8]` 
          : isRecommended
            ? isSelected
               ? 'bg-white border-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.15),0_12px_40px_-8px_rgba(79,70,229,0.2)] scale-[1.02] z-20'
               : 'bg-white/80 border-indigo-200/60 hover:border-indigo-300 hover:shadow-[0_8px_30px_-10px_rgba(99,102,241,0.15)] z-10'
            : isSelected 
               ? 'bg-white border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] scale-[1.01] z-10' 
               : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md z-0'
        }
      `}
    >
      {/* --- BEST FIT EXCLUSIVE STYLING --- */}
      {isRecommended && (
        <>
           {/* 1. Subtle Background Gradient Mesh */}
           <div className={`absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 pointer-events-none transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-60'}`} />
           
           {/* 2. Abstract Geometric Pattern */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-multiply">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-200/50" />
                  </pattern>
                  <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" className="text-indigo-300/30" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#fade-mask)" />
                <rect width="100%" height="100%" fill="url(#dot-pattern)" />
              </svg>
           </div>

           {/* 3. Top Right Gradient Glow Blob */}
           <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-all duration-700 ${isSelected ? 'opacity-100 scale-110' : 'opacity-50 scale-100'}`} />
           
           {/* 4. Active Border Animation (Selection State) */}
           {isSelected && (
             <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl animate-pulse pointer-events-none"></div>
           )}
        </>
      )}

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 p-6 md:p-7 flex flex-col gap-5">
        
        {/* HEADER: Badge & Button */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
             
             {/* Dynamic Badge */}
             <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border w-fit transition-all duration-300
                ${isRecommended 
                   ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/30' 
                   : !isEligible 
                      ? 'bg-slate-100 border-slate-200 text-slate-400' 
                      : 'bg-white border-slate-200 text-slate-500'}
             `}>
                {isRecommended ? <Trophy size={11} className="text-yellow-300 fill-yellow-300" /> : null}
                {isEligible ? `${plan.confidenceScore}% Fit` : 'Locked'}
             </div>
             
             {/* Recommendation Label */}
             {isRecommended && isEligible && (
               <span className="text-[11px] font-medium text-indigo-600/80 flex items-center gap-1 animate-fade-in">
                 <Sparkles size={10} />
                 AI Recommended Strategy
               </span>
             )}
          </div>

          {/* Selection State Indicator */}
          <div className={`
             transition-all duration-300 transform
             ${isSelected ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0 hidden sm:block'}
          `}>
             {isSelected ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wide shadow-md">
                   <CheckCircle2 size={12} className="text-emerald-400" />
                   Selected
                </div>
             ) : null}
          </div>
          
          {/* Unselected State "Select" Button (Ghost) */}
          {!isSelected && isEligible && (
            <button className={`
               px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50
               ${isRecommended ? 'hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50' : ''}
            `}>
              Select
            </button>
          )}
        </div>

        {/* BODY: Typography */}
        <div>
          <div className="mb-2">
            <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${!isEligible ? 'text-slate-400' : 'text-slate-900'}`}>
              {plan.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <span className={`${isRecommended ? 'text-indigo-600 font-semibold' : 'text-slate-500'}`}>{plan.match}</span> 
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-slate-400 font-normal">{plan.subtitle}</span>
            </p>
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            {plan.description}
          </p>
        </div>

        {/* FOOTER: Feature Pills */}
        <div className="pt-2 flex flex-wrap gap-2">
          {plan.features.map((f, i) => (
             <div 
               key={i} 
               className={`
                 px-3 py-1.5 rounded-md border text-[10px] font-semibold transition-colors duration-300
                 ${isSelected 
                    ? isRecommended 
                       ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700' 
                       : 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-50/50 border-slate-100 text-slate-500'}
               `}
             >
               <span className="opacity-70 font-normal mr-1">{f.label}:</span>{f.value}
             </div>
          ))}
          
          {/* Extra Tag for Recommended */}
          {isRecommended && (
             <div className="px-3 py-1.5 rounded-md border border-emerald-100 bg-emerald-50/50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
               Tax-Free Growth
             </div>
          )}
        </div>

      </div>

      {/* Locked Overlay */}
      {!isEligible && (
         <div className="absolute top-6 right-6 text-slate-300">
            <Lock size={20} />
         </div>
      )}
    </div>
  );
};