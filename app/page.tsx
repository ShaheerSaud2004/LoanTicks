import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();

  if (session) {
    // User is logged in, redirect to their dashboard based on role
    const role = session.user?.role;
    if (role === 'admin') {
      redirect('/admin/dashboard');
    } else if (role === 'employee') {
      redirect('/employee/dashboard');
    } else if (role === 'customer') {
      redirect('/customer/dashboard');
    }
  }

  // User is not logged in, redirect to login
  redirect('/login');
}
