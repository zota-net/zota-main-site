'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#signal-flow' },
  { label: 'Platform', href: '#platform' },
  { label: 'Technology', href: '#tech' },
  { label: 'About', href: '/about' },
  { label: 'Support', href: '/support' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 60);
  });

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] transition-colors duration-500"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 4.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div
          className={`transition-all duration-500 ${
            isScrolled
              ? 'bg-home-bg/80 backdrop-blur-xl border-b border-home-border'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="relative w-7 h-7">
                  <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
                    <rect
                      x="2"
                      y="2"
                      width="24" height="24"
                      rx="3"
                      stroke="#FF6A00"
                      strokeWidth="1.5"
                      className="transition-all duration-300 group-hover:stroke-[#FF8533]"
                    />
                    <circle cx="14" cy="14" r="3" fill="#FF6A00" className="transition-all duration-300 group-hover:fill-[#FF8533]" />
                    <line x1="14" y1="5" x2="14" y2="11" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                    <line x1="14" y1="17" x2="14" y2="23" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                    <line x1="5" y1="14" x2="11" y2="14" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                    <line x1="17" y1="14" x2="23" y2="14" stroke="#FF6A00" strokeWidth="1" opacity="0.5" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-home-text tracking-tight">
                  Xeti<span className="text-[#FF6A00]">Hub</span>
                </span>
              </a>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className="relative px-4 py-2 text-sm text-home-text-muted font-medium tracking-wide transition-colors duration-300 hover:text-home-text group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#FF6A00] transition-all duration-300 group-hover:w-full" />
                  </button>
                ))}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-3">
                <a
                  href="/contact"
                  className="px-5 py-2 text-sm font-medium text-home-text-muted border border-home-border rounded-sm transition-all duration-300 hover:border-[#FF6A00]/30 hover:text-home-text"
                >
                  Contact
                </a>
                <motion.a
                  href="/dashboard"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#FF6A00] rounded-sm transition-all duration-300"
                  whileHover={{
                    boxShadow: '0 0 20px rgba(255,106,0,0.3)',
                  }}
                >
                  Enter Platform
                </motion.a>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-home-text-muted hover:text-home-text transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[99] bg-home-bg/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-2xl text-home-text-muted font-medium tracking-wide hover:text-home-text transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {link.label}
              </motion.button>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <a
                href="/contact"
                className="px-8 py-3 text-base text-home-text-muted border border-home-border rounded-sm"
              >
                Contact
              </a>
              <a
                href="/dashboard"
                className="px-8 py-3 text-base font-semibold text-white bg-[#FF6A00] rounded-sm text-center"
              >
                Enter Platform
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
