'use client';

import React, { useEffect, useRef } from 'react';

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

export default function AboutPage() {
  const fadeRef1 = useScrollFade();
  const fadeRef2 = useScrollFade();
  const fadeRef3 = useScrollFade();

  const values = [
    { title: "Reliability First", desc: "Uptime isn't a feature; it's the foundation of internet access. If the core routing system fails, everything else is irrelevant." },
    { title: "Operator-Centric", desc: "Built by former ISPs, every interface decision minimizes clicks and abstracts away complex networking logic without losing power." },
    { title: "Radical Simplicity", desc: "No bloated menus or confusing wizards. We stripped XetiHub down to the core features ISPs actually use to bill and manage networks." }
  ];

  return (
    <>
      <section className="pt-[clamp(6rem,12vw,10rem)] pb-[clamp(4rem,8vw,6rem)] px-[clamp(1.25rem,5vw,4rem)]">
        <div ref={fadeRef1} className="animate-fade-up mx-auto max-w-[800px] text-center">
          <span className="font-geist-mono text-[0.75rem] font-medium tracking-widest uppercase text-[var(--text-muted)] mb-6 block">Our Mission</span>
          <h1 className="font-geist font-semibold text-[clamp(2.4rem,5vw,4rem)] leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] mb-8">
            Built for ISPs, Operators &amp; Entrepreneurs
          </h1>
          <p className="text-[1.2rem] text-[var(--text-secondary)] leading-relaxed">
            Internet access is a utility, but running a public network is often chaotic. We started XetiHub out of frustration with clunky legacy infrastructure, and rebuilt the ISP billing layer from first principles.
          </p>
        </div>
      </section>

      <section className="py-[clamp(4rem,6vw,8rem)] px-[clamp(1.25rem,5vw,4rem)] bg-[var(--bg-secondary)] border-y border-[var(--border)]">
        <div ref={fadeRef2} className="animate-fade-up mx-auto max-w-[1100px]">
          <h2 className="font-geist font-semibold text-[clamp(1.8rem,3vw,2.4rem)] tracking-[-0.02em] text-[var(--text-primary)] mb-12 text-center">
            Our Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-[var(--bg-primary)] p-8 rounded-xl border border-[var(--border)] flex flex-col gap-4">
                <div className="w-10 h-10 flex items-center justify-center font-geist-mono text-[0.85rem] font-semibold bg-[var(--bg-secondary)] text-[var(--accent)] rounded-lg">
                  0{i + 1}
                </div>
                <h3 className="font-medium text-[1.2rem] text-[var(--text-primary)]">{v.title}</h3>
                <p className="text-[1rem] text-[var(--text-secondary)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[clamp(4rem,8vw,10rem)] px-[clamp(1.25rem,5vw,4rem)]">
        <div ref={fadeRef3} className="animate-fade-up mx-auto max-w-[800px]">
          <h2 className="font-geist font-semibold text-[clamp(1.8rem,3vw,2.4rem)] tracking-[-0.02em] text-[var(--text-primary)] mb-12">
            The Journey
          </h2>
          <div className="border-l border-[var(--border-strong)] ml-4 pl-8 flex flex-col gap-12 relative">
            
            <div className="relative">
              <div className="absolute w-3 h-3 bg-[var(--bg-primary)] border-2 border-[var(--accent)] rounded-full -left-[38px] top-1" />
              <span className="font-geist-mono text-[0.85rem] text-[var(--text-muted)] block mb-2">2021</span>
              <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)] mb-2">The Legacy Era</h3>
              <p className="text-[1rem] text-[var(--text-secondary)]">Manual voucher printing, disconnected RADIUS servers, and broken M-Pesa scripts were keeping operators awake at 3 AM.</p>
            </div>

            <div className="relative">
              <div className="absolute w-3 h-3 bg-[var(--bg-primary)] border-2 border-[var(--accent)] rounded-full -left-[38px] top-1" />
              <span className="font-geist-mono text-[0.85rem] text-[var(--text-muted)] block mb-2">2023</span>
              <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)] mb-2">XetiHub Architecture</h3>
              <p className="text-[1rem] text-[var(--text-secondary)]">We designed a unified, API-first control layer. Beta testing begins with local ISPs running tens of thousands of active sessions.</p>
            </div>

            <div className="relative">
              <div className="absolute w-3 h-3 bg-[var(--accent)] rounded-full -left-[38px] top-1" />
              <div className="absolute w-5 h-5 bg-[var(--brand-orange)] opacity-20 rounded-full -left-[42px] top-[0]" />
              <span className="font-geist-mono text-[0.85rem] text-[var(--brand-orange)] block mb-2 font-medium">Today</span>
              <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)] mb-2">Operator-Grade Standards</h3>
              <p className="text-[1rem] text-[var(--text-secondary)]">Powering millions of authenticated sessions daily, providing seamless financial orchestration for independent network operators.</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
