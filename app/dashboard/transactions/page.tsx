"use client";

import { EmptyPage } from "@/components/empty-page";
import { Button } from "@/components/ui/button";
import { useNavBar } from "@/hooks/use-nav-bar";
import {
  PATHS,
  type transaction,
  type transactionStatus,
  type transactionType,
} from "@/types";
import { getTransactions } from "@/lib/utils";
import { CircleOff, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TransactionCard from "@/components/transaction-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TransactionDetailsSheet } from "@/components/transaction-details";
import { useSearchParams } from "next/navigation";

const Page = () => {
  useNavBar("Transactions");
  const q = useSearchParams();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<transactionStatus | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<transactionType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Setup query with pagination
  const { data, status, refetch, isLoading } = useQuery({
    queryKey: ["transactions", statusFilter, typeFilter, currentPage],
    queryFn: () =>
      getTransactions({
        page: currentPage,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        limit: pageSize,
      }),
  });

  const transactions = data?.transactions || [];
  const isEmpty = status === "success" && transactions.length === 0;
  const totalPages = data?.pagination?.pages || 1;

  // Transaction type options
  const transactionTypes: { value: transactionType | "all"; label: string }[] =
    [
      { value: "all", label: "All Types" },
      { value: "funding", label: "Funding" },
      { value: "airtime", label: "Airtime" },
      { value: "data", label: "Data" },
      { value: "bill", label: "Bill" },
      { value: "recharge-card", label: "Recharge Card" },
      { value: "exam", label: "Exam" },
    ];

  // Transaction status options
  const transactionStatuses: {
    value: transactionStatus | "all";
    label: string;
  }[] = [
    { value: "all", label: "All Statuses" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
  ];

  // Reset filters
  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (
    isEmpty &&
    currentPage === 1 &&
    statusFilter === "all" &&
    typeFilter === "all"
  ) {
    return (
      <EmptyPage
        icon={CircleOff}
        header="No Transactions Recorded Yet!"
        message="If you have any transactions there will all appear here, Thank You"
      >
        <div className="gap-3 flex items-center">
          <Button
            variant="ringHover"
            asChild
            size="lg"
            className="rounded-none"
          >
            <Link href={PATHS.BUY_DATA}>BUY DATA</Link>
          </Button>
          <Button
            variant="ringHover"
            asChild
            size="lg"
            className="rounded-none"
          >
            <Link href={PATHS.BUY_AIRTIME}>BUY AIRTIME</Link>
          </Button>
        </div>
      </EmptyPage>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <TransactionDetailsSheet
        key={q.get("tx_ref")}
        open={Boolean(q.get("tx_ref"))}
        tx_ref={q.get("tx_ref")!}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as transactionType | "all");
              setCurrentPage(1); // Reset to first page when filter changes
            }}
          >
            <SelectTrigger className="md:w-[180px] w-full rounded-none">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {transactionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as transactionStatus | "all");
              setCurrentPage(1); // Reset to first page when filter changes
            }}
          >
            <SelectTrigger className="md:w-[180px] w-full rounded-none">
              <SelectValue placeholder="Transaction Status" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {transactionStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(statusFilter !== "all" || typeFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-primary hover:bg-primary hover:text-white"
              onClick={resetFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active filters */}
        {(statusFilter !== "all" || typeFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-4">
            {statusFilter !== "all" && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-none"
              >
                Status: {statusFilter}
                <button
                  className="ml-1 text-xs"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  ×
                </button>
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-none"
              >
                Type:{" "}
                {typeFilter
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
                <button
                  className="ml-1 text-xs"
                  onClick={() => {
                    setTypeFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Transactions list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <TransactionCard isLoading={true} />
            <TransactionCard isLoading={true} />
            <TransactionCard isLoading={true} />
          </div>
        ) : status === "error" ? (
          <div className="text-center py-8">
            <p className="text-red-500">
              Error loading transactions. Please try again.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : isEmpty ? (
          <EmptyPage
            icon={CircleOff}
            header="Transaction Not Found"
            message="No transactions found with the selected filters."
          >
            <Button
              variant="ringHover"
              className="mt-4 rounded-none"
              onClick={resetFilters}
            >
              Clear Filters
            </Button>
          </EmptyPage>
        ) : (
          // Transactions list
          <>
            {transactions.map((transaction: transaction) => (
              <TransactionCard
                key={transaction.tx_ref}
                transaction={transaction}
              />
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-none"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Summary */}
            <p className="text-center text-sm text-gray-500 py-4">
              {data?.pagination?.total
                ? `Showing ${transactions.length} of ${data.pagination.total} transactions`
                : "No more transactions to display"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
