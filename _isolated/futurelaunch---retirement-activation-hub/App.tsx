import React from 'react';
import { HeroSection } from './components/HeroSection';
import { LearningSection } from './components/LearningSection';
import { AdvisorSection } from './components/AdvisorSection';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen mesh-bg selection:bg-brand-100 selection:text-brand-900 font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <LearningSection />
        <AdvisorSection />
      </main>
      
      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>&copy; 2024 FutureLaunch. Designing your tomorrow.</p>
      </footer>
    </div>
  );
}

export default App;
