'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Shield,
  FileText,
  HelpCircle,
  Home
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white border border-gray-600">
                <Image 
                  src="/logo.jpg" 
                  alt="LoanAticks" 
                  fill 
                  className="object-contain p-1"
                />
              </div>
              <h3 className="text-xl font-bold text-white">LoanAticks</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted partner for home mortgage solutions. We provide competitive rates, 
              fast approvals, and expert guidance for all your financing needs.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="h-4 w-4 text-yellow-500" />
              <span>Secure & Trusted</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/customer/dashboard" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors flex items-center gap-2 text-sm"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/customer/loan-application" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors flex items-center gap-2 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Apply for Loan
                </Link>
              </li>
              <li>
                <Link 
                  href="/login" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors flex items-center gap-2 text-sm"
                >
                  <Mail className="h-4 w-4" />
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  href="#contact" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors flex items-center gap-2 text-sm"
                >
                  <HelpCircle className="h-4 w-4" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a 
                    href="mailto:support@loanaticks.com" 
                    className="text-gray-300 hover:text-yellow-500 transition-colors text-sm"
                  >
                    support@loanaticks.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <a 
                    href="tel:+18005551234" 
                    className="text-gray-300 hover:text-yellow-500 transition-colors text-sm"
                  >
                    (800) 555-1234
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-gray-300 text-sm">
                    123 Financial District<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Legal & Support</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/security" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors text-sm"
                >
                  Security Information
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="text-white font-semibold mb-3 text-sm">Follow Us</h5>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-gray-700 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-gray-700 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-gray-700 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-gray-700 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © 2025 LoanAticks. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-500" />
                SSL Secured
              </span>
              <span>Licensed Mortgage Lender</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
