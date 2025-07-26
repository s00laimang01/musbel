'use client';

import { OptimizationProvider } from './optimization-provider';

export function HomeOptimizationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OptimizationProvider>{children}</OptimizationProvider>;
}