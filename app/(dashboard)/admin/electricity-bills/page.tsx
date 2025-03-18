"use client";

import type React from "react";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Search,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api, formatCurrency } from "@/lib/utils";

// Types
interface Bill {
  id: string;
  customer: string;
  amount: number;
  usage: number;
  status: string;
  dueDate: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatsData {
  totalBills: {
    count: number;
    percentChange: number;
  };
  pendingPayments: {
    amount: number;
    percentChange: number;
  };
  averageBill: {
    amount: number;
    percentChange: number;
  };
}

export default function ElectricityBillsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch bills data
  const {
    data: billsData,
    isLoading: isLoadingBills,
    isError: isErrorBills,
    refetch: refetchBills,
  } = useQuery({
    queryKey: [
      "bills",
      pagination.page,
      pagination.limit,
      searchQuery,
      statusFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);

      const response = await api.get(
        `/admin/electricity/?${params.toString()}`
      );

      const data = await response.data;
      setPagination({
        ...pagination,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });

      return data.bills;
    },
  });

  // Fetch stats data
  const {
    data: statsData,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery<StatsData>({
    queryKey: ["billsStats"],
    queryFn: async () => {
      const response = await api.get("/admin/electricity/stats");

      return response.data;
    },
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page on new search
    refetchBills();
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination({ ...pagination, page: 1 }); // Reset to first page on new filter
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast("Your export is being processed.");
      // Implement export functionality here
    } catch (error) {
      toast("There was an error exporting your data.");
    }
  };

  // Handle bill actions
  const handleBillAction = async (action: string, billId: string) => {
    try {
      if (action === "mark-as-paid") {
        const response = await fetch(`/api/electricity-bills/${billId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "success" }),
        });

        if (!response.ok) throw new Error("Failed to update bill");

        toast("The bill has been marked as paid.");

        refetchBills();
      } else if (action === "delete") {
        // Implement delete functionality
      }
    } catch (error) {
      toast("There was an error processing your request.");
    }
  };

  // Loading states
  if (isLoadingBills && isLoadingStats) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">
          Loading electricity bills...
        </p>
      </div>
    );
  }

  // Error states
  if (isErrorBills || isErrorStats) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-destructive">
          Error loading data. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            refetchBills();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Electricity Bills
          </h1>
          <p className="text-muted-foreground">
            Manage and view electricity bill information.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-none"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.totalBills.count.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {Number(statsData?.totalBills.percentChange || 0) >= 0 ? "+" : ""}
              {statsData?.totalBills.percentChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statsData?.pendingPayments.amount!, 2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Number(statsData?.pendingPayments.percentChange || 0) >= 0
                ? "+"
                : ""}
              {statsData?.pendingPayments.percentChange.toFixed(1)}% from last
              month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Bill Amount
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statsData?.averageBill.amount!, 2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Number(statsData?.averageBill.percentChange || 0) >= 0
                ? "+"
                : ""}
              {statsData?.averageBill.percentChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bills..."
            className="pl-8 rounded-none h-[2.5rem]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" variant="default" className="rounded-none">
          Search
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-none">
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusFilter("")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("success")}>
              Paid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("failed")}>
              Overdue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </form>

      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Usage (kWh)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billsData && billsData.length > 0 ? (
              billsData.map((bill: Bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.id}</TableCell>
                  <TableCell>{bill.customer}</TableCell>
                  <TableCell>${bill.amount.toFixed(2)}</TableCell>
                  <TableCell>{bill.usage}</TableCell>
                  <TableCell>
                    <Badge
                      className="rounded-none"
                      variant={
                        bill.status === "Paid"
                          ? "default"
                          : bill.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            // Navigate to details page
                            window.location.href = `/electricity-bills/${bill.id}`;
                          }}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Send reminder</DropdownMenuItem>
                        <DropdownMenuItem>Download invoice</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleBillAction("mark-as-paid", bill.id)
                          }
                        >
                          Mark as paid
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No bills found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <strong>
            {billsData?.length
              ? (pagination.page - 1) * pagination.limit + 1
              : 0}
            -
            {billsData?.length
              ? (pagination.page - 1) * pagination.limit + billsData.length
              : 0}
          </strong>{" "}
          of <strong>{pagination.total}</strong> bills
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={handlePreviousPage}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={handleNextPage}
            disabled={pagination.page >= pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
