import type { Metadata } from 'next';
import { MarketingNav, MarketingFooter } from '@/components/marketing/layout-components';

export const metadata: Metadata = {
  title: 'XETIHUB | Master Your WiFi Network',
  description: 'Comprehensive WiFi hotspot billing system with mobile money payments, voucher codes, multi-site management, and intelligent automatic reconnection.',
  openGraph: {
    title: 'XETIHUB | Master Your WiFi Network',
    description: 'WiFi hotspot billing platform with mobile money integration, RADIUS servers, hardware support, and seamless connectivity.',
    type: 'website',
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <MarketingNav />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
