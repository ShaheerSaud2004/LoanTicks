'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Shield, TrendingUp, Users } from 'lucide-react';

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

      console.log('Login result:', JSON.stringify(result, null, 2));
      
      // NextAuth v5 returns { error: string } on failure or undefined/null on success
      if (result?.error) {
        console.error('Login error:', result.error);
        // Handle specific error types
        if (result.error === 'Configuration') {
          setError('Server configuration error. Please ensure NEXTAUTH_SECRET is set correctly. Restart the server if you just added it.');
        } else if (result.error.includes('CredentialsSignin') || result.error.includes('Invalid email or password')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(`Login failed: ${result.error}. Please check your credentials.`);
        }
        setLoading(false);
        setLoginStatus('');
      } else {
        // Success - no error means login worked
        console.log('✓ Login successful, redirecting...');
        setLoginStatus('✓ Login successful!');
        setShowSuccessAnimation(true);
        
        // Quick animation then redirect
        setTimeout(() => {
          router.push('/');
          router.refresh();
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

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setError('');
    setEmail(userEmail);
    setPassword(userPassword);
    setLoading(true);
    setLoginStatus('Authenticating...');
    
    try {
      // Never log user emails
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting quick login');
      }
      const result = await signIn('credentials', {
        email: userEmail.trim().toLowerCase(),
        password: userPassword,
        redirect: false,
      });

      console.log('Login result:', JSON.stringify(result, null, 2));
      
      // NextAuth v5 returns { error: string } on failure or { url: string } on success
      if (result?.error) {
        console.error('Login error:', result.error);
        // Handle specific error types
        if (result.error === 'Configuration') {
          setError('Server configuration error. Please ensure NEXTAUTH_SECRET is set correctly. Restart the server if you just added it.');
        } else if (result.error.includes('CredentialsSignin') || result.error.includes('Invalid email or password')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(`Login failed: ${result.error}. Please check your credentials.`);
        }
        setLoading(false);
        setLoginStatus('');
      } else {
        // Success - no error means login worked
        console.log('✓ Login successful, redirecting...');
        setLoginStatus('✓ Login successful!');
        setShowSuccessAnimation(true);
        
        // Quick animation then redirect
        setTimeout(() => {
          router.push('/');
          router.refresh();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 animate-fadeIn">
          <div className="text-center">
            <div className="relative">
              {/* Animated Checkmark Circle */}
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-white rounded-full animate-scaleIn"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-yellow-500 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {/* Success Text */}
              <h2 className="text-3xl font-bold text-white mb-2 animate-slideUp">
                Welcome Back!
              </h2>
              <p className="text-white/90 text-lg animate-slideUp" style={{animationDelay: '0.2s'}}>
                Redirecting to your dashboard...
              </p>
              
              {/* Loading Dots */}
              <div className="flex justify-center gap-2 mt-6 animate-slideUp" style={{animationDelay: '0.3s'}}>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 lg:gap-8 items-center relative z-10 mb-8">
        {/* Left Side - Hero Content */}
        <div className="text-white space-y-6 lg:space-y-8 p-6 lg:p-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0 relative p-2">
              <Image src="/logo.jpg" alt="LoanAticks" fill className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">LoanAticks</h1>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">Home Mortgage Solutions</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3 lg:mb-4">
              Your Dream Home<br/>Starts Here 🏡
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
              Experience streamlined mortgage financing with competitive rates, fast approvals, and expert support every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl font-bold">A+</div>
              <div className="text-xs sm:text-sm text-white/80">Rated</div>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl font-bold">15K+</div>
              <div className="text-xs sm:text-sm text-white/80">Homeowners</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl font-bold">$4.8B</div>
              <div className="text-xs sm:text-sm text-white/80">Funded</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm sm:text-base">Sign in to continue to your account</p>
          </div>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {loading && (
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 border-2 border-yellow-400 text-gray-900 px-5 py-4 rounded-xl shadow-lg flex items-center gap-4 animate-slideIn">
                <Loader2 className="h-6 w-6 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <strong className="font-bold text-base">{loginStatus}</strong>
                  <div className="w-full bg-yellow-400/30 h-2 mt-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 shadow-lg rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-500 border-2 border-red-600 text-white px-5 py-4 rounded-xl shadow-lg flex items-start gap-3 animate-shake">
                <div className="text-2xl">❌</div>
                <div className="flex-1">
                  <strong className="font-bold text-base block mb-1">Login Failed</strong>
                  <p className="text-sm text-red-50">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-base"
                placeholder="your.email@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-base"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 active:from-yellow-700 active:to-yellow-800 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 touch-manipulation min-h-[44px] text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Please Wait...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Login Options */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">Quick Login</p>
            <div className="space-y-2 text-xs sm:text-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleQuickLogin('admin@loanaticks.com', 'admin123');
                }}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 active:from-gray-800 active:to-gray-900 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] text-sm sm:text-base"
              >
                <span className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Login
                </span>
                <span className="text-xs opacity-90">Click to login →</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleQuickLogin('employee@loanaticks.com', 'employee123');
                }}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employee Login
                </span>
                <span className="text-xs opacity-90">Click to login →</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleQuickLogin('customer@loanaticks.com', 'customer123');
                }}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Customer Login
                </span>
                <span className="text-xs opacity-90">Click to login →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer at Bottom */}
      <div className="w-full max-w-6xl mt-8 pt-6 border-t border-gray-600/30 relative z-10">
        <p className="text-center text-sm text-gray-400">
          © 2025 LoanAticks. All rights reserved.
        </p>
      </div>
    </div>
  );
}
