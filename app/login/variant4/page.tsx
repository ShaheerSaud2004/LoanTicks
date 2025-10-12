'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginVariant4() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Design Switcher */}
      <div className="absolute top-4 right-4 flex flex-wrap gap-2 z-20 max-w-[calc(100%-2rem)]">
        <Link href="/login" className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition">
          D1
        </Link>
        <Link href="/login/variant2" className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition">
          D2
        </Link>
        <Link href="/login/variant3" className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition">
          D3
        </Link>
        <Link href="/login/variant4" className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-lg">
          D4
        </Link>
        <Link href="/login/variant5" className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition">
          D5
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600 rounded-xl mb-4 overflow-hidden">
              <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to continue to LoanTicks</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {loading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{loginStatus}</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <div className="text-lg">⚠️</div>
                <div className="flex-1">
                  <strong className="font-medium text-sm block mb-1">Login Failed</strong>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Signing In...
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
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Demo Accounts</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Admin</span>
                <span className="text-gray-600 text-xs font-mono">admin@loanticks.com</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Employee</span>
                <span className="text-gray-600 text-xs font-mono">employee@loanticks.com</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Customer</span>
                <span className="text-gray-600 text-xs font-mono">customer@loanticks.com</span>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">Password for all: [role]123</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-600 text-xs">
          <p>© 2025 LoanTicks. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

