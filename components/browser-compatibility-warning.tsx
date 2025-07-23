"use client";

import { useEffect, useState } from "react";
import { detectBrowserCompatibility } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export function BrowserCompatibilityWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [compatibilityInfo, setCompatibilityInfo] = useState<ReturnType<
    typeof detectBrowserCompatibility
  > | null>(null);

  useEffect(() => {
    // Only run on client-side
    const compatibility = detectBrowserCompatibility();
    setCompatibilityInfo(compatibility);

    if (!compatibility.isCompatible && compatibility.isOldBrowser) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning || !compatibilityInfo) return null;

  return (
    <Alert
      variant="destructive"
      className="fixed top-0 left-0 right-0 z-50 m-4 shadow-lg"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Browser Compatibility Warning</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Your browser may not fully support all features of this application.
          For the best experience, please consider updating your browser or
          using a different device.
        </p>
        {compatibilityInfo?.missingFeatures?.length ||
          (0 > 0 && (
            <p className="text-xs opacity-80">
              Missing features: {compatibilityInfo?.missingFeatures?.join(", ")}
            </p>
          ))}
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWarning(false)}
            className="text-xs"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
