import Link from 'next/link';
import { Home, FileText, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 flex items-center">
              <img src="/logo.jpg" alt="LOANATICKS" className="h-full w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-slate-200 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Page not found</h2>
          <p className="text-slate-600 mb-8">
            The page you’re looking for doesn’t exist or the link may be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
            >
              <Home className="h-5 w-5" />
              Back to home
            </Link>
            <Link
              href="/customer/loan-application"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium transition-colors"
            >
              <FileText className="h-5 w-5" />
              Apply for loan
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium transition-colors"
            >
              <Mail className="h-5 w-5" />
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
