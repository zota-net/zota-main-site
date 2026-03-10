'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { 
  Router, Server, Smartphone, Ticket, MapPin, 
  ArrowRight, Sparkles, Wifi, Zap, Users
} from 'lucide-react';

const FloatingGrid = dynamic(() => import('@/components/three/FloatingGrid'), {
  ssr: false,
  loading: () => null,
});

interface TechCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
  color: string;
}

const techCards: TechCard[] = [
  {
    icon: <Router className="w-6 h-6" />,
    title: 'Hardware Integration',
    description: 'Seamless support for Mikrotik, TP-Link Omada, Unifi, and Ruijie controllers',
    detail: 'Native integration with leading WiFi hardware platforms. Automatic device discovery, configuration management, and real-time monitoring across all supported systems.',
    color: '#FF6A00',
  },
  {
    icon: <Server className="w-6 h-6" />,
    title: 'RADIUS Server Support',
    description: 'Full RADIUS protocol implementation for enterprise authentication',
    detail: 'Complete RADIUS server integration with support for EAP, PAP, CHAP, and MS-CHAPv2. Centralized user management and policy enforcement across multiple sites.',
    color: '#00D9FF',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Mobile Money Integration',
    description: 'Direct payment processing through mobile money platforms',
    detail: 'Integrated payment gateways for mobile money services. Real-time transaction processing, automatic reconciliation, and multi-currency support.',
    color: '#22C55E',
  },
  {
    icon: <Ticket className="w-6 h-6" />,
    title: 'Voucher Management',
    description: 'Advanced voucher generation, distribution, and redemption system',
    detail: 'Bulk voucher creation with customizable expiration, usage limits, and pricing tiers. QR code generation, email/SMS distribution, and detailed usage analytics.',
    color: '#E63946',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Multi-Site Management',
    description: 'Centralized control over multiple hotspot locations and devices',
    detail: 'Unified dashboard for managing hundreds of sites and thousands of devices. Hierarchical organization, role-based access, and automated reporting.',
    color: '#A855F7',
  },
];

// Single tech card component
function TechCardComponent({ card, index }: { card: TechCard; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="group relative tech-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <motion.div
        className="relative p-6 rounded-xl border border-home-border bg-home-card cursor-pointer overflow-hidden transition-all duration-500 h-full flex flex-col"
        whileHover={{ 
          borderColor: `${card.color}30`,
          scale: 1.02,
          y: -5,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        layout
      >
        {/* Background glow on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ 
            background: `radial-gradient(ellipse at center, ${card.color}08 0%, transparent 70%)`
          }}
        />

        {/* Icon */}
        <div 
          className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
          style={{ 
            backgroundColor: `${card.color}12`,
            color: card.color,
            boxShadow: `0 0 0px ${card.color}00`,
          }}
        >
          {card.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-home-text mb-2">{card.title}</h3>
        
        {/* Description */}
        <p className="text-sm text-home-text-muted leading-relaxed mb-3 flex-1">{card.description}</p>

        {/* Expanded detail */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <p className="text-xs text-home-text-faint leading-relaxed pt-3 border-t border-home-border">
            {card.detail}
          </p>
        </motion.div>

        {/* Learn more */}
        <div className="flex items-center gap-1 mt-4 text-xs font-medium transition-all duration-300" style={{ color: card.color }}>
          <span>{isExpanded ? 'Less' : 'Learn more'}</span>
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
            <ArrowRight className="w-3 h-3" />
          </motion.div>
        </div>

        {/* Corner accent */}
        <div 
          className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${card.color}15, transparent 70%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function TechStackSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      // Parallax effect for cards - cards move up/down at different speeds
      const cards = gsap.utils.toArray<HTMLElement>('.tech-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 50 * (i % 3 + 1) },
          {
            y: -50 * (i % 3 + 1),
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      });

      // Rotating core animation on scroll
      if (coreRef.current) {
        gsap.to(coreRef.current, {
          rotate: 360,
          scale: 1.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="technology" 
      ref={containerRef}
      className="relative py-32 md:py-48 bg-home-bg overflow-hidden"
    >
      {/* 3D Background */}
      <FloatingGrid
        className="absolute inset-0 opacity-40 pointer-events-none"
        color="#FF6A00"
        showCubes
      />

      {/* Background glow flow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF6A00]/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#00D9FF]/[0.03] blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">The Tech Architecture</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-home-text mt-4 max-w-4xl mx-auto leading-[1.1]">
              Built for Seamless WiFi Management
            </h2>
            <p className="text-xl text-home-text-muted mt-6 max-w-2xl mx-auto font-light">
              Hardware integration, RADIUS support, and intelligent reconnection at enterprise scale.
            </p>
          </motion.div>
        </div>

        {/* Central Core + Cards */}
        <div className="relative">
          {/* Central glowing core with scroll rotation */}
          <div
            ref={coreRef}
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          >
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#FF6A00]/10 flex items-center justify-center backdrop-blur-3xl border border-home-border">
                <Sparkles className="w-10 h-10 text-[#FF6A00]" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#FF6A00]/20"
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Cards Grid with mixed parallax timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-20">
            {techCards.map((card, index) => (
              <TechCardComponent key={card.title} card={card} index={index} />
            ))}
            
            {/* Extra CTA card as part of the flow */}
            <motion.div
              className="relative p-8 rounded-xl border border-dashed border-[#FF6A00]/20 bg-[#FF6A00]/[0.02] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/[0.05] tech-card min-h-[250px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="w-14 h-14 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-6">
                <ArrowRight className="w-6 h-6 text-[#FF6A00]" />
              </div>
              <h3 className="text-xl font-bold text-home-text mb-2">View Technical Docs</h3>
              <p className="text-sm text-home-text-muted max-w-[200px]">Full API architecture and gRPC specifications</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

