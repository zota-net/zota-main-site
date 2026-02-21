'use client';

import { useEffect } from 'react';
import { useNetworkStore } from '@/lib/store/network-store';
import { useAppStore } from '@/lib/store/app-store';

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const { isSimulating, simulationSpeed, simulateTick } = useNetworkStore();
  const { settings } = useAppStore();

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      simulateTick();
    }, settings.refreshRate * 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, settings.refreshRate, simulateTick]);

  return <>{children}</>;
}
