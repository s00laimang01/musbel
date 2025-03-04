"use client";

import ActionButtons from "@/components/action-buttons";
import Header from "@/components/dashboard-header";
import FeatureCards from "@/components/features";
import RecentActivity from "@/components/recent-activities";
import { useNavBar } from "@/hooks/use-nav-bar";
import React from "react";

const Page = () => {
  useNavBar("Hi Suleiman");
  return (
    <main className="flex-1 md:p-8">
      {/* Desktop Header - hidden on mobile */}
      <div className="hidden md:block">
        <Header
          name="Suleiman"
          fullName="Suleiman Abubakar"
          email="au611640@gmail.com"
          balance={"0.00"}
        />
      </div>

      {/* Mobile Balance Display */}
      <div className="md:hidden mt-8">
        <div className="flex items-baseline">
          <span className="text-6xl font-bold text-primary">0.00</span>
          <span className="ml-2 text-gray-400">NGN</span>
        </div>
      </div>

      <div className="mt-8 md:mt-12">
        <ActionButtons />
      </div>

      <div className="mt-6 md:mt-8">
        <FeatureCards />
      </div>

      <div className="mt-8">
        <RecentActivity />
      </div>
    </main>
  );
};

export default Page;
