'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import ApplicationPrintDocument, { type PrintApplication } from '@/components/ApplicationPrintDocument';

export default function ApplicationPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [application, setApplication] = useState<PrintApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user.role !== 'employee' && session.user.role !== 'admin')) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    let cancelled = false;
    async function fetchApp() {
      try {
        const res = await fetch(`/api/loan-application?id=${resolvedParams.id}`);
        const data = await res.json();
        if (!cancelled && res.ok && data.application) setApplication(data.application);
        else if (!cancelled && !res.ok) router.push('/employee/dashboard');
      } catch {
        if (!cancelled) router.push('/employee/dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (session?.user?.role === 'employee' || session?.user?.role === 'admin') fetchApp();
    return () => { cancelled = true; };
  }, [resolvedParams.id, session?.user?.role, router]);

  const handlePrint = () => window.print();

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading application…</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Application not found.</p>
        <Link href="/employee/dashboard" className="ml-4 text-teal-600 underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              .print-doc-wrap, .print-doc-wrap * { visibility: visible; }
              .print-doc-wrap { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
              .no-print { display: none !important; }
            }
            @media screen {
              .print-doc-wrap { max-width: 800px; margin: 0 auto; padding: 2rem; }
            }
          `,
        }}
      />
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="no-print max-w-4xl mx-auto px-4 mb-4 flex items-center justify-between">
          <Link
            href={`/employee/applications/${resolvedParams.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to application
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
          >
            <Printer className="w-4 h-4" />
            Print application
          </button>
        </div>
        <div className="print-doc-wrap bg-white shadow-lg rounded-lg overflow-hidden">
          <ApplicationPrintDocument application={application} />
        </div>
      </div>
    </>
  );
}
