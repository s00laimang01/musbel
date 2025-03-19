"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import {
  cn,
  formatCurrency,
  getInitials,
  getStatusColor,
  getTransactionsForAdmin,
} from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export function RecentSales() {
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () =>
      getTransactionsForAdmin({ limit: 5, sortBy: "createdAt", sortOrder: -1 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="ml-auto h-4 w-[60px]" />
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="flex items-center text-destructive">
          <AlertCircle className="mr-2 h-5 w-5" />
          <p className="font-medium">Failed to load transactions</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
        <Button variant="outline" onClick={() => refetch()} className="mt-2">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data?.data.transactions?.map((transaction) => (
        <div
          key={transaction.transaction_id}
          className="flex items-center hover:bg-gray-200 p-3 cursor-pointer"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
            <AvatarFallback>
              {getInitials(transaction.userfullName)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.userfullName}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.userEmail.length > 15
                ? transaction.userEmail.slice(0, 15) + "..."
                : transaction.userEmail}
            </p>
          </div>
          <div
            className={cn(
              "ml-auto font-medium",
              getStatusColor(transaction.status)
            )}
          >
            {transaction.status === "success"
              ? "+"
              : transaction.status === "pending"
              ? "*"
              : "-"}
            {formatCurrency(transaction.amount, 2)}
          </div>
        </div>
      ))}
    </div>
  );
}
