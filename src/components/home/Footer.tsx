'use client';

import { motion } from 'framer-motion';

const FOOTER_LINKS = {
  Platform: ['Network Monitor', 'Traffic Analytics', 'Signal Control', 'Threat Detection', 'API Gateway'],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '#' },
  ],
  Resources: ['Documentation', 'Case Studies', 'Whitepapers', 'Webinars', 'Status'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Security', 'Compliance', 'Cookie Policy'],
};

const SOCIAL_LINKS = [
  { label: 'LinkedIn', icon: 'LI' },
  { label: 'Twitter', icon: 'X' },
  { label: 'GitHub', icon: 'GH' },
];

export default function Footer() {
  return (
    <footer className="relative bg-home-bg border-t border-home-border">
      {/* Top bar accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6A00]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <a href="#" className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6">
                  <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
                    <rect x="2" y="2" width="24" height="24" rx="3" stroke="#FF6A00" strokeWidth="1.5" />
                    <circle cx="14" cy="14" r="3" fill="#FF6A00" />
                    <line x1="14" y1="5" x2="14" y2="11" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                    <line x1="14" y1="17" x2="14" y2="23" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                    <line x1="5" y1="14" x2="11" y2="14" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                    <line x1="17" y1="14" x2="23" y2="14" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-home-text tracking-tight">
                  Net<span className="text-[#FF6A00]">Net</span>
                </span>
              </a>
              <p className="text-sm text-home-text-faint leading-relaxed mb-6 max-w-[200px]">
                The telecom control platform built for operators who demand absolute command.
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-8 h-8 flex items-center justify-center rounded border border-home-border bg-home-card text-[10px] font-mono text-home-text-faint transition-all duration-300 hover:border-[#FF6A00]/20 hover:text-[#FF6A00]/60"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-mono text-home-text-faint tracking-[0.15em] uppercase mb-4">
                  {category}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => {
                    const label = typeof link === 'string' ? link : link.label;
                    const href = typeof link === 'string' ? '#' : link.href;
                    return (
                      <li key={label}>
                        <a
                          href={href}
                          className="text-sm text-home-text-faint transition-colors duration-300 hover:text-home-text-muted"
                        >
                          {label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-home-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-home-text-faint font-mono">
            <span>© {new Date().getFullYear()} NetNet</span>
            <span className="w-1 h-1 rounded-full bg-home-border" />
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs text-home-text-faint font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
