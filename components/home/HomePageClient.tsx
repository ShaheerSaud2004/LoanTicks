'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  LogIn,
  FileText,
  Shield,
  Users,
  Star,
  Menu,
  X,
} from 'lucide-react';
import Footer from '@/components/layout/Footer';

const QUICK_LOGINS = [
  { label: 'Admin Login', email: 'admin@loanaticks.com', password: 'admin123', icon: Shield },
  { label: 'Employee Login', email: 'employee@loanaticks.com', password: 'employee123', icon: Users },
  { label: 'Customer Login', email: 'customer@loanaticks.com', password: 'customer123', icon: LogIn },
] as const;

export default function HomePageClient() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);

  const handleQuickLogin = async (email: string, password: string) => {
    setLoginLoading(email);
    setLoginOpen(false);
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (result?.error) {
        alert('Login failed. Try again or use the full login page.');
      } else {
        window.location.href = '/';
      }
    } catch {
      alert('Login failed. Try again or use the full login page.');
    } finally {
      setLoginLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar - contact info */}
      <div className="bg-slate-900 text-slate-300 text-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
              <a href="tel:8665989232" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
                <Phone className="h-4 w-4" />
                <span>866-598-9232</span>
              </a>
              <a href="mailto:support@loanaticks.com" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
                <Mail className="h-4 w-4" />
                <span>support@loanaticks.com</span>
              </a>
              <span className="hidden md:flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-4 w-4" />
                8270 Aspen St, Rancho Cucamonga, CA 91730
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <div className="relative">
                <button
                  onClick={() => setLoginOpen(!loginOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                  <ChevronDown className={`h-4 w-4 transition-transform ${loginOpen ? 'rotate-180' : ''}`} />
                </button>
                {loginOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLoginOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white shadow-lg border border-slate-200 py-2 z-50">
                      {QUICK_LOGINS.map(({ label, email, password, icon: Icon }) => (
                        <button
                          key={label}
                          onClick={() => handleQuickLogin(email, password)}
                          disabled={loginLoading !== null}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-yellow-50 transition-colors disabled:opacity-50"
                        >
                          <Icon className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="text-sm font-medium">{label}</span>
                          {loginLoading === email && (
                            <span className="ml-auto text-xs text-slate-500">Signing in...</span>
                          )}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link
                          href="/login"
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                          onClick={() => setLoginOpen(false)}
                        >
                          <LogIn className="h-4 w-4 text-slate-500" />
                          Full login page
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold transition-colors"
              >
                <FileText className="h-4 w-4" />
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav - logo + mobile menu */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <Image src="/logo.jpg" alt="LoanAticks" fill className="object-contain p-1" priority />
              </div>
              <span className="text-xl font-bold text-slate-900">LoanAticks</span>
            </Link>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#reviews" className="text-slate-600 hover:text-yellow-600 font-medium transition-colors">
                Reviews
              </Link>
              <Link href="#team" className="text-slate-600 hover:text-yellow-600 font-medium transition-colors">
                Our Team
              </Link>
              <Link href="#contact" className="text-slate-600 hover:text-yellow-600 font-medium transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col gap-2">
                <Link href="#reviews" className="py-2 text-slate-600 hover:text-yellow-600" onClick={() => setMobileMenuOpen(false)}>
                  Reviews
                </Link>
                <Link href="#team" className="py-2 text-slate-600 hover:text-yellow-600" onClick={() => setMobileMenuOpen(false)}>
                  Our Team
                </Link>
                <Link href="#contact" className="py-2 text-slate-600 hover:text-yellow-600" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Dream Home{' '}
              <span className="text-yellow-400">Starts Here</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-10">
              Experience streamlined mortgage financing with competitive rates, fast approvals, and expert support every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold text-lg transition-colors"
              >
                <FileText className="h-5 w-5" />
                Apply Now
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-lg border border-white/20 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                Login
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              NMLS #2724157 · Licensed in State of TX
            </p>
          </div>
        </div>
      </section>

      {/* Reviews - Yelp */}
      <section id="reviews" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">What Our Clients Say</h2>
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">
            See what customers are saying about us on Yelp.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', stars: 5, text: 'Professional, responsive, and made our first home purchase smooth. Highly recommend!' },
              { name: 'James L.', stars: 5, text: 'Great rates and the team was incredibly helpful throughout the process.' },
              { name: 'Maria G.', stars: 5, text: 'Refinanced with LoanAticks and saved a lot. Very satisfied.' },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">&ldquo;{review.text}&rdquo;</p>
                <p className="text-sm font-medium text-slate-900">{review.name}</p>
                <a
                  href="https://www.yelp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  View on Yelp →
                </a>
              </div>
            ))}
          </div>
          <p className="text-center mt-8">
            <a
              href="https://www.yelp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors"
            >
              <Star className="h-5 w-5" />
              See more reviews on Yelp
            </a>
          </p>
        </div>
      </section>

      {/* Our Team */}
      <section id="team" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Our Team</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Experienced professionals dedicated to helping you find the right mortgage solution.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Expert Loan Officers', desc: 'Licensed professionals ready to guide you through every step.' },
              { name: 'Processing Team', desc: 'Efficient document handling and clear communication.' },
              { name: 'Support Staff', desc: 'Friendly support when you need answers.' },
            ].map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                  <Users className="h-12 w-12 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{member.name}</h3>
                <p className="text-slate-600 text-sm">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Apply now for a competitive rate quote or contact us with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold transition-colors"
            >
              <FileText className="h-5 w-5" />
              Apply Now
            </Link>
            <a
              href="tel:8665989232"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 font-semibold border border-white/20 transition-colors"
            >
              <Phone className="h-5 w-5" />
              866-598-9232
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
