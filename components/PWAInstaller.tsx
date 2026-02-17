'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Service worker is registered in PWAWrapper

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slideUp">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">Install LOANATICKS</h3>
          <p className="text-xs text-yellow-50">
            Add to home screen for quick access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-50 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="text-white hover:text-yellow-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
