"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage, fetchUsers, getInitials } from "@/lib/utils";
import {
  PATHS,
  type accountStatus,
  type IUser,
  type IUserRole,
  type transactionStatus,
} from "@/types";
import { AddUserDialog } from "@/components/dashboard/create-user";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useState(false);

  // State
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<{
    status?: transactionStatus;
    role?: IUserRole;
  }>({});

  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users with React Query

  // React Query hook for fetching users
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", currentPage, debouncedSearchQuery, activeFilters],
    queryFn: () =>
      fetchUsers({
        currentPage,
        debouncedSearchQuery,
        status: activeFilters.status,
        role: activeFilters.role,
        limit,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  // Delete user mutation
  const blockUserMutation = useMutation({
    mutationFn: async (userId: string, options?: any) => {
      const status = options.status === "active" ? "inactive" : "active";

      const response = await api.patch<{ data: IUser }>(
        `/admin/users/${userId}`,
        { status }
      );

      return response.data;
    },
    onSuccess: () => {
      toast("User deleted successfully");
      // Invalidate and refetch users query
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      toast(errorMessage(err).message);
    },
  });

  const users = data?.data?.users || [];
  const total = data?.data?.total || 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFilter = (type: "status" | "role", value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage * limit < total) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(PATHS.ADMIN_USERS + userId);
  };

  const handleEditUser = (userId: string) => {
    // router.push(`/users/${userId}/edit`);
  };

  const handleChangeUserAccountStatus = async (
    userId: string,
    userAccountStatus: accountStatus
  ) => {
    try {
      startTransition(true);

      await api.patch(`/admin/users/${userId}`, {
        status: userAccountStatus === "active" ? "inactive" : "active",
      });

      queryClient.invalidateQueries({
        queryKey: ["users", currentPage, debouncedSearchQuery, activeFilters],
      });

      const message =
        userAccountStatus === "active"
          ? "User Account Has Been Banned"
          : "User Account Has Been Activated";

      toast(message);
    } catch (error) {
      toast.error(errorMessage(error).message);
      console.error("Error deleting user:", error);
    } finally {
      startTransition(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions.
          </p>
        </div>
        <AddUserDialog>
          <Button variant="ringHover" className="rounded-none">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </AddUserDialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 h-[2.5rem] rounded-none"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-none">
              Filter
              {(activeFilters.status || activeFilters.role) && (
                <Badge variant="secondary" className="ml-2 rounded-sm">
                  {Object.values(activeFilters).filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleFilter("status", "")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilter("status", "active")}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilter("status", "inactive")}
            >
              Inactive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleFilter("role", "")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilter("role", "user")}>
              User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilter("role", "admin")}>
              Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-destructive"
                >
                  Error loading users. Please try again.
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id!}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/" alt={user.fullName} />
                        <AvatarFallback>
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.auth.email}</TableCell>
                  <TableCell>
                    <Badge
                      className="rounded-none"
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className=" capitalize">{user.role}</TableCell>
                  <TableCell>{user.createdAt}</TableCell>
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
                          onClick={() => handleViewUser(user._id!)}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditUser(user._id!)}
                        >
                          Edit user
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            handleChangeUserAccountStatus(
                              user._id!,
                              user.status
                            )
                          }
                          disabled={isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {user.status === "active"
                                ? "Blocking..."
                                : "Unblocking..."}
                            </>
                          ) : user.status === "active" ? (
                            "Block user"
                          ) : (
                            "Unblock user"
                          )}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <strong>
            {users.length > 0 ? (currentPage - 1) * limit + 1 : 0}-
            {Math.min(currentPage * limit, total)}
          </strong>{" "}
          of <strong>{total}</strong> users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none hover:text-white hover:bg-primary text-primary"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none hover:text-white hover:bg-primary text-primary"
            onClick={handleNextPage}
            disabled={currentPage * limit >= total || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
