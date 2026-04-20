'use client';

import React, { useRef, useEffect } from 'react';

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

export default function ContactPage() {
  const fadeRef = useScrollFade();

  return (
    <section className="pt-[clamp(6rem,12vw,10rem)] pb-[clamp(4rem,8vw,10rem)] px-[clamp(1.25rem,5vw,4rem)]">
      <div ref={fadeRef} className="animate-fade-up mx-auto max-w-[1100px]">
        
        <div className="mb-16">
          <h1 className="font-geist font-semibold text-[clamp(2.4rem,5vw,4rem)] leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] mb-4">
            Get in Touch
          </h1>
          <p className="text-[1.2rem] text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Whether you are evaluating XetiHub for a new deployment or need engineering assistance, our team is ready to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-24">
          
          {/* Contact Info Left Pane */}
          <div className="flex flex-col gap-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)]">Email</h3>
              </div>
              <p className="text-[1rem] text-[var(--text-secondary)]">support@xetihub.com</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)]">Support Hours</h3>
              </div>
              <p className="text-[1rem] text-[var(--text-secondary)]">Monday – Friday</p>
              <p className="text-[1rem] text-[var(--text-secondary)]">9:00 AM – 6:00 PM (EAT)</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <h3 className="font-medium text-[1.1rem] text-[var(--text-primary)]">Response Time</h3>
              </div>
              <p className="text-[1rem] text-[var(--text-secondary)]">We aim to respond to all inquiries within 24 hours.</p>
            </div>
          </div>

          {/* Contact Form Right Pane */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 md:p-10">
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[0.85rem] text-[var(--text-primary)]">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-md px-4 py-2.5 text-[1rem] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[0.85rem] text-[var(--text-primary)]">Work Email</label>
                <input 
                  type="email" 
                  placeholder="john@company.com"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-md px-4 py-2.5 text-[1rem] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[0.85rem] text-[var(--text-primary)]">Subject</label>
                <select className="w-full bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-md px-4 py-2.5 text-[1rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none">
                  <option>Technical Support</option>
                  <option>Sales & Licensing</option>
                  <option>Partnership Inquiry</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[0.85rem] text-[var(--text-primary)]">Message</label>
                <textarea 
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-md px-4 py-2.5 text-[1rem] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="mt-2 w-full px-6 py-3 rounded-md font-medium text-[1rem] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Send Message
              </button>

            </form>

            <div className="mt-8 pt-8 border-t border-[var(--border-strong)] text-center">
              <a href="/support" className="text-[0.95rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Prefer self-service? Visit our Support Center →
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
