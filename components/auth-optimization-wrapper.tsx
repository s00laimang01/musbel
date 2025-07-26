'use client';

import { OptimizationProvider } from './optimization-provider';

export function AuthOptimizationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OptimizationProvider>{children}</OptimizationProvider>;
}