import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmployeeManagementClient from './EmployeeManagementClient';

export default async function EmployeeManagementPage() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return <EmployeeManagementClient />;
}
