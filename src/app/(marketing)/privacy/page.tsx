'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <section className="pt-[clamp(6rem,12vw,10rem)] pb-[clamp(4rem,8vw,10rem)] px-[clamp(1.25rem,5vw,4rem)]">
      <div className="mx-auto max-w-[720px]">
        <h1 className="font-geist font-semibold text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)] mb-4">
          Privacy Policy
        </h1>
        <p className="font-geist-mono text-[0.85rem] text-[var(--text-muted)] mb-12 uppercase tracking-wide">
          Last Updated: March 15, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert prose-p:text-[1rem] prose-p:leading-[1.7] prose-p:text-[var(--text-secondary)] prose-headings:font-geist prose-headings:font-semibold prose-headings:text-[var(--text-primary)] prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-[1.5rem] prose-h2:-tracking-[0.01em] max-w-none">
          <p>
            At XetiHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our networking platform.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. When you register for our platform, we collect personal information such as your name, email address, company details, and billing information. Our platform also inherently collects networking data, such as router IP addresses, MAC addresses of connected devices, and session data required for billing operations.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            The primary use of your data is to facilitate the core services of XetiHub: orchestrating RADIUS authentication, managing WiFi hotspot user sessions, generating billing metrics, and executing requested mobile money API callbacks.
          </p>
          <p>
            We also use the information to monitor and analyze usage and trends to improve your experience with the platform.
          </p>

          <h2>3. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>

          <h2>4. Third-Party Integrations</h2>
          <p>
            Our platform allows you to integrate with third-party payment gateways (e.g., MTN Mobile Money, M-Pesa). When utilizing these features, note that your data handled by these entities goes subject to their respective privacy policies.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@xetihub.com" className="text-[var(--accent)] hover:underline">privacy@xetihub.com</a>.
          </p>
        </div>
      </div>
    </section>
  );
}