"use client";

import BalanceCard from "@/components/balance-card";
import { FeatureCard } from "@/components/features";
import RecentActivity from "@/components/recent-activities";
import { Input } from "@/components/ui/input";
import { useNavBar } from "@/hooks/use-nav-bar";
import { Utilities } from "@/lib/constants";
import Link from "next/link";
import React from "react";

const Page = () => {
  useNavBar("Utility Payments");
  return (
    <div className="space-y-4">
      <BalanceCard flexBtn />
      <Input
        className="w-full h-[3rem] placeholder:text-lg rounded-none"
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
        <RecentActivity
          header="Recent Bill Transactions"
          transactionType="bill"
          description="An overview of the current status of your most recent bill transactions."
        />
      </div>
    </div>
  );
};

export default Page;
