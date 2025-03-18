"use client";
import { formatDistanceToNow } from "date-fns";
import {
  BadgeCheck,
  BadgeX,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  Phone,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, errorMessage, formatCurrency, getInitials } from "@/lib/utils";
import { TransactionsList } from "@/components/dashboard/transaction-lists";
import { UserStatusBadge } from "@/components/dashboard/user-status-badge";
import type { dedicatedAccountNumber, IUser, transaction } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { UserActionButtons } from "@/components/dashboard/user-action-btn";
import { toast } from "sonner";

async function getUser(id: string) {
  const res = await api.get<{
    data: {
      user: IUser;
      transactions: transaction[];
      dedicatedAccount: dedicatedAccountNumber;
    };
  }>(`/admin/users/${id}`);

  return res.data;
}

export default function UserDetailsPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { isLoading, data: userData } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id as string),
    enabled: !!id,
  });

  const { user, transactions = [], dedicatedAccount } = userData?.data || {};

  const saveUserChanges = async (data: any) => {
    try {
      await api.patch(`/admin/users/${user?._id}/`, data);
      toast("User Info Has Been Updated");
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  const handleUserAction = async (
    action: string,
    userId: string,
    data?: any
  ) => {
    try {
      if (action === "edit") {
        await saveUserChanges(data);
      }

      if (action === "generateAccount") {
        await api.post(`/admin/users/generate-virtual-account/`, {
          userId: user?._id,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["user", id] });
      // Implementation would go here
      console.log(`Performing ${action} on user ${userId}`);
      return Promise.resolve();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (isLoading) {
    return <UserDetailsSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.fullName || "User Details"}
          </h1>
          <p className="text-muted-foreground">
            User details and transaction history
          </p>
        </div>
        {user?.status && <UserStatusBadge status={user.status} />}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Personal and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                <p className="text-muted-foreground">{user?.auth?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      user?.role === "admin" ? "destructive" : "secondary"
                    }
                    className="rounded-none capitalize"
                  >
                    {user?.role}
                  </Badge>
                  {user?.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Joined{" "}
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user?.phoneNumber}</span>
                {user?.isPhoneVerified ? (
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <BadgeX className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{user?.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {user?.balance !== undefined
                    ? formatCurrency(user.balance, 2)
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{user?.hasSetPin ? "PIN Set" : "PIN Not Set"}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex flex-col items-center">
                <Badge
                  variant={user?.isEmailVerified ? "success" : "destructive"}
                  className="mb-2 rounded-none"
                >
                  {user?.isEmailVerified ? "Verified" : "Unverified"}
                </Badge>
                <span className="text-xs text-muted-foreground">Email</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge
                  variant={user?.isPhoneVerified ? "success" : "destructive"}
                  className="mb-2 rounded-none"
                >
                  {user?.isPhoneVerified ? "Verified" : "Unverified"}
                </Badge>
                <span className="text-xs text-muted-foreground">Phone</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge
                  variant={user?.hasSetPin ? "success" : "destructive"}
                  className="mb-2 rounded-none"
                >
                  {user?.hasSetPin ? "Set" : "Not Set"}
                </Badge>
                <span className="text-xs text-muted-foreground">PIN</span>
              </div>
            </div>

            {user && (
              <UserActionButtons
                user={user}
                onAction={handleUserAction}
                userAccount={dedicatedAccount}
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Overview of account activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-none">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="mt-2 font-semibold text-xl">
                      {user?.balance !== undefined
                        ? formatCurrency(user.balance, 2)
                        : "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Current Balance
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-none">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="mt-2 font-semibold text-xl">
                      {transactions?.length || 0}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total Transactions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {transactions && transactions.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Transaction Summary</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-3 bg-muted rounded-none">
                    <Badge variant="success" className="mb-2 rounded-none">
                      Success
                    </Badge>
                    <span className="text-lg font-semibold">
                      {
                        transactions.filter((t) => t.status === "success")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-none">
                    <Badge variant="destructive" className="mb-2 rounded-none">
                      Failed
                    </Badge>
                    <span className="text-lg font-semibold">
                      {transactions.filter((t) => t.status === "failed").length}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-none">
                    <Badge variant="warning" className="mb-2 rounded-none">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                    <span className="text-lg font-semibold">
                      {
                        transactions.filter((t) => t.status === "pending")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="rounded-none">
          <TabsTrigger value="all" className="rounded-none">
            All Transactions
          </TabsTrigger>
          <TabsTrigger value="funding" className="rounded-none">
            Funding
          </TabsTrigger>
          <TabsTrigger value="airtime" className="rounded-none">
            Airtime
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-none">
            Data
          </TabsTrigger>
          <TabsTrigger value="bill" className="rounded-none">
            Bills
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <TransactionsList transactions={transactions} />
        </TabsContent>
        <TabsContent value="funding">
          <TransactionsList
            transactions={
              transactions?.filter((t) => t.type === "funding") || []
            }
          />
        </TabsContent>
        <TabsContent value="airtime">
          <TransactionsList
            transactions={
              transactions?.filter((t) => t.type === "airtime") || []
            }
          />
        </TabsContent>
        <TabsContent value="data">
          <TransactionsList
            transactions={transactions?.filter((t) => t.type === "data") || []}
          />
        </TabsContent>
        <TabsContent value="bill">
          <TransactionsList
            transactions={transactions?.filter((t) => t.type === "bill") || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Personal and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32 mt-2" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Overview of account activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="rounded-none">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                      <Skeleton className="h-6 w-24 mx-auto mt-2" />
                      <Skeleton className="h-4 w-32 mx-auto mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
