'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

export default function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session} basePath="/api/auth">
      {children}
    </SessionProvider>
  );
}
