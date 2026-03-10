'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useMouseParallax, useTypingEffect, useLiveValue } from '@/lib/engine/hooks';
import { ArrowRight, Play } from 'lucide-react';

const NetworkScene = dynamic(() => import('./NetworkScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-home-bg" />,
});

// Scanning text reveal effect
function ScanningText({ text, className, delay = 0, isVisible = true }: {
  text: string;
  className?: string;
  delay?: number;
  isVisible?: boolean;
}) {
  const { displayText, isComplete } = useTypingEffect(text, 55, isVisible, delay);
  
  return (
    <span className={className}>
      {displayText}
      {!isComplete && isVisible && (
        <span className="inline-block w-[3px] h-[1em] bg-[#FF6A00] ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

// Grid Floor SVG overlay
function GridOverlay() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-20">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,106,0,0.15)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
      </svg>
    </div>
  );
}

export default function HeroSection() {
  const [showContent, setShowContent] = useState(false);
  const mousePos = useMouseParallax(0.015);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="relative w-full min-h-screen overflow-hidden bg-home-bg">
      {/* 3D Network Background */}
      <div className="absolute inset-0 z-0">
        <NetworkScene className="w-full h-full" mousePos={mousePos} />
      </div>

      {/* Grid Overlay */}
      <GridOverlay />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-home-bg/60 via-transparent to-home-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-home-bg/40 via-transparent to-home-bg/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-24 pb-6">
        {/* Center content area */}
        <div className="flex-1 flex flex-col items-center justify-center">
        {/* System Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -10 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-home-border bg-home-card backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-mono text-home-text-muted tracking-wide">SYSTEMS OPERATIONAL</span>
          <span className="text-xs font-mono text-green-400">●</span>
        </motion.div>

        {/* Main Headline */}
        <div className="text-center max-w-5xl">
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] font-bold tracking-tight leading-[0.9] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#44403c] via-[#78716c] via-[40%] to-[#292524] dark:from-[#a8a29e] dark:via-[#fafaf9] dark:via-[50%] dark:to-[#a8a29e]">
              <ScanningText text="MASTER YOUR" delay={1200} isVisible={showContent} />
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#c2410c] dark:from-[#FF6A00] dark:via-[#FF8533] dark:to-[#FF6A00] mt-2">
              <ScanningText text="WIFI NETWORK." delay={2000} isVisible={showContent} />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 0.7 : 0, y: showContent ? 0 : 20 }}
            transition={{ delay: 3.0, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-home-text-muted max-w-2xl mx-auto leading-relaxed font-light"
          >
            Comprehensive WiFi hotspot billing system with mobile money payments, voucher codes, 
            multi-site management, and intelligent automatic reconnection for uninterrupted service.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ delay: 3.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          {/* Primary CTA */}
          <button className="group relative px-8 py-3.5 bg-[#FF6A00] text-white font-semibold text-sm tracking-wide rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] hover:scale-105">
            <span className="relative z-10 flex items-center gap-2">
              Enter Platform
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF8533] to-[#FF6A00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Secondary CTA */}
          <button className="group px-8 py-3.5 border border-[#FF6A00]/40 text-home-text font-medium text-sm tracking-wide rounded-sm transition-all duration-300 hover:bg-[#FF6A00]/10 hover:border-[#FF6A00]/60 hover:shadow-[0_0_20px_rgba(255,106,0,0.15)]">
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4 text-[#FF6A00]" />
              Watch Overview
            </span>
          </button>
        </motion.div>
        </div>

        {/* Bottom Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
          transition={{ delay: 4.0, duration: 0.8 }}
          className="mb-4 flex items-center gap-4 sm:gap-8 px-4 sm:px-6 py-3 rounded-lg border border-home-border bg-home-card backdrop-blur-md"
        >
          <LiveStat label="Active Hotspots" value={1247} suffix="" />
          <div className="w-px h-8 bg-home-border" />
          <LiveStat label="Uptime" value={99.9} suffix="%" decimals={1} />
          <div className="w-px h-8 bg-home-border hidden sm:block" />
          <div className="hidden sm:block">
            <LiveStat label="Connected Users" value={47.3} suffix="K" decimals={1} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Live stat component
function LiveStat({ label, value, suffix = '', decimals = 0 }: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const liveVal = useLiveValue(value, 0.02, 200);
  
  return (
    <div className="text-center">
      <div className="text-lg sm:text-xl font-bold text-home-text tabular-nums">
        {liveVal.toFixed(decimals)}<span className="text-[#FF6A00] text-sm ml-0.5">{suffix}</span>
      </div>
      <div className="text-[10px] font-mono text-home-text-faint tracking-wider uppercase">{label}</div>
    </div>
  );
}
