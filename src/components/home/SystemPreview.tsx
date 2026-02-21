'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SystemPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      if (!imageRef.current || !containerRef.current) return;

      // Parallax effect for the dashboard mockup
      gsap.fromTo(imageRef.current, 
        { 
          y: 60,
          rotateX: 10,
          scale: 0.95,
        },
        {
          y: -60,
          rotateX: -5,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-32 bg-home-bg overflow-hidden perspective-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="relative"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-xs font-mono tracking-[0.3em] text-[#FF6A00] uppercase block mb-4">Core Platform</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-home-text mb-6">
              The Unified Control Layer
            </h2>
            <p className="text-home-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Experience total visibility and command over your entire telecom infrastructure from a single, high-fidelity interface.
            </p>
          </div>

          {/* Large Image Preview Container */}
          <div ref={imageRef} className="relative group will-change-transform">
            {/* Background Glow */}
            <div className="absolute -inset-10 bg-gradient-to-r from-[#FF6A00]/15 via-[#00D9FF]/10 to-[#FF6A00]/15 rounded-[3rem] blur-[100px] opacity-30 group-hover:opacity-60 transition duration-1000" />
            
            {/* Main Mockup Container */}
            <div className="relative aspect-[16/9] w-full rounded-[2rem] border border-home-border bg-[#0a0a0a] dark:bg-[#0a0a0a] overflow-hidden shadow-2xl">
              {/* Top Bar UI */}
              <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-black/40 dark:bg-white/5 backdrop-blur-md flex items-center px-6 gap-2 z-20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E63946]/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFB703]/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/50" />
                </div>
                <div className="ml-4 h-5 px-4 rounded-full bg-white/5 border border-white/10 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse mr-2" />
                  <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">system_live_stream</span>
                </div>
              </div>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ 
                backgroundImage: 'linear-gradient(rgba(255,106,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,106,0,0.2) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />

              {/* System Image Content */}
              <div className="absolute inset-0 flex items-center justify-center p-2 pt-10 pb-2">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image 
                    src="/images/Screenshot2026-02-08003250.png" 
                    alt="The Unified Control Layer Dashboard"
                    fill
                    className="object-contain opacity-100 transition-opacity duration-700"
                    priority
                  />
                  
                  {/* Scanning Scanline overlay */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent animate-scan-line-slow z-10" />
                </div>
              </div>

              {/* Overlay HUD Elements */}
              <div className="absolute bottom-8 left-8 p-4 rounded-lg bg-black/60 dark:bg-black/60 border border-white/10 backdrop-blur-xl z-20">
                <div className="text-[10px] text-white/40 font-mono mb-2">THROUGHPUT</div>
                <div className="text-2xl font-bold text-[#FF6A00] font-mono">4.7 PB/s</div>
              </div>

              <div className="absolute top-20 right-8 p-4 rounded-lg bg-black/60 dark:bg-black/60 border border-white/10 backdrop-blur-xl z-20">
                <div className="text-[10px] text-white/40 font-mono mb-2">ACTIVE SESSIONS</div>
                <div className="text-xl font-bold text-[#00D9FF] font-mono">12.5M</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
