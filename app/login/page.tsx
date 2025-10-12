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
    setLoginStatus('Authenticating credentials...');

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Show status
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        setLoginStatus('');
      } else {
        setLoginStatus('Authentication successful!');
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoginStatus('Redirecting to dashboard...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Redirect will be handled by middleware based on user role
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
      setLoginStatus('');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center shadow-xl overflow-hidden">
              <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">LoanTicks</h1>
              <p className="text-blue-200 text-sm">Financial Services</p>
            </div>
          </div>
          
          <div className="space-y-6 text-white">
            <h2 className="text-4xl font-bold leading-tight">
              Secure Loan<br/>Management System
            </h2>
            <p className="text-blue-200 text-lg">
              Professional financial solutions for businesses and individuals
            </p>
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-sm">
          <p>© 2025 LoanTicks Financial Services. All rights reserved.</p>
          <p className="mt-1">Secured by enterprise-grade encryption</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-900 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-slate-900">LoanTicks</h1>
                <p className="text-slate-600 text-xs">Financial Services</p>
              </div>
            </div>
          </div>

          {/* Login Header */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Sign In
            </h2>
            <p className="mt-2 text-slate-600">
              Access your account securely
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Loading Status */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-slideIn">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div className="flex-1">
                  <strong className="font-semibold">{loginStatus}</strong>
                  <div className="w-full bg-blue-200 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-pulse" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-shake">
                <div className="text-red-500">⚠</div>
                <div>
                  <strong className="font-semibold">Authentication Failed</strong>
                  <p className="text-sm mt-0.5">{error}</p>
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
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Authenticating...
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
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">
              Demo Access Credentials
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">Administrator</div>
                <div className="text-slate-600 text-xs font-mono">admin@loanticks.com · admin123</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">Employee</div>
                <div className="text-slate-600 text-xs font-mono">employee@loanticks.com · employee123</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">Customer</div>
                <div className="text-slate-600 text-xs font-mono">customer@loanticks.com · customer123</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Secured with SSL encryption · Protected by enterprise security</p>
        </div>
      </div>
      </div>
    </div>
  );
}

