'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="h-24 w-64 sm:h-32 sm:w-80 md:h-40 md:w-96 bg-white rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden p-4">
              <img 
                src="/logo.jpg" 
                alt="LoanTicks" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border-2 border-teal-200/50">
          {/* Coming Soon Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Coming Soon</span>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 pt-2 pb-2 leading-tight bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent overflow-visible">
            Something Big is Coming
          </h2>
          
          <p className="text-gray-600 text-center text-lg sm:text-xl mb-8 leading-relaxed">
            We&apos;re building something amazing for your mortgage needs. Join our waitlist to be the first to know when we launch!
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-teal-50 border-2 border-teal-300 rounded-xl p-4 flex items-center gap-3 animate-slideIn">
              <CheckCircle2 className="h-6 w-6 text-teal-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-teal-900">You&apos;re on the list!</p>
                <p className="text-sm text-teal-700">We&apos;ll notify you as soon as we launch.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center gap-3 animate-shake">
              <div className="text-2xl">❌</div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Waitlist Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-900"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join the Waitlist</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Features Preview */}
          <div className="mt-10 pt-8 border-t-2 border-teal-100">
            <p className="text-center text-gray-500 text-sm mb-6 font-semibold uppercase tracking-wider">
              What to Expect
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-teal-50/50">
                <div className="text-2xl mb-2">🏠</div>
                <h3 className="font-semibold text-teal-900 mb-1">Easy Applications</h3>
                <p className="text-xs text-gray-600">Streamlined mortgage process</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-50/50">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-amber-900 mb-1">Fast Approvals</h3>
                <p className="text-xs text-gray-600">Quick decision making</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-teal-50/50">
                <div className="text-2xl mb-2">💎</div>
                <h3 className="font-semibold text-teal-900 mb-1">Best Rates</h3>
                <p className="text-xs text-gray-600">Competitive pricing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} LoanAticks. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
