'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface WalkthroughStep {
  target: string; // CSS selector or data attribute
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface DashboardWalkthroughProps {
  role: 'admin' | 'employee' | 'customer';
  onComplete: () => void;
}

const walkthroughSteps: Record<string, WalkthroughStep[]> = {
  customer: [
    {
      target: '[data-tour="welcome-banner"]',
      title: 'Welcome to Your Dashboard! 👋',
      description: 'This is your customer dashboard where you can view your active loans, track applications, and manage your mortgage information.',
      position: 'bottom',
    },
    {
      target: '[data-tour="stats-cards"]',
      title: 'Your Loan Statistics',
      description: 'Here you can see your active mortgages, total amount financed, next payment due, and application status at a glance.',
      position: 'bottom',
    },
    {
      target: '[data-tour="apply-button"]',
      title: 'Apply for a New Loan',
      description: 'Click this button to start a new mortgage application. The process takes about 30-45 minutes and guides you through all required information.',
      position: 'bottom',
    },
    {
      target: '[data-tour="active-loans"]',
      title: 'Your Active Loans',
      description: 'View all your active mortgage loans here, including payment amounts, due dates, and property information.',
      position: 'top',
    },
    {
      target: '[data-tour="applications-tracker"]',
      title: 'Application Tracker',
      description: 'Track the status of your loan applications. You\'ll see when applications are submitted, under review, approved, or need additional information.',
      position: 'top',
    },
  ],
  employee: [
    {
      target: '[data-tour="dashboard-header"]',
      title: 'Welcome to Employee Dashboard! 👋',
      description: 'As an employee, you can review and manage loan applications assigned to you. Let\'s explore the key features.',
      position: 'bottom',
    },
    {
      target: '[data-tour="stats-cards"]',
      title: 'Application Statistics',
      description: 'View your workload at a glance: total applications, pending reviews, approved loans, and unassigned cases.',
      position: 'bottom',
    },
    {
      target: '[data-tour="filters"]',
      title: 'Filter Applications',
      description: 'Use these filters to find specific applications by status, assignment, or search by borrower name or application ID.',
      position: 'bottom',
    },
    {
      target: '[data-tour="applications-list"]',
      title: 'Application List',
      description: 'Review all loan applications here. Click "View" to see full details, make decisions, and add notes.',
      position: 'top',
    },
  ],
  admin: [
    {
      target: '[data-tour="dashboard-header"]',
      title: 'Welcome to Admin Dashboard! 👋',
      description: 'As an administrator, you have full system access. You can manage employees, view all applications, and oversee system operations.',
      position: 'bottom',
    },
    {
      target: '[data-tour="stats-cards"]',
      title: 'System Overview',
      description: 'Monitor key metrics including total applications, active employees, system revenue, and overall activity.',
      position: 'bottom',
    },
    {
      target: '[data-tour="applications-manager"]',
      title: 'All Applications',
      description: 'View and manage all loan applications across the system. You can assign applications to employees and track their progress.',
      position: 'top',
    },
    {
      target: '[data-tour="employee-management"]',
      title: 'Employee Management',
      description: 'Manage your team members - add new employees, view their performance, and assign applications.',
      position: 'top',
    },
  ],
};

export default function DashboardWalkthrough({ role, onComplete }: DashboardWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: string | number; left: string }>({ top: '50%', left: '50%' });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const positionLockRef = useRef(false);
  const steps = useMemo(() => walkthroughSteps[role] || [], [role]);

  const scrollToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    const element = document.querySelector(step.target);
    
    if (element) {
      setIsTransitioning(true);
      positionLockRef.current = true;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        setIsTransitioning(false);
        positionLockRef.current = false;
      }, 600);
    } else {
      console.warn('Walkthrough element not found:', step.target);
    }
  }, [steps]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem(`walkthrough_${role}_completed`);
    const wasTriggered = sessionStorage.getItem(`walkthrough_${role}_triggered`);
    
    if (!hasSeenWalkthrough || wasTriggered === 'true') {
      if (wasTriggered === 'true') {
        sessionStorage.removeItem(`walkthrough_${role}_triggered`);
      }
      setTimeout(() => {
        setIsVisible(true);
        setTooltipPosition({ top: '50%', left: '50%' });
        scrollToStep(0);
      }, 300);
    }
  }, [role, scrollToStep]);

  const nextStep = () => {
    if (isTransitioning) return; // Prevent rapid clicks
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      // Scroll only once when step changes
      scrollToStep(next);
    } else {
      completeWalkthrough();
    }
  };

  const prevStep = () => {
    if (isTransitioning) return; // Prevent rapid clicks
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      // Scroll only once when step changes
      scrollToStep(prev);
    }
  };

  const skipWalkthrough = () => {
    completeWalkthrough();
  };

  const completeWalkthrough = () => {
    localStorage.setItem(`walkthrough_${role}_completed`, 'true');
    setIsVisible(false);
    onComplete();
  };

  const currentStepData = steps[currentStep] || steps[0];

  useEffect(() => {
    if (!isVisible || !currentStepData) return;
    
      // Update position after scroll completes - only once per step change
    const updatePosition = () => {
      // Don't update if we're transitioning or position is locked
      if (isTransitioning || positionLockRef.current) {
        return;
      }

      const element = document.querySelector(currentStepData.target);
      if (!element) {
        console.warn('Walkthrough element not found:', currentStepData.target);
        // If element not found, always center tooltip
        setTooltipPosition({ top: '50%', left: '50%' });
        return;
      }

      const rect = element.getBoundingClientRect();
      
      // If element has no height/width (empty or hidden), always center
      if (rect.width === 0 || rect.height === 0) {
        setTooltipPosition({ top: '50%', left: '50%' });
        return;
      }

      // Always center the tooltip horizontally for better UX and no lag
      // Position vertically based on element position
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const _viewportWidth = window.innerWidth;

      let top: string | number = '50%';
      const left = '50%'; // Always center horizontally

      // Calculate vertical position based on element
      if (rect.bottom + scrollY + 300 < scrollY + viewportHeight) {
        // Position below element
        top = rect.bottom + scrollY + 20;
      } else if (rect.top + scrollY - 300 > scrollY) {
        // Position above element
        top = rect.top + scrollY - 10;
      } else {
        // Center vertically if element is in middle
        top = '50%';
      }

      setTooltipPosition({ top, left });
    };

    // Update position immediately, then after scroll completes
    let scrollTimeout: NodeJS.Timeout;
    const timeoutId = setTimeout(() => {
      if (!isTransitioning && !positionLockRef.current) {
        updatePosition();
      }
    }, 600); // Reduced delay for less lag

    // Only update on manual scroll/resize, not on step-initiated scrolls
    const handleScroll = () => {
      // Don't update during transitions
      if (isTransitioning || positionLockRef.current) {
        return;
      }
      // Debounce scroll updates - reduced delay
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isTransitioning && !positionLockRef.current) {
          updatePosition();
        }
      }, 100); // Reduced debounce for less lag
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      if (!isTransitioning && !positionLockRef.current) {
        updatePosition();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStep, currentStepData, isVisible, steps.length, isTransitioning]);

  if (!isVisible || steps.length === 0) {
    return null;
  }

  const element = document.querySelector(currentStepData.target);
  const rect = element?.getBoundingClientRect();
  const hasValidElement = element && rect && rect.width > 0 && rect.height > 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[9998] transition-opacity" />

      {/* Highlight Box - only show if element exists and has dimensions */}
      {hasValidElement && (
        <div
          className="fixed z-[9999] border-4 border-yellow-500 rounded-lg shadow-2xl pointer-events-none transition-all"
          style={{
            top: `${rect.top - 4}px`,
            left: `${rect.left - 4}px`,
            width: `${rect.width + 8}px`,
            height: `${rect.height + 8}px`,
          }}
        />
      )}

      {/* Tooltip - always centered horizontally, positioned vertically */}
      <div
        className={`fixed z-[10000] bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-[90vw] sm:max-w-sm w-full transition-all duration-200`}
        style={{
          top: typeof tooltipPosition.top === 'string' 
            ? tooltipPosition.top 
            : `${tooltipPosition.top}px`,
          left: tooltipPosition.left,
          transform: typeof tooltipPosition.top === 'string' && tooltipPosition.top === '50%'
            ? 'translate(-50%, -50%)'
            : 'translate(-50%, 0)',
          maxHeight: isMobile ? '80vh' : 'none',
          overflowY: isMobile ? 'auto' : 'visible',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{currentStepData.title}</h3>
          </div>
          <button
            onClick={skipWalkthrough}
            className="text-gray-400 hover:text-gray-600 transition ml-2"
            aria-label="Skip walkthrough"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">{currentStepData.description}</p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isTransitioning}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={isTransitioning}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-gray-900 bg-yellow-500 rounded-lg hover:bg-yellow-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          ) : (
            <button
              onClick={completeWalkthrough}
              disabled={isTransitioning}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Got it!</span>
            </button>
          )}
        </div>

        {/* Skip Link */}
        <button
          onClick={skipWalkthrough}
          className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 hover:text-gray-700 w-full text-center"
        >
          Skip tour
        </button>
      </div>
    </>
  );
}
