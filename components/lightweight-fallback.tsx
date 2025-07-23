'use client';

import { useEffect, useState } from 'react';
import { detectBrowserCompatibility } from '@/lib/utils';
import Link from 'next/link';
import { configs } from '@/lib/constants';

/**
 * This component provides a lightweight fallback UI for older browsers
 * It uses minimal JavaScript and CSS to ensure compatibility
 */
export function LightweightFallback({ children }: { children: React.ReactNode }) {
  const [isOldBrowser, setIsOldBrowser] = useState(false);
  
  useEffect(() => {
    const compatibility = detectBrowserCompatibility();
    if (compatibility.isOldBrowser) {
      setIsOldBrowser(true);
    }
  }, []);

  if (!isOldBrowser) {
    return <>{children}</>;
  }

  // Simple, lightweight UI for older browsers
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      lineHeight: '1.5'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#0f172a', fontSize: '24px' }}>{configs.appName}</h1>
        <p style={{ color: '#64748b' }}>Buy Data, Airtime & Pay Bills</p>
      </header>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fffbe6', border: '1px solid #eab308', borderRadius: '4px' }}>
        <p style={{ margin: '0', color: '#854d0e' }}>
          We've detected that you're using an older browser. We're showing you a simplified version of our site for better compatibility.
        </p>
      </div>

      <nav style={{ marginBottom: '30px' }}>
        <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <li>
            <a href="/" style={{ display: 'inline-block', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', textDecoration: 'none', color: '#0f172a' }}>Home</a>
          </li>
          <li>
            <a href="/auth/sign-in" style={{ display: 'inline-block', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', textDecoration: 'none', color: '#0f172a' }}>Sign In</a>
          </li>
          <li>
            <a href="/auth/sign-up" style={{ display: 'inline-block', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', textDecoration: 'none', color: '#0f172a' }}>Sign Up</a>
          </li>
        </ul>
      </nav>

      <main>
        {/* Fallback content */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#0f172a', fontSize: '20px', marginBottom: '15px' }}>Welcome to {configs.appName}</h2>
          <p style={{ color: '#334155', marginBottom: '15px' }}>
            Nigeria's most reliable platform for affordable data bundles, instant airtime recharge, 
            seamless bill payments, and exam result token purchases.
          </p>
          <a 
            href="/auth/sign-up" 
            style={{ 
              display: 'inline-block', 
              padding: '10px 16px', 
              backgroundColor: '#0284c7', 
              color: 'white', 
              borderRadius: '4px', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Get Started
          </a>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#0f172a', fontSize: '20px', marginBottom: '15px' }}>Our Services</h2>
          <ul style={{ padding: '0 0 0 20px', color: '#334155' }}>
            <li style={{ marginBottom: '10px' }}>Data Bundles - Best prices on MTN, Airtel, Glo, and 9mobile</li>
            <li style={{ marginBottom: '10px' }}>Airtime Recharge - Instant delivery to any network</li>
            <li style={{ marginBottom: '10px' }}>Bill Payments - Electricity, Cable TV, and more</li>
            <li style={{ marginBottom: '10px' }}>Exam Result Tokens - WAEC, NECO, and JAMB</li>
          </ul>
        </section>
      </main>

      <footer style={{ marginTop: '40px', padding: '20px 0', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
        <p>&copy; {new Date().getFullYear()} {configs.appName}. All rights reserved.</p>
      </footer>
    </div>
  );
}