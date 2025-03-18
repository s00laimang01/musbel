"use client";

import React from "react";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  MoreHorizontal,
  Plus,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";
import { api, errorMessage, formatCurrency } from "@/lib/utils";
import { CreateDataPlanDialog } from "@/components/dashboard/create-data-plan";
import { dataPlan } from "@/types";
import { toast } from "sonner";
import PromptModal from "@/components/prompt-modal";

// Type definitions
interface DataPlan {
  _id: string;
  amount: number;
  availability: string;
  data: string;
  isPopular: boolean;
  network: string;
  type: string;
  planId: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  data: {
    featuredPlans: dataPlan[];
    dataPlans: dataPlan[];
    pagination: PaginationData;
  };
}

export default function DataPlansPage() {
  // State for search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [network, setNetwork] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [initialLoad, setInitialLoad] = useState(true);
  const [dataPlan, setDataPlan] = useState<dataPlan>();
  const [dataId, setDataId] = useState<string>();

  const queryClient = useQueryClient();

  // Function to fetch data plans
  const fetchDataPlans = async (): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (searchTerm) {
      params.append("search", searchTerm);
    }

    if (network) {
      params.append("network", network);
    }

    const response = await api.get(`/admin/data/?${params.toString()}`);

    return response.data;
  };

  // React Query hook
  const { data, isLoading, isError, error } = useQuery<ApiResponse, Error>({
    queryKey: ["dataPlans", page, limit, searchTerm, network],
    queryFn: fetchDataPlans,
  });

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search

    // Manually invalidate the query to trigger a refetch
    queryClient.invalidateQueries({
      queryKey: ["dataPlans", 1, limit, searchTerm, network],
    });
  };

  // Handle network filter
  const handleNetworkFilter = (selectedNetwork: string) => {
    const newNetwork = selectedNetwork === network ? null : selectedNetwork;
    setNetwork(newNetwork);
    setPage(1); // Reset to first page on filter change

    // Manually invalidate the query to trigger a refetch
    queryClient.invalidateQueries({
      queryKey: ["dataPlans", 1, limit, searchTerm, newNetwork],
    });
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.data.pagination.hasNextPage) {
      setPage(page + 1);
    }
  };

  const deletePlan = async () => {
    try {
      await api.delete(`/admin/data/?dataId=${dataId}/`);
      toast("Plan deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["dataPlans", page, limit, searchTerm, network],
      });
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  React.useEffect(() => {
    if (data && initialLoad) {
      setInitialLoad(false);
    }
  }, [data, initialLoad]);

  // Only show full-page loading on initial load
  if (isLoading && initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading data plans...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-destructive">Error: {error.message}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const featuredPlans = data?.data.featuredPlans || [];
  const dataPlans = data?.data.dataPlans || [];
  const pagination = data?.data.pagination;

  return (
    <div className="flex flex-col gap-4">
      {dataPlan && (
        <CreateDataPlanDialog
          dataPlan={dataPlan}
          _open
          onClose={() => {
            setDataPlan(undefined);
          }}
        />
      )}

      {dataId && (
        <PromptModal
          onConfirm={deletePlan}
          _open
          onClose={() => {
            setDataId(undefined);
          }}
          title="Delete Data Plan"
          description="Are you sure you want to delete this data plan? Deleting this data plan means this plan will not be available for users anymore!"
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Plans</h1>
          <p className="text-muted-foreground">
            Manage data plans and packages.
          </p>
        </div>
        <CreateDataPlanDialog>
          <Button variant="ringHover" className="rounded-none" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </CreateDataPlanDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 relative">
        {isLoading && !initialLoad && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {featuredPlans.map((plan) => (
          <Card key={plan._id} className="flex flex-col rounded-none">
            <CardHeader>
              <CardTitle>
                {plan.network.toUpperCase()} {plan.data}
              </CardTitle>
              <CardDescription>{plan.type}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(plan.amount, 2)}
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.availability}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <span className="font-medium">{plan.data}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Data
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">
                    {plan.network.toUpperCase()}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Network
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">{plan.type}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Type
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={() => {
                  setDataPlan(plan);
                }}
                className="flex-1 rounded-none"
                variant="outline"
              >
                Edit
              </Button>
              <Button variant="destructive" asChild>
                <Button
                  onClick={() => setDataPlan(plan)}
                  size="sm"
                  className="rounded-none h-[2.5rem] text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search plans..."
            className="pl-8 rounded-none h-[2.5rem]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <DropdownMenuLabel>Filter by Network</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNetworkFilter("mtn")}>
              MTN {network === "mtn" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNetworkFilter("airtel")}>
              Airtel {network === "airtel" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNetworkFilter("glo")}>
              Glo {network === "glo" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNetworkFilter("9mobile")}>
              9mobile {network === "9mobile" && "✓"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </form>

      <div className="rounded-none border relative">
        {isLoading && !initialLoad && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Network</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No data plans found
                </TableCell>
              </TableRow>
            ) : (
              dataPlans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell className="font-medium">
                    {plan.network.toUpperCase()}
                  </TableCell>
                  <TableCell>{plan.data}</TableCell>
                  <TableCell>{formatCurrency(plan.amount, 2)}</TableCell>
                  <TableCell>{plan.type}</TableCell>
                  <TableCell>
                    <Badge
                      className="rounded-none"
                      variant={plan.isPopular ? "default" : "secondary"}
                    >
                      {plan.availability}
                    </Badge>
                  </TableCell>
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
                            setDataPlan(plan);
                          }}
                        >
                          Edit plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDataId(plan._id!)}
                          className="text-destructive"
                        >
                          Delete plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>
              {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{" "}
            of <strong>{pagination.total}</strong> plans
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
