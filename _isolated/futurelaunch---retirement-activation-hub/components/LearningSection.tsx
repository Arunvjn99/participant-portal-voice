import React from 'react';
import { Play } from 'lucide-react';
import { RESOURCES } from '../constants';

export const LearningSection: React.FC = () => {
  return (
    <section className="py-20 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex justify-between items-end mb-10">
        <div>
           <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Learn at your pace</h2>
           <p className="text-slate-500">Short, simple guides to help you make informed decisions.</p>
        </div>
        <button className="hidden sm:block text-brand-600 font-medium hover:text-brand-800 transition-colors">
            View library
        </button>
      </div>

      <div className="relative w-full overflow-x-auto pb-8 hide-scrollbar">
        <div className="flex gap-6 w-max">
          {RESOURCES.map((resource) => (
            <div 
                key={resource.id} 
                className="group relative w-72 h-80 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1"
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img 
                        src={resource.thumbnail} 
                        alt={resource.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 w-full">
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider mb-2 border border-white/10">
                        {resource.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        {resource.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Play size={10} fill="currentColor" />
                        </div>
                        {resource.duration}
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
