import Link from 'next/link';
import Image from 'next/image';
import { Shield, Lock, FileCheck, Server } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Security Information | LOANATICKS',
  description: 'How LOANATICKS protects your data and keeps your application secure.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                <Image src="/logo.jpg" alt="LOANATICKS" fill className="object-contain p-1" priority />
              </div>
              <span className="text-xl font-bold text-slate-900">LOANATICKS</span>
            </Link>
            <Link
              href="/"
              className="text-slate-600 hover:text-yellow-600 font-medium transition-colors text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Security Information</h1>
        <p className="text-slate-600 mb-10">
          We take the security of your personal and financial information seriously. Here is how we protect your data.
        </p>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Encryption</h2>
              <p className="text-slate-700">
                Data transmitted between your browser and our servers is encrypted using industry-standard TLS. Sensitive
                data at rest is encrypted to protect your information.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Secure Application & Documents</h2>
              <p className="text-slate-700">
                Loan applications and uploaded documents are stored securely. Access is restricted to authorized
                personnel and is logged for compliance and auditing.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Compliance</h2>
              <p className="text-slate-700">
                We follow applicable laws and regulations for handling financial and personal information. We are
                licensed in the State of Texas (NMLS #2724157) and adhere to industry best practices.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Server className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Infrastructure</h2>
              <p className="text-slate-700">
                Our application runs on secure, monitored infrastructure. We use authentication, rate limiting, and
                access controls to protect against unauthorized access.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-slate-600 text-sm">
          For more on how we use and protect your data, see our{' '}
          <Link href="/privacy-policy" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
