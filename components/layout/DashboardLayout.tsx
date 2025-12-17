'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { ReactNode, useState } from 'react';

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-slideIn">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Logging Out
              </h3>
              <p className="text-slate-600">
                Securely ending your session...
              </p>
              <div className="mt-4 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse" style={{width: '100%'}}></div>
              </div>
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
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}

