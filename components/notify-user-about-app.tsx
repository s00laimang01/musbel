"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone, ArrowRight, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AppInstallDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInstallSteps, setShowInstallSteps] = useState(false);

  useEffect(() => {
    // Check if app was already downloaded
    const isAppDownloaded = document.cookie
      .split("; ")
      .find((row) => row.startsWith("isAppDownloaded="))
      ?.split("=")[1];

    if (!isAppDownloaded) {
      // Show dialog after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownload = () => {
    // Set cookie to remember user downloaded the app
    document.cookie = `isAppDownloaded=true; path=/; max-age=${31536000 * 3}`;

    // Show installation steps
    setShowInstallSteps(true);

    // Simulate download trigger (replace with actual download logic)
    const link = document.createElement("a");
    link.href = "/kinta-sme-data.apk"; // Updated path - files in public are served from root
    link.download = "kinta-sme-data.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Set cookie even if user closes without downloading (optional)

    const isAppDownloaded = document.cookie
      .split("; ")
      .find((row) => row.startsWith("isAppDownloaded="))
      ?.split("=")[1];

    if (!isAppDownloaded) {
      document.cookie = "isAppDownloaded=true; path=/; max-age=86400"; // 1 day
    }
  };

  if (!showInstallSteps) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>

            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Our App is Ready! 🎉
            </DialogTitle>

            <DialogDescription className="text-base text-muted-foreground">
              Get the best experience with our mobile app. Installation is quick
              and easy!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Installation Steps
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    1
                  </Badge>
                  <span className="text-sm">
                    Click the download button below
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    2
                  </Badge>
                  <span className="text-sm">
                    Go to Downloads and install the app
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download className="w-5 h-5 mr-2" />
              Download App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Free • Secure • No ads
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <DialogTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
            Download Started! ✅
          </DialogTitle>

          <DialogDescription className="text-base text-muted-foreground">
            Follow these steps to complete the installation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Installation Guide
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs shrink-0 mt-0.5"
                >
                  1
                </Badge>
                <div>
                  <p className="font-medium text-sm">Open Downloads</p>
                  <p className="text-xs text-muted-foreground">
                    Go to your device's Downloads folder or notification panel
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs shrink-0 mt-0.5"
                >
                  2
                </Badge>
                <div>
                  <p className="font-medium text-sm">Tap the downloaded file</p>
                  <p className="text-xs text-muted-foreground">
                    Look for "Kinta-Sme-Data.apk" and tap to install
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs shrink-0 mt-0.5"
                >
                  3
                </Badge>
                <div>
                  <p className="font-medium text-sm">Allow installation</p>
                  <p className="text-xs text-muted-foreground">
                    Enable "Install from unknown sources" if prompted
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Need help?</strong> If you can't find the download, check
              your browser's download history or notification panel.
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="w-full"
          >
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
