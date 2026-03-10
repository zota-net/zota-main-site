'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-home-bg text-home-text">
      <Navigation />

      <main className="relative pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-home-text mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-home-text-muted mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Information We Collect</h2>
                <p className="text-home-text-muted mb-4">
                  We collect information you provide directly to us, such as when you create an account,
                  use our services, or contact us for support. This may include:
                </p>
                <ul className="list-disc list-inside text-home-text-muted space-y-2 mb-4">
                  <li>Account information (name, email, phone number)</li>
                  <li>Payment information for billing purposes</li>
                  <li>Network usage data for hotspot management</li>
                  <li>Device information and connection logs</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">How We Use Your Information</h2>
                <p className="text-home-text-muted mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-home-text-muted space-y-2 mb-4">
                  <li>Provide and maintain our WiFi hotspot billing services</li>
                  <li>Process payments and manage billing</li>
                  <li>Monitor network performance and security</li>
                  <li>Communicate with you about our services</li>
                  <li>Improve our platform and develop new features</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Data Security</h2>
                <p className="text-home-text-muted mb-4">
                  We implement appropriate technical and organizational measures to protect your personal
                  information against unauthorized access, alteration, disclosure, or destruction. This
                  includes encryption of data in transit and at rest, regular security audits, and
                  compliance with industry standards.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Data Retention</h2>
                <p className="text-home-text-muted mb-4">
                  We retain your personal information for as long as necessary to provide our services,
                  comply with legal obligations, resolve disputes, and enforce our agreements. Specific
                  retention periods vary depending on the type of data and the purpose for which it was collected.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Your Rights</h2>
                <p className="text-home-text-muted mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-home-text-muted space-y-2 mb-4">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or restrict certain processing of your information</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Contact Us</h2>
                <p className="text-home-text-muted mb-4">
                  If you have any questions about this Privacy Policy or our data practices,
                  please contact us at:
                </p>
                <div className="bg-home-card border border-home-border rounded-lg p-4">
                  <p className="text-home-text-muted">
                  Email: privacy@XETIHUB.io<br />
                    Address: [Company Address]
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}