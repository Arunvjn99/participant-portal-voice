import React, { useEffect, useState } from 'react';
import { PlanData } from '../types';

interface TrajectoryCanvasProps {
  plan: PlanData;
}

export const TrajectoryCanvas: React.FC<TrajectoryCanvasProps> = ({ plan }) => {
  const [activePath, setActivePath] = useState('');
  
  // Define paths for desktop (wide)
  // viewBox 0 0 1000 400
  const paths = {
    'roth-401k': "M 0 380 C 200 380, 500 200, 1000 50", // Steep curve
    'trad-401k': "M 0 380 C 250 380, 550 250, 1000 120", // Medium curve
    'after-tax': "M 0 380 C 300 380, 600 300, 1000 220", // Flatter curve
  };

  // Define gradients based on theme
  const gradients = {
    violet: { start: '#6366f1', end: '#a855f7', stop: '#c084fc' }, // Indigo to Purple
    blue: { start: '#3b82f6', end: '#0ea5e9', stop: '#7dd3fc' }, // Blue to Sky
    slate: { start: '#64748b', end: '#94a3b8', stop: '#cbd5e1' }, // Slate
  };

  const currentTheme = gradients[plan.theme];
  const currentPath = paths[plan.id as keyof typeof paths] || paths['roth-401k'];

  useEffect(() => {
    setActivePath(currentPath);
  }, [currentPath]);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      {/* Background Glow */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 transition-colors duration-700 ease-in-out`}
        style={{ backgroundColor: currentTheme.start }}
      />

      <svg 
        viewBox="0 0 1000 400" 
        preserveAspectRatio="none" 
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={currentTheme.start} stopOpacity="0.4" />
            <stop offset="50%" stopColor={currentTheme.end} stopOpacity="1" />
            <stop offset="100%" stopColor={currentTheme.stop} stopOpacity="1" />
          </linearGradient>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <mask id="fadeMask">
            <linearGradient id="maskGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset="0.2" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <rect x="0" y="0" width="1000" height="400" fill="url(#maskGrad)" />
          </mask>
        </defs>

        {/* The Trajectory Line */}
        <path
          d={activePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow)"
          mask="url(#fadeMask)"
          className="transition-[d] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />

        {/* Under-glow Area */}
        <path
          d={`${activePath} L 1000 400 L 0 400 Z`}
          fill={`url(#lineGradient)`}
          className="opacity-10 transition-[d] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Milestone Dot */}
        <circle r="8" fill="white" filter="url(#glow)">
          <animateMotion 
            dur="0s" 
            fill="freeze"
            keyPoints="1;1" 
            keyTimes="0;1" 
            calcMode="linear"
          >
             <mpath href="#motionPath" />
          </animateMotion>
        </circle>

        {/* Hidden path for motion calc */}
        <path id="motionPath" d={activePath} fill="none" className="transition-[d] duration-700" />

        {/* Moving Particles */}
        {[0, 1, 2].map((i) => (
          <circle key={i} r={3 - i * 0.5} fill="white" className="opacity-80">
            <animateMotion
              dur={`${3 + i}s`}
              repeatCount="indefinite"
              path={activePath}
              rotate="auto"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.4 0 0.2 1"
              begin={`${i * 0.8}s`}
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur={`${3 + i}s`}
              repeatCount="indefinite"
              begin={`${i * 0.8}s`}
            />
          </circle>
        ))}
      </svg>
      
      {/* Mobile Vertical Fallback (Conceptual visual change handled by CSS/Layout mostly, 
          but SVG adapts via preserveAspectRatio="none" generally ok for this abstract shape,
          or we can rotate on mobile via CSS) */}
    </div>
  );
};