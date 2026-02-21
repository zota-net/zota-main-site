'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ArrowRight, Zap } from 'lucide-react';

const OrbitalScene = dynamic(() => import('@/components/three/OrbitalScene'), {
  ssr: false,
  loading: () => null,
});

export default function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20%' });

  return (
    <section id="cta" className="relative py-32 md:py-48 bg-home-bg overflow-hidden" ref={ref}>
      {/* 3D Orbital Background */}
      <OrbitalScene
        className="absolute inset-0 opacity-30 pointer-events-none"
        primaryColor="#FF6A00"
        secondaryColor="#00D9FF"
      />

      {/* Converging particles background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { 
            opacity: 1, 
            scale: 1,
            background: [
              'radial-gradient(circle, rgba(255,106,0,0.08) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(255,106,0,0.12) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(255,106,0,0.08) 0%, transparent 70%)',
            ]
          } : {}}
          transition={{ 
            opacity: { duration: 1 },
            scale: { duration: 1.5, ease: 'easeOut' },
            background: { duration: 4, repeat: Infinity }
          }}
        />

        {/* Converging lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360;
            const rad = (angle * Math.PI) / 180;
            const startX = 50 + Math.cos(rad) * 60;
            const startY = 50 + Math.sin(rad) * 60;
            return (
              <line
                key={i}
                x1={`${startX}%`}
                y1={`${startY}%`}
                x2="50%"
                y2="50%"
                stroke="#FF6A00"
                strokeWidth="0.5"
                strokeDasharray="8 12"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-20"
                  dur={`${2 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </line>
            );
          })}
        </svg>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-home-border" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-home-border" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-home-border" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-home-border" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/5 mb-8"
            animate={{ 
              boxShadow: [
                '0 0 0px rgba(255,106,0,0)',
                '0 0 20px rgba(255,106,0,0.15)',
                '0 0 0px rgba(255,106,0,0)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span className="text-xs font-mono text-[#FF6A00] tracking-wider">READY TO DEPLOY</span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-home-text leading-[0.95] mb-6">
            <span className="block">Own the</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FF8533] to-[#FF6A00] mt-2">
              Financial Registry
            </span>
            <span className="block text-home-text mt-2">of the Future.</span>
          </h2>

          <p className="text-lg text-home-text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Join the organizations already redefining how payments, vouchers, and settlements are governed globally.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              className="group relative px-10 py-4 bg-[#FF6A00] text-white font-semibold text-base tracking-wide rounded-sm overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 40px rgba(255,106,0,0.4), 0 0 80px rgba(255,106,0,0.2)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Request Demo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#FF8533] to-[#CC5500]"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              className="px-10 py-4 border border-home-border text-home-text-muted font-medium text-base tracking-wide rounded-sm transition-all duration-300 hover:border-[#FF6A00]/30 hover:text-home-text hover:bg-home-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Talk to Engineering
            </motion.button>
          </div>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center justify-center gap-8 mt-12 text-xs text-home-text-faint font-mono"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <span>SOC2 Compliant</span>
            <span className="w-1 h-1 rounded-full bg-home-border" />
            <span>ISO 27001</span>
            <span className="w-1 h-1 rounded-full bg-home-border" />
            <span>GDPR Ready</span>
            <span className="w-1 h-1 rounded-full bg-home-border hidden sm:block" />
            <span className="hidden sm:block">99.999% SLA</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
