'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Router, Wifi, Server, Radio, Network } from 'lucide-react';
import { MarketingNav, MarketingFooter } from '@/components/marketing/layout-components';

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // stop observing once it has faded in
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

// Removed inline Nav, imported from shared components instead.

// ─── HERO SECTION ────────────────────────────────────────────────────────────

const Hero = () => {
  const fadeRef = useScrollFade();
  return (
    <section className="pt-[clamp(8rem,15vw,12rem)] pb-[clamp(4rem,8vw,8rem)] px-[clamp(1.25rem,5vw,4rem)]">
      <div ref={fadeRef} className="animate-fade-up mx-auto max-w-[1100px] flex flex-col items-center text-center">
        
        <div className="flex items-center justify-center gap-2 mb-8 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="font-geist-mono text-[0.75rem] font-medium tracking-wide text-[var(--text-primary)] uppercase">Systems Operational</span>
        </div>

        <h1 className="font-geist font-semibold text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)] max-w-4xl mb-6">
          Master Your <br />
          <span className="text-[var(--brand-orange)]">WiFi Network.</span>
        </h1>

        <p className="text-[1.1rem] font-medium text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed">
          The ultimate control layer for network operators. Seamlessly manage billing, mobile money integrations, voucher systems, and multi-site routing from a single unified interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-md font-medium text-[1rem] bg-[var(--brand-orange)] text-white shadow-sm shadow-[var(--brand-orange)]/20 hover:shadow-md hover:shadow-[var(--brand-orange)]/40 hover:bg-[#e65c00] hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto text-center"
          >
            Enter Platform
          </Link>
          <Link
            href="#platform"
            className="px-6 py-3 rounded-md font-medium text-[1rem] bg-transparent text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-secondary)] transition-colors w-full sm:w-auto text-center"
          >
            Watch Overview
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-geist-mono text-[0.85rem] text-[var(--text-muted)]">
          <span>1,247 Active Hotspots</span>
          <span className="hidden sm:inline">·</span>
          <span>99.9% Uptime</span>
          <span className="hidden sm:inline">·</span>
          <span>47.3K Connected Users</span>
        </div>

        <div className="mt-16 w-full max-w-[1000px] mx-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2 shadow-sm overflow-hidden">
          <div className="w-full flex flex-col bg-[var(--bg-primary)] rounded-lg border border-[var(--border)] overflow-hidden">
            <div className="h-10 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex flex-none items-center px-4 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-[var(--border-strong)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--border-strong)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--border-strong)]" />
            </div>
            <div className="relative w-full aspect-[16/9]">
              <Image 
                src="/images/Screenshot.png"
                alt="XetiHub Dashboard Interface"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── FEATURES ────────────────────────────────────────────────────────────────

const Features = () => {
  const fadeRef = useScrollFade();
  
  const featureList = [
    { title: "Hotspot Management", desc: "Monitor all active sessions, limit bandwidth, and kick users instantly." },
    { title: "Billing Analytics", desc: "Real-time revenue tracking and customizable period reporting." },
    { title: "Mobile Money", desc: "Native integration for automated top-ups and instant M-Pesa/MTN settlement." },
    { title: "Voucher Engine", desc: "Generate, batch-print, and manage thousands of time or data-based codes." },
    { title: "RADIUS Control", desc: "Fully integrated remote authentication dial-in user service infrastructure." }
  ];

  return (
    <section id="features" className="py-[clamp(4rem,8vw,8rem)] px-[clamp(1.25rem,5vw,4rem)] border-t border-[var(--border)]">
      <div ref={fadeRef} className="animate-fade-up mx-auto max-w-[1100px] grid md:grid-cols-2 gap-12 md:gap-24">
        
        <div>
          <span className="font-geist-mono text-[0.75rem] font-medium tracking-widest uppercase text-[var(--text-muted)] mb-4 block">Platform</span>
          <h2 className="font-geist font-semibold text-[clamp(1.8rem,3.5vw,2.6rem)] tracking-[-0.02em] text-[var(--text-primary)] mb-6 leading-tight">
            The Unified <br />Control Layer.
          </h2>
          <p className="text-[1.1rem] text-[var(--text-secondary)] mb-8 max-w-md">
            Built for ISPs and local network operators. We stripped away the complexity to give you an interface designed purely for speed and reliability.
          </p>
          <Link href="/about" className="inline-flex items-center text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors">
            Read our engineering philosophy <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          {featureList.map((f, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-3 h-3 mt-[7px] shrink-0 bg-[var(--brand-orange)] rounded-[2px]" />
              <div>
                <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)] mb-1">{f.title}</h3>
                <p className="text-[1rem] text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── SUPPORTED DEVICES ───────────────────────────────────────────────────────

const SupportedDevices = () => {
  const fadeRef = useScrollFade();
  
  const devices = [
    { name: "MikroTik Routers", desc: "Native API integration for seamless hotspot and queue management.", icon: Router },
    { name: "TP-Link Omada", desc: "Full controller integration via external portal server mapping.", icon: Server },
    { name: "TP-Link EAP (Direct)", desc: "Direct captive portal authentication for standalone access points.", icon: Wifi },
    { name: "Ubiquiti UniFi", desc: "Advanced guest policies and RADIUS profile sync for UniFi OS.", icon: Radio },
    { name: "Ruijie / Reyee", desc: "Cloud controller integration with seamless authentication.", icon: Network }
  ];

  return (
    <section className="py-[clamp(4rem,8vw,8rem)] px-[clamp(1.25rem,5vw,4rem)] bg-[var(--bg-primary)]">
      <div ref={fadeRef} className="animate-fade-up mx-auto max-w-[1100px]">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="font-geist font-semibold text-[clamp(1.5rem,3vw,2.2rem)] tracking-[-0.02em] text-[var(--text-primary)] mb-4">
            Hardware Agnostic
          </h2>
          <p className="text-[1.1rem] text-[var(--text-secondary)]">
            XetiHub seamlessly interfaces with industry-leading networking equipment, ensuring no vendor lock-in for your operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d, i) => (
            <div key={i} className="flex flex-col gap-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--brand-orange)]/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center">
                <d.icon className="w-6 h-6 text-[var(--text-primary)]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)] mb-2">{d.name}</h3>
                <p className="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── STATS ROW ───────────────────────────────────────────────────────────────

const StatsRow = () => {
  const fadeRef = useScrollFade();
  return (
    <section className="bg-[var(--bg-secondary)] border-y border-[var(--border)] py-[clamp(4rem,6vw,6rem)] px-[clamp(1.25rem,5vw,4rem)]">
      <div ref={fadeRef} className="animate-fade-up mx-auto max-w-[1100px] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {[
          { stat: "1.2k+", label: "ACTIVE HOTSPOTS" },
          { stat: "47k", label: "CONNECTED USERS" },
          { stat: "99.9%", label: "SYSTEM UPTIME" },
          { stat: "<50ms", label: "AUTH LATENCY" }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center md:items-start border-l border-transparent md:border-[var(--border-strong)] md:pl-8 first:border-0 first:pl-0">
            <span className="font-geist-mono font-semibold text-[1.8rem] text-[var(--text-primary)] mb-2">{s.stat}</span>
            <span className="font-geist-mono text-[0.75rem] font-medium tracking-widest text-[var(--text-muted)] uppercase">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────

const HowItWorks = () => {
  const fadeRef = useScrollFade();
  return (
    <section className="py-[clamp(4rem,8vw,8rem)] px-[clamp(1.25rem,5vw,4rem)]">
      <div ref={fadeRef} className="animate-fade-up mx-auto max-w-[1100px]">
        <div className="mb-16">
          <h2 className="font-geist font-semibold text-[clamp(1.8rem,3.5vw,2.6rem)] tracking-[-0.02em] text-[var(--text-primary)] mb-4">
            Deployment Workflow
          </h2>
          <p className="text-[1.1rem] text-[var(--text-secondary)]">From zero to fully-automated billing in three steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[18px] left-[10%] right-[40%] h-[1px] border-t border-[var(--border-strong)] border-dashed z-[-1]" />
          <div className="hidden md:block absolute top-[18px] left-[40%] right-[10%] h-[1px] border-t border-[var(--border-strong)] border-dashed z-[-1]" />

          {[
            { num: "01", title: "Connect Router", desc: "Link your MikroTik edge routers to XetiHub via our secure API bridge in minutes." },
            { num: "02", title: "Configure Billing", desc: "Set up data or time-based packages, map mobile money endpoints, and issue vouchers." },
            { num: "03", title: "Start Earning", desc: "The system fully handles authentication, bandwidth caps, and automated reconnections." }
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-4 bg-[var(--bg-primary)]">
              <span className="w-10 h-10 flex items-center justify-center font-geist-mono text-[0.85rem] font-semibold bg-[var(--bg-secondary)] border border-[var(--border-strong)] rounded-full text-[var(--text-primary)]">
                {s.num}
              </span>
              <div>
                <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)] mb-2">{s.title}</h3>
                <p className="text-[1rem] text-[var(--text-secondary)]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA BANNER ──────────────────────────────────────────────────────────────

const CtaBanner = () => {
  const fadeRef = useScrollFade();
  return (
    <section className="pb-[clamp(4rem,8vw,8rem)] px-[clamp(1.25rem,5vw,4rem)]">
      <div ref={fadeRef} className="animate-fade-up mx-auto max-w-[1100px] bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-2xl p-12 md:p-16 text-center flex flex-col items-center justify-center">
        <h2 className="font-geist font-semibold text-[clamp(1.8rem,3.5vw,2.6rem)] tracking-[-0.02em] text-[var(--text-primary)] mb-4">
          Ready to scale your network?
        </h2>
        <p className="text-[1.1rem] text-[var(--text-secondary)] mb-8 max-w-xl">
          Join hundreds of operators using XetiHub for unified, operator-grade network management.
        </p>
        <Link
          href="/dashboard"
          className="px-8 py-3.5 rounded-md font-medium text-[1rem] bg-[var(--brand-orange)] text-white shadow-sm shadow-[var(--brand-orange)]/20 hover:shadow-md hover:shadow-[var(--brand-orange)]/40 hover:bg-[#e65c00] hover:-translate-y-0.5 transition-all duration-200"
        >
          Enter Platform
        </Link>
      </div>
    </section>
  );
};

// Removed inline Footer, imported from shared components instead.

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <MarketingNav />
      <Hero />
      <Features />
      <SupportedDevices />
      <StatsRow />
      <HowItWorks />
      <CtaBanner />
      <MarketingFooter />
    </main>
  );
}
