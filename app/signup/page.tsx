'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds so user sees success message
        setTimeout(() => {
          router.refresh();
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-slate-600 mb-6">
            Your account has been created successfully. It is now pending admin approval. You will be notified once your account is approved.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500 rounded-full blur-[140px]"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 lg:p-10 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg relative p-2">
                <Image src="/logo.jpg" alt="Loanaticks" fill className="object-contain" priority />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Loanaticks</h1>
            </div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">Create Customer Account</h2>
            <p className="text-slate-600 text-base">Sign up to get started with your loan application</p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Sign up is only available for customers. Admin and employee accounts are created by administrators.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-900 px-5 py-4 rounded-xl flex items-start gap-3 mb-6">
              <AlertCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-semibold text-sm block mb-1">Error</strong>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-base text-slate-900 bg-white hover:border-slate-300"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-base text-slate-900 bg-white hover:border-slate-300"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-base text-slate-900 bg-white hover:border-slate-300"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-base text-slate-900 bg-white hover:border-slate-300"
                placeholder="At least 12 characters"
              />
              <p className="text-xs text-slate-500 mt-1">
                Must contain uppercase, lowercase, number, and special character (@$!%*?&)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-base text-slate-900 bg-white hover:border-slate-300"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-900 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation min-h-[48px] text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: window.location.origin })}
              disabled={loading}
              className="w-full py-3.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 touch-manipulation min-h-[48px] text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-slate-900 hover:text-yellow-600 transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
