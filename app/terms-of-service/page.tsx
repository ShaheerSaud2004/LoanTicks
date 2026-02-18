import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Terms of Service | LOANATICKS',
  description: 'Terms of service for LOANATICKS home mortgage solutions.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 flex items-center flex-shrink-0">
                <img src="/logo.jpg" alt="LOANATICKS" className="h-full w-auto object-contain" />
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
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-slate-600 mb-4">Last updated: February 2025.</p>
        <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
          <p>
            By using the LOANATICKS website and services, you agree to these Terms of Service. Please read them
            carefully.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Use of Services</h2>
          <p>
            You agree to use our site and loan application process only for lawful purposes. You must provide accurate
            and complete information when applying for a loan. Misrepresentation may result in denial of your
            application or other legal action.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Eligibility</h2>
          <p>
            Our mortgage services are offered to residents of the United States who meet applicable eligibility
            requirements. We are licensed in the State of Texas (NMLS #2724157).
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, LOANATICKS is not liable for indirect, incidental, or consequential
            damages arising from your use of our services. Approval and terms of any loan are subject to our
            underwriting criteria and applicable law.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of our services after changes constitutes
            acceptance of the updated terms.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Contact</h2>
          <p>
            For questions about these terms, contact us using the information on our website.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
