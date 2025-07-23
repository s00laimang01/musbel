"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";
import { detectBrowserCompatibility } from "@/lib/utils";
import {
  useNetworkCondition,
  getImageQuality,
  getImageSize,
} from "@/hooks/use-network-condition";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  lowResSrc?: string;
  mediumResSrc?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

/**
 * A component that optimizes images for older browsers and network conditions
 * - Uses lower resolution images for older browsers
 * - Adapts image quality based on network speed
 * - Falls back to standard img tag if needed
 * - Lazy loads images by default (unless priority is true)
 */
export function OptimizedImage({
  src,
  lowResSrc,
  mediumResSrc,
  fallbackSrc,
  alt,
  width,
  height,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isOldBrowser, setIsOldBrowser] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [imageWidth, setImageWidth] = useState(
    typeof width === "number" ? width : undefined
  );
  const [imageHeight, setImageHeight] = useState(
    typeof height === "number" ? height : undefined
  );

  // Get network condition
  const { condition: networkCondition } = useNetworkCondition();

  useEffect(() => {
    // Check browser compatibility
    const compatibility = detectBrowserCompatibility();
    const isOld = compatibility.isOldBrowser;
    setIsOldBrowser(isOld!);

    // Determine appropriate image source based on browser and network
    let newSrc = src;

    // For slow networks or old browsers, use low resolution
    if (networkCondition === "slow" || isOld) {
      if (lowResSrc) {
        newSrc = lowResSrc;
      }
    }
    // For medium networks, use medium resolution if available
    else if (networkCondition === "medium") {
      if (mediumResSrc) {
        newSrc = mediumResSrc;
      }
    }

    setImageSrc(newSrc);

    // Adjust dimensions based on network condition if numeric values were provided
    if (typeof width === "number" && typeof height === "number") {
      // Only resize for slow/medium networks and non-priority images
      if (
        (networkCondition === "slow" || networkCondition === "medium") &&
        !priority
      ) {
        const newWidth = getImageSize(networkCondition, width);
        const aspectRatio = width / height;
        const newHeight = Math.round(newWidth / aspectRatio);

        setImageWidth(newWidth);
        setImageHeight(newHeight);
      }
    }
  }, [lowResSrc, mediumResSrc, networkCondition, priority, src, width, height]);

  // For very old browsers, use a standard img tag with minimal attributes
  if (isOldBrowser) {
    return (
      <img
        src={fallbackSrc || imageSrc}
        alt={alt || ""}
        width={imageWidth}
        height={imageHeight}
        loading={priority ? undefined : "lazy"}
        decoding={priority ? "sync" : "async"}
        style={{ maxWidth: "100%", height: "auto" }}
        {...props}
      />
    );
  }

  // For modern browsers, use Next.js Image component
  return (
    <Image
      src={imageSrc}
      alt={alt || ""}
      width={imageWidth}
      height={imageHeight}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      {...props}
    />
  );
}
