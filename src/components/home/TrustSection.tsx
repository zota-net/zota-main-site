'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ArrowRight, ArrowUpRight, X, TrendingDown, Clock, CheckCircle } from 'lucide-react';

const DNAHelix = dynamic(() => import('@/components/three/DNAHelix'), {
  ssr: false,
  loading: () => null,
});

interface CaseStudy {
  company: string;
  industry: string;
  logo: string;
  challenge: string;
  solution: string;
  results: { metric: string; value: string }[];
}

const logos = [
  { name: 'Vodafone', abbr: 'VF', color: '#E60000' },
  { name: 'Deutsche Telekom', abbr: 'DT', color: '#E20074' },
  { name: 'AT&T', abbr: 'AT', color: '#009FDB' },
  { name: 'NTT', abbr: 'NT', color: '#FF6600' },
  { name: 'Orange', abbr: 'OR', color: '#FF7900' },
  { name: 'Telefonica', abbr: 'TF', color: '#0066FF' },
  { name: 'Singtel', abbr: 'ST', color: '#EE0000' },
  { name: 'Telstra', abbr: 'TS', color: '#001E82' },
];

const caseStudies: CaseStudy[] = [
  {
    company: 'European Tier-1 Operator',
    industry: 'Telecommunications',
    logo: 'EU',
    challenge: 'Managing 120M+ endpoints across 12 countries with legacy NMS tools causing 4-hour MTTR and frequent blind spots in rural coverage areas.',
    solution: 'Deployed XETIHUB control layer with AI-driven anomaly detection and autonomous remediation across all regions with zero downtime migration.',
    results: [
      { metric: 'MTTR Reduction', value: '47%' },
      { metric: 'Blind Spot Elimination', value: '99.8%' },
      { metric: 'Cost Savings / Year', value: '$12M' },
    ],
  },
  {
    company: 'Asia-Pacific Data Center Group',
    industry: 'Cloud Infrastructure',
    logo: 'AP',
    challenge: 'Scaling from 3 to 14 data centers in 18 months while maintaining sub-millisecond latency SLAs for financial services clients.',
    solution: 'XETIHUB edge intelligence layer with predictive capacity planning and automated traffic engineering across all PoPs.',
    results: [
      { metric: 'Scale Increase', value: '467%' },
      { metric: 'SLA Compliance', value: '99.999%' },
      { metric: 'Provisioning Time', value: '-89%' },
    ],
  },
];

// Logo component
function LogoNode({ logo, index }: { logo: typeof logos[0]; index: number }) {
  return (
    <motion.div
      className="group relative flex items-center justify-center cursor-pointer"
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, type: 'spring' }}
      whileHover={{ scale: 1.1, y: -5 }}
    >
      <div 
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-home-border bg-home-card flex items-center justify-center transition-all duration-300 group-hover:border-[#FF6A00]/20 group-hover:bg-[#FF6A00]/5"
      >
        <span 
          className="text-xl sm:text-2xl font-bold font-mono opacity-40 group-hover:opacity-80 transition-opacity"
          style={{ color: logo.color }}
        >
          {logo.abbr}
        </span>
      </div>
      
      {/* Name tooltip */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        <span className="text-[10px] text-home-text-muted font-mono">{logo.name}</span>
      </div>
    </motion.div>
  );
}

// Case study modal
function CaseStudyCard({ study, isOpen, onClose }: {
  study: CaseStudy;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <motion.div
        className="relative w-full max-w-2xl rounded-xl border border-home-border bg-home-bg p-8 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <button 
          className="absolute top-4 right-4 text-home-text-faint hover:text-home-text transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center">
            <span className="text-lg font-bold font-mono text-[#FF6A00]">{study.logo}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-home-text">{study.company}</h3>
            <span className="text-xs text-home-text-muted font-mono tracking-wide">{study.industry}</span>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Challenge</span>
            </div>
            <p className="text-sm text-home-text-muted leading-relaxed">{study.challenge}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Solution</span>
            </div>
            <p className="text-sm text-home-text-muted leading-relaxed">{study.solution}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wide">Results</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {study.results.map((result) => (
                <div key={result.metric} className="p-3 rounded-lg border border-home-border bg-home-card text-center">
                  <div className="text-2xl font-bold font-mono text-[#FF6A00]">{result.value}</div>
                  <div className="text-[10px] text-home-text-muted mt-1">{result.metric}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="w-full mt-6 py-3 rounded-lg border border-[#FF6A00]/30 text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00]/10 transition-colors flex items-center justify-center gap-2">
          Read Full Case Study
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function TrustSection() {
  const [selectedStudy, setSelectedStudy] = useState<number | null>(null);

  return (
    <section id="trust" className="relative py-24 md:py-32 bg-home-bg overflow-hidden">
      {/* 3D DNA Helix Background */}
      <DNAHelix
        className="absolute inset-0 opacity-20 pointer-events-none"
        primaryColor="#00D9FF"
        secondaryColor="#A855F7"
      />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full bg-[#FF6A00]/[0.02] blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">Trusted</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-home-text mt-4">
            Powering Millions of Connections Daily
          </h2>
          <p className="text-home-text-muted mt-4 max-w-2xl mx-auto text-lg">
            Deployed by operators across 47 regions, managing infrastructure at unprecedented scale.
          </p>
        </motion.div>

        {/* Logo Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-20">
          {logos.map((logo, i) => (
            <LogoNode key={logo.name} logo={logo} index={i} />
          ))}
        </div>

        {/* Case Studies */}
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies.map((study, i) => (
            <motion.div
              key={study.company}
              className="group p-6 rounded-xl border border-home-border bg-home-card cursor-pointer transition-all duration-300 hover:border-[#FF6A00]/20 hover:bg-[#FF6A00]/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              onClick={() => setSelectedStudy(i)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center">
                  <span className="text-sm font-bold font-mono text-[#FF6A00]">{study.logo}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-home-text">{study.company}</h3>
                  <span className="text-[10px] text-home-text-faint font-mono">{study.industry}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-home-text-faint ml-auto group-hover:text-[#FF6A00] transition-colors" />
              </div>

              <p className="text-sm text-home-text-muted leading-relaxed mb-4 line-clamp-2">{study.challenge}</p>

              <div className="flex gap-3">
                {study.results.map((r) => (
                  <div key={r.metric} className="text-center">
                    <div className="text-lg font-bold font-mono text-[#FF6A00]">{r.value}</div>
                    <div className="text-[8px] text-home-text-faint tracking-wide">{r.metric}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      {selectedStudy !== null && (
        <CaseStudyCard
          study={caseStudies[selectedStudy]}
          isOpen={true}
          onClose={() => setSelectedStudy(null)}
        />
      )}
    </section>
  );
}
