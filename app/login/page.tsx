'use client';

import { useState } from 'react';
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
      const result = await signIn('credentials', {
        email: userEmail,
        password: userPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Incorrect email or password. Please check your credentials and try again.');
        setLoading(false);
        setLoginStatus('');
      } else {
        setLoginStatus('✓ Login successful!');
        setShowSuccessAnimation(true);
        
        // Quick animation then redirect
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 800);
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
      setLoading(false);
      setLoginStatus('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    handleLogin(userEmail, userPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 animate-fadeIn">
          <div className="text-center">
            <div className="relative">
              {/* Animated Checkmark Circle */}
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-white rounded-full animate-scaleIn"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-green-500 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 lg:gap-8 items-center relative z-10">
        {/* Left Side - Hero Content */}
        <div className="text-white space-y-6 lg:space-y-8 p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="LOANATicks" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">LOANATicks</h1>
              <p className="text-white/80 text-xs sm:text-sm">Modern Financial Platform</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3 lg:mb-4">
              Smart Lending,<br/>Simplified
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
              Experience next-generation loan management with cutting-edge technology and unparalleled security.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl font-bold">100%</div>
              <div className="text-xs sm:text-sm text-white/80">Secure</div>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl font-bold">50K+</div>
              <div className="text-xs sm:text-sm text-white/80">Users</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl font-bold">$2.5B</div>
              <div className="text-xs sm:text-sm text-white/80">Processed</div>
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
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 border-2 border-blue-400 text-white px-5 py-4 rounded-xl shadow-lg flex items-center gap-4 animate-slideIn">
                <Loader2 className="h-6 w-6 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <strong className="font-bold text-base">{loginStatus}</strong>
                  <div className="w-full bg-blue-400/30 h-2 mt-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-white shadow-lg rounded-full animate-pulse" style={{width: '100%'}}></div>
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
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
                onClick={() => handleQuickLogin('admin@loanaticks.com', 'admin123')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Login
                </span>
                <span className="text-xs opacity-90">Click to login →</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employee@loanaticks.com', 'employee123')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employee Login
                </span>
                <span className="text-xs opacity-90">Click to login →</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@loanaticks.com', 'customer123')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
