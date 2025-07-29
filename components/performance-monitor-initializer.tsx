"use client";

import { useEffect } from "react";

/**
 * Client component that initializes performance monitoring
 * This is separated to avoid SSR issues
 */
export function PerformanceMonitorInitializer() {
  useEffect(() => {
    // Dynamically import the performance monitoring module
    // This avoids including it in the initial bundle
    import("@/lib/performance-monitor")
      .then(({ initPerformanceMonitoring }) => {
        // Initialize performance monitoring
        initPerformanceMonitoring();
      })
      .catch((err) => {
        console.error("Failed to load performance monitoring:", err);
      });
  }, []);

  // This component doesn't render anything
  return null;
}
