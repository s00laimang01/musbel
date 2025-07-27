"use client";

import { useEffect } from "react";
import { useBrowserCompatibility } from "./browser-compatibility-provider";
import { useNetworkCondition } from "@/hooks/use-network-condition";

interface OptimizationProviderProps {
  children: React.ReactNode;
}

/**
 * OptimizationProvider component that implements various optimization strategies
 * for better performance on mobile devices and slow networks
 */
export function OptimizationProvider({ children }: OptimizationProviderProps) {
  // Get browser compatibility information
  const {
    isOldBrowser,
    supportsContentVisibility,
    prefersReducedMotion,
    prefersReducedData,
    screenSizeCategory,
  } = useBrowserCompatibility();

  // Get network condition
  const { condition: networkCondition } = useNetworkCondition();

  useEffect(() => {
    // Add a class to indicate when fonts are loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add("fonts-loaded");
      });
    }

    // Apply network condition classes
    if (networkCondition === "slow") {
      document.documentElement.classList.add("optimize-for-slow-network");
    }

    // Apply screen size classes based on browser compatibility provider
    if (screenSizeCategory === "small") {
      document.documentElement.classList.add("optimize-for-small-screen");
    } else if (screenSizeCategory === "medium") {
      document.documentElement.classList.add("optimize-for-medium-screen");
    } else {
      document.documentElement.classList.remove("optimize-for-small-screen");
      document.documentElement.classList.remove("optimize-for-medium-screen");
    }

    // Apply content-visibility if supported
    if (supportsContentVisibility) {
      // Find elements that can benefit from content-visibility
      const sections = document.querySelectorAll(
        "section, article, .card, .content-block"
      );

      sections.forEach((section) => {
        // Only apply to elements not in the viewport initially
        const rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          section.classList.add("use-content-visibility");
        }
      });
    }

    // Apply old browser optimizations if needed
    if (isOldBrowser) {
      document.documentElement.classList.add("optimize-for-old-browser");
    }

    // Apply reduced data mode if user prefers reduced data
    if (prefersReducedData) {
      document.documentElement.classList.add("optimize-for-data-saving");
    }

    // Cleanup
    return () => {
      document.documentElement.classList.remove("optimize-for-slow-network");
      document.documentElement.classList.remove("optimize-for-small-screen");
      document.documentElement.classList.remove("optimize-for-medium-screen");
      document.documentElement.classList.remove("optimize-for-old-browser");
      document.documentElement.classList.remove("optimize-for-data-saving");
    };
  }, [
    isOldBrowser,
    supportsContentVisibility,
    prefersReducedMotion,
    prefersReducedData,
    screenSizeCategory,
    networkCondition,
  ]);

  return <>{children}</>;
}
