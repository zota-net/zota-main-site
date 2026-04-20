'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export const MarketingNav = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="mx-auto w-full max-w-[1100px] px-[clamp(1.25rem,5vw,4rem)] h-16 flex items-center justify-between">
        <Link href="/" className="font-geist font-bold text-[1.1rem] tracking-tight text-[var(--text-primary)]">
          XetiHub<span className="text-[var(--brand-orange)]">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[0.9rem] font-medium text-[var(--text-secondary)]">
          <Link href="/#platform" className="hover:text-[var(--text-primary)] transition-colors">Platform</Link>
          <Link href="/#features" className="hover:text-[var(--text-primary)] transition-colors">Features</Link>
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">About</Link>
          <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">Contact</Link>
          <Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">Support</Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <Link
            href="/login"
            className="hidden md:inline-flex px-4 py-2 rounded-md font-medium text-[0.9rem] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-md font-medium text-[0.9rem] bg-[var(--brand-orange)] text-white shadow-sm shadow-[var(--brand-orange)]/20 hover:shadow-md hover:shadow-[var(--brand-orange)]/40 hover:bg-[#e65c00] hover:-translate-y-0.5 transition-all duration-200"
          >
            Enter Platform
          </Link>
        </div>
      </div>
    </nav>
  );
};

export const MarketingFooter = () => {
  return (
    <footer className="border-t border-[var(--border)] py-12 px-[clamp(1.25rem,5vw,4rem)] bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-[1100px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <Link href="/" className="font-geist font-bold text-[1.2rem] tracking-tight text-[var(--text-primary)] mb-2 inline-block">
            XetiHub<span className="text-[var(--brand-orange)]">.</span>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="font-geist-mono text-[0.7rem] text-[var(--text-muted)] uppercase tracking-wide">All Systems Operational</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[0.9rem] text-[var(--text-secondary)]">
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">About</Link>
          <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">Contact</Link>
          <Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">Support Center</Link>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1100px] mt-12 text-[0.8rem] text-[var(--text-muted)]">
        &copy; {new Date().getFullYear()} XetiHub. All rights reserved.
      </div>
    </footer>
  );
};
