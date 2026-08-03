'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar, AppHeader } from '@/components/dashboard';
import { GlobalSearch } from '@/components/global-search';
import { useUserStore } from '@/lib/store/user-store';
import { useAppStore } from '@/lib/store/app-store';
import { LoadingOverlay } from '@/components/common';
import { AGENT_HOME_PATH, isAgentAllowedPath } from '@/lib/agent-access';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkSession, user } = useUserStore();
  const { settings, isLoading } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isAgent = (user?.role as string) === 'Agent';

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

  useEffect(() => {
    // Agents get a restricted portal — bounce them out of client-only pages
    // (business overview/earnings, agent management, settings, etc.), even
    // if they navigate there directly by URL.
    if (isAgent && !isAgentAllowedPath(pathname)) {
      router.replace(AGENT_HOME_PATH);
    }
  }, [isAgent, pathname, router]);

  if (!isAuthenticated) {
    return <LoadingOverlay show={true} text="Verifying session..." />;
  }

  if (isAgent && !isAgentAllowedPath(pathname)) {
    return <LoadingOverlay show={true} text="Redirecting to your portal..." />;
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
