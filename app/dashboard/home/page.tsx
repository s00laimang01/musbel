"use client";

import ActionButtons from "@/components/action-buttons";
import Header from "@/components/dashboard-header";
import FeatureCards from "@/components/features";
import AppInstallDialog from "@/components/notify-user-about-app";
import RemindUserToVerifyEmail from "@/components/notify-user-to-verify-email";
import RecentActivity from "@/components/recent-activities";
import { RemindUserToRefer } from "@/components/refer-notifications";
import RemindUserToCreateTransactionPin from "@/components/remind-user-to-create-pin";
import SystemMessage from "@/components/system-message";
import TopUpCard from "@/components/top-up-card";
import TransactionCard from "@/components/transaction-card";
import { useAuthentication } from "@/hooks/use-authentication";
import { useNavBar } from "@/hooks/use-nav-bar";
import { api } from "@/lib/utils";
import { transaction } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Page = () => {
  const { user } = useAuthentication("me", 5000);

  useNavBar(`Hi ${user?.fullName.split(" ")[0]} 👋`);

  const { isLoading, data } = useQuery({
    queryKey: ["transactions", "last"],
    queryFn: () => api.get<{ data: transaction }>(`/transactions/last/`),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  const { data: transaction } = data?.data || {};

  const firstName = user?.fullName?.split(" ")[0];

  return (
    <main className="flex-1 md:p-8">
      <RemindUserToVerifyEmail />
      <RemindUserToCreateTransactionPin />
      <SystemMessage />
      <RemindUserToRefer />
      <AppInstallDialog />
      {/* Desktop Header - hidden on mobile */}
      <div className="hidden md:block">
        <Header
          name={firstName!}
          fullName={user?.fullName!}
          email={user?.auth.email!}
          balance={user?.balance.toFixed(2) || "0.00"}
        />
      </div>

      {/* Mobile Balance Display */}
      <div className="md:hidden mt-8">
        <div className="flex items-baseline">
          <span className="text-6xl font-bold text-primary">
            {user?.balance.toFixed(2)}
          </span>
          <span className="ml-2 text-gray-400">NGN</span>
        </div>
      </div>

      {transaction && (
        <TransactionCard isLoading={isLoading} transaction={transaction} />
      )}

      <TopUpCard />

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
