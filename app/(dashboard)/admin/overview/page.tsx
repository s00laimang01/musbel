"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/dashboard/overview";
import { RecentSales } from "@/components/dashboard/recent-sales";
import {
  ArrowUpRight,
  Users,
  CreditCard,
  DollarSign,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { isLoading, data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () =>
      await api.get<{
        data: {
          todaysPayment: number;
          totalDataPurchase: number;
          totalTransactions: string;
          users: number;
        };
      }>(`/admin/overview/`),
  });

  const { data: overviewData } = data || {};

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business metrics and performance.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 rounded-none">
        <TabsList className="rounded-none">
          <TabsTrigger value="overview" className="rounded-none">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-none">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-none">
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="rounded-none">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-[80px] mb-2" />
                        <Skeleton className="h-3 w-[120px]" />
                      </CardContent>
                    </Card>
                  ))}
              </>
            ) : (
              <>
                <Card className="rounded-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewData?.data.totalTransactions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> +20.1%
                      </span>{" "}
                      overall insight
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Data Purchase
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewData?.data.totalDataPurchase}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> +12.2%
                      </span>{" "}
                      overall insight
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewData?.data.users}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> +5.4%
                      </span>{" "}
                      overall insight
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Todays Payments
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewData?.data.todaysPayment}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> +19%
                      </span>{" "}
                      overall insight
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 rounded-none">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Monthly revenue and user growth.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="md:col-span-3 col-span-4 rounded-none">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Recent transactions from your customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-1">
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights about your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and view reports about your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Reports content will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
