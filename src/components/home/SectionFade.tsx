'use client';

/**
 * A soft gradient divider placed between homepage sections.
 * Provides a smooth visual fade transition so sections flow
 * naturally into each other instead of hard-cutting.
 */
export default function SectionFade({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative h-24 sm:h-32 w-full pointer-events-none ${flip ? 'rotate-180' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF6A00]/[0.02] dark:via-[#FF6A00]/[0.03] to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-home-border to-transparent" />
    </div>
  );
}
