"use client";

import { api, formatCurrency } from "@/lib/utils";
import type { ChartDataPoint } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function Overview() {
  const {
    isLoading,
    data: _data,
    error,
  } = useQuery({
    queryKey: ["overview"],
    queryFn: () =>
      api.get<{ data: ChartDataPoint[] }>(`/admin/overview/chart/`),
  });

  const { data: overviewData } = _data || {};

  const { data = [] } = overviewData || {};

  if (isLoading) {
    return (
      <div className="w-full h-[350px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
        <div className="flex-1 flex flex-col justify-end space-y-2">
          <div className="grid grid-cols-12 gap-2 items-end">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="col-span-2 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex gap-1">
                    <Skeleton
                      className={`w-full h-${
                        20 + Math.floor(Math.random() * 80)
                      }`}
                    />
                    <Skeleton
                      className={`w-full h-${
                        20 + Math.floor(Math.random() * 60)
                      }`}
                    />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
          </div>
          <div className="h-6 flex justify-between">
            <Skeleton className="h-3 w-[40px]" />
            <Skeleton className="h-3 w-[40px]" />
            <Skeleton className="h-3 w-[40px]" />
            <Skeleton className="h-3 w-[40px]" />
            <Skeleton className="h-3 w-[40px]" />
            <Skeleton className="h-3 w-[40px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            Failed to load chart data
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${formatCurrency(value)}`}
        />
        <Tooltip />
        <Bar
          dataKey="revenue"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Bar
          dataKey="users"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary/50"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
