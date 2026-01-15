'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import Footer from './Footer';
import TutorialButton from '@/components/walkthrough/TutorialButton';

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  userEmail: string;
}

export default function DashboardLayout({
  children,
  userName,
  userRole,
  userEmail,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutStage, setLogoutStage] = useState<'signing-out' | 'clearing' | 'success' | null>(null);

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (isLoggingOut) return; // Prevent double-clicks
    
    try {
      setIsLoggingOut(true);
      setLogoutStage('signing-out');
      
      // Stage 1: Signing out (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sign out from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      
      // Stage 2: Clearing session (1 second)
      setLogoutStage('clearing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stage 3: Success (1 second)
      setLogoutStage('success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Final redirect
      router.push('/login');
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, show animation and redirect
      setLogoutStage('success');
      setTimeout(() => {
        router.push('/login');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }, 1000);
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-gray-600 text-gray-700';
      case 'employee':
        return 'bg-yellow-500 text-yellow-600';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Logout Animation */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fadeIn"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-gray-200 max-w-md w-full mx-4 animate-scaleIn">
            <div className="flex flex-col items-center gap-4">
              {logoutStage === 'signing-out' && (
                <>
                  <div className="relative">
                    <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-yellow-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Signing out...</h3>
                    <p className="text-sm md:text-base text-gray-600">Please wait while we securely log you out</p>
                  </div>
                </>
              )}
              
              {logoutStage === 'clearing' && (
                <>
                  <div className="relative">
                    <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Clearing session...</h3>
                    <p className="text-sm md:text-base text-gray-600">Removing your session data</p>
                  </div>
                </>
              )}
              
              {logoutStage === 'success' && (
                <>
                  <div className="relative">
                    <div className="h-16 w-16 md:h-20 md:w-20 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
                      <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-600 animate-checkmark" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Logged out successfully!</h3>
                    <p className="text-sm md:text-base text-gray-600">Redirecting to login page...</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
              <button
                onClick={() => router.push(
                  userRole === 'admin' ? '/admin/dashboard' :
                  userRole === 'employee' ? '/employee/dashboard' :
                  '/customer/dashboard'
                )}
                className="h-10 sm:h-12 w-10 sm:w-12 rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition cursor-pointer flex-shrink-0 relative"
              >
                <Image src="/logo.jpg" alt="LoanTicks" fill className="object-contain" />
              </button>
              
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center gap-1">
                {userRole === 'customer' && (
                  <>
                    <button
                      onClick={() => router.push('/customer/dashboard')}
                      className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/customer/loan-application')}
                      className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </>
                )}
                {userRole === 'employee' && (
                  <>
                    <button
                      onClick={() => router.push('/employee/dashboard')}
                      className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                    >
                      Dashboard
                    </button>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => router.push('/admin/dashboard')}
                      className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/admin/employees')}
                      className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                    >
                      Employees
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] xl:max-w-none">
                  {userName}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[120px] xl:max-w-none">{userEmail}</div>
              </div>
              
              <span
                className={`hidden sm:inline px-2 sm:px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeColor()}`}
              >
                {userRole}
              </span>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                type="button"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0"
                aria-label="Logout"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden md:inline">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden md:inline">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>

      {/* Tutorial Button - Fixed position */}
      <TutorialButton role={userRole as 'admin' | 'employee' | 'customer'} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

