'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Shield, CheckCircle } from 'lucide-react';
import OAuthSignInButtons from '@/components/auth/OAuthSignInButtons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleLogin = async (userEmail: string, userPassword: string) => {
    setError('');
    setLoading(true);
    setLoginStatus('Authenticating...');

    try {
      // Normalize email to lowercase
      const normalizedEmail = userEmail.trim().toLowerCase();
      // Never log user emails in production
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting login');
      }
      
      const result = await signIn('credentials', {
        email: normalizedEmail,
        password: userPassword,
        redirect: false,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Login result:', result);
      }

      // NextAuth v5 returns { error: string } on failure or undefined/null on success
      if (result?.error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Login error:', result.error);
        }
        // Handle specific error types
        if (result.error === 'Configuration') {
          setError('Server configuration error: Set AUTH_SECRET or NEXTAUTH_SECRET in Vercel → Settings → Environment Variables (Production). If the value contains + or /, wrap it in double quotes. Then Redeploy → Clear cache and redeploy.');
        } else if (result.error === 'CallbackRouteError' || result.error?.includes('CredentialsSignin') || result.error?.includes('Invalid')) {
          setError('Invalid email or password. For quick login (Admin/Employee/Customer), seed the production database once: run "npm run seed" with MONGODB_URI pointing to your production DB.');
        } else {
          setError(`Login failed: ${result.error ?? 'Unknown error'}. Please check your credentials.`);
        }
        setLoading(false);
        setLoginStatus('');
      } else {
        // Success - no error means login worked
        if (process.env.NODE_ENV === 'development') {
          console.log('Login successful, redirecting...');
        }
        setLoginStatus('✓ Login successful!');
        setShowSuccessAnimation(true);
        
        // Get session to determine role and redirect accordingly
        setTimeout(async () => {
          try {
            // Fetch session to get user role
            const response = await fetch('/api/auth/session');
            const session = await response.json();
            
            // Redirect based on role
            if (session?.user?.role === 'admin') {
              router.push('/admin/dashboard');
            } else if (session?.user?.role === 'employee') {
              router.push('/employee/dashboard');
            } else if (session?.user?.role === 'customer') {
              router.push('/customer/dashboard');
            } else {
              // Fallback to home page which will redirect
              router.push('/');
            }
            router.refresh();
          } catch (err) {
            console.error('Error getting session:', err);
            // Fallback to home page
          router.push('/');
          router.refresh();
          }
        }, 800);
      }
    } catch (error) {
      console.error('Login exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Handle URL construction errors specifically
      if (errorMessage.includes('URL') || errorMessage.includes('Invalid')) {
        setError('Configuration error. Please ensure NEXTAUTH_URL is set correctly in environment variables.');
      } else {
        setError(`Connection error: ${errorMessage}. Please check your internet and try again.`);
      }
      setLoading(false);
      setLoginStatus('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col p-4 md:p-8 relative overflow-hidden">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-white rounded-full scale-0 animate-[scale_0.3s_ease-out_forwards]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-14 h-14 text-yellow-500 opacity-0 animate-[checkmark_0.4s_0.2s_ease-out_forwards]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            <h2 className="text-2xl font-semibold text-white mb-2 opacity-0 animate-[fadeIn_0.4s_0.3s_ease-out_forwards]">
                Welcome Back!
              </h2>
            <p className="text-slate-300 text-base opacity-0 animate-[fadeIn_0.4s_0.4s_ease-out_forwards]">
                Redirecting to your dashboard...
              </p>
          </div>
        </div>
      )}

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500 rounded-full blur-[140px]"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Main content - scrollable so footer is never covered */}
      <div className="flex-1 flex items-center justify-center min-h-0 relative z-10 overflow-y-auto py-6">
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-10">
          {/* Logo only */}
          <div className="text-white text-center">
            <img src="/logo.svg" alt="LOANATICKS" className="h-14 lg:h-16 w-auto object-contain" />
          </div>

          {/* Login Card */}
        <div className="w-full bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 lg:p-10 border border-white/20 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-600 text-base">Sign in to continue to your account</p>
          </div>
          
          {/* Trust Indicators */}
          <div className="space-y-3 mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-slate-600 font-medium">Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-slate-600 font-medium">24/7 Support</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide px-2">Registered as</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg py-2 px-3">
              <Shield className="h-3.5 w-3.5 text-yellow-600" />
              <span className="text-sm font-semibold text-slate-900">Expert Loan Advisor</span>
            </div>
          </div>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {loading && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-5 py-4 rounded-xl shadow-md flex items-center gap-3 border border-yellow-300">
                <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                <span className="font-medium text-sm">{loginStatus}</span>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-4 rounded-xl flex items-start gap-3">
                <div className="text-red-500 text-xl flex-shrink-0 mt-0.5">⚠️</div>
                <div className="flex-1">
                  <strong className="font-semibold text-sm block mb-1">Login Failed</strong>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-base text-slate-900 bg-white hover:border-slate-300 placeholder:text-slate-400"
                placeholder="your.email@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-base text-slate-900 bg-white hover:border-slate-300 placeholder:text-slate-400"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-900 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation min-h-[48px] text-base group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <OAuthSignInButtons disabled={loading} mode="signin" />

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                {"Don't have an account? "}
                <a href="/signup" className="font-semibold text-slate-900 hover:text-yellow-600 transition-colors">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
        </div>
      </div>

      {/* Footer - in flow so it's never covered by login card */}
      <footer className="flex-shrink-0 relative z-10 pt-4 pb-2">
        <p className="text-center text-sm text-slate-500">
          NMLS #2724157 · Licensed in State of TX · For licensing information go to{' '}
          <a
            href="https://www.nmlsconsumeraccess.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-yellow-700 underline transition-colors"
          >
            www.nmlsconsumeraccess.org
          </a>
        </p>
        <p className="text-center text-sm text-slate-500 mt-1">
          © 2026 LOANATICKS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
