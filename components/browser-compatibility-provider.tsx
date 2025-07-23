'use client';

import { ReactNode } from 'react';
import { ClientBrowserWarning } from './client-browser-warning';
import { LightweightFallback } from './lightweight-fallback';
import { PerformanceMonitorInitializer } from './performance-monitor-initializer';

interface BrowserCompatibilityProviderProps {
  children: ReactNode;
}

export function BrowserCompatibilityProvider({ 
  children 
}: BrowserCompatibilityProviderProps) {
  return (
    <>
      <LightweightFallback>
        {children}
      </LightweightFallback>
      <ClientBrowserWarning />
      <PerformanceMonitorInitializer />
    </>
  );
}