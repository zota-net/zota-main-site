import type { Metadata } from 'next';

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
  return <>{children}</>;
}
