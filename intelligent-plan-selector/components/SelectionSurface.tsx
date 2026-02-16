import React from 'react';
import { PlanData } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface SelectionSurfaceProps {
  plan: PlanData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isFaded: boolean;
}

export const SelectionSurface: React.FC<SelectionSurfaceProps> = ({ 
  plan, 
  isSelected, 
  onSelect,
  isFaded 
}) => {
  return (
    <div
      onClick={() => onSelect(plan.id)}
      className={`
        relative group cursor-pointer rounded-2xl p-8 md:p-10 transition-all duration-300 ease-out h-full flex flex-col
        border
        ${isSelected 
          ? 'bg-white border-blue-500 shadow-sm ring-4 ring-blue-500/10 z-10 scale-[1.02]' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:scale-[1.01] hover:shadow-sm z-0'}
        ${isFaded ? 'opacity-50 blur-[1px] grayscale-[0.5]' : 'opacity-100'}
      `}
    >
      {/* Selection Indicator */}
      <div className={`
        absolute top-8 right-8 transition-all duration-300
        ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
      `}>
        <CheckCircle2 className="text-blue-600 w-8 h-8 fill-blue-50" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
          {plan.subtitle}
        </span>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
          {plan.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-slate-500 leading-relaxed mb-8 text-base">
        {plan.description}
      </p>

      {/* Bullet Truths */}
      <ul className="space-y-4 mt-auto">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
            <span>
              <span className="font-semibold text-slate-900">{feature.label}:</span> {feature.value}
            </span>
          </li>
        ))}
      </ul>

      {/* Emotional Anchor */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-sm font-medium text-slate-600">
          {plan.emotionalCopy}
        </p>
      </div>

      {/* Recommendation Badge - Minimal */}
      {plan.isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
          Recommended
        </div>
      )}
    </div>
  );
};