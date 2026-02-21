'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/home/Navigation';
import HeroSection from '@/components/home/HeroSection';
import Footer from '@/components/home/Footer';

// Lazy load heavy sections for performance
const SignalFlowSection = dynamic(
  () => import('@/components/home/SignalFlowSection'),
  { ssr: false }
);
const PlatformPreview = dynamic(
  () => import('@/components/home/PlatformPreview'),
  { ssr: false }
);
const ParallaxDepth = dynamic(
  () => import('@/components/home/ParallaxDepth'),
  { ssr: false }
);
const TechStackSection = dynamic(
  () => import('@/components/home/TechStackSection'),
  { ssr: false }
);
const TrustSection = dynamic(
  () => import('@/components/home/TrustSection'),
  { ssr: false }
);
const FinalCTASection = dynamic(
  () => import('@/components/home/FinalCTASection'),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="bg-black text-white overflow-x-hidden selection:bg-[#FF6A00]/20 selection:text-white">
      {/* Fixed Navigation */}
      <Navigation />

      {/* Hero with 3D Network */}
      <HeroSection />

      {/* Signal Flow — 5 Capability Modules */}
      <SignalFlowSection />

      {/* Platform Preview — Floating Dashboard */}
      <PlatformPreview />

      {/* Parallax Depth — Globe to Packet Zoom */}
      <ParallaxDepth />

      {/* Technology Stack */}
      <TechStackSection />

      {/* Trust — Logos & Case Studies */}
      <TrustSection />

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
