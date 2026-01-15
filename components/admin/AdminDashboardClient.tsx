'use client';

import { useState } from 'react';
import DashboardWalkthrough from '@/components/walkthrough/DashboardWalkthrough';

interface AdminDashboardClientProps {
  children: React.ReactNode;
  userRole: string;
}

export default function AdminDashboardClient({ children, userRole }: AdminDashboardClientProps) {
  const [walkthroughComplete, setWalkthroughComplete] = useState(false);

  return (
    <>
      {!walkthroughComplete && (
        <DashboardWalkthrough
          role={userRole as 'admin'}
          onComplete={() => setWalkthroughComplete(true)}
        />
      )}
      {children}
    </>
  );
}
