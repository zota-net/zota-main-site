'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useThemeStore, defaultThemes, getActiveTheme } from '@/lib/store/theme-store';

function hexToHsl(hex: string): string {
  // Remove #
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function ThemeVariables({ children }: { children: React.ReactNode }) {
  const { activeThemeId, customThemes, resolvedMode } = useThemeStore();
  
  React.useEffect(() => {
    const allThemes = [...defaultThemes, ...customThemes];
    const theme = allThemes.find((t) => t.id === activeThemeId) || defaultThemes[0];
    
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--primary', hexToHsl(theme.primary));
    root.style.setProperty('--primary-foreground', hexToHsl(theme.primaryForeground));
    root.style.setProperty('--accent', hexToHsl(theme.accent));
    root.style.setProperty('--accent-foreground', hexToHsl(theme.accentForeground));
    root.style.setProperty('--destructive', hexToHsl(theme.destructive));
    
    // Store original hex values for use in components
    root.style.setProperty('--theme-primary-hex', theme.primary);
    root.style.setProperty('--theme-accent-hex', theme.accent);
    root.style.setProperty('--theme-destructive-hex', theme.destructive);
    root.style.setProperty('--theme-warning-hex', theme.warning);
    root.style.setProperty('--theme-success-hex', theme.success);
    root.style.setProperty('--theme-info-hex', theme.info);
  }, [activeThemeId, customThemes, resolvedMode]);
  
  return <>{children}</>;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  ...props
}: ThemeProviderProps) {
  const setResolvedMode = useThemeStore((state) => state.setResolvedMode);
  
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      <ThemeVariablesWrapper setResolvedMode={setResolvedMode}>
        <ThemeVariables>{children}</ThemeVariables>
      </ThemeVariablesWrapper>
    </NextThemesProvider>
  );
}

function ThemeVariablesWrapper({
  children,
  setResolvedMode,
}: {
  children: React.ReactNode;
  setResolvedMode: (mode: 'light' | 'dark') => void;
}) {
  const { resolvedTheme } = require('next-themes').useTheme();
  
  React.useEffect(() => {
    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      setResolvedMode(resolvedTheme);
    }
  }, [resolvedTheme, setResolvedMode]);
  
  return <>{children}</>;
}
