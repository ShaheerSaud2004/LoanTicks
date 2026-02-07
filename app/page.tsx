import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HomePageClient from '@/components/home/HomePageClient';

export default async function HomePage() {
  const session = await auth();

  if (session) {
    const role = session.user?.role;
    if (role === 'admin') {
      redirect('/admin/dashboard');
    }
    if (role === 'employee') {
      redirect('/employee/dashboard');
    }
    if (role === 'customer') {
      redirect('/customer/dashboard');
    }
  }

  // Not logged in: show standalone homepage (no redirect to /login)
  return <HomePageClient />;
}
