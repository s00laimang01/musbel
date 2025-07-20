"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import type { transaction } from "@/types";
import { useRouter } from "next/navigation";
import { ScrollArea } from "./scroll-area";
import TransactionReceipt, {
  TransactionReceiptSkeleton,
} from "./transaction-receipt";
import html2canvas from "html2canvas";

interface TransactionDetailsSheetProps {
  tx_ref: string;
  open?: boolean;
}

export function TransactionDetailsSheet({
  tx_ref,
  open,
}: TransactionDetailsSheetProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const [isDownloading, setIsDownloading] = useState(false);
  const r = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  const { isLoading, data } = useQuery({
    queryKey: ["transaction", tx_ref],
    queryFn: async () =>
      (
        await api.get<{ data: transaction }>(
          `/transactions/get-transaction/?tx_ref=${tx_ref}&useExpirationDate=false`
        )
      ).data,
    enabled: isOpen,
  });

  const { data: transaction } = data || {};

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    if (!value) {
      r.push(location.pathname);
    }
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    setIsDownloading(true);

    try {
      // Create canvas from the receipt element
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
      });

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `receipt-${tx_ref}-${Date.now()}.png`;

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          URL.revokeObjectURL(url);
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error downloading receipt:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="md:max-w-lg p-2 w-full space-y-3 bg-gray-100">
        <ScrollArea>
          <SheetHeader className="p-0 mb-4 flex flex-row gap-2 items-center py-4 border-b border-gray-800">
            {/* Header */}
            <Button
              className="rounded-full"
              size="icon"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              {" "}
              <ArrowLeft />
            </Button>
            <SheetTitle className="text-lg font-medium">
              TRANSACTION RECEIPT
            </SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <TransactionReceiptSkeleton />
          ) : (
            <TransactionReceipt {...transaction!} ref={receiptRef} />
          )}
          <SheetFooter className="py-4">
            <Button
              className="rounded-none"
              onClick={downloadReceipt}
              disabled={isLoading || isDownloading}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="w-full rounded-none">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
