'use client';

import { useThemeStore } from '@/lib/store/theme-store';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'full' | 'icon';
}

const sizeMap = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
  xl: { icon: 48, text: 'text-3xl' },
};

export function Logo({ 
  className, 
  size = 'md', 
  showText = true,
  variant = 'full'
}: LogoProps) {
  const { branding, resolvedMode } = useThemeStore();
  const { icon: iconSize, text: textSize } = sizeMap[size];
  
  // Determine which logo to use
  const logoUrl = resolvedMode === 'dark' 
    ? (branding.logoDarkUrl || branding.logoUrl)
    : (branding.logoLightUrl || branding.logoUrl);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={branding.companyName}
          width={iconSize}
          height={iconSize}
          className="object-contain"
        />
      ) : (
        <div 
          className="relative flex items-center justify-center rounded-lg bg-primary/10 p-1"
          style={{ width: iconSize + 8, height: iconSize + 8 }}
        >
          <Activity 
            className="text-primary" 
            style={{ width: iconSize * 0.7, height: iconSize * 0.7 }}
          />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        </div>
      )}
      
      {showText && variant === 'full' && (
        <span className={cn('font-bold tracking-tight', textSize)}>
          {branding.companyName}
        </span>
      )}
    </div>
  );
}
