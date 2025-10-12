'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Shield, Zap, Users, CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginVariant5() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Floating Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      {/* Design Switcher */}
      <div className="absolute top-6 right-6 flex gap-2 z-20">
        <Link href="/login" className="px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white/70 hover:text-white text-xs font-medium rounded-lg transition border border-white/10">
          Design 1
        </Link>
        <Link href="/login/variant2" className="px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white/70 hover:text-white text-xs font-medium rounded-lg transition border border-white/10">
          Design 2
        </Link>
        <Link href="/login/variant3" className="px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white/70 hover:text-white text-xs font-medium rounded-lg transition border border-white/10">
          Design 3
        </Link>
        <Link href="/login/variant4" className="px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white/70 hover:text-white text-xs font-medium rounded-lg transition border border-white/10">
          Design 4
        </Link>
        <Link href="/login/variant5" className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg border border-purple-400/50">
          Design 5
        </Link>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Features */}
          <div className="text-white space-y-8 lg:pr-12">
            {/* Logo & Brand */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-4 group">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
                  <img src="/logo.jpg" alt="LoanTicks" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">
                    LoanTicks
                  </h1>
                  <p className="text-purple-300 text-sm font-medium">Smart Financial Solutions</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Secure Access
                  </span>
                  <br />
                  <span className="text-white">to Your Financial Future</span>
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Experience seamless loan management with enterprise-grade security and intuitive design.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all group">
                <Shield className="h-8 w-8 mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1">256-bit</div>
                <div className="text-xs text-slate-400">Encryption</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all group">
                <Zap className="h-8 w-8 mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1">Instant</div>
                <div className="text-xs text-slate-400">Processing</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all group">
                <Users className="h-8 w-8 mb-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1">50K+</div>
                <div className="text-xs text-slate-400">Active Users</div>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-3 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Real-time application tracking</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Advanced fraud protection</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>24/7 customer support</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Automated decision engine</span>
              </div>
            </div>

            <div className="text-center lg:text-left text-slate-400 text-sm">
              <p>© 2025 LoanTicks. All rights reserved.</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-300">Sign in to continue to your account</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3">
                  <div className="text-lg">⚠️</div>
                  <div className="flex-1 text-sm">{error}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-sm font-medium text-slate-300 mb-4">Demo Accounts</p>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@loanticks.com');
                    setPassword('admin123');
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg p-3 transition text-left group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white text-sm">Administrator</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-xs font-medium border border-purple-500/30">Admin</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">admin@loanticks.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('employee@loanticks.com');
                    setPassword('employee123');
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg p-3 transition text-left group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white text-sm">Employee</span>
                    <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-500/30">Staff</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">employee@loanticks.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('customer@loanticks.com');
                    setPassword('customer123');
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg p-3 transition text-left group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white text-sm">Customer</span>
                    <span className="bg-green-500/20 text-green-300 px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-500/30">User</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">customer@loanticks.com</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

