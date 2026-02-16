'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  LogIn,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function HomePageClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar - contact info */}
      <div className="bg-slate-900 text-slate-300 text-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
              <a href="tel:7137821309" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
                <Phone className="h-4 w-4" />
                <span>713-782-1309</span>
              </a>
              <a href="mailto:Loanaticks@gmail.com" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
                <Mail className="h-4 w-4" />
                <span>Loanaticks@gmail.com</span>
              </a>
              <span className="hidden md:flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-4 w-4" />
                5606 Theall Rd, Houston, TX 77066
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
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
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                <Image src="/logo.jpg" alt="LoanAticks" fill className="object-contain p-1" priority />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">LOANATICKS</span>
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
              <Link href="#what-to-expect" className="text-slate-600 hover:text-yellow-600 font-medium transition-colors">
                What to Expect
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
                <Link href="#what-to-expect" className="py-2 text-slate-600 hover:text-yellow-600" onClick={() => setMobileMenuOpen(false)}>
                  What to Expect
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

      {/* By the Numbers - stats and trust */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Why LoanAticks</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Fast, transparent, and backed by a licensed team you can trust.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '24–48 hrs', label: 'Typical application review' },
              { value: 'NMLS #2724157', label: 'Licensed in State of TX' },
              { value: 'Secure', label: 'Encrypted application & docs' },
              { value: 'Dedicated', label: 'Personal loan officer support' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect - clear process and benefits */}
      <section id="what-to-expect" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">What to Expect</h2>
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">
            A straightforward process, clear communication, and a team that has your back.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Apply in minutes', desc: 'One simple application. We guide you step by step and tell you exactly what we need.' },
              { title: 'Fast review', desc: 'We typically review your application within 24–48 hours and keep you updated by email.' },
              { title: 'No surprises', desc: 'Transparent rates, no hidden fees, and a dedicated point of contact so you always know where you stand.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 font-bold text-lg mb-3">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-700 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors"
            >
              <FileText className="h-5 w-5" />
              Start your application
            </Link>
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
          <p className="text-slate-300 mb-4 max-w-xl mx-auto">
            Apply now for a competitive rate quote or contact us with any questions.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Office: 713-782-1309 · 5606 Theall Rd, Houston, TX 77066<br />
            Loanaticks@gmail.com or Yasin@loanaticks.com
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
              href="tel:7137821309"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 font-semibold border border-white/20 transition-colors"
            >
              <Phone className="h-5 w-5" />
              713-782-1309
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
