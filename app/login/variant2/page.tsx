'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Shield, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function LoginVariant2() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoginStatus('Verifying credentials...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoginStatus('Checking user database...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Incorrect email or password. Please check your credentials and try again.');
        setLoading(false);
        setLoginStatus('');
      } else {
        setLoginStatus('✓ Login successful!');
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoginStatus('Loading your dashboard...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
      setLoading(false);
      setLoginStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Design Switcher */}
      <div className="absolute top-4 right-4 flex flex-wrap gap-2 z-20 max-w-[calc(100%-2rem)]">
        <Link href="/login" className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          D1
        </Link>
        <Link href="/login/variant2" className="px-2.5 py-1.5 bg-white text-purple-600 text-xs font-semibold rounded-lg shadow-lg">
          D2
        </Link>
        <Link href="/login/variant3" className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          D3
        </Link>
        <Link href="/login/variant4" className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          D4
        </Link>
        <Link href="/login/variant5" className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          D5
        </Link>
      </div>

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
              <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">LoanTicks</h1>
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

          {/* Demo Credentials */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">Demo Accounts</p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                <span className="font-semibold text-gray-900">Admin</span>
                <span className="text-gray-600 font-mono text-[10px] sm:text-xs">admin@loanticks.com · admin123</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 bg-blue-50 rounded-lg gap-1 sm:gap-0">
                <span className="font-semibold text-gray-900">Employee</span>
                <span className="text-gray-600 font-mono text-[10px] sm:text-xs">employee@loanticks.com · employee123</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 bg-green-50 rounded-lg gap-1 sm:gap-0">
                <span className="font-semibold text-gray-900">Customer</span>
                <span className="text-gray-600 font-mono text-[10px] sm:text-xs">customer@loanticks.com · customer123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

