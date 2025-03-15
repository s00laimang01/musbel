"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Landmark,
  Smartphone,
  Wallet,
  Wifi,
  BookOpen,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { api, cn } from "@/lib/utils";
import type {
  paymentMethod,
  transaction,
  transactionStatus,
  transactionType,
} from "@/types";
import { useRouter } from "next/navigation";
import { ScrollArea } from "./scroll-area";

interface TransactionDetailsSheetProps {
  tx_ref: string;
  open?: boolean;
}

export function TransactionDetailsSheet({
  tx_ref,
  open,
}: TransactionDetailsSheetProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const r = useRouter();

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

  const getStatusIcon = (status: transactionStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "pending":
        return <Clock className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusColor = (status: transactionStatus) => {
    switch (status) {
      case "success":
        return "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground";
      case "failed":
        return "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive-foreground";
      case "pending":
        return "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground";
    }
  };

  const getTypeIcon = (type: transactionType) => {
    switch (type) {
      case "funding":
        return <Wallet className="h-5 w-5" />;
      case "airtime":
        return <Smartphone className="h-5 w-5" />;
      case "data":
        return <Wifi className="h-5 w-5" />;
      case "bill":
        return <FileText className="h-5 w-5" />;
      case "recharge-card":
        return <CreditCard className="h-5 w-5" />;
      case "exam":
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: transactionType) => {
    switch (type) {
      case "funding":
        return "Wallet Funding";
      case "airtime":
        return "Airtime Purchase";
      case "data":
        return "Data Purchase";
      case "bill":
        return "Bill Payment";
      case "recharge-card":
        return "Recharge Card";
      case "exam":
        return "Exam Payment";
    }
  };

  const getPaymentMethodIcon = (method: paymentMethod) => {
    switch (method) {
      case "dedicatedAccount":
        return <Landmark className="h-5 w-5" />;
      case "virtualAccount":
        return <CreditCard className="h-5 w-5" />;
      case "ownAccount":
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getPaymentMethodLabel = (method: paymentMethod) => {
    switch (method) {
      case "dedicatedAccount":
        return "Dedicated Account";
      case "virtualAccount":
        return "Virtual Account";
      case "ownAccount":
        return "Own Account";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP 'at' p");
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="md:max-w-md p-4 w-[90%]">
        <ScrollArea>
          <SheetHeader className="p-0">
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>
              Complete information about this transaction
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="py-6 space-y-6">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-full bg-muted animate-pulse w-12 h-12"></div>
                <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
                <div className="h-5 bg-muted animate-pulse rounded w-24"></div>
              </div>

              <Separator />

              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                    <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                  </div>
                ))}

                <div className="flex flex-col gap-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                  <div className="h-20 bg-muted/50 animate-pulse rounded w-full"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  {transaction?.type && getTypeIcon(transaction.type)}
                </div>
                <h3 className="text-xl font-semibold">
                  {transaction?.amount
                    ? formatAmount(transaction.amount)
                    : "N/A"}
                </h3>
                {transaction?.status && (
                  <Badge
                    className={cn(
                      getStatusColor(transaction.status),
                      "rounded-none"
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(transaction.status)}
                      <span className="capitalize">{transaction.status}</span>
                    </span>
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Transaction Type
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {transaction?.type && getTypeIcon(transaction.type)}
                    {transaction?.type && getTypeLabel(transaction.type)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Payment Method
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {transaction?.paymentMethod &&
                      getPaymentMethodIcon(transaction.paymentMethod)}
                    {transaction?.paymentMethod &&
                      getPaymentMethodLabel(transaction.paymentMethod)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Reference
                  </span>
                  <span className="font-mono text-sm font-medium">
                    {transaction?.tx_ref}
                  </span>
                </div>

                {transaction?.accountId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Account ID
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {transaction.accountId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">User</span>
                  <span className="font-medium">{transaction?.user}</span>
                </div>

                {transaction?.note && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Note</span>
                    <p className="text-sm p-3 bg-primary/5 rounded-none">
                      {transaction.note}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {formatDate(transaction?.createdAt)}
                  </span>
                </div>

                {transaction?.updatedAt &&
                  transaction.updatedAt !== transaction.createdAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Last Updated
                      </span>
                      <span className="text-sm">
                        {formatDate(transaction.updatedAt)}
                      </span>
                    </div>
                  )}

                {transaction?.meta &&
                  Object.keys(transaction.meta).length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">
                        Additional Details
                      </span>
                      <div className="bg-primary/5 p-3 rounded-none">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(transaction.meta, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
          <SheetFooter className="p-0">
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
