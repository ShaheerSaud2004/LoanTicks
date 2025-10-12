'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, CheckCircle, User } from 'lucide-react';

export default function LoginPage() {
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
      // Show initial status
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
        
        // Redirect will be handled by middleware based on user role
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Design Switcher */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Link href="/login" className="px-3 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-lg">
          Design 1
        </Link>
        <Link href="/login/variant2" className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition">
          Design 2
        </Link>
        <Link href="/login/variant3" className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition">
          Design 3
        </Link>
        <Link href="/login/variant4" className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition">
          Design 4
        </Link>
      </div>
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        {/* Animated circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 max-w-md">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-20 w-20 bg-white rounded-xl flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-white/20">
                <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">LoanTicks</h1>
                <p className="text-blue-200 text-sm font-medium">Financial Services</p>
              </div>
            </div>
            
            <div className="space-y-6 text-white">
              <h2 className="text-5xl font-bold leading-tight tracking-tight">
                Secure Loan<br/>Management<br/>System
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Professional financial solutions trusted by businesses and individuals worldwide
              </p>
              
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-blue-200 text-sm">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">$2.5B</div>
                  <div className="text-blue-200 text-sm">Loans Processed</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-blue-200 text-sm border-t border-white/10 pt-6">
            <p className="font-medium">© 2025 LoanTicks Financial Services</p>
            <p className="mt-1 text-blue-300">🔒 Secured by enterprise-grade encryption</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl p-4 shadow-lg border border-slate-200">
              <div className="h-14 w-14 bg-blue-900 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-slate-900">LoanTicks</h1>
                <p className="text-slate-600 text-xs font-medium">Financial Services</p>
              </div>
            </div>
          </div>

          {/* Login Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-slate-600">
              Sign in to access your account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 lg:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Loading Status - MORE PROMINENT */}
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Please Wait...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In to Account
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-8 border-t-2 border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Demo Access Credentials
              </p>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">Test Accounts</span>
            </div>
            <div className="space-y-3">
              <div className="group bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 p-4 rounded-xl hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-900 text-sm">Administrator</div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>
                </div>
                <div className="text-slate-600 text-xs font-mono bg-white/60 px-2 py-1 rounded">admin@loanticks.com · admin123</div>
              </div>
              <div className="group bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 p-4 rounded-xl hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-900 text-sm">Employee</div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Staff</span>
                </div>
                <div className="text-slate-600 text-xs font-mono bg-white/60 px-2 py-1 rounded">employee@loanticks.com · employee123</div>
              </div>
              <div className="group bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-4 rounded-xl hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-900 text-sm">Customer</div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">User</span>
                </div>
                <div className="text-slate-600 text-xs font-mono bg-white/60 px-2 py-1 rounded">customer@loanticks.com · customer123</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-green-500">●</span>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-500">●</span>
              <span>Bank-Grade Security</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

