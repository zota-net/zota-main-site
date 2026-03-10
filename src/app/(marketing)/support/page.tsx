'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { HelpCircle, MessageSquare, Book, Phone, Mail, Clock } from 'lucide-react';

const SUPPORT_OPTIONS = [
  {
    icon: <Book className="w-6 h-6" />,
    title: 'Documentation',
    description: 'Comprehensive guides for setup, configuration, and troubleshooting.',
    link: '#',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Community Forum',
    description: 'Connect with other operators and share solutions.',
    link: '#',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Email Support',
    description: 'Get help from our technical support team.',
    link: 'mailto:support@XETIHUB.io',
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Phone Support',
    description: 'Speak directly with our support specialists.',
    link: 'tel:+1-555-0123',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How do I set up a new hotspot?',
    answer: 'Follow our quick start guide in the documentation. It covers hardware configuration, RADIUS setup, and initial testing.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support mobile money payments, credit cards, bank transfers, and voucher redemptions across multiple regions.',
  },
  {
    question: 'How does automatic reconnection work?',
    answer: 'Our intelligent reconnection system monitors connection status and automatically restores service when users return to range or after power outages.',
  },
  {
    question: 'Can I manage multiple sites?',
    answer: 'Yes, our platform supports unlimited sites with centralized management, role-based access, and unified reporting.',
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-home-bg text-home-text">
      <Navigation />

      <main className="relative pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-home-text mb-6">
              Support Center
            </h1>
            <p className="text-xl text-home-text-muted max-w-3xl mx-auto">
              Get the help you need to maximize your WiFi hotspot network performance.
            </p>
          </motion.div>

          {/* Support Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {SUPPORT_OPTIONS.map((option, index) => (
              <div
                key={index}
                className="bg-home-card border border-home-border rounded-xl p-6 text-center hover:border-[#FF6A00]/20 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-[#FF6A00]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-[#FF6A00]">{option.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-home-text mb-2">{option.title}</h3>
                <p className="text-sm text-home-text-muted mb-4">{option.description}</p>
                <a
                  href={option.link}
                  className="text-[#FF6A00] hover:text-[#FF6A00]/80 text-sm font-medium"
                >
                  Learn more →
                </a>
              </div>
            ))}
          </motion.div>

          {/* Status & Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            <div className="bg-home-card border border-home-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-home-text">System Status</h3>
              </div>
              <p className="text-home-text-muted mb-4">
                All systems are operational. View detailed status and incident history.
              </p>
              <a href="#" className="text-[#FF6A00] hover:text-[#FF6A00]/80 text-sm font-medium">
                View Status Page →
              </a>
            </div>

            <div className="bg-home-card border border-home-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-[#FF6A00]" />
                <h3 className="text-lg font-semibold text-home-text">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm text-home-text-muted">
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM UTC</p>
                <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM UTC</p>
                <p><strong>Sunday:</strong> Emergency support only</p>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-home-text mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {FAQ_ITEMS.map((faq, index) => (
                <div key={index} className="bg-home-card border border-home-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-home-text mb-3 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#FF6A00] flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-home-text-muted ml-8">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16 bg-home-card border border-home-border rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-home-text mb-4">Still need help?</h3>
            <p className="text-home-text-muted mb-6 max-w-2xl mx-auto">
              Our support team is here to help you succeed. Contact us for personalized assistance
              with your WiFi hotspot network.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:support@XETIHUB.ioio"
                className="px-6 py-3 bg-[#FF6A00] text-white font-semibold rounded-lg hover:bg-[#FF6A00]/90 transition-colors duration-300"
              >
                Contact Support
              </a>
              <a
                href="/contact"
                className="px-6 py-3 border border-home-border text-home-text font-medium rounded-lg hover:border-[#FF6A00]/30 transition-colors duration-300"
              >
                Schedule a Call
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}