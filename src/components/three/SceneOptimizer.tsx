'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

/**
 * Preloads all Three.js scene modules eagerly on mount so they are
 * already in the webpack chunk cache when sections scroll into view.
 * Renders nothing — just triggers the imports.
 */
export function ThreePreloader() {
  useEffect(() => {
    // Fire all dynamic imports immediately so chunks are fetched in parallel.
    // These are the same paths used by dynamic() in pages/components.
    const modules = [
      import('@/components/three/OrbitalScene'),
      import('@/components/three/FloatingGrid'),
      import('@/components/three/DNAHelix'),
      import('@/components/three/ParticleRise'),
      import('@/components/three/TorusField'),
      import('@/components/three/ConstellationWeb'),
      import('@/components/home/NetworkScene'),
    ];
    // Preload in parallel — no await needed, just trigger fetch
    Promise.all(modules).catch(() => {
      // Silently ignore — these will be retried by dynamic() if needed
    });
  }, []);

  return null;
}

/**
 * Wraps a 3D scene component and only renders it when the element is 
 * near (or in) the viewport. Uses a generous rootMargin so the Canvas
 * initializes BEFORE the user actually scrolls to it, eliminating pop-in.
 * 
 * Once visible, the component stays mounted (no unmounting on scroll-away)
 * to avoid re-initialization costs.
 */
export function SceneVisibility({
  children,
  className,
  rootMargin = '200% 0px',
  keepMounted = true,
}: {
  children: ReactNode;
  className?: string;
  /** How far outside the viewport to begin loading. Default 200% = 2 full viewports ahead. */
  rootMargin?: string;
  /** If true, once visible the scene stays mounted even when scrolled away. Default true. */
  keepMounted?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          if (keepMounted) {
            observer.disconnect(); // Once shown, stop observing
          }
        } else if (!keepMounted) {
          setIsNear(false);
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, keepMounted]);

  return (
    <div ref={ref} className={className}>
      {isNear ? children : null}
    </div>
  );
}
