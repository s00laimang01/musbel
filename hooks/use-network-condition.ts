'use client';

import { useState, useEffect } from 'react';

type NetworkCondition = 'fast' | 'medium' | 'slow' | 'unknown';

interface NetworkConditionResult {
  condition: NetworkCondition;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Hook to detect network conditions and optimize accordingly
 * Returns network condition type and related metrics
 */
export function useNetworkCondition(): NetworkConditionResult {
  const [networkCondition, setNetworkCondition] = useState<NetworkConditionResult>({
    condition: 'unknown',
  });

  useEffect(() => {
    // Default to 'medium' if we can't detect
    let condition: NetworkCondition = 'medium';
    const result: NetworkConditionResult = { condition };

    // Check if Network Information API is available
    if ('connection' in navigator) {
      const connection = navigator.connection as any;
      
      if (connection) {
        // Add network metrics to result
        result.effectiveType = connection.effectiveType;
        result.downlink = connection.downlink;
        result.rtt = connection.rtt;
        result.saveData = connection.saveData;

        // Determine condition based on effective connection type
        if (connection.saveData) {
          condition = 'slow';
        } else if (
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g'
        ) {
          condition = 'slow';
        } else if (connection.effectiveType === '3g') {
          condition = 'medium';
        } else if (connection.effectiveType === '4g') {
          condition = 'fast';
        }

        // Also consider actual bandwidth if available
        if (typeof connection.downlink === 'number') {
          if (connection.downlink < 1) {
            condition = 'slow';
          } else if (connection.downlink < 5) {
            condition = 'medium';
          } else {
            condition = 'fast';
          }
        }

        result.condition = condition;
      }

      // Listen for changes in connection
      const updateConnectionStatus = () => {
        setNetworkCondition({
          condition: result.condition,
          effectiveType: connection?.effectiveType,
          downlink: connection?.downlink,
          rtt: connection?.rtt,
          saveData: connection?.saveData
        });
      };

      // Set initial value
      setNetworkCondition(result);

      // Add event listener for connection changes
      if (connection) {
        connection.addEventListener('change', updateConnectionStatus);
      }

      // Cleanup
      return () => {
        if (connection) {
          connection.removeEventListener('change', updateConnectionStatus);
        }
      };
    } else {
      // Network Information API not available
      setNetworkCondition({ condition: 'medium' });
    }
  }, []);

  return networkCondition;
}

/**
 * Helper function to calculate appropriate image size based on network condition
 */
export function getImageSize(condition: NetworkCondition, originalSize: number): number {
  switch (condition) {
    case 'slow':
      // Reduce to 50% for slow connections
      return Math.round(originalSize * 0.5);
    case 'medium':
      // Reduce to 75% for medium connections
      return Math.round(originalSize * 0.75);
    case 'fast':
    case 'unknown':
    default:
      // Keep original size for fast connections
      return originalSize;
  }
}