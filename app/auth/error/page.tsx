'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorContent = () => {
    switch (error) {
      case 'AccountNotFound':
        return {
          title: "Account Not Found",
          message: "You don't have an account yet. Please sign up to create one.",
          icon: <UserPlus className="w-16 h-16 text-yellow-500" />,
          primaryAction: {
            text: "Sign Up",
            href: "/signup",
          },
          secondaryAction: {
            text: "Back to Login",
            href: "/login",
          },
        };
      case 'AccountPendingApproval':
        return {
          title: "Account Pending Approval",
          message: "Your account is pending admin approval. You will be notified once your account is approved.",
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          primaryAction: {
            text: "Back to Login",
            href: "/login",
          },
        };
      case 'AccessDenied':
        return {
          title: "Account Not Found",
          message: "You don't have an account yet. Please sign up to create one.",
          icon: <UserPlus className="w-16 h-16 text-yellow-500" />,
          primaryAction: {
            text: "Sign Up",
            href: "/signup",
          },
          secondaryAction: {
            text: "Back to Login",
            href: "/login",
          },
        };
      default:
        return {
          title: "Authentication Error",
          message: "An error occurred during authentication. Please try again.",
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
          primaryAction: {
            text: "Back to Login",
            href: "/login",
          },
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500 rounded-full blur-[140px]"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 lg:p-10 border border-white/20">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg relative p-2">
              <Image src="/logo.jpg" alt="Loanaticks" fill className="object-contain" priority />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Loanaticks</h1>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            {content.icon}
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-3">
              {content.title}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {content.message}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={content.primaryAction.href}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 touch-manipulation min-h-[48px] text-base"
            >
              {content.primaryAction.text === "Sign Up" ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{content.primaryAction.text}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{content.primaryAction.text}</span>
                </>
              )}
            </Link>

            {content.secondaryAction && (
              <Link
                href={content.secondaryAction.href}
                className="w-full py-3.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation min-h-[48px] text-base"
              >
                {content.secondaryAction.text}
              </Link>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-slate-700 text-center">
              <strong>Note:</strong> Sign up is only available for customers. Admin and employee accounts are created by administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
