'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Mail, Phone, MapPin, Send, ArrowRight,
  Globe, Clock, MessageSquare, Building2,
} from 'lucide-react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';

const DNAHelix = dynamic(() => import('@/components/three/DNAHelix'), {
  ssr: false,
  loading: () => null,
});
const ParticleRise = dynamic(() => import('@/components/three/ParticleRise'), {
  ssr: false,
  loading: () => null,
});
const ConstellationWeb = dynamic(() => import('@/components/three/ConstellationWeb'), {
  ssr: false,
  loading: () => null,
});
const TorusField = dynamic(() => import('@/components/three/TorusField'), {
  ssr: false,
  loading: () => null,
});
const FloatingGrid = dynamic(() => import('@/components/three/FloatingGrid'), {
  ssr: false,
  loading: () => null,
});

/* ─── DATA ─── */

const offices = [
  {
    city: 'San Francisco',
    address: '500 Howard Street, Suite 400',
    region: 'Americas HQ',
    timezone: 'PST (UTC-8)',
    color: '#FF6A00',
  },
  {
    city: 'London',
    address: '30 St Mary Axe, Level 12',
    region: 'EMEA HQ',
    timezone: 'GMT (UTC+0)',
    color: '#00D9FF',
  },
  {
    city: 'Singapore',
    address: '1 Raffles Place, Tower 2',
    region: 'APAC HQ',
    timezone: 'SGT (UTC+8)',
    color: '#22C55E',
  },
];

const contactMethods = [
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email',
    value: 'hello@XETIHUB.io',
    href: 'mailto:hello@XETIHUB.io',
    color: '#FF6A00',
  },
  {
    icon: <Phone className="w-5 h-5" />,
    label: 'Phone',
    value: '+1 (888) 638-6380',
    href: 'tel:+18886386380',
    color: '#00D9FF',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Live Chat',
    value: 'Available 24/7',
    href: '#',
    color: '#22C55E',
  },
];

/* ─── HELPERS ─── */

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

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder submit
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-home-bg text-home-text transition-colors duration-500">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        {/* 3D DNA Helix Background */}
        <DNAHelix
          className="absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none"
          primaryColor="#FF6A00"
          secondaryColor="#00D9FF"
        />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-[#FF6A00]/[0.04] blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
              ◆ Contact Us
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-[1.1]">
              <span className="text-stone-800 dark:text-stone-300">Let&apos;s build</span>
              <br />
              <span className="text-black dark:text-white">something together.</span>
            </h1>
            <p className="text-home-text-muted mt-6 max-w-xl mx-auto text-lg font-light">
              Whether you&apos;re an operator looking to modernize or a partner exploring integration — we&apos;re here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative border-y border-home-border overflow-hidden">
        {/* 3D Constellation Web Background */}
        <ConstellationWeb
          className="absolute inset-0 opacity-12 dark:opacity-30 pointer-events-none"
          primaryColor="#00D9FF"
          secondaryColor="#22C55E"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-3 gap-6">
            {contactMethods.map((method, i) => (
              <FadeIn key={method.label} delay={i * 0.1}>
                <a
                  href={method.href}
                  className="group flex items-center gap-4 p-5 rounded-xl border border-home-border bg-home-card transition-all duration-300 hover:border-[#FF6A00]/15"
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${method.color}12`, color: method.color }}
                  >
                    {method.icon}
                  </div>
                  <div>
                    <div className="text-xs text-home-text-faint font-mono uppercase tracking-wider">
                      {method.label}
                    </div>
                    <div className="text-sm font-semibold text-home-text mt-0.5">{method.value}</div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Offices */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* 3D Particle Rise Background */}
        <ParticleRise
          className="absolute inset-0 opacity-12 dark:opacity-28 pointer-events-none"
          primaryColor="#FF6A00"
          secondaryColor="#22C55E"
        />
        {/* 3D Torus Field Background (layered) */}
        <TorusField
          className="absolute inset-0 opacity-8 dark:opacity-22 pointer-events-none"
          primaryColor="#00D9FF"
          secondaryColor="#A855F7"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn>
                <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
                  ◆ Send a Message
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-home-text mt-3 mb-8">
                  Tell us about your needs.
                </h2>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-6 h-6 text-[#22C55E]" />
                    </div>
                    <h3 className="text-xl font-bold text-home-text mb-2">Message sent!</h3>
                    <p className="text-home-text-muted text-sm">
                      Our team will get back to you within 24 hours. Check your inbox.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-mono text-home-text-faint uppercase tracking-wider mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formState.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-home-border bg-home-card text-home-text text-sm placeholder:text-home-text-faint focus:outline-none focus:border-[#FF6A00]/40 transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-home-text-faint uppercase tracking-wider mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formState.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-home-border bg-home-card text-home-text text-sm placeholder:text-home-text-faint focus:outline-none focus:border-[#FF6A00]/40 transition-colors"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-mono text-home-text-faint uppercase tracking-wider mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formState.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-home-border bg-home-card text-home-text text-sm placeholder:text-home-text-faint focus:outline-none focus:border-[#FF6A00]/40 transition-colors"
                          placeholder="Acme Telecom"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-home-text-faint uppercase tracking-wider mb-2">
                          Subject *
                        </label>
                        <select
                          name="subject"
                          required
                          value={formState.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-home-border bg-home-card text-home-text text-sm focus:outline-none focus:border-[#FF6A00]/40 transition-colors"
                        >
                          <option value="">Select a topic...</option>
                          <option value="demo">Request a Demo</option>
                          <option value="sales">Sales Inquiry</option>
                          <option value="partnership">Partnership</option>
                          <option value="support">Technical Support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-home-text-faint uppercase tracking-wider mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formState.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-home-border bg-home-card text-home-text text-sm placeholder:text-home-text-faint focus:outline-none focus:border-[#FF6A00]/40 transition-colors resize-none"
                        placeholder="Tell us about your project and how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="group px-8 py-3.5 bg-[#FF6A00] text-white font-semibold text-sm rounded-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] hover:scale-105 flex items-center gap-2"
                    >
                      Send Message
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>
                )}
              </FadeIn>
            </div>

            {/* Offices */}
            <div className="lg:col-span-2">
              <FadeIn delay={0.2}>
                <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">
                  ◆ Our Offices
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-home-text mt-3 mb-8">
                  Global presence.
                </h2>
                <div className="space-y-5">
                  {offices.map((office) => (
                    <div
                      key={office.city}
                      className="p-5 rounded-xl border border-home-border bg-home-card"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: office.color }}
                        />
                        <span className="text-xs font-mono text-home-text-faint uppercase tracking-wider">
                          {office.region}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-home-text mb-1">{office.city}</h3>
                      <div className="flex items-start gap-2 text-sm text-home-text-muted mb-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-home-text-faint" />
                        {office.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-home-text-faint">
                        <Clock className="w-4 h-4" />
                        {office.timezone}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra info */}
                <div className="mt-8 p-5 rounded-xl border border-[#FF6A00]/10 bg-[#FF6A00]/[0.03]">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-[#FF6A00]" />
                    <span className="text-sm font-bold text-home-text">Enterprise inquiries</span>
                  </div>
                  <p className="text-sm text-home-text-muted leading-relaxed mb-3">
                    For deployments serving 10M+ devices, our enterprise team provides 
                    dedicated onboarding and SLA guarantees.
                  </p>
                  <a
                    href="mailto:enterprise@XETIHUB.io"
                    className="text-sm font-medium text-[#FF6A00] hover:underline flex items-center gap-1"
                  >
                    enterprise@XETIHUB.io
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 border-t border-home-border overflow-hidden">
        {/* 3D Floating Grid Background */}
        <FloatingGrid
          className="absolute inset-0 opacity-15 dark:opacity-30 pointer-events-none"
          color="#FF6A00"
          showCubes={false}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-home-text mb-4">
              Prefer a live walkthrough?
            </h2>
            <p className="text-home-text-muted text-lg mb-8 max-w-xl mx-auto">
              Schedule a 30-minute demo with our solutions team and see the platform in action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3.5 bg-[#FF6A00] text-white font-semibold text-sm rounded-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] hover:scale-105 flex items-center gap-2"
              >
                Book a Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+18886386380"
                className="px-8 py-3.5 border border-home-border text-home-text font-medium text-sm rounded-sm transition-all duration-300 hover:border-[#FF6A00]/30"
              >
                Call Us Directly
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
