'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Building2, Server, Cpu, ArrowRight } from 'lucide-react';

interface ParallaxScene {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  metrics: { label: string; value: string }[];
}

const scenes: ParallaxScene[] = [
  {
    id: 'global',
    title: 'Revenue Ecosystem Control',
    subtitle: 'Every connection, mapped in real-time across your WiFi hotspot network.',
    icon: <Globe className="w-8 h-8" />,
    color: '#00D9FF',
    metrics: [
      { label: 'Merchant Nodes', value: '142K' },
      { label: 'Active Currencies', value: '18' },
      { label: 'Settlement Avg', value: '< 2s' },
    ],
  },
  {
    id: 'city',
    title: 'Merchant Edge Registry',
    subtitle: 'Processing voucher activations and payments at the point of commerce.',
    icon: <Building2 className="w-8 h-8" />,
    color: '#A855F7',
    metrics: [
      { label: 'Activation Speed', value: 'Instant' },
      { label: 'Local Relays', value: '8.4K' },
      { label: 'Daily Batching', value: '2.4M' },
    ],
  },
  {
    id: 'datacenter',
    title: 'Core Financial Ledger',
    subtitle: 'High-security processing nodes with absolute data integrity and zero downtime.',
    icon: <Server className="w-8 h-8" />,
    color: '#22C55E',
    metrics: [
      { label: 'Volume (24h)', value: '$12.7M' },
      { label: 'Data Integrity', value: '100%' },
      { label: 'Audit Logs', value: 'Immutable' },
    ],
  },
  {
    id: 'packet',
    title: 'Atomic Transaction DNA',
    subtitle: 'Real-time inspection of every financial packet for fraud prevention.',
    icon: <Cpu className="w-8 h-8" />,
    color: '#FF6A00',
    metrics: [
      { label: 'Packet Check', value: '7-Layer' },
      { label: 'Validation Time', value: '12ms' },
      { label: 'Fraud Detection', value: 'AI-Driven' },
    ],
  },
];

export default function ParallaxDepthSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const visual = visualRef.current;
    const sections = sectionsRef.current;
    if (!container || !visual || !sections) return;

    const ctx = gsap.context(() => {
      // Reduced duration multiplier for faster scroll feel
      const segmentDuration = 1; 
      const totalDuration = scenes.length * segmentDuration;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: `+=${scenes.length * 70}%`, // Reduced from 100% for faster traversal
          scrub: 0.5, // Tighter scrub for responsive feel
          pin: true,
          pinSpacing: true,
          anticipatePin: 1, // Helps with pin jarring
          fastScrollEnd: true,
        },
      });

      // Background visual zoom and scale with hardware acceleration hint
      gsap.set(visual, { willChange: 'transform, opacity' });
      tl.to(visual, {
        scale: 4,
        rotate: 15,
        opacity: 0.1,
        ease: 'none',
        duration: totalDuration,
      }, 0);

      // Animate each section with uniform pacing
      const sectionElements = sections.querySelectorAll('.parallax-section');
      // Set hardware acceleration hints
      gsap.set(sectionElements, { willChange: 'opacity, transform, filter' });

      sectionElements.forEach((section, i) => {
        const start = i * segmentDuration; // Even spacing: 0, 1, 2, 3
        const fadeIn = 0.25;               // 25% of segment to fade in
        const hold = 0.5;                  // 50% of segment to hold
        const fadeOut = 0.25;              // 25% of segment to fade out

        // Fade in
        tl.fromTo(section,
          { opacity: 0, y: 80, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: fadeIn, ease: 'power1.out' },
          start
        );

        // Hold visible
        tl.to(section, { opacity: 1, duration: hold, ease: 'none' }, start + fadeIn);

        // Fade out (skip for last scene)
        if (i < sectionElements.length - 1) {
          tl.to(section, {
            opacity: 0,
            y: -80,
            filter: 'blur(8px)',
            duration: fadeOut,
            ease: 'power1.in',
          }, start + fadeIn + hold);
        }
      });

      // Inner visual elements (rings) animations
      const rings = visual.querySelectorAll('.parallax-ring');
      rings.forEach((ring, i) => {
        gsap.to(ring, {
          rotate: i % 2 === 0 ? 360 : -360,
          duration: 10 + i * 5,
          repeat: -1,
          ease: 'linear',
        });
      });

    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="depth" className="relative bg-home-bg overflow-hidden min-h-screen">
      {/* Background Visual Container - Sticky/Pinned through context */}
      <div 
        ref={visualRef} 
        className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none"
      >
        <div className="relative w-[800px] h-[800px]">
          {/* Concentric Parallax Rings */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="parallax-ring absolute inset-0 rounded-full border border-white/5"
              style={{
                margin: `${i * 60}px`,
                borderWidth: '1px',
                borderColor: `rgba(255,106,0,${0.05 + (i * 0.02)})`,
                boxShadow: `inset 0 0 20px rgba(255,106,0,${0.02})`,
              }}
            />
          ))}
          
          {/* Glowing Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-[#FF6A00]/10 blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-full bg-[#FF6A00] blur-[10px] animate-pulse" />
        </div>
      </div>

      {/* Content Layers */}
      <div ref={sectionsRef} className="relative z-10 w-full h-screen">
        {scenes.map((scene, i) => (
          <div 
            key={scene.id} 
            className="parallax-section absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <div 
              className="mb-8 p-4 rounded-2xl bg-home-card border border-home-border backdrop-blur-xl transition-all duration-500 hover:border-home-text-faint"
              style={{ color: scene.color }}
            >
              {scene.icon}
            </div>

            <h2 className="text-5xl sm:text-7xl font-bold text-home-text mb-6 tracking-tight leading-[1.1]">
              {scene.title}
            </h2>
            <p className="text-xl sm:text-2xl text-home-text-muted max-w-2xl mx-auto mb-12 font-light">
              {scene.subtitle}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full mx-auto">
              {scene.metrics.map((metric) => (
                <div 
                  key={metric.label} 
                  className="px-8 py-6 rounded-2xl bg-home-card border border-home-border group transition-all duration-300 hover:bg-home-surface hover:border-home-text-faint"
                >
                  <div 
                    className="text-3xl font-bold font-mono mb-1 transition-colors group-hover:text-home-text"
                    style={{ color: scene.color }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-xs text-home-text-faint tracking-[0.2em] uppercase font-mono">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Indicator */}
            {i === 0 && (
              <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-50 animate-bounce">
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#FF6A00] to-transparent" />
                <span className="text-[10px] font-mono tracking-[0.5em] text-[#FF6A00] uppercase">Scroll to dive</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Depth Progress Marker */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        {scenes.map((_, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-px bg-home-border group-hover:bg-home-text-muted transition-all" />
          </div>
        ))}
      </div>
    </section>
  );
}
