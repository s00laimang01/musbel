'use client';

import { useEffect } from 'react';

interface CSSOptimizerProps {
  children: React.ReactNode;
}

/**
 * CSSOptimizer component that applies performance optimizations
 * for CSS rendering and layout on different devices and network conditions
 */
export function CSSOptimizer({ children }: CSSOptimizerProps) {
  useEffect(() => {
    // Apply CSS optimizations based on device capabilities and network
    
    // 1. Check for slow connections
    const checkNetworkCondition = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection as any;
        
        if (connection && (connection.saveData || 
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g')) {
          // Add class for slow connections
          document.documentElement.classList.add('optimize-for-slow-network');
        } else {
          document.documentElement.classList.remove('optimize-for-slow-network');
        }
      }
    };
    
    // 2. Check for small screens
    const checkScreenSize = () => {
      // For very small screens (mobile phones)
      if (window.innerWidth < 480) {
        document.documentElement.classList.add('optimize-for-small-screen');
      } else {
        document.documentElement.classList.remove('optimize-for-small-screen');
      }
      
      // For medium screens (tablets)
      if (window.innerWidth >= 480 && window.innerWidth < 768) {
        document.documentElement.classList.add('optimize-for-medium-screen');
      } else {
        document.documentElement.classList.remove('optimize-for-medium-screen');
      }
    };
    
    // 3. Check for reduced motion preference
    const checkReducedMotion = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };
    
    // 4. Apply content-visibility to improve rendering performance
    const applyContentVisibility = () => {
      // Find elements that can benefit from content-visibility
      const sections = document.querySelectorAll('section, article, .card, .content-block');
      
      sections.forEach((section) => {
        // Only apply to elements not in the viewport initially
        const rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          section.classList.add('use-content-visibility');
        }
      });
    };
    
    // Run optimizations
    checkNetworkCondition();
    checkScreenSize();
    checkReducedMotion();
    
    // Run content-visibility optimization after initial render
    setTimeout(applyContentVisibility, 100);
    
    // Add event listeners
    window.addEventListener('resize', checkScreenSize);
    
    if ('connection' in navigator && navigator.connection) {
      (navigator.connection as any).addEventListener('change', checkNetworkCondition);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      
      if ('connection' in navigator && navigator.connection) {
        (navigator.connection as any).removeEventListener('change', checkNetworkCondition);
      }
    };
  }, []);
  
  return <>{children}</>;
}