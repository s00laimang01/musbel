'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { ClientBrowserWarning } from './client-browser-warning';
import { LightweightFallback } from './lightweight-fallback';
import { PerformanceMonitorInitializer } from './performance-monitor-initializer';
import { detectBrowserCompatibility, getOptimalImageFormat, getScreenSizeCategory, prefersReducedData, prefersReducedMotion } from '@/lib/utils/browser-compatibility';

type BrowserCompatibilityContextType = {
  supportsModernImages: boolean;
  supportsWebP: boolean;
  supportsAvif: boolean;
  supportsContentVisibility: boolean;
  supportsIntersectionObserver: boolean;
  supportsModernCSS: boolean;
  isOldBrowser: boolean;
  optimalImageFormat: 'avif' | 'webp' | 'jpg';
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  screenSizeCategory: 'small' | 'medium' | 'large';
};

const defaultContext: BrowserCompatibilityContextType = {
  supportsModernImages: false,
  supportsWebP: false,
  supportsAvif: false,
  supportsContentVisibility: false,
  supportsIntersectionObserver: false,
  supportsModernCSS: false,
  isOldBrowser: true,
  optimalImageFormat: 'jpg',
  prefersReducedMotion: false,
  prefersReducedData: false,
  screenSizeCategory: 'medium',
};

const BrowserCompatibilityContext = createContext<BrowserCompatibilityContextType>(defaultContext);

interface BrowserCompatibilityProviderProps {
  children: ReactNode;
}

export function BrowserCompatibilityProvider({ 
  children 
}: BrowserCompatibilityProviderProps) {
  const [compatibility, setCompatibility] = useState<BrowserCompatibilityContextType>(defaultContext);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Detect browser compatibility
    const {
      supportsModernImages,
      supportsWebP,
      supportsAvif,
      supportsContentVisibility,
      supportsIntersectionObserver,
      supportsModernCSS,
      isOldBrowser,
    } = detectBrowserCompatibility();

    // Get optimal image format
    const optimalImageFormat = getOptimalImageFormat();

    // Check for reduced motion preference
    const reducedMotion = prefersReducedMotion();

    // Check for reduced data preference
    const reducedData = prefersReducedData();

    // Get screen size category
    const screenSize = getScreenSizeCategory();

    // Update context
    setCompatibility({
      supportsModernImages,
      supportsWebP,
      supportsAvif,
      supportsContentVisibility,
      supportsIntersectionObserver,
      supportsModernCSS,
      isOldBrowser,
      optimalImageFormat,
      prefersReducedMotion: reducedMotion,
      prefersReducedData: reducedData,
      screenSizeCategory: screenSize,
    });

    // Add classes to document body based on compatibility
    if (isOldBrowser) {
      document.body.classList.add('old-browser');
    }

    if (!supportsModernCSS) {
      document.body.classList.add('no-modern-css');
    }

    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    }

    if (reducedData) {
      document.body.classList.add('reduced-data');
    }

    document.body.classList.add(`screen-${screenSize}`);

    // Listen for screen size changes
    const handleResize = () => {
      const newScreenSize = getScreenSizeCategory();
      if (newScreenSize !== compatibility.screenSizeCategory) {
        document.body.classList.remove(`screen-${compatibility.screenSizeCategory}`);
        document.body.classList.add(`screen-${newScreenSize}`);
        setCompatibility(prev => ({ ...prev, screenSizeCategory: newScreenSize }));
      }
    };

    // Listen for reduced motion changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
        setCompatibility(prev => ({ ...prev, prefersReducedMotion: true }));
      } else {
        document.body.classList.remove('reduced-motion');
        setCompatibility(prev => ({ ...prev, prefersReducedMotion: false }));
      }
    };

    window.addEventListener('resize', handleResize);
    motionMediaQuery.addEventListener('change', handleMotionChange);

    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionMediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <BrowserCompatibilityContext.Provider value={compatibility}>
      <LightweightFallback>
        {children}
      </LightweightFallback>
      <ClientBrowserWarning />
      <PerformanceMonitorInitializer />
    </BrowserCompatibilityContext.Provider>
  );
}

export function useBrowserCompatibility() {
  return useContext(BrowserCompatibilityContext);
}