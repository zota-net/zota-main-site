'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/home/Navigation';
import HeroSection from '@/components/home/HeroSection';
import SystemPreview from '@/components/home/SystemPreview';
import StickyGradientBg from '@/components/home/StickyGradientBg';
import SectionFade from '@/components/home/SectionFade';
import Footer from '@/components/home/Footer';
import SmoothScroll from '@/components/home/SmoothScroll';

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
const TestimonialsSection = dynamic(
  () => import('@/components/home/TestimonialsSection'),
  { ssr: false }
);
const FinalCTASection = dynamic(
  () => import('@/components/home/FinalCTASection'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="bg-home-bg text-home-text overflow-x-hidden selection:bg-[#FF6A00]/20 transition-colors duration-500">
      {/* Fixed sticky background gradient */}
      <StickyGradientBg />

      <SmoothScroll>
        {/* Fixed Navigation */}
        <Navigation />

        {/* Hero with 3D Network */}
        <HeroSection />

        <SectionFade />

        {/* System Preview — Dashboard High-Fidelity Placeholder */}
        <SystemPreview />

        <SectionFade />

        {/* Signal Flow — 5 Capability Modules */}
        <SignalFlowSection />

        <SectionFade />

        {/* Platform Preview — Floating Dashboard */}
        <PlatformPreview />

        <SectionFade />

        {/* Parallax Depth — Globe to Packet Zoom */}
        <ParallaxDepth />

        <SectionFade />

        {/* Technology Stack */}
        <TechStackSection />

        <SectionFade />

        {/* User Testimonials */}
        <TestimonialsSection />

        <SectionFade />

        {/* Trust — Logos & Case Studies */}
        <TrustSection />

        <SectionFade />

        {/* Final CTA */}
        <FinalCTASection />

        {/* Footer */}
        <Footer />
      </SmoothScroll>
    </main>
  );
}
