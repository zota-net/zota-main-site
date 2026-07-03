'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RouteStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SAVE_ROUTE',
        route: pathname,
      });
    }
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SAVE_ROUTE',
          route: pathname,
        });
      }
    };
    window.addEventListener('beforeunload', handler);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handler();
    });
    return () => {
      window.removeEventListener('beforeunload', handler);
      document.removeEventListener('visibilitychange', handler);
    };
  }, [pathname]);

  return <>{children}</>;
}
