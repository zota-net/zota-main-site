'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Globe, Shield, Zap, Users, Target, Award,
  ArrowRight, Building2, Cpu, Network,
} from 'lucide-react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { ThreePreloader, SceneVisibility } from '@/components/three/SceneOptimizer';

const OrbitalScene = dynamic(() => import('@/components/three/OrbitalScene'), {
  ssr: false,
  loading: () => null,
});
const TorusField = dynamic(() => import('@/components/three/TorusField'), {
  ssr: false,
  loading: () => null,
});
const ConstellationWeb = dynamic(() => import('@/components/three/ConstellationWeb'), {
  ssr: false,
  loading: () => null,
});
const DNAHelix = dynamic(() => import('@/components/three/DNAHelix'), {
  ssr: false,
  loading: () => null,
});
const ParticleRise = dynamic(() => import('@/components/three/ParticleRise'), {
  ssr: false,
  loading: () => null,
});
const FloatingGrid = dynamic(() => import('@/components/three/FloatingGrid'), {
  ssr: false,
  loading: () => null,
});

/* ─── DATA ─── */

const stats = [
  { value: '1.2K+', label: 'Active Hotspots' },
  { value: '42', label: 'Cities Covered' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '$2.4M', label: 'Monthly Revenue' },
];

const values = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Reliability First',
    description: 'Zero-downtime architecture with automatic reconnection. Every connection is monitored and recovered instantly.',
    color: '#E63946',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    description: 'Sub-second authentication and billing across thousands of hotspots. No compromises on user experience.',
    color: '#FF6A00',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Multi-Site Scale',
    description: 'Operating across 42 cities with centralized management. Local performance, global oversight.',
    color: '#00D9FF',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Operator-Focused',
    description: 'Built by network engineers for hotspot operators. Every feature solves a real connectivity challenge.',
    color: '#22C55E',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Always Connected',
    description: 'Designed for networks that cannot fail. Intelligent reconnection handles outages, mobility, and signal loss.',
    color: '#A855F7',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Hardware Ready',
    description: 'Pre-integrated with Mikrotik, TP-Link, Unifi, and Ruijie. RADIUS certified and enterprise-grade.',
    color: '#F59E0B',
  },
];

const timeline = [
  { year: '2019', title: 'Founded', description: 'XETIHUB started with a vision to revolutionize WiFi hotspot billing and management.' },
  { year: '2020', title: 'First Hotspot Network', description: 'Launched the core platform with 3 hotspot operators and mobile money integration.' },
  { year: '2021', title: 'Voucher Engine', description: 'Released industrial-scale voucher generation processing 50K vouchers per second.' },
  { year: '2022', title: 'Hardware Integration', description: 'Expanded to support Mikrotik, TP-Link, and Unifi controllers with RADIUS servers.' },
  { year: '2023', title: 'Auto-Reconnect', description: 'Introduced intelligent reconnection technology handling power outages and mobility.' },
  { year: '2024', title: 'Network Scale', description: 'Surpassed 1,200 active hotspots and $2.4M in monthly processed revenue.' },
];

const team = [
  { name: 'Marcus Chen', role: 'CEO & Co-Founder', initials: 'MC', color: '#FF6A00' },
  { name: 'Sarah Okafor', role: 'CTO & Co-Founder', initials: 'SO', color: '#00D9FF' },
  { name: 'David Reyes', role: 'VP Engineering', initials: 'DR', color: '#22C55E' },
  { name: 'Amara Patel', role: 'VP Product', initials: 'AP', color: '#A855F7' },
  { name: 'Jonas Müller', role: 'Head of Security', initials: 'JM', color: '#E63946' },
  { name: 'Lena Ström', role: 'Head of AI/ML', initials: 'LS', color: '#F59E0B' },
];

/* ─── COMPONENTS ─── */

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── PAGE ─── */

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-home-bg text-home-text transition-colors duration-500">
      <Navigation />
      <ThreePreloader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* 3D Orbital Background */}
        <OrbitalScene
          className="absolute inset-0 opacity-25 dark:opacity-40 pointer-events-none"
          primaryColor="#FF6A00"
          secondaryColor="#00D9FF"
        />

        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF6A00]/[0.04] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#00D9FF]/[0.03] blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
              ◆ About XETIHUB
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mt-4 leading-[1.1]">
              <span className="text-stone-800 dark:text-stone-300">Built by network engineers,</span>
              <br />
              <span className="text-black dark:text-white">for hotspot operators.</span>
            </h1>
            <p className="text-home-text-muted mt-6 max-w-2xl mx-auto text-lg sm:text-xl font-light leading-relaxed">
              We&apos;re building the WiFi hotspot billing platform that every network operator 
              needs but no one has built right — until now.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-home-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-[#FF6A00]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-home-text-faint font-mono uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* 3D Particle Rise Background */}
        <SceneVisibility className="absolute inset-0" rootMargin="300% 0px">
          <ParticleRise
            className="w-full h-full opacity-12 dark:opacity-30 pointer-events-none"
            primaryColor="#FF6A00"
            secondaryColor="#00D9FF"
          />
        </SceneVisibility>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
                  ◆ Our Mission
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-home-text mt-3 mb-6">
                  Enterprise-grade hotspot management for every operator.
                </h2>
                <p className="text-home-text-muted leading-relaxed mb-4">
                  WiFi hotspot operators manage thousands of access points, handle diverse payment methods, 
                  and ensure seamless connectivity across multiple sites. Yet most still rely on 
                  fragmented systems that are slow, unreliable, and hard to scale.
                </p>
                <p className="text-home-text-muted leading-relaxed">
                  XETIHUB replaces that entire stack with a unified, intelligent platform 
                  that gives operators complete control and instant insights across their 
                  entire hotspot network.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Building2 className="w-5 h-5" />, label: 'Operators Served', value: '180+' },
                  { icon: <Cpu className="w-5 h-5" />, label: 'Access Points', value: '8.4K' },
                  { icon: <Network className="w-5 h-5" />, label: 'Daily Sessions', value: '1.2M' },
                  { icon: <Globe className="w-5 h-5" />, label: 'Cities', value: '42' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-5 rounded-xl border border-home-border bg-home-card text-center"
                  >
                    <div className="flex justify-center text-[#FF6A00] mb-2">{item.icon}</div>
                    <div className="text-xl font-bold font-mono text-home-text">{item.value}</div>
                    <div className="text-[10px] text-home-text-faint font-mono uppercase tracking-wider mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 md:py-32 border-t border-home-border overflow-hidden">
        {/* 3D Torus Field Background */}
        <SceneVisibility className="absolute inset-0" rootMargin="300% 0px">
          <TorusField
            className="w-full h-full opacity-15 dark:opacity-35 pointer-events-none"
            primaryColor="#A855F7"
            secondaryColor="#FF6A00"
          />
        </SceneVisibility>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
                ◆ Our Values
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-home-text mt-3">
                What drives every line of code.
              </h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <FadeIn key={value.title} delay={i * 0.08}>
                <div className="group p-6 rounded-xl border border-home-border bg-home-card transition-all duration-300 hover:border-[#FF6A00]/15 h-full">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${value.color}12`, color: value.color }}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold text-home-text mb-2">{value.title}</h3>
                  <p className="text-sm text-home-text-muted leading-relaxed">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative py-24 md:py-32 border-t border-home-border overflow-hidden">
        {/* 3D DNA Helix Background */}
        <SceneVisibility className="absolute inset-0" rootMargin="300% 0px">
          <DNAHelix
            className="w-full h-full opacity-12 dark:opacity-30 pointer-events-none"
            primaryColor="#00D9FF"
            secondaryColor="#FF6A00"
          />
        </SceneVisibility>

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
                ◆ Our Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-home-text mt-3">
                From first commit to global scale.
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-home-border md:-translate-x-px" />

            {timeline.map((item, i) => (
              <FadeIn key={item.year} delay={i * 0.1}>
                <div className={`relative flex items-start gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-[#FF6A00] border-2 border-home-bg -translate-x-1.5 mt-1.5 z-10" />

                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                    <span className="text-xs font-mono text-[#FF6A00] tracking-wider">{item.year}</span>
                    <h3 className="text-lg font-bold text-home-text mt-1">{item.title}</h3>
                    <p className="text-sm text-home-text-muted mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-24 md:py-32 border-t border-home-border overflow-hidden">
        {/* 3D Constellation Web Background */}
        <SceneVisibility className="absolute inset-0" rootMargin="300% 0px">
          <ConstellationWeb
            className="w-full h-full opacity-15 dark:opacity-35 pointer-events-none"
            primaryColor="#FF6A00"
            secondaryColor="#00D9FF"
          />
        </SceneVisibility>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
                ◆ Leadership
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-home-text mt-3">
                The team behind the platform.
              </h2>
              <p className="text-home-text-muted mt-4 max-w-xl mx-auto">
                Industry veterans from networking, payments, and distributed systems.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.08}>
                <div className="group p-6 rounded-xl border border-home-border bg-home-card text-center transition-all duration-300 hover:border-[#FF6A00]/15">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-lg font-bold font-mono"
                    style={{ backgroundColor: `${member.color}15`, color: member.color }}
                  >
                    {member.initials}
                  </div>
                  <h3 className="text-base font-bold text-home-text">{member.name}</h3>
                  <p className="text-xs text-home-text-muted font-mono mt-1">{member.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 border-t border-home-border overflow-hidden">
        {/* 3D Grid Background */}
        <SceneVisibility className="absolute inset-0" rootMargin="300% 0px">
          <FloatingGrid
            className="w-full h-full opacity-18 dark:opacity-35 pointer-events-none"
            color="#FF6A00"
            showCubes={false}
          />
        </SceneVisibility>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-home-text mb-4">
              Ready to master your network?
            </h2>
            <p className="text-home-text-muted text-lg mb-8 max-w-xl mx-auto">
              Join 180+ hotspot operators who trust XETIHUB to power their WiFi networks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3.5 bg-[#FF6A00] text-white font-semibold text-sm rounded-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] hover:scale-105 flex items-center gap-2"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="px-8 py-3.5 border border-home-border text-home-text font-medium text-sm rounded-sm transition-all duration-300 hover:border-[#FF6A00]/30"
              >
                Create Account
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
