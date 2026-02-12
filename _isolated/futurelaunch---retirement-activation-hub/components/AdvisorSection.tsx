import React from 'react';
import { MessageCircle, Calendar } from 'lucide-react';
import { ADVISORS } from '../constants';

export const AdvisorSection: React.FC = () => {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
            Need guidance? Real people are here.
          </h2>
          <p className="text-slate-500 text-lg">
            Robots are great for math, but sometimes you just need to talk to a human. Our team is non-commissioned and here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ADVISORS.map((advisor) => (
            <div key={advisor.id} className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 hover:bg-brand-50/50 transition-colors border border-transparent hover:border-brand-100 group">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img src={advisor.image} alt={advisor.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">{advisor.name}</h3>
              <p className="text-brand-600 text-sm font-medium mb-3">{advisor.role}</p>
              <p className="text-slate-500 mb-8 leading-relaxed">"{advisor.bio}"</p>
              
              <div className="flex gap-3 w-full mt-auto">
                <button className="flex-1 py-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={16} />
                    Chat
                </button>
                <button className="flex-1 py-2 px-4 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Calendar size={16} />
                    Book
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
