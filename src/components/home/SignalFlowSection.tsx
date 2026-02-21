'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Eye, Brain, Zap, Shield, Expand,
  ArrowRight, Server, Globe, AlertTriangle,
  TrendingUp, Cpu, Lock, BarChart3, Network,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────── DATA ─────────────────────── */

interface SignalModule {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  tag: string;
  satellites: { icon: React.ReactNode; label: string; stat: string }[];
  stats: { label: string; value: string }[];
}

const modules: SignalModule[] = [
  {
    id: 'overview',
    tag: 'MOD-01',
    title: 'Operational Intelligence',
    subtitle: 'Central command interface for global telecom infrastructure and real-time network health.',
    icon: <Eye className="w-7 h-7" />,
    color: '#FF6A00',
    glowColor: 'rgba(255, 106, 0, 0.15)',
    satellites: [
      { icon: <Server className="w-4 h-4" />, label: 'Nodes', stat: '1.2M' },
      { icon: <Globe className="w-4 h-4" />, label: 'Regions', stat: '42' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'Uptime', stat: '99.99%' },
      { icon: <AlertTriangle className="w-4 h-4" />, label: 'Alerts', stat: 'Healthy' },
    ],
    stats: [
      { label: 'Active Endpoints', value: '47.3M' },
      { label: 'Global Latency', value: '14ms' },
    ],
  },
  {
    id: 'payments',
    tag: 'MOD-02',
    title: 'Revenue & Financials',
    subtitle: 'Comprehensive financial engine tracking annual revenue, phone number monetization, and failed transactions.',
    icon: <TrendingUp className="w-7 h-7" />,
    color: '#00D9FF',
    glowColor: 'rgba(0, 217, 255, 0.15)',
    satellites: [
      { icon: <TrendingUp className="w-4 h-4" />, label: 'Growth', stat: '+24%' },
      { icon: <Cpu className="w-4 h-4" />, label: 'Auth', stat: 'Secure' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'Failed', stat: '0.04%' },
      { icon: <Network className="w-4 h-4" />, label: 'Gateways', stat: '128' },
    ],
    stats: [
      { label: 'Annual Revenue', value: '$2.4B' },
      { label: 'Phone Numbers', value: '12.8M' },
    ],
  },
  {
    id: 'vouchers',
    tag: 'MOD-03',
    title: 'Voucher Engine',
    subtitle: 'Industrial-scale batch generation, automated distribution, and secure activation management.',
    icon: <Zap className="w-7 h-7" />,
    color: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.15)',
    satellites: [
      { icon: <Zap className="w-4 h-4" />, label: 'Gen Speed', stat: '50K/s' },
      { icon: <Server className="w-4 h-4" />, label: 'Batches', stat: 'Active' },
      { icon: <Globe className="w-4 h-4" />, label: 'Distribution', stat: 'Instant' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'Usage', stat: '84%' },
    ],
    stats: [
      { label: 'Generated Today', value: '14.2M' },
      { label: 'Active Inventory', value: '98.4B' },
    ],
  },
  {
    id: 'devices',
    tag: 'MOD-04',
    title: 'Endpoint Management',
    subtitle: 'Autonomous registry and diagnostic suite for millions of connected telecom devices.',
    icon: <Expand className="w-7 h-7" />,
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    satellites: [
      { icon: <Server className="w-4 h-4" />, label: 'Registry', stat: 'Live' },
      { icon: <Globe className="w-4 h-4" />, label: 'Coverage', stat: 'Wide' },
      { icon: <Eye className="w-4 h-4" />, label: 'Monitoring', stat: 'Active' },
      { icon: <Shield className="w-4 h-4" />, label: 'State', stat: 'Synced' },
    ],
    stats: [
      { label: 'Managed Devices', value: '500M+' },
      { label: 'Health Score', value: '98.7' },
    ],
  },
  {
    id: 'security',
    tag: 'MOD-05',
    title: 'Autonomous Defense',
    subtitle: 'Zero-trust security layer with AI-driven threat neutralization and packet diagnostics.',
    icon: <Shield className="w-7 h-7" />,
    color: '#E63946',
    glowColor: 'rgba(230, 57, 70, 0.15)',
    satellites: [
      { icon: <Lock className="w-4 h-4" />, label: 'Protocol', stat: 'TLS 1.3' },
      { icon: <Shield className="w-4 h-4" />, label: 'Firewall', stat: 'L7' },
      { icon: <Expand className="w-4 h-4" />, label: 'Scale', stat: 'Multi-Z' },
      { icon: <AlertTriangle className="w-4 h-4" />, label: 'Mitigation', stat: '<50ms' },
    ],
    stats: [
      { label: 'Threats Blocked', value: '14.2M' },
      { label: 'Security Level', value: 'Tier 4' },
    ],
  },
];

/* ─────────────────── GAMING CARD ─────────────────── */

function GamingCard({ module }: { module: SignalModule }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="gaming-card relative flex-shrink-0 w-[82vw] sm:w-[68vw] md:w-[52vw] lg:w-[40vw] xl:w-[35vw] h-[clamp(420px,58vh,620px)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Frame */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500 bg-home-bg"
        style={{
          border: `1px solid ${module.color}25`,
          boxShadow: isHovered
            ? `0 0 40px ${module.color}15, 0 0 80px ${module.color}08, inset 0 1px 0 ${module.color}15`
            : `0 0 20px ${module.color}08, inset 0 1px 0 ${module.color}10`,
        }}
      >
        {/* Adaptive gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none dark:opacity-100 opacity-30"
          style={{
            background: `linear-gradient(145deg, ${module.color}08 0%, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.98) 100%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none dark:opacity-0 opacity-100"
          style={{
            background: `linear-gradient(145deg, ${module.color}08 0%, rgba(245,245,245,0.95) 40%, rgba(240,240,240,0.98) 100%)`,
          }}
        />
        {/* HUD Corner Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: `${module.color}50` }} />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl" style={{ borderColor: `${module.color}50` }} />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl" style={{ borderColor: `${module.color}30` }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: `${module.color}30` }} />

        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none gaming-scanline opacity-[0.03]" />

        {/* Glowing top edge */}
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${module.color}60, transparent)` }}
        />

        {/* Card Content */}
        <div className="relative z-10 flex flex-col h-full p-6 sm:p-8">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center gaming-icon-pulse"
                style={{
                  backgroundColor: `${module.color}15`,
                  color: module.color,
                  boxShadow: `0 0 20px ${module.color}20`,
                }}
              >
                {module.icon}
              </div>
              <div>
                <span
                  className="text-[10px] font-mono tracking-[0.3em] uppercase block"
                  style={{ color: `${module.color}90` }}
                >
                  {module.tag}
                </span>
                <span
                  className="text-xs font-mono tracking-[0.2em] uppercase"
                  style={{ color: module.color }}
                >
                  {module.id}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: module.color }} />
              <span className="text-[10px] font-mono text-home-text-faint">ONLINE</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-bold text-home-text leading-tight mb-2">
            {module.title}
          </h3>
          <p className="text-sm text-home-text-muted leading-relaxed mb-5 max-w-sm">
            {module.subtitle}
          </p>

          {/* Orbital Diagram with Rotating Rings & Image Placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
            <div className="relative w-full h-40 sm:h-48 mb-6 rounded-xl border border-home-border bg-home-card overflow-hidden group/img">
               <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/10 to-transparent" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-12 h-12 rounded-lg border border-home-border flex items-center justify-center bg-black/40">
                        {module.icon}
                     </div>
                     <span className="text-[10px] font-mono text-home-text-faint tracking-widest uppercase">
                       {module.id}_preview.png
                     </span>
                  </div>
               </div>
               {/* Animated scanning line */}
               <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan-line-slow" />
            </div>

            <div className="relative w-40 h-40 sm:w-48 sm:h-48 scale-75 sm:scale-90 opacity-40">
              {/* Ring 1 — outer, slow clockwise */}
              <div
                className="absolute inset-0 rounded-full border gaming-ring-spin-slow"
                style={{ borderColor: `${module.color}12` }}
              />
              {/* Ring 2 — mid, reverse */}
              <div
                className="absolute inset-4 rounded-full border gaming-ring-spin-reverse"
                style={{ borderColor: `${module.color}18` }}
              />
              {/* Ring 3 — inner, fast */}
              <div
                className="absolute inset-8 rounded-full border gaming-ring-spin-fast"
                style={{ borderColor: `${module.color}10` }}
              />

              {/* Accent arc — partial glowing ring, slow */}
              <div
                className="absolute inset-1 rounded-full gaming-ring-spin-slow"
                style={{
                  borderTop: `2px solid ${module.color}60`,
                  borderRight: '2px solid transparent',
                  borderBottom: '2px solid transparent',
                  borderLeft: '2px solid transparent',
                }}
              />
              {/* Accent arc 2 — reverse */}
              <div
                className="absolute inset-5 rounded-full gaming-ring-spin-reverse"
                style={{
                  borderTop: '2px solid transparent',
                  borderRight: '2px solid transparent',
                  borderBottom: `2px solid ${module.color}40`,
                  borderLeft: '2px solid transparent',
                }}
              />

              {/* Center node */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center gaming-core-glow"
                  style={{
                    backgroundColor: `${module.color}15`,
                    color: module.color,
                    boxShadow: `0 0 30px ${module.color}25, 0 0 60px ${module.color}10`,
                  }}
                >
                  {module.icon}
                </div>
              </div>

              {/* Satellite nodes */}
              {module.satellites.map((sat, i) => {
                const angle = (i / module.satellites.length) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const r = 88;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;

                return (
                  <motion.div
                    key={sat.label}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 200 }}
                  >
                    <div
                      className="relative group cursor-pointer w-11 h-11 rounded-lg border flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      style={{
                        borderColor: `${module.color}25`,
                        backgroundColor: `${module.color}08`,
                      }}
                    >
                      <div style={{ color: module.color }}>{sat.icon}</div>
                      <span className="text-[7px] text-home-text-muted font-mono leading-none">{sat.stat}</span>
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-[9px] text-home-text-faint font-mono">{sat.label}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Stats Footer */}
          <div className="mt-auto pt-4 border-t border-home-border">
            <div className="grid grid-cols-2 gap-3">
              {module.stats.map((stat) => (
                <div key={stat.label} className="p-3 rounded-lg bg-home-card border border-home-border">
                  <div className="text-base sm:text-lg font-bold font-mono" style={{ color: module.color }}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-home-text-faint mt-0.5 font-mono uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
            <button
              className="mt-4 w-full group flex items-center justify-center gap-2 text-xs font-mono tracking-wider uppercase py-2.5 rounded-lg border transition-all duration-300"
              style={{
                borderColor: `${module.color}25`,
                color: module.color,
                backgroundColor: `${module.color}05`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${module.color}15`;
                e.currentTarget.style.borderColor = `${module.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${module.color}05`;
                e.currentTarget.style.borderColor = `${module.color}25`;
              }}
            >
              Explore {module.id}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── MAIN SECTION ─────────────── */

export default function SignalFlowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const header = headerRef.current;
    if (!section || !track) return;

    const cards = track.querySelectorAll<HTMLElement>('.gaming-card');
    const getScrollAmount = () => track.scrollWidth - window.innerWidth;

    // Use gsap.context for safe React cleanup — prevents removeChild errors
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean; isDesktop: boolean };

          const scrubVal = isMobile ? 1.5 : 2.5;
          const scrollMultiplier = isMobile ? 1.2 : 1.5;

          // ── Phase 1: Smooth header fade-in before pin ──
          if (header) {
            gsap.fromTo(
              header,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 80%',
                  end: 'top 20%',
                  scrub: scrubVal,
                },
              }
            );
          }

          // ── Phase 2: Pin & horizontal scroll ──
          // pinType: 'transform' avoids DOM reparenting (prevents removeChild error)
          const scrollTween = gsap.to(track, {
            x: () => -getScrollAmount(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${getScrollAmount() * scrollMultiplier}`,
              pin: true,
              pinSpacing: true,
              pinType: 'transform',
              scrub: scrubVal,
              invalidateOnRefresh: true,
            },
          });

          // ── Phase 3: Per-card zoom parallax ──
          cards.forEach((card) => {
            gsap.fromTo(
              card,
              { scale: 0.93, opacity: 0.4 },
              {
                scale: 1,
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: scrollTween,
                  start: 'left 100%',
                  end: 'left 60%',
                  scrub: true,
                },
              }
            );

            gsap.to(card, {
              scale: 0.95,
              opacity: 0.5,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: 'right 40%',
                end: 'right -15%',
                scrub: true,
              },
            });
          });

          return () => {};
        }
      );
    }, sectionRef); // scope to sectionRef — GSAP only touches nodes inside this ref

    // Debounced resize refresh
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      // ctx.revert() kills all GSAP animations AND ScrollTriggers within the context
      // This restores the DOM to its original state BEFORE React tries to unmount
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="relative bg-home-bg overflow-hidden"
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `
          linear-gradient(rgba(255,106,0,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,106,0,0.4) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Section Header */}
      <div ref={headerRef} className="relative z-10 pt-24 pb-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[10px] font-mono tracking-[0.5em] text-[#FF6A00]/70 uppercase">
            ◆ System Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-home-text mt-4 mb-3">
            Five Pillars of Control
          </h2>
          <p className="text-home-text-muted max-w-xl mx-auto text-sm sm:text-base font-light">
            Every signal monitored. Every pattern recognized. Every threat neutralized.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-home-text-faint">
            <div className="w-6 h-px bg-home-border" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to explore</span>
            <div className="w-6 h-px bg-home-border" />
            <ArrowRight className="w-3 h-3 animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Horizontal Track */}
      <div
        ref={trackRef}
        className="relative z-10 flex items-center gap-5 sm:gap-8 lg:gap-10 px-[8vw] sm:px-[12vw] pb-6"
        style={{ willChange: 'transform' }}
      >
        {modules.map((module) => (
          <GamingCard key={module.id} module={module} />
        ))}
        {/* End spacer */}
        <div className="flex-shrink-0 w-[10vw]" />
      </div>

      {/* Bottom progress dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {modules.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2">
            <div
              className="w-6 h-0.5 rounded-full"
              style={{ backgroundColor: `${m.color}40` }}
            />
            {i < modules.length - 1 && <div className="w-1 h-0.5 bg-white/10 rounded-full" />}
          </div>
        ))}
      </div>
    </section>
  );
}

