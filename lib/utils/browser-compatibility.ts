/**
 * Utility functions to detect browser compatibility for various optimization features
 */

export function detectBrowserCompatibility() {
  if (typeof window === 'undefined') {
    return {
      supportsModernImages: false,
      supportsWebP: false,
      supportsAvif: false,
      supportsContentVisibility: false,
      supportsIntersectionObserver: false,
      supportsModernCSS: false,
      isOldBrowser: true,
    };
  }

  // Check for modern image format support
  const supportsWebP = checkWebPSupport();
  const supportsAvif = checkAvifSupport();
  
  // Check for modern CSS features
  const supportsContentVisibility = 'contentVisibility' in document.documentElement.style;
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const supportsModernCSS = checkModernCSSSupport();
  
  // Check for modern image component support
  const supportsModernImages = supportsIntersectionObserver && 'loading' in HTMLImageElement.prototype;
  
  // Determine if this is an old browser
  const isOldBrowser = !supportsModernImages || !supportsWebP || !supportsModernCSS;
  
  return {
    supportsModernImages,
    supportsWebP,
    supportsAvif,
    supportsContentVisibility,
    supportsIntersectionObserver,
    supportsModernCSS,
    isOldBrowser,
  };
}

// Helper function to check WebP support
function checkWebPSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    // Check if browser can encode WebP data URLs
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

// Helper function to check AVIF support
function checkAvifSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  // This is a basic check, but not 100% reliable
  // A more reliable check would involve actually loading an AVIF image
  const img = new Image();
  return typeof img.decode === 'function' && 'avif' in ImageDecoder.prototype;
}

// Helper function to check modern CSS support
function checkModernCSSSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  const style = document.documentElement.style;
  
  // Check for CSS Grid support
  const hasGrid = 'grid' in style;
  
  // Check for CSS Variables support
  const hasVars = 'var' in style;
  
  // Check for Flexbox support
  const hasFlex = 'flex' in style;
  
  // Check for CSS Animations
  const hasAnimations = 'animation' in style;
  
  return hasGrid && hasVars && hasFlex && hasAnimations;
}

// Helper function to get appropriate image format based on browser support
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'jpg';
  
  const { supportsAvif, supportsWebP } = detectBrowserCompatibility();
  
  if (supportsAvif) return 'avif';
  if (supportsWebP) return 'webp';
  return 'jpg';
}

// Helper function to determine if we should use reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Helper function to determine if we should use reduced data
export function prefersReducedData(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Save-Data header
  if ('connection' in navigator && (navigator.connection as any).saveData) {
    return true;
  }
  
  return false;
}

// Helper function to determine screen size category
export function getScreenSizeCategory(): 'small' | 'medium' | 'large' {
  if (typeof window === 'undefined') return 'medium';
  
  const width = window.innerWidth;
  
  if (width < 640) return 'small';
  if (width < 1024) return 'medium';
  return 'large';
}