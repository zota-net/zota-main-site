'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <section className="pt-[clamp(6rem,12vw,10rem)] pb-[clamp(4rem,8vw,10rem)] px-[clamp(1.25rem,5vw,4rem)]">
      <div className="mx-auto max-w-[720px]">
        <h1 className="font-geist font-semibold text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)] mb-4">
          Terms of Service
        </h1>
        <p className="font-geist-mono text-[0.85rem] text-[var(--text-muted)] mb-12 uppercase tracking-wide">
          Last Updated: March 15, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert prose-p:text-[1rem] prose-p:leading-[1.7] prose-p:text-[var(--text-secondary)] prose-headings:font-geist prose-headings:font-semibold prose-headings:text-[var(--text-primary)] prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-[1.5rem] prose-h2:-tracking-[0.01em] max-w-none">
          <p>
            Welcome to XetiHub. These Terms of Service control your use of our platform, software, APIs, and associated services. By registering an account and using the platform, you agree to be bound by these terms.
          </p>

          <h2>1. Platform Usage & Scope</h2>
          <p>
            XetiHub provides a management overlay for networking hardware (e.g., MikroTik routers) allowing you to execute billing, hotspot session control, and voucher generation. You agree to use the Service strictly for lawful operations and maintain proper authorization over any networking infrastructure you connect to our API.
          </p>

          <h2>2. Service Level Agreement</h2>
          <p>
            While we strive for 99.9% uptime and utilize globally redundant edge infrastructure, XetiHub is provided on an "as is" and "as available" basis. We do not warrant that the service will be uninterrupted or error-free.
          </p>

          <h2>3. Payments and Billing</h2>
          <p>
            If you subscribe to a paid tier on XetiHub, you agree to pay all applicable fees relative to your usage volume or tier limits. Failure to pay may result in immediate suspension of API access to your routers and RADIUS authentication services.
          </p>

          <h2>4. Limitation of Liability</h2>
          <p>
            In no event shall XetiHub be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use or inability to use the Service.
          </p>

          <h2>5. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation a breach of the Terms.
          </p>
          
          <h2>6. Contact</h2>
          <p>
            For any legal inquiries regarding these Terms of Service, reach out to us at <a href="mailto:legal@xetihub.com" className="text-[var(--accent)] hover:underline">legal@xetihub.com</a>.
          </p>
        </div>
      </div>
    </section>
  );
}