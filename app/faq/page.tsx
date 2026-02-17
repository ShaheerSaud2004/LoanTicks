import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'FAQ | LOANATICKS',
  description: 'Frequently asked questions about LOANATICKS mortgage application and services.',
};

const faqs = [
  {
    q: 'How do I apply for a mortgage?',
    a: 'Click "Apply Now" on our homepage or go to the sign-up page to create an account. Once registered as a customer, you can start the loan application from your dashboard. The application walks you through the required steps and documents.',
  },
  {
    q: 'How long does the application review take?',
    a: 'We typically review applications within 24–48 hours. You will receive an email when there is an update. You can also check your dashboard for status.',
  },
  {
    q: 'What documents do I need?',
    a: 'Common requirements include ID, proof of income (pay stubs, W-2s, tax returns), bank statements, and information about the property. The application and your loan officer will specify what we need for your situation.',
  },
  {
    q: 'Are you licensed?',
    a: 'Yes. LOANATICKS is licensed in the State of Texas. Our NMLS number is 2724157. You can verify at nmlsconsumeraccess.org.',
  },
  {
    q: 'Is my information secure?',
    a: 'Yes. We use encryption for data in transit and at rest, and we follow industry practices to protect your personal and financial information. See our Security Information page for details.',
  },
  {
    q: 'How can I contact you?',
    a: 'Call us at 866-598-9232 or use the contact information in the footer. You can also log in to your dashboard to message or view updates.',
  },
];

export default function FAQPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h1>
        <p className="text-slate-600 mb-10">
          Common questions about our mortgage application process and services.
        </p>

        <dl className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-slate-200 pb-6 last:border-0">
              <dt className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</dt>
              <dd className="text-slate-700">{faq.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-slate-600">
          Still have questions?{' '}
          <a href="tel:8665989232" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Call us at 866-598-9232
          </a>{' '}
          or{' '}
          <Link href="/" className="text-yellow-600 hover:text-yellow-700 font-medium">
            go back to home
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
