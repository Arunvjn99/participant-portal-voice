import React from 'react';
import { MessageCircle } from 'lucide-react';

export const AdvisorContact: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-12 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1 border border-slate-200/60 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
          
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
               <div className="w-12 h-12 rounded-full bg-slate-100 p-0.5 ring-1 ring-slate-200/50">
                 <img src="https://i.pravatar.cc/150?img=32" alt="Advisor" className="w-full h-full rounded-full object-cover" />
               </div>
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-0.5">
                 <h3 className="text-sm font-bold text-slate-900">Sarah Jenkins</h3>
                 <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-wide">Advisor</span>
               </div>
               <p className="text-xs text-slate-500">Not sure which plan to pick? I can help you decide.</p>
            </div>
          </div>

          <button className="w-full md:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
             <span>Chat with Sarah</span>
             <MessageCircle size={14} className="text-slate-400" />
          </button>
          
        </div>
      </div>
    </div>
  );
};