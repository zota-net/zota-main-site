'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar, AppHeader } from '@/components/dashboard';
import { GlobalSearch } from '@/components/global-search';
import { useUserStore } from '@/lib/store/user-store';
import { useAppStore } from '@/lib/store/app-store';
import { LoadingOverlay } from '@/components/common';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, checkSession } = useUserStore();
  const { settings, isLoading } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check session validity
    const isValid = checkSession();
    if (!isAuthenticated && !isValid) {
      router.push('/login');
    }
  }, [isAuthenticated, checkSession, router]);

  if (!isAuthenticated) {
    return <LoadingOverlay show={true} text="Verifying session..." />;
  }

  const sidebarWidth = settings.sidebarCollapsed ? 72 : 280;
  const mainMargin = mounted && !isMobile ? sidebarWidth : 0;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Header */}
      <AppHeader />
      
      {/* Main Content */}
      <main
        className="pt-14 sm:pt-16 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: mainMargin }}
      >
        <div className="p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Global Search Dialog */}
      <GlobalSearch />

      {/* Loading Overlay */}
      <LoadingOverlay show={isLoading} />
    </div>
  );
}
