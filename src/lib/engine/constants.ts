// XETIHUB Brand Constants
export const COLORS = {
  primary: '#FF6A00',      // Signal Orange
  primaryDark: '#CC5500',
  primaryLight: '#FF8533',
  secondary: '#000000',    // Deep Black
  tertiary: '#FFFFFF',     // Pure White
  cyan: '#00D9FF',         // Accent Cyan
  red: '#E63946',          // Critical Alert Red
  green: '#22C55E',        // Success Green
  darkBg: '#0a0a0a',
  charcoal: '#1a1a1a',
  cardBg: '#111111',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
} as const;

export const ANIMATION = {
  micro: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
  section: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
  dataReveal: { duration: 0.6, ease: [0, 0.55, 0.45, 1] },
  systemInit: { duration: 2.0, ease: [0.16, 1, 0.3, 1] },
  stagger: { staggerChildren: 0.08, delayChildren: 0.2 },
} as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

export const TELEMETRY_DATA = {
  packetsPerSec: 2_400_000,
  avgLatency: 14,
  packetLoss: 0.02,
  activeEndpoints: 47_300_000,
  systemLoad: 67.4,
  uptime: 99.9997,
  connectedDevices: 847_000_000,
  concurrentOps: 12_500_000,
  throughputPB: 4.7,
  responseTimeMs: 0.8,
} as const;
