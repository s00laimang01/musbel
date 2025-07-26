'use client';

import { useEffect } from 'react';
import { optimizeFonts } from '@/lib/font-optimization';

/**
 * FontOptimizer component that implements font optimization strategies
 * for better performance on mobile devices and slow networks
 */
export function FontOptimizer() {
  useEffect(() => {
    // Apply font optimization strategies
    optimizeFonts();

    // Add a class to indicate when fonts are loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    }

    // Detect network conditions
    if ('connection' in navigator) {
      const connection = navigator.connection as any;
      
      // For slow connections, add a class to use system fonts
      if (connection && (connection.saveData || 
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g')) {
        document.documentElement.classList.add('reduce-web-fonts');
      }
    }

    // For small screens, optimize rendering
    const optimizeForSmallScreens = () => {
      if (window.innerWidth < 768) {
        document.documentElement.classList.add('optimize-small-screen');
      } else {
        document.documentElement.classList.remove('optimize-small-screen');
      }
    };

    // Run once and add listener
    optimizeForSmallScreens();
    window.addEventListener('resize', optimizeForSmallScreens);

    // Cleanup
    return () => {
      window.removeEventListener('resize', optimizeForSmallScreens);
    };
  }, []);

  return null; // This component doesn't render anything
}