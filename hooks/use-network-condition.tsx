"use client";

import { useState, useEffect } from "react";

type NetworkCondition = "fast" | "medium" | "slow" | "offline";
type ConnectionType = "4g" | "3g" | "2g" | "slow-2g" | "unknown";

interface NetworkInfo {
  condition: NetworkCondition;
  connectionType: ConnectionType;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
  isOnline: boolean;
}

/**
 * Hook to detect network conditions and optimize data loading
 * for users on slow connections
 */
export function useNetworkCondition(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    condition: "fast",
    connectionType: "unknown",
    downlink: null,
    rtt: null,
    saveData: false,
    isOnline: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Function to update network info
    const updateNetworkInfo = () => {
      // Check if online
      const isOnline = navigator.onLine;

      // Default values
      let condition: NetworkCondition = "fast";
      let connectionType: ConnectionType = "unknown";
      let downlink: number | null = null;
      let rtt: number | null = null;
      let saveData = false;

      // Check for Network Information API
      // @ts-ignore - connection is not in the standard TypeScript DOM types
      if ("connection" in navigator) {
        // @ts-ignore
        const connection = navigator.connection;

        // Get connection type
        //@ts-ignore
        if (connection?.effectiveType) {
          // @ts-ignore
          connectionType = connection.effectiveType as ConnectionType;
        }

        // Get downlink speed (Mbps)
        //@ts-ignore
        if (connection.downlink) {
          // @ts-ignore
          downlink = connection.downlink;
        }

        // Get round-trip time (ms)
        //@ts-ignore
        if (connection.rtt) {
          // @ts-ignore
          rtt = connection.rtt;
        }

        // Check if save data mode is enabled
        //@ts-ignore
        if (connection.saveData) {
          // @ts-ignore
          saveData = connection.saveData;
        }

        // Determine network condition
        if (!isOnline) {
          condition = "offline";
        } else if (connectionType === "slow-2g" || connectionType === "2g") {
          condition = "slow";
        } else if (connectionType === "3g" || (downlink && downlink < 1)) {
          condition = "medium";
        } else {
          condition = "fast";
        }
      }

      // Update state
      setNetworkInfo({
        condition,
        connectionType,
        downlink,
        rtt,
        saveData,
        isOnline,
      });
    };

    // Initial update
    updateNetworkInfo();

    // Add event listeners
    window.addEventListener("online", updateNetworkInfo);
    window.addEventListener("offline", updateNetworkInfo);

    // @ts-ignore - connection is not in the standard TypeScript DOM types
    if ("connection" in navigator && navigator.connection) {
      // @ts-ignore
      navigator.connection.addEventListener("change", updateNetworkInfo);
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", updateNetworkInfo);
      window.removeEventListener("offline", updateNetworkInfo);

      // @ts-ignore - connection is not in the standard TypeScript DOM types
      if ("connection" in navigator && navigator.connection) {
        // @ts-ignore
        navigator.connection.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
}

/**
 * Utility function to get image quality based on network condition
 * @param networkCondition - The current network condition
 * @returns The appropriate image quality
 */
export function getImageQuality(
  networkCondition: NetworkCondition
): "low" | "medium" | "high" {
  switch (networkCondition) {
    case "slow":
      return "low";
    case "medium":
      return "medium";
    case "fast":
      return "high";
    case "offline":
      return "low"; // Use lowest quality when offline (from cache)
    default:
      return "high";
  }
}

/**
 * Utility function to get appropriate image size based on network condition
 * @param networkCondition - The current network condition
 * @param defaultWidth - The default image width
 * @returns The appropriate image width
 */
export function getImageSize(
  networkCondition: NetworkCondition,
  defaultWidth: number
): number {
  switch (networkCondition) {
    case "slow":
      return Math.round(defaultWidth * 0.5); // 50% of original size
    case "medium":
      return Math.round(defaultWidth * 0.75); // 75% of original size
    case "fast":
      return defaultWidth; // Original size
    case "offline":
      return Math.round(defaultWidth * 0.5); // 50% of original size when offline
    default:
      return defaultWidth;
  }
}
