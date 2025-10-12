'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Redirect will be handled by middleware based on user role
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden bg-white/95 backdrop-blur-sm border-4 border-white/50 transition-transform hover:scale-110 duration-300">
            <img src="/logo.jpg" alt="LoanTicks Logo" className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-6 text-4xl font-black text-white drop-shadow-lg">
            LoanTicks
          </h2>
          <p className="mt-2 text-base text-white/90 font-medium">
            Professional Loan Management Platform
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm shadow-sm animate-shake">
                <strong className="font-bold">Error! </strong>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-2"
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
                className="appearance-none block w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800 mb-2"
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
                className="appearance-none block w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Signing in...
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
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <p className="text-xs font-bold text-gray-500 text-center mb-4 uppercase tracking-wide">
              🔑 Demo Credentials
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                <strong className="text-purple-700 font-bold">👑 Admin:</strong> 
                <span className="text-gray-700 ml-2">admin@loanticks.com / admin123</span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <strong className="text-blue-700 font-bold">💼 Employee:</strong> 
                <span className="text-gray-700 ml-2">employee@loanticks.com / employee123</span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                <strong className="text-green-700 font-bold">👤 Customer:</strong> 
                <span className="text-gray-700 ml-2">customer@loanticks.com / customer123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

