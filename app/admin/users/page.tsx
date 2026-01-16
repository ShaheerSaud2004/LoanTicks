import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserApprovalClient from '@/components/admin/UserApprovalClient';

export default async function UserApprovalPage() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();

  // Get all pending users
  const pendingUsers = await User.find({ isApproved: false })
    .sort({ createdAt: -1 })
    .lean();

  // Get all approved users for reference
  const approvedUsers = await User.find({ isApproved: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Serialize for client component
  const serializedPending = pendingUsers.map(user => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
    approvedAt: user.approvedAt?.toISOString(),
  }));

  const serializedApproved = approvedUsers.map(user => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
    approvedAt: user.approvedAt?.toISOString(),
  }));

  return (
    <UserApprovalClient 
      pendingUsers={serializedPending} 
      approvedUsers={serializedApproved}
      userName={session.user.name || 'Admin'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    />
  );
}
