import React from 'react';
import { Check, User, Target, PiggyBank, FileCheck } from 'lucide-react';

const steps = [
  { id: 1, label: 'Profile', status: 'complete', icon: User },
  { id: 2, label: 'Choose Plan', status: 'current', icon: Target },
  { id: 3, label: 'Contribution', status: 'upcoming', icon: PiggyBank },
  { id: 4, label: 'Review', status: 'upcoming', icon: FileCheck },
];

export const Stepper: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-10 px-4 md:px-0">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === 'complete';
          const isCurrent = step.status === 'current';
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Circle Indicator */}
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500
                    ${
                      isCompleted
                        ? 'bg-emerald-500 text-white scale-100'
                        : isCurrent
                        ? 'bg-indigo-600 text-white shadow-[0_0_0_4px_rgba(99,102,241,0.1)] scale-110'
                        : 'bg-white border-2 border-slate-200 text-slate-400 scale-100'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <Icon size={14} strokeWidth={isCurrent ? 2.5 : 2} />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-sm font-medium whitespace-nowrap transition-colors duration-300
                    ${
                      isCurrent
                        ? 'text-slate-900 font-bold block'
                        : isCompleted
                        ? 'text-slate-700 hidden sm:block' // Hide completed labels on tiny screens
                        : 'text-slate-400 hidden sm:block' // Hide future labels on mobile
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className={`
                    flex-1 mx-2 sm:mx-4 h-0 border-t-2 transition-all duration-500
                    ${
                        isCompleted 
                        ? 'border-emerald-500 border-solid' 
                        : 'border-slate-200 border-dotted'
                    }
                `}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};