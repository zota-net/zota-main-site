import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XETIHUB | Command The Network',
  description: 'Next-generation telecom control platform. Real-time network intelligence, signal orchestration, and infrastructure command — built for operators who demand absolute control.',
  openGraph: {
    title: 'XETIHUB | Command The Network',
    description: 'Next-generation telecom control platform. Real-time network intelligence, signal orchestration, and infrastructure command.',
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
