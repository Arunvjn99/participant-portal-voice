import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

const data = [
  { year: '2024', amount: 0 },
  { year: '2030', amount: 45000 },
  { year: '2040', amount: 180000 },
  { year: '2050', amount: 480000 },
  { year: '2060', amount: 890000 },
  { year: '2065', amount: 1240000 },
];

export const FloatingCards: React.FC = () => {
  const [contribution, setContribution] = useState(6);

  return (
    <div className="relative w-full h-[600px] hidden lg:block select-none pointer-events-none lg:pointer-events-auto">
      {/* 1. Main Projection Card - Deepest Layer */}
      <div className="absolute top-10 right-10 w-96 h-80 glass-card rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.15)] p-6 z-10 animate-float transition-all duration-500 hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-slate-500 text-sm font-medium">Projected at 65</p>
            <h3 className="text-4xl font-display font-bold text-slate-800 tracking-tight">
              $1,240,000
            </h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
            <ArrowUpRight size={14} className="mr-1" />
            On Track
          </div>
        </div>
        
        <div className="h-48 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#6d28d9', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Insight Chip - Floating above chart */}
      <div className="absolute top-0 right-28 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-white/50 z-20 animate-float-delayed flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-full text-amber-600">
          <Sparkles size={16} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Smart Recommendation</p>
          <p className="text-xs text-slate-500">Roth 401(k) suggested for your profile.</p>
        </div>
      </div>

      {/* 3. Contribution Simulator - Middle Layer */}
      <div className="absolute bottom-20 left-10 w-80 glass-card rounded-2xl shadow-2xl p-6 z-30 border-t border-white">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-medium text-slate-600">Your Contribution</span>
          <span className="text-2xl font-bold text-brand-600">{contribution}%</span>
        </div>
        
        <input 
          type="range" 
          min="1" 
          max="15" 
          value={contribution} 
          onChange={(e) => setContribution(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600 mb-4"
        />
        
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Employer match maximized at 6%</span>
        </div>
      </div>

      {/* 4. Abstract Decor Elements */}
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
    </div>
  );
};
