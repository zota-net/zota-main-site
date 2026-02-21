'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Smooth lerp for counters
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Format large numbers with suffixes
export function formatMetric(value: number, decimals = 1): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(decimals)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

// Use intersection observer for scroll reveal
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Animated counter that counts up when in view
export function useAnimatedValue(
  target: number,
  duration = 2000,
  shouldAnimate = true
) {
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!shouldAnimate) return;
    
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, shouldAnimate]);

  return value;
}

// Fluctuating live value (makes things feel real)
export function useLiveValue(
  baseValue: number,
  variance = 0.05,
  intervalMs = 100
) {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * 2 * variance * baseValue;
      setValue(prev => lerp(prev, baseValue + fluctuation, 0.15));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [baseValue, variance, intervalMs]);

  return value;
}

// Mouse parallax effect
export function useMouseParallax(intensity = 0.02) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setPosition({
        x: (e.clientX - centerX) * intensity,
        y: (e.clientY - centerY) * intensity,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  return position;
}

// Scroll progress hook
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

// Typing effect hook
export function useTypingEffect(
  text: string,
  speed = 60,
  shouldStart = true,
  delay = 0
) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;
    
    setDisplayText('');
    setIsComplete(false);
    
    let timeout: NodeJS.Timeout;
    let index = 0;

    const startTyping = () => {
      const type = () => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
          timeout = setTimeout(type, speed);
        } else {
          setIsComplete(true);
        }
      };
      type();
    };

    const delayTimeout = setTimeout(startTyping, delay);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(delayTimeout);
    };
  }, [text, speed, shouldStart, delay]);

  return { displayText, isComplete };
}

// Window size hook
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
