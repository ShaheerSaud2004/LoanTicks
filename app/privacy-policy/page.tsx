import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Privacy Policy | LOANATICKS',
  description: 'Privacy policy for LOANATICKS home mortgage solutions.',
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-600 mb-4">Last updated: February 2025.</p>
        <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
          <p>
            LOANATICKS (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
            This policy describes how we collect, use, and safeguard your information when you use our website and
            mortgage application services.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Information We Collect</h2>
          <p>
            We collect information you provide directly (name, email, phone, address, financial and employment
            information) when you apply for a loan or contact us. We also collect usage data and cookies to improve
            our site and services.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">How We Use Your Information</h2>
          <p>
            We use your information to process loan applications, communicate with you, improve our services, and
            comply with legal obligations. We do not sell your personal information to third parties.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Security</h2>
          <p>
            We use industry-standard measures to protect your data, including encryption and secure storage. For more
            details, see our Security Information page.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-6">Contact</h2>
          <p>
            For questions about this privacy policy, contact us at the phone or email listed on our website.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
