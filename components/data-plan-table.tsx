"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
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
import { useNetworkFilter } from "@/hooks/use-network-filter";
import { useTypeFilter } from "@/hooks/use-type-filter";
import { dataPlan } from "@/types";

export function DataPlanTable({ dataPlans }: { dataPlans: dataPlan[] }) {
  const { selectedNetwork } = useNetworkFilter();
  const { selectedType } = useTypeFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("amount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort data plans
  const filteredPlans = dataPlans.filter((plan) => {
    const matchesNetwork = selectedNetwork
      ? plan.network === selectedNetwork
      : true;
    const matchesType = selectedType ? plan.type === selectedType : true;
    const matchesSearch = searchQuery
      ? plan.network.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.data.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.type.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesNetwork && matchesType && matchesSearch;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (sortField === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    }

    if (sortField === "data") {
      // Convert data to GB for sorting
      const getDataInGB = (dataStr: string) => {
        const dataString = dataStr.toUpperCase();
        if (dataString.includes("MB")) {
          return Number.parseFloat(dataString) / 1000; // Convert MB to GB
        } else if (dataString.includes("GB")) {
          return Number.parseFloat(dataString);
        }
        return 0;
      };

      const aValue = getDataInGB(a.data);
      const bValue = getDataInGB(b.data);

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // For other string fields
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPlans.length / itemsPerPage);
  const paginatedPlans = sortedPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field)
      return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search plans..."
          className="pl-8 rounded-none"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>

      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  className="flex h-8 items-center p-0 font-semibold"
                  onClick={() => handleSort("network")}
                >
                  Network
                  <SortIcon field="network" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex h-8 items-center p-0 font-semibold"
                  onClick={() => handleSort("data")}
                >
                  Data
                  <SortIcon field="data" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex h-8 items-center p-0 font-semibold"
                  onClick={() => handleSort("amount")}
                >
                  Price
                  <SortIcon field="amount" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  className="flex h-8 items-center p-0 font-semibold"
                  onClick={() => handleSort("type")}
                >
                  Type
                  <SortIcon field="type" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  className="flex h-8 items-center p-0 font-semibold"
                  onClick={() => handleSort("availability")}
                >
                  Validity
                  <SortIcon field="availability" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPlans.length > 0 ? (
              paginatedPlans.map((plan) => (
                <TableRow key={plan.planId}>
                  <TableCell className="capitalize">{plan.network}</TableCell>
                  <TableCell>{plan.data}</TableCell>
                  <TableCell className="font-medium">₦{plan.amount}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {plan.type}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {plan.availability}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No plans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredPlans.length)} of{" "}
            {filteredPlans.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
