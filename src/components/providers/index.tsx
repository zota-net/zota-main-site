'use client';

import { ThemeProvider } from './theme-provider';
import { SimulationProvider } from './simulation-provider';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="netnet-theme">
      <SimulationProvider>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </SimulationProvider>
    </ThemeProvider>
  );
}
