import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

// Using system fonts to avoid Turbopack Google Fonts resolution bug

export const metadata: Metadata = {
  title: 'XETIHUB | WiFi Hotspot Billing & Management Platform',
  description: 'Comprehensive WiFi hotspot billing system with mobile money payments, voucher codes, multi-site management, and intelligent automatic reconnection',
  keywords: ['WiFi', 'hotspot', 'billing', 'mobile money', 'voucher', 'RADIUS', 'network management'],
  authors: [{ name: 'XETIHUB Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
