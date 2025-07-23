// This file dynamically loads polyfills only when needed
// It's more efficient than loading all polyfills for all browsers

const loadPolyfills = async () => {
  if (typeof window === 'undefined') return;

  const needsPolyfills = [];

  // Check for Promise
  if (!window.Promise) {
    needsPolyfills.push('Promise');
  }

  // Check for fetch
  if (!window.fetch) {
    needsPolyfills.push('fetch');
  }

  // Check for IntersectionObserver
  if (!window.IntersectionObserver) {
    needsPolyfills.push('IntersectionObserver');
  }

  // Check for Array methods
  if (!Array.prototype.includes) {
    needsPolyfills.push('Array.includes');
  }

  // Check for Object methods
  if (!Object.entries) {
    needsPolyfills.push('Object.entries');
  }

  // Only load polyfills if needed
  if (needsPolyfills.length > 0) {
    console.log(`Loading polyfills for: ${needsPolyfills.join(', ')}`);
    
    // Import core-js polyfills dynamically
    await import('core-js/stable');
    await import('regenerator-runtime/runtime');
    
    console.log('Polyfills loaded successfully');
  }
};

// Execute immediately
if (typeof window !== 'undefined') {
  loadPolyfills().catch(err => {
    console.error('Error loading polyfills:', err);
  });
}

export {};