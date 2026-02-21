'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLiveValue } from '@/lib/engine/hooks';
import { formatMetric } from '@/lib/engine/hooks';
import { 
  Activity, BarChart3, Globe, Shield, Terminal,
  Wifi, Server, Cpu, Database, Lock, ArrowUpRight, Zap
} from 'lucide-react';

// Dashboard panel component
function DashboardPanel({ 
  title, children, className, color = '#FF6A00'
}: { 
  title: string; 
  children: React.ReactNode; 
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-home-border bg-home-card backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-[#FF6A00]/20 hover:scale-[1.02] ${className}`}
    >
      <div className="px-3 py-2 border-b border-home-border flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] font-mono text-home-text-faint tracking-wider uppercase">{title}</span>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}

// Mini area chart
function MiniChart({ color = '#FF6A00', data }: { color?: string; data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 200;
  const height = 50;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 mt-2">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Live metric display
function LiveMetric({ label, baseValue, suffix, color = '#FF6A00', variance = 0.05 }: {
  label: string;
  baseValue: number;
  suffix: string;
  color?: string;
  variance?: number;
}) {
  const value = useLiveValue(baseValue, variance, 150);
  
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] text-home-text-muted">{label}</span>
      <span className="text-sm font-mono font-semibold tabular-nums" style={{ color }}>
        {typeof baseValue === 'number' && baseValue < 100 
          ? value.toFixed(1) 
          : formatMetric(value, 1)
        }{suffix}
      </span>
    </div>
  );
}

// Network map visualization
function NetworkMap() {
  const nodes = [
    { x: 20, y: 30, label: 'EU-WEST', active: true },
    { x: 55, y: 25, label: 'EU-CENTRAL', active: true },
    { x: 80, y: 35, label: 'AP-EAST', active: true },
    { x: 35, y: 60, label: 'US-EAST', active: true },
    { x: 65, y: 55, label: 'AP-SOUTH', active: false },
    { x: 45, y: 80, label: 'SA-EAST', active: true },
  ];

  const connections = [
    [0, 1], [1, 2], [0, 3], [1, 4], [3, 5], [2, 4],
  ];

  return (
    <div className="relative w-full h-32">
      <svg className="absolute inset-0 w-full h-full">
        {connections.map(([a, b], i) => (
          <line
            key={i}
            x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`}
            x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke="#FF6A00" strokeWidth="0.5" strokeOpacity="0.3"
            strokeDasharray="4 4"
          >
            <animate attributeName="stroke-dashoffset" values="0;-8" dur="2s" repeatCount="indefinite" />
          </line>
        ))}
      </svg>
      
      {nodes.map((node, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className={`w-3 h-3 rounded-full border ${node.active ? 'border-[#FF6A00] bg-[#FF6A00]/30' : 'border-home-border bg-home-card'}`}>
            {node.active && (
              <div className="w-full h-full rounded-full animate-ping bg-[#FF6A00]/40" />
            )}
          </div>
          <span className="text-[7px] font-mono text-home-text-faint mt-1">{node.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function PlatformPreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Generate fake chart data
  const chartData1 = Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i * 0.5) * 20 + Math.random() * 10);
  const chartData2 = Array.from({ length: 20 }, (_, i) => 30 + Math.cos(i * 0.3) * 15 + Math.random() * 8);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Header fade in
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: headerRef.current, start: 'top 85%', toggleActions: 'play none none none' } }
        );
      }

      // Card parallax
      if (cardRef.current) {
        gsap.fromTo(cardRef.current, 
          { y: 60, rotateX: 4 },
          { y: -60, rotateX: -2, ease: 'none', scrollTrigger: { trigger: containerRef.current, start: 'top bottom', end: 'bottom top', scrub: true } }
        );
      }

      // Stats fade in
      if (statsRef.current) {
        gsap.fromTo(statsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, scrollTrigger: { trigger: statsRef.current, start: 'top 90%', toggleActions: 'play none none none' } }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="platform" className="relative py-24 md:py-32 bg-home-bg overflow-hidden" ref={containerRef}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 rounded-full bg-[#FF6A00]/2 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-16"
          style={{ opacity: 0 }}
        >
          <span className="text-xs font-mono tracking-[0.4em] text-[#FF6A00]/80 uppercase">The Platform</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-home-text mt-4">
            Unified Transaction Lifecycle
          </h2>
          <p className="text-home-text-muted mt-4 max-w-2xl mx-auto text-lg">
            Monitor revenue, voucher distributions, and network status from a single high-fidelity interface.
          </p>
        </div>

        {/* Dashboard Preview - Floating card with perspective */}
        <div
          ref={cardRef}
          className="relative"
          style={{ perspective: 1200 }}
        >
          <div className="relative rounded-xl border border-home-border bg-home-card backdrop-blur-xl p-4 md:p-6 shadow-2xl shadow-black/10 dark:shadow-black/50">
            {/* Dashboard Header Bar */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-home-border">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs font-mono text-home-text-faint">netnet://control-center</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </span>
                <span className="text-[10px] font-mono text-home-text-faint">v4.2.1</span>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Network Map Panel */}
              <DashboardPanel title="SYSTEM REGISTRY" className="md:col-span-2">
                <NetworkMap />
              </DashboardPanel>

              {/* System Status */}
              <DashboardPanel title="SYSTEM STATUS">
                <div className="space-y-3">
                  <LiveMetric label="Payment Success" baseValue={99.8} suffix="%" color="#22C55E" variance={0.05} />
                  <LiveMetric label="Active Vouchers" baseValue={14.2} suffix="M" color="#00D9FF" variance={0.01} />
                  <LiveMetric label="Revenue Velocity" baseValue={842} suffix="k/hr" color="#FF6A00" />
                  <LiveMetric label="Settlement Delay" baseValue={0.4} suffix="s" color="#22C55E" variance={0.1} />
                </div>
              </DashboardPanel>

              {/* Traffic Chart */}
              <DashboardPanel title="VOUCHER VELOCITY">
                <div className="text-xs text-home-text-faint mb-1">Activations / Minute</div>
                <div className="text-lg font-mono font-bold text-[#FF6A00]">8.4k</div>
                <MiniChart color="#FF6A00" data={chartData1} />
              </DashboardPanel>

              {/* Alert Console */}
              <DashboardPanel title="TRANSACTION ENGINE">
                <div className="space-y-2">
                  {[
                    { level: 'SECURE', msg: 'Batch #8821 Settled', color: '#22C55E', time: '2s ago' },
                    { level: 'RETRY', msg: 'Auth delay: Provider XP', color: '#F59E0B', time: '14s ago' },
                    { level: 'GEN', msg: '100k Bulk Export OK', color: '#00D9FF', time: '1m ago' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-1 rounded text-[8px] font-bold" style={{ backgroundColor: `${alert.color}20`, color: alert.color }}>
                        {alert.level}
                      </span>
                      <span className="text-home-text-muted flex-1 truncate">{alert.msg}</span>
                      <span className="text-home-text-faint">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </DashboardPanel>

              {/* Throughput */}
              <DashboardPanel title="FINANCIAL THROUGHPUT">
                <div className="text-xs text-home-text-faint mb-1">Volume (24h)</div>
                <div className="text-lg font-mono font-bold text-[#00D9FF]">$1.42M</div>
                <MiniChart color="#00D9FF" data={chartData2} />
              </DashboardPanel>
            </div>
          </div>

          {/* Reflection / shadow */}
          <div className="absolute -bottom-8 left-4 right-4 h-16 bg-gradient-to-b from-[#FF6A00]/5 to-transparent blur-2xl rounded-full" />
        </div>

        {/* Bottom stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          style={{ opacity: 0 }}
        >
          {[
            { label: 'Transaction Latency', value: '< 200ms', icon: <Zap className="w-4 h-4" /> },
            { label: 'Financial Security', value: 'Bank-Grade', icon: <Shield className="w-4 h-4" /> },
            { label: 'Monthly Vouchers', value: '45M+', icon: <Cpu className="w-4 h-4" /> },
            { label: 'Data Integrity', value: '99.999%', icon: <Database className="w-4 h-4" /> },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-lg border border-home-border bg-home-card">
              <div className="flex justify-center text-[#FF6A00] mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-home-text font-mono">{stat.value}</div>
              <div className="text-xs text-home-text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
