'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginVariant3() {
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
    <div className="min-h-screen bg-white flex">
      {/* Design Switcher */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Link href="/login" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition">
          Design 1
        </Link>
        <Link href="/login/variant2" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition">
          Design 2
        </Link>
        <Link href="/login/variant3" className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-lg">
          Design 3
        </Link>
        <Link href="/login/variant4" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition">
          Design 4
        </Link>
        <Link href="/login/variant5" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition">
          Design 5
        </Link>
      </div>

      {/* Left Side - Minimal Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-16">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">LoanTicks</h1>
            <p className="text-gray-400 text-sm">Financial Services</p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-4">
            <div className="text-7xl font-bold leading-none">
              Elegant<br/>Banking
            </div>
            <p className="text-xl text-gray-400 max-w-md">
              Sophistication meets simplicity in modern financial management.
            </p>
          </div>

          <div className="flex gap-16 text-sm">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-gray-400">Trusted Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2.5B</div>
              <div className="text-gray-400">Volume</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          © 2025 LoanTicks. Enterprise-grade security.
        </div>
      </div>

      {/* Right Side - Minimalist Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="h-12 w-12 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold">LoanTicks</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Sign In</h2>
              <p className="text-gray-500">Access your account</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-black outline-none transition text-lg"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-black outline-none transition text-lg"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Please Wait...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Continue
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Test Accounts</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Administrator</span>
                  <span className="text-gray-500 font-mono text-xs">admin@loanticks.com</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Employee</span>
                  <span className="text-gray-500 font-mono text-xs">employee@loanticks.com</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Customer</span>
                  <span className="text-gray-500 font-mono text-xs">customer@loanticks.com</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Password for all: [role]123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

