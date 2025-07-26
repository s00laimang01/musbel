// Font optimization strategy

/**
 * This module provides font optimization strategies for better performance
 * on mobile devices and slow networks
 */

export const optimizeFonts = () => {
  if (typeof window === "undefined") return;

  // Check if the browser supports the Font Loading API
  if ("fonts" in document) {
    // Preload the main font with high priority
    const fontPreloadLink = document.createElement("link");
    fontPreloadLink.rel = "preload";
    fontPreloadLink.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&display=swap";
    fontPreloadLink.as = "font";
    fontPreloadLink.type = "font/woff2";
    fontPreloadLink.crossOrigin = "anonymous";
    document.head.appendChild(fontPreloadLink);

    // Use Font Loading API to control font loading
    document.fonts.ready.then(() => {
      // Font has loaded, can perform any post-loading optimizations here
      document.documentElement.classList.add("fonts-loaded");
    });
  }

  // Detect slow connections and apply font optimization
  //@ts-ignore
  if (navigator?.connection) {
    //@ts-ignore
    const connection = navigator?.connection as any;

    if (
      connection.saveData ||
      connection.effectiveType === "slow-2g" ||
      connection.effectiveType === "2g"
    ) {
      // For very slow connections, use system fonts as fallback
      document.documentElement.classList.add("reduce-web-fonts");
    }
  }
};

// Font fallback strategy for CSS
export const fontFallbackCSS = `
  /* Font fallback strategy */
  .reduce-web-fonts {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`;
