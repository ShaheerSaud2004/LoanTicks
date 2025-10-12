'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Sparkles, Zap, Award } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Design Switcher */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Link href="/login" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          Design 1
        </Link>
        <Link href="/login/variant2" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          Design 2
        </Link>
        <Link href="/login/variant3" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          Design 3
        </Link>
        <Link href="/login/variant4" className="px-3 py-1.5 bg-white text-orange-600 text-xs font-semibold rounded-lg shadow-lg">
          Design 4
        </Link>
        <Link href="/login/variant5" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          Design 5
        </Link>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-12 text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-white/30">
              <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
            </div>
          </div>
          <h1 className="text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
            LoanTicks
          </h1>
          <p className="text-2xl font-bold mb-8">The Future of Financial Management</p>
          
          <div className="flex items-center justify-center gap-12 mb-8">
            <div className="text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-2" />
              <div className="text-3xl font-bold">AI-Powered</div>
            </div>
            <div className="text-center">
              <Zap className="h-10 w-10 mx-auto mb-2" />
              <div className="text-3xl font-bold">Lightning Fast</div>
            </div>
            <div className="text-center">
              <Award className="h-10 w-10 mx-auto mb-2" />
              <div className="text-3xl font-bold">Award Winning</div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto border-4 border-white/50">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Let&apos;s Get Started!
            </h2>
            <p className="text-gray-600 text-lg">Sign in to unlock your financial potential</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {loading && (
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 border-2 border-orange-400 text-white px-5 py-4 rounded-2xl shadow-lg flex items-center gap-4 animate-slideIn">
                <Loader2 className="h-6 w-6 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <strong className="font-bold text-base">{loginStatus}</strong>
                  <div className="w-full bg-orange-400/30 h-2 mt-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-white shadow-lg rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-500 border-2 border-red-600 text-white px-5 py-4 rounded-2xl shadow-lg flex items-start gap-3 animate-shake">
                <div className="text-2xl">❌</div>
                <div className="flex-1">
                  <strong className="font-bold text-base block mb-1">Login Failed</strong>
                  <p className="text-sm text-red-50">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-2xl text-lg focus:border-orange-500 focus:outline-none transition shadow-sm"
                placeholder="your.email@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-2xl text-lg focus:border-orange-500 focus:outline-none transition shadow-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-6 w-6" />
                  Please Wait...
                </>
              ) : (
                <>
                  <LogIn className="h-6 w-6" />
                  SIGN IN NOW
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-10 pt-8 border-t-2 border-gray-200">
            <div className="text-center mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                🎉 Demo Access Available
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <div className="font-black text-gray-900 mb-2">Admin</div>
                <div className="text-xs text-gray-600 font-mono">admin@loanticks.com</div>
                <div className="text-xs text-gray-500 mt-1">admin123</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <div className="font-black text-gray-900 mb-2">Employee</div>
                <div className="text-xs text-gray-600 font-mono">employee@loanticks.com</div>
                <div className="text-xs text-gray-500 mt-1">employee123</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <div className="font-black text-gray-900 mb-2">Customer</div>
                <div className="text-xs text-gray-600 font-mono">customer@loanticks.com</div>
                <div className="text-xs text-gray-500 mt-1">customer123</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-white text-sm">
          <p className="font-semibold">© 2025 LoanTicks • Secured by Military-Grade Encryption 🔒</p>
        </div>
      </div>
    </div>
  );
}

