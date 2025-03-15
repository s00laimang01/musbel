"use client";

import { DataPlanCalculator } from "@/components/data-plan-calculator";
import { DataPlanTable } from "@/components/data-plan-table";
import { NetworkFilter } from "@/components/network-filter";
import { TypeFilter } from "@/components/type-filter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavBar } from "@/hooks/use-nav-bar";
import { api } from "@/lib/utils";
import { dataPlan } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Calculator } from "lucide-react";
import React from "react";

const Page = () => {
  useNavBar("Data Plan Calculator");

  const { isLoading, data } = useQuery({
    queryKey: ["data-plans"],
    queryFn: () => api.get<{ data: dataPlan[] }>(`/create/data-plan/`),
  });

  const { data: _data } = data || {};

  const { data: dataPlans = [] } = _data || {};

  return (
    <main className="min-h-screen">
      <div className="">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Data Plan Pricing
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Compare data plans from different networks and calculate costs based
            on your needs
          </p>
        </header>

        <div className="gap-8">
          <div className="md:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <NetworkFilter dataPlans={dataPlans} />
              <TypeFilter dataPlans={dataPlans} />
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring hover:text-primary focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full items-center justify-start gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-white rounded-none"
                  >
                    <Calculator />
                    Calculator
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetTitle className="sr-only" />
                  <DataPlanCalculator dataPlans={dataPlans} />
                </SheetContent>
              </Sheet>
            </div>
            <DataPlanTable dataPlans={dataPlans} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
