import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Redirect to appropriate dashboard based on role
  const dashboardUrl =
    session.user.role === 'admin'
      ? '/admin/dashboard'
      : session.user.role === 'employee'
      ? '/employee/dashboard'
      : '/customer/dashboard';

  redirect(dashboardUrl);
}
