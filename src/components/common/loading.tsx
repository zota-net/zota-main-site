'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {text && <span className="text-muted-foreground text-sm">{text}</span>}
    </div>
  );
}

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
}

export function LoadingOverlay({ show, text = 'Loading...' }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-muted" />
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium">{text}</p>
      </div>
    </motion.div>
  );
}

interface NetworkLoaderProps {
  className?: string;
}

export function NetworkLoader({ className }: NetworkLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        {/* Center node */}
        <motion.div
          className="w-4 h-4 bg-primary rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Orbiting nodes */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/60 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              marginTop: -4,
              marginLeft: -4,
            }}
            animate={{
              x: [0, Math.cos((i * Math.PI) / 2) * 24, 0],
              y: [0, Math.sin((i * Math.PI) / 2) * 24, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        ))}
        
        {/* Connection lines */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute w-6 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left"
            style={{
              top: '50%',
              left: '50%',
              marginTop: -1,
              rotate: `${i * 90}deg`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Page loading skeleton
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-10 w-32 bg-muted rounded" />
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-muted rounded-lg" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
