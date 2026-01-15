'use client';

import { useEffect } from 'react';
import PWAInstaller from './PWAInstaller';

export default function PWAWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      // Try both paths
      const swPaths = ['/sw.js', '/app/sw.js'];
      
      const registerSW = async () => {
        for (const path of swPaths) {
          try {
            const registration = await navigator.serviceWorker.register(path, {
              scope: '/',
            });
            console.log('✅ Service Worker registered:', registration.scope);
            return;
          } catch (error) {
            // Try next path
            continue;
          }
        }
        console.log('⚠️ Service Worker registration failed - will work without offline support');
      };
      
      registerSW();
    }
  }, []);

  return (
    <>
      {children}
      <PWAInstaller />
    </>
  );
}
