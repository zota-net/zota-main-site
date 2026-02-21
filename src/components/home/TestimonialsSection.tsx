'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Quote, Star, ShieldCheck, User } from 'lucide-react';

const ParticleRise = dynamic(() => import('@/components/three/ParticleRise'), {
  ssr: false,
  loading: () => null,
});

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  verified: boolean;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 'TX-482',
    name: 'Sarah Chen',
    role: 'Chief Technology Officer',
    company: 'Nexus Global',
    content: "Transitioning our settlement registry to NetNet reduced our cross-border finality from hours to milliseconds. The high-fidelity control layer is exactly what our infrastructure team needed.",
    verified: true,
    rating: 5
  },
  {
    id: 'TX-911',
    name: 'Marcus Thorne',
    role: 'Lead Network Architect',
    company: 'SkyLink Systems',
    content: "The level of detail in the atomic transaction DNA is unprecedented. We now have 100% visibility into every packet, allowing us to proactively stop fraud before it touches the ledger.",
    verified: true,
    rating: 5
  },
  {
    id: 'TX-203',
    name: 'Elena Rodriguez',
    role: 'VP of Engineering',
    company: 'Vanguard Telco',
    content: "Most platforms are built for yesterday's scales. NetNet handles our petabyte-level voucher distributions with zero downtime and perfect data integrity. Truly a game changer.",
    verified: true,
    rating: 5
  }
];

function TestimonialCard({ item, index }: { item: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative"
    >
      <div className="relative p-8 rounded-2xl border border-home-border bg-home-card backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-[#FF6A00]/30 hover:bg-home-card">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Quote className="w-16 h-16 text-home-text" />
        </div>
        
        {/* Verification Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[#FF6A00] text-[#FF6A00]" />
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
            <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
            <span className="text-[9px] font-mono text-[#22C55E] uppercase tracking-wider">Verified Identity</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-home-text-muted text-lg leading-relaxed mb-8 italic">
          &quot;{item.content}&quot;
        </p>

        {/* Footer info */}
        <div className="flex items-center gap-4 border-t border-home-border pt-6">
          <div className="w-12 h-12 rounded-full border border-home-border bg-home-card flex items-center justify-center overflow-hidden">
             <User className="w-6 h-6 text-home-text-faint" />
          </div>
          <div>
            <h4 className="text-home-text font-bold text-sm tracking-wide uppercase">{item.name}</h4>
            <p className="text-[#FF6A00] text-[10px] font-mono tracking-widest uppercase mt-0.5">
              {item.role} @ {item.company}
            </p>
          </div>
          <div className="ml-auto text-[9px] font-mono text-home-text-faint">
            [REF_{item.id}]
          </div>
        </div>

        {/* Corner Scan Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#FF6A00]/0 to-transparent group-hover:via-[#FF6A00]/50 transition-all duration-700" />
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="testimonials" ref={containerRef} className="relative py-32 bg-home-bg overflow-hidden">
      {/* 3D Particle Background */}
      <ParticleRise
        className="absolute inset-0 opacity-25 pointer-events-none"
        primaryColor="#FF6A00"
        secondaryColor="#A855F7"
      />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-250 h-150 rounded-full bg-[#FF6A00]/2 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">Network Feedback</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-home-text mt-4 tracking-tight">
              Verified Operator Insights
            </h2>
            <div className="h-1 w-20 bg-[#FF6A00] mx-auto mt-8" />
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <TestimonialCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Stats overlay */}
        <motion.div 
          className="mt-20 flex flex-wrap justify-center gap-12 border-y border-home-border py-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-home-text font-mono">100%</div>
            <div className="text-[10px] text-home-text-faint font-mono tracking-widest uppercase mt-1">Uptime Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-home-text font-mono">4.9/5</div>
            <div className="text-[10px] text-home-text-faint font-mono tracking-widest uppercase mt-1">Ease of Management</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-home-text font-mono">98%</div>
            <div className="text-[10px] text-home-text-faint font-mono tracking-widest uppercase mt-1">Registry Accuracy</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
