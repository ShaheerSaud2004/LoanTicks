'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Crown, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function LoginVariant5() {
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center p-4 relative overflow-hidden">
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
        <Link href="/login/variant4" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition">
          Design 4
        </Link>
        <Link href="/login/variant5" className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold rounded-lg shadow-lg">
          Design 5
        </Link>
      </div>

      {/* Animated Gold Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-6 bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-yellow-400/50 shadow-2xl">
            <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-yellow-300/50">
              <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
                LoanTicks
              </h1>
              <p className="text-yellow-200 text-lg font-bold">Premium Financial Services</p>
            </div>
            <Crown className="h-12 w-12 text-yellow-300 animate-pulse" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Side - Premium Features */}
          <div className="text-white space-y-8 p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-yellow-400/30 shadow-2xl">
              <h2 className="text-5xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  Luxury
                </span>
                <br />
                <span className="text-white">Financial Management</span>
              </h2>
              <p className="text-xl text-cyan-50 leading-relaxed mb-8">
                Experience elite banking with our premium turquoise and gold platform. Where sophistication meets innovation.
              </p>

              {/* Premium Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-3xl font-black text-yellow-300">A+</div>
                  <div className="text-xs text-cyan-100 font-semibold">Rated</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-3xl font-black text-yellow-300">$2.5B</div>
                  <div className="text-xs text-cyan-100 font-semibold">Volume</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30 text-center">
                  <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-3xl font-black text-yellow-300">50K+</div>
                  <div className="text-xs text-cyan-100 font-semibold">Elite Users</div>
                </div>
              </div>

              {/* Premium Features List */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-cyan-50">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="font-semibold">24/7 Concierge Support</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-50">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="font-semibold">Premium Interest Rates</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-50">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="font-semibold">Exclusive Investment Access</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-50">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="font-semibold">Platinum Security Protection</span>
                </div>
              </div>
            </div>

            <div className="text-center text-cyan-50 text-sm">
              <p className="font-semibold">🔒 Protected by Military-Grade Encryption</p>
              <p className="text-cyan-200 mt-1">© 2025 LoanTicks Premium Financial Services</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-yellow-400/50">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider mb-4 shadow-lg">
                ✨ Premium Access
              </div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-lg">Sign in to your premium account</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {loading && (
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 border-2 border-cyan-400 text-white px-5 py-4 rounded-2xl shadow-lg flex items-center gap-4 animate-slideIn">
                  <Loader2 className="h-6 w-6 animate-spin flex-shrink-0" />
                  <div className="flex-1">
                    <strong className="font-bold text-base">{loginStatus}</strong>
                    <div className="w-full bg-cyan-400/30 h-2 mt-2.5 rounded-full overflow-hidden">
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
                  className="w-full px-5 py-4 border-2 border-cyan-200 rounded-2xl text-lg focus:border-cyan-500 focus:outline-none transition shadow-sm focus:shadow-lg"
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
                  className="w-full px-5 py-4 border-2 border-cyan-200 rounded-2xl text-lg focus:border-cyan-500 focus:outline-none transition shadow-sm focus:shadow-lg"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-700 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 border-2 border-yellow-400/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6" />
                    Please Wait...
                  </>
                ) : (
                  <>
                    <LogIn className="h-6 w-6" />
                    PREMIUM SIGN IN
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <div className="text-center mb-6">
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                  👑 Premium Demo Access
                </span>
              </div>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-2xl p-4 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-gray-900">Administrator</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">Admin</span>
                  </div>
                  <div className="text-sm text-gray-700 font-mono bg-white/60 px-3 py-2 rounded-lg">
                    admin@loanticks.com · admin123
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-400 rounded-2xl p-4 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-gray-900">Employee</span>
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">Staff</span>
                  </div>
                  <div className="text-sm text-gray-700 font-mono bg-white/60 px-3 py-2 rounded-lg">
                    employee@loanticks.com · employee123
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-400 rounded-2xl p-4 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-gray-900">Customer</span>
                    <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">User</span>
                  </div>
                  <div className="text-sm text-gray-700 font-mono bg-white/60 px-3 py-2 rounded-lg">
                    customer@loanticks.com · customer123
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

