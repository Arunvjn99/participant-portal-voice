import React, { useState } from 'react';
import { PlanRail } from './components/PlanRail';
import { PlanDetails } from './components/PlanDetails';
import { ProfileCapsule } from './components/ProfileCapsule';
import { AdvisorContact } from './components/AdvisorContact';
import { Stepper } from './components/Stepper';
import { PLANS, USER_PROFILE } from './constants';
import { ArrowRight, Lock } from 'lucide-react';

const App: React.FC = () => {
  // Default to the Recommended plan
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    PLANS.find(p => p.isRecommended)?.id || PLANS[0].id
  );
  
  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[0];

  return (
    <div className="min-h-screen font-sans bg-[#F5F5F7] text-slate-900">
      
      {/* 1. Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">R</div>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Retirement Path</span>
           </div>
           
           {/* Desktop Profile Capsule */}
           <ProfileCapsule user={USER_PROFILE} />
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* 2. Responsive Stepper */}
        <Stepper />
        
        {/* 3. Page Title */}
        <div className="mb-8 animate-fade-in text-center md:text-left">
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Select your retirement plan.</h1>
           <p className="text-slate-500">Choose an option to see how it affects your future savings.</p>
        </div>

        {/* 4. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Plan Selection (Span 7) */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
             <PlanRail 
               plans={PLANS} 
               selectedId={selectedPlanId} 
               onSelect={setSelectedPlanId} 
             />
             
             {/* Advisor Section */}
             <div className="hidden lg:block">
                <AdvisorContact />
             </div>
          </div>

          {/* Right Column: Projected Impact Sticky Panel (Span 5) */}
          <div className="lg:col-span-5 relative">
             <div className="lg:sticky lg:top-24 transition-all duration-500">
               <PlanDetails plan={selectedPlan} user={USER_PROFILE} />
             </div>
          </div>

          {/* Mobile Advisor (Visible only on small screens) */}
          <div className="lg:hidden">
            <AdvisorContact />
          </div>

        </div>

      </main>

      {/* 5. Floating Commitment Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-4 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="hidden md:block text-xs text-slate-400">
             {selectedPlan.isEligible ? "Your choice is saved automatically." : "This option is not available."}
           </div>
           <button 
             disabled={!selectedPlan.isEligible}
             className={`
               w-full md:w-auto text-white text-sm font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2
               ${selectedPlan.isEligible 
                 ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 hover:scale-[1.02]' 
                 : 'bg-slate-300 shadow-none cursor-not-allowed'}
             `}
           >
             {selectedPlan.isEligible ? (
               <>
                 Confirm {selectedPlan.title}
                 <ArrowRight size={16} />
               </>
             ) : (
               <>
                 <Lock size={14} />
                 Plan Unavailable
               </>
             )}
           </button>
        </div>
      </div>

    </div>
  );
};

export default App;