'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';

export default function TermsPage() {
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
              Terms of Service
            </h1>

            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-home-text-muted mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Acceptance of Terms</h2>
                <p className="text-home-text-muted mb-4">
                  By accessing and using XETIHUB's WiFi hotspot billing platform, you accept and agree to be
                  bound by the terms and provision of this agreement. If you do not agree to abide by the
                  above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Service Description</h2>
                <p className="text-home-text-muted mb-4">
                  XETIHUB provides a comprehensive WiFi hotspot billing and management platform that includes:
                </p>
                <ul className="list-disc list-inside text-home-text-muted space-y-2 mb-4">
                  <li>Hotspot network management and monitoring</li>
                  <li>Mobile money payment processing</li>
                  <li>Voucher generation and distribution</li>
                  <li>RADIUS server integration</li>
                  <li>Hardware controller support (Mikrotik, TP-Link, Unifi, Ruijie)</li>
                  <li>Automatic reconnection technology</li>
                  <li>Multi-site management capabilities</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">User Responsibilities</h2>
                <p className="text-home-text-muted mb-4">
                  As a user of our platform, you agree to:
                </p>
                <ul className="list-disc list-inside text-home-text-muted space-y-2 mb-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Use the service only for lawful purposes</li>
                  <li>Not interfere with or disrupt the service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Payment Terms</h2>
                <p className="text-home-text-muted mb-4">
                  Payment terms for our services are as follows:
                </p>
                <ul className="list-disc list-inside text-home-text-muted space-y-2 mb-4">
                  <li>Services are billed according to the pricing plan selected</li>
                  <li>Payment is due in advance for subscription services</li>
                  <li>Late payments may result in service suspension</li>
                  <li>All fees are non-refundable unless otherwise specified</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Service Availability</h2>
                <p className="text-home-text-muted mb-4">
                  We strive to provide continuous service availability with a target uptime of 99.9%.
                  However, we do not guarantee uninterrupted service and may perform maintenance
                  that temporarily affects availability.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Limitation of Liability</h2>
                <p className="text-home-text-muted mb-4">
                  XETIHUB shall not be liable for any indirect, incidental, special, or consequential
                  damages arising out of or in connection with the use of our services. Our total
                  liability shall not exceed the amount paid by you for the services in the 12 months
                  preceding the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-home-text mb-4">Contact Information</h2>
                <p className="text-home-text-muted mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-home-card border border-home-border rounded-lg p-4">
                  <p className="text-home-text-muted">
                  Email: legal@XETIHUB.io<br />
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