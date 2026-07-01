import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
import { RouteStateProvider } from '@/components/pwa/route-state';
import { ServiceWorkerRegister } from '@/components/pwa/sw-register';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import './globals.css';

// Using system fonts to avoid Turbopack Google Fonts resolution bug

export const metadata: Metadata = {
  title: 'XETIHUB | WiFi Hotspot Billing & Management Platform',
  description: 'Comprehensive WiFi hotspot billing system with mobile money payments, voucher codes, multi-site management, and intelligent automatic reconnection',
  keywords: ['WiFi', 'hotspot', 'billing', 'mobile money', 'voucher', 'RADIUS', 'network management'],
  authors: [{ name: 'XETIHUB Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'XETIHUB',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#FF6A00',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="XETIHUB" />
      </head>
      <body className="antialiased">
        <RouteStateProvider>
          <Providers>
            {children}
            <ServiceWorkerRegister />
            <InstallPrompt />
          </Providers>
        </RouteStateProvider>
      </body>
    </html>
  );
}
