import React, { useState } from 'react';
import { Send, Sparkles, Loader2, X } from 'lucide-react';
import { SUGGESTION_CHIPS } from '../constants';
import { getFinancialGuidance } from '../services/geminiService';

export const AIAssistantInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setHasInteracted(true);
    setIsLoading(true);
    setResponse(null);
    setInputValue(query); // If clicked from chip

    const result = await getFinancialGuidance(query);
    setResponse(result);
    setIsLoading(false);
  };

  const handleClear = () => {
    setResponse(null);
    setInputValue('');
    setHasInteracted(false);
  }

  return (
    <div className="w-full max-w-xl mt-12 relative z-40 group">
      {/* The Input Container */}
      <div className={`relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 ${response ? 'rounded-t-2xl' : 'rounded-full'}`}>
        <div className="flex items-center px-2 py-2">
            <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 ml-1">
                <Sparkles size={18} />
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
                placeholder="What would you like to understand today?"
                className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
            />
            <button 
                onClick={() => handleSearch(inputValue)}
                disabled={isLoading || !inputValue}
                className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </div>

        {/* The AI Response Expansion */}
        {response && (
             <div className="w-full bg-white border-t border-slate-50 px-6 py-6 rounded-b-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-4">
                    <div className="flex-1 text-slate-600 leading-relaxed text-sm md:text-base">
                        {response}
                    </div>
                    <button onClick={handleClear} className="text-slate-300 hover:text-slate-500 h-fit">
                        <X size={16} />
                    </button>
                </div>
             </div>
        )}
      </div>

      {/* Suggestion Chips */}
      {!hasInteracted && (
        <div className="flex flex-wrap gap-2 mt-4 px-2">
            {SUGGESTION_CHIPS.map((chip, idx) => (
            <button
                key={idx}
                onClick={() => handleSearch(chip)}
                className="px-4 py-2 bg-white/50 hover:bg-white border border-slate-200/50 hover:border-brand-200 rounded-full text-xs font-medium text-slate-500 hover:text-brand-600 transition-all shadow-sm hover:shadow-md"
            >
                {chip}
            </button>
            ))}
        </div>
      )}
    </div>
  );
};
