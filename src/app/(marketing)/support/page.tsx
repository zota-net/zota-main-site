'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function SupportPage() {
  const fadeRef1 = useScrollFade();
  const fadeRef2 = useScrollFade();

  const categories = [
    { title: "Getting Started", desc: "Initial setup, platform navigation, and foundational concepts.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { title: "Router Configuration", desc: "Connecting MikroTik hardware, secure API bridges, and RADIUS.", icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
    { title: "Billing & Payments", desc: "Subscription packages, pricing tiers, and revenue analytics.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Mobile Money Integration", desc: "M-Pesa, MTN Mobile Money setup and webhooks troubleshooting.", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { title: "Voucher Codes", desc: "Batch generation, PDF exports, layout configuration, and limits.", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { title: "API & Developers", desc: "REST endpoints, authentication, and webhooks documentation.", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  ];

  return (
    <>
      <section className="pt-[clamp(6rem,12vw,10rem)] pb-[clamp(3rem,6vw,5rem)] px-[clamp(1.25rem,5vw,4rem)]">
        <div ref={fadeRef1} className="animate-fade-up mx-auto max-w-[800px] text-center">
          <h1 className="font-geist font-semibold text-[clamp(2.4rem,5vw,4rem)] leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] mb-8">
            Support Center
          </h1>
          
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search for help..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-12 py-4 text-[1.1rem] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-orange)] focus:bg-[var(--bg-primary)] transition-colors shadow-sm"
            />
          </div>
        </div>
      </section>

      <section className="py-[clamp(3rem,6vw,5rem)] px-[clamp(1.25rem,5vw,4rem)]">
        <div ref={fadeRef2} className="animate-fade-up mx-auto max-w-[1100px]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c, i) => (
              <Link key={i} href="#" className="group bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-sm transition-all flex flex-col gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-secondary)] rounded-md text-[var(--text-primary)] group-hover:text-[var(--accent)] group-hover:bg-[rgba(26,106,245,0.1)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={c.icon}></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)] mb-2">{c.title}</h3>
                  <p className="text-[0.95rem] text-[var(--text-secondary)] mb-4">{c.desc}</p>
                  <span className="text-[0.9rem] text-[var(--accent)] font-medium inline-flex items-center">
                    View articles <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[clamp(3rem,6vw,8rem)] px-[clamp(1.25rem,5vw,4rem)]">
        <div className="mx-auto max-w-[1100px] text-center bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-10">
          <h2 className="font-medium text-[1.2rem] text-[var(--text-primary)] mb-2">Need urgent help?</h2>
          <p className="text-[1rem] text-[var(--text-secondary)] mb-4">Our engineering support team is available via direct chat or email.</p>
          <a href="mailto:support@xetihub.com" className="text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors">
            support@xetihub.com
          </a>
        </div>
      </section>
    </>
  );
}