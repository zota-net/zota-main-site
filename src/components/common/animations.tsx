'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import React from 'react';

// Animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: 0.2 }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const pulseGlow: Variants = {
  initial: { 
    boxShadow: '0 0 0 0 rgba(255, 106, 0, 0.4)' 
  },
  animate: { 
    boxShadow: [
      '0 0 0 0 rgba(255, 106, 0, 0.4)',
      '0 0 20px 10px rgba(255, 106, 0, 0.2)',
      '0 0 0 0 rgba(255, 106, 0, 0)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Animated components
interface MotionDivProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
}

export const FadeIn = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = 'FadeIn';

export const FadeInUp = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeInUp.displayName = 'FadeInUp';

export const ScaleIn = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleIn}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ScaleIn.displayName = 'ScaleIn';

export const StaggerContainer = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerContainer.displayName = 'StaggerContainer';

export const StaggerItem = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerItem}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = 'StaggerItem';

// Page transition wrapper
export function PageTransition({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover scale effect
export function HoverScale({ 
  children,
  scale = 1.02,
  className
}: { 
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shimmer loading effect
export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <motion.div
      className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`}
      animate={{ x: ['0%', '200%'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: 0.5
      }}
    />
  );
}

// Pulse indicator
export function PulseIndicator({ 
  color = 'bg-primary',
  size = 'md'
}: { 
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span className="relative flex">
      <motion.span
        className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}
        animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${color}`} />
    </span>
  );
}

// Number counter animation
export function AnimatedCounter({ 
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = ''
}: { 
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const startValue = displayValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (value - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Signal line animation (for network visuals)
export function SignalLine({ 
  active = true,
  direction = 'horizontal'
}: { 
  active?: boolean;
  direction?: 'horizontal' | 'vertical';
}) {
  return (
    <div className={`relative overflow-hidden ${direction === 'horizontal' ? 'h-0.5 w-full' : 'w-0.5 h-full'}`}>
      <div className="absolute inset-0 bg-muted" />
      {active && (
        <motion.div
          className={`absolute bg-primary ${direction === 'horizontal' ? 'h-full w-8' : 'w-full h-8'}`}
          animate={{
            [direction === 'horizontal' ? 'x' : 'y']: ['0%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </div>
  );
}
