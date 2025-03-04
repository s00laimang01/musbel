"use client";

import BalanceCard from "@/components/balance-card";
import Empty from "@/components/empty";
import { FeatureCard } from "@/components/features";
import RecentActivity from "@/components/recent-activities";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavBar } from "@/hooks/use-nav-bar";
import { Utilities } from "@/lib/constants";
import Link from "next/link";
import React from "react";

const Page = () => {
  useNavBar("Utility Payments");
  return (
    <div className="space-y-4">
      <BalanceCard />
      <Input
        className="w-full h-[3rem] rounded-sm placeholder:text-lg"
        placeholder="Search"
      />
      <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
        {Utilities.map((utility, idx) => (
          <Link href={utility.path} key={idx}>
            <FeatureCard
              className="rounded-none hover:text-primary"
              description=""
              icon={utility.icon}
              title={utility.label}
            />
          </Link>
        ))}
      </div>
      <div className="w-full border" />
      <div className="space-y-3">
        <h2 className=" tracking-tight text-xl font-semibold text-primary">
          RECENT TRANSACTIONS
        </h2>
        <Empty header="You have no utilities transactions" />
      </div>
    </div>
  );
};

export default Page;
