'use client';

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import DashboardWalkthrough from './DashboardWalkthrough';

interface TutorialButtonProps {
  role: 'admin' | 'employee' | 'customer';
}

export default function TutorialButton({ role }: TutorialButtonProps) {
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Check if walkthrough was triggered by button click
  useEffect(() => {
    const wasTriggered = sessionStorage.getItem(`walkthrough_${role}_triggered`);
    if (wasTriggered === 'true') {
      sessionStorage.removeItem(`walkthrough_${role}_triggered`);
      setShowWalkthrough(true);
    }
  }, [role]);

  const startTutorial = () => {
    // Clear the completion flag to restart the walkthrough
    localStorage.removeItem(`walkthrough_${role}_completed`);
    // Set a session flag to trigger the walkthrough
    sessionStorage.setItem(`walkthrough_${role}_triggered`, 'true');
    setShowWalkthrough(true);
  };

  const handleComplete = () => {
    setShowWalkthrough(false);
  };

  return (
    <>
      {/* Tutorial Button - Fixed position */}
      <button
        onClick={startTutorial}
        type="button"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 group touch-manipulation min-h-[44px] min-w-[44px]"
        aria-label="Start tutorial"
        title="Start tutorial walkthrough"
      >
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="sr-only">Start Tutorial</span>
        
        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          Click for tutorial
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Walkthrough Component */}
      {showWalkthrough && (
        <DashboardWalkthrough
          role={role}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
