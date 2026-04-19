import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Clock, LogIn } from 'lucide-react';

export default async function PendingApprovalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.isApproved) {
    if (session.user.role === 'admin') {
      redirect('/admin/dashboard');
    }
    if (session.user.role === 'employee') {
      redirect('/employee/dashboard');
    }
    redirect('/customer/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-white/10 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-yellow-100 p-4">
            <Clock className="w-12 h-12 text-yellow-700" aria-hidden />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">Account verification in progress</h1>
        <p className="text-slate-600 leading-relaxed mb-6">
          You are signed in. An administrator still needs to verify and activate your{' '}
          {session.user.role === 'customer' ? 'customer' : 'staff'} account before you can use the full
          dashboard.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          You will use the same email and password (or Google/GitHub) once your access is enabled. No need
          to register again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <LogIn className="w-4 h-4" aria-hidden />
            Sign-in page
          </Link>
        </div>
      </div>
    </div>
  );
}
