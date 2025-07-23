'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BrowserCompatibilityWarning } from './browser-compatibility-warning';

export function ClientBrowserWarning() {
  useEffect(() => {
    // This component will only run on the client side
  }, []);

  // Use createPortal to render the warning in the designated container
  if (typeof window !== 'undefined') {
    const container = document.getElementById('browser-compatibility-container');
    if (container) {
      return createPortal(<BrowserCompatibilityWarning />, container);
    }
  }

  return null;
}