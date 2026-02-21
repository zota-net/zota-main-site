'use client';

import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter, HoverScale } from '@/components/common';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  animated?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-primary/5 border-primary/20',
  success: 'bg-green-500/5 border-green-500/20',
  warning: 'bg-yellow-500/5 border-yellow-500/20',
  danger: 'bg-red-500/5 border-red-500/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  danger: 'bg-red-500/10 text-red-500',
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  animated = true,
  decimals = 0,
  prefix = '',
  suffix = '',
}: StatsCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue);

  return (
    <HoverScale scale={1.02}>
      <Card className={cn(
        'relative overflow-hidden transition-all duration-300',
        variantStyles[variant],
        className
      )}>
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        </div>

        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn('p-2 rounded-lg', iconStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold tracking-tight"
              >
                {animated && isNumeric ? (
                  <AnimatedCounter
                    value={numericValue}
                    duration={1}
                    decimals={decimals}
                    prefix={prefix}
                    suffix={suffix}
                  />
                ) : (
                  <span>{prefix}{value}{suffix}</span>
                )}
              </motion.div>
              
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>

            {trend && (
              <Badge
                variant={trend.isPositive ? 'default' : 'destructive'}
                className={cn(
                  'text-xs',
                  trend.isPositive 
                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}% {trend.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </HoverScale>
  );
}
