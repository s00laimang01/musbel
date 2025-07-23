/**
 * Performance monitoring utilities to improve user experience on older devices
 */

/**
 * Monitors resource loading performance and reports slow-loading resources
 */
export function monitorResourcePerformance() {
  if (typeof window === 'undefined' || !window.performance || !window.performance.getEntriesByType) {
    return;
  }

  // Set thresholds for slow resources (in milliseconds)
  const SLOW_RESOURCE_THRESHOLD = 3000; // 3 seconds
  const VERY_SLOW_RESOURCE_THRESHOLD = 5000; // 5 seconds

  // Function to analyze resource timing
  const analyzeResourceTiming = () => {
    // Get all resource timing entries
    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Filter for slow resources
    const slowResources = resources.filter(resource => {
      // Calculate total time (from start to response end)
      const totalTime = resource.responseEnd - resource.startTime;
      return totalTime > SLOW_RESOURCE_THRESHOLD;
    });

    // Log slow resources for debugging
    if (slowResources.length > 0) {
      console.warn('Slow-loading resources detected:', 
        slowResources.map(resource => ({
          url: resource.name,
          type: resource.initiatorType,
          time: Math.round(resource.responseEnd - resource.startTime) + 'ms',
          size: resource.transferSize ? Math.round(resource.transferSize / 1024) + 'KB' : 'unknown'
        }))
      );

      // Find very slow resources that might be blocking the page
      const verySlowResources = slowResources.filter(resource => {
        const totalTime = resource.responseEnd - resource.startTime;
        return totalTime > VERY_SLOW_RESOURCE_THRESHOLD;
      });

      // If there are very slow resources, consider taking action
      if (verySlowResources.length > 0) {
        handleVerySlowResources(verySlowResources);
      }
    }
  };

  // Handle very slow resources
  const handleVerySlowResources = (slowResources: PerformanceResourceTiming[]) => {
    // Get resource types that are slow
    const slowScripts = slowResources.filter(r => r.initiatorType === 'script');
    const slowStyles = slowResources.filter(r => r.initiatorType === 'css' || r.initiatorType === 'link');
    const slowImages = slowResources.filter(r => r.initiatorType === 'img');

    // Show warning for slow loading if needed
    if (slowScripts.length > 2 || slowStyles.length > 2) {
      // Only show warning if multiple resources are slow (to avoid false positives)
      showPerformanceWarning();
    }
  };

  // Show a performance warning to the user
  const showPerformanceWarning = () => {
    // Check if we've already shown a warning
    if (document.getElementById('performance-warning')) return;

    // Create a warning element
    const warningEl = document.createElement('div');
    warningEl.id = 'performance-warning';
    warningEl.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#fff8e6;color:#7c5e10;padding:8px 16px;font-size:12px;text-align:center;z-index:9999;border-top:1px solid #f0d070;';
    warningEl.innerHTML = `
      <p style="margin:4px 0">This page is loading slowly on your device. Some features may be limited for better performance.</p>
      <button id="dismiss-perf-warning" style="background:#f0d070;border:none;padding:4px 8px;margin:4px;border-radius:4px;cursor:pointer;font-size:11px;">Dismiss</button>
    `;

    // Add to document
    document.body.appendChild(warningEl);

    // Add dismiss handler
    document.getElementById('dismiss-perf-warning')?.addEventListener('click', () => {
      warningEl.remove();
      // Store in session that we've dismissed the warning
      try {
        sessionStorage.setItem('performance-warning-dismissed', 'true');
      } catch (e) {
        // Ignore storage errors
      }
    });
  };

  // Run the analysis when the page is fully loaded
  window.addEventListener('load', () => {
    // Wait a bit after load to analyze
    setTimeout(analyzeResourceTiming, 1000);
  });

  // Also monitor navigation performance
  if (window.PerformanceObserver) {
    try {
      const navObserver = new PerformanceObserver((list) => {
        const perfEntries = list.getEntries();
        const navEntry = perfEntries[0] as PerformanceNavigationTiming;
        
        // Check if page load is slow
        if (navEntry.domContentLoadedEventEnd - navEntry.startTime > 5000) {
          console.warn('Slow page load detected:', 
            Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime) + 'ms');
          
          // If very slow, show warning
          if (navEntry.domContentLoadedEventEnd - navEntry.startTime > 8000) {
            showPerformanceWarning();
          }
        }
      });
      
      navObserver.observe({ type: 'navigation', buffered: true });
    } catch (e) {
      // PerformanceObserver might not be fully supported
      console.error('Error setting up PerformanceObserver:', e);
    }
  }
}

/**
 * Initializes performance monitoring
 * Call this function in your app's entry point
 */
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Start monitoring after a short delay
    setTimeout(() => {
      monitorResourcePerformance();
    }, 1000);
  }
}