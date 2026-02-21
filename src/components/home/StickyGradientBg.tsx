'use client';

/**
 * A fixed full-screen gradient background that sticks behind
 * all homepage content, with smooth color transitions between
 * light and dark mode via CSS custom properties.
 */
export default function StickyGradientBg() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none transition-colors duration-700">
      {/* Primary base gradient */}
      <div className="absolute inset-0 bg-home-bg transition-colors duration-700" />

      {/* Dark mode: deep radial glow anchored top-center */}
      <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] rounded-full bg-[radial-gradient(ellipse,rgba(255,106,0,0.06)_0%,transparent_70%)] blur-[1px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(0,217,255,0.03)_0%,transparent_70%)] blur-[1px]" />
      </div>

      {/* Light mode: subtle warm ambient glow */}
      <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] rounded-full bg-[radial-gradient(ellipse,rgba(255,106,0,0.04)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(255,133,51,0.03)_0%,transparent_70%)]" />
      </div>

      {/* Soft noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Sticky section-fade edges — top and bottom vignette */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-home-bg to-transparent transition-colors duration-700 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-home-bg to-transparent transition-colors duration-700 z-10" />
    </div>
  );
}
