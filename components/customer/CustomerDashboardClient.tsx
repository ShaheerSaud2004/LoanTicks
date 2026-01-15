'use client';

import { useState } from 'react';
import DashboardWalkthrough from '@/components/walkthrough/DashboardWalkthrough';

interface CustomerDashboardClientProps {
  children: React.ReactNode;
  userRole: string;
}

export default function CustomerDashboardClient({ children, userRole }: CustomerDashboardClientProps) {
  const [walkthroughComplete, setWalkthroughComplete] = useState(false);

  return (
    <>
      {!walkthroughComplete && (
        <DashboardWalkthrough
          role={userRole as 'customer'}
          onComplete={() => setWalkthroughComplete(true)}
        />
      )}
      {children}
    </>
  );
}
