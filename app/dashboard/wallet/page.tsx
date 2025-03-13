"use client";

import Empty from "@/components/empty";
import RecentActivity from "@/components/recent-activities";
import Text from "@/components/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthentication } from "@/hooks/use-authentication";
import { useNavBar } from "@/hooks/use-nav-bar";
import { sendWhatsAppMessage } from "@/lib/utils";
import { PATHS } from "@/types";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = () => {
  useNavBar("Wallet");
  const { user } = useAuthentication("me", 5000);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-primary/80 md:block hidden">
        WALLET
      </h2>
      <Card className="rounded-sm bg-primary/80">
        <CardContent>
          <h2 className="font-semibold text-white">BALANCE</h2>
          <div className="flex items-baseline">
            <span className="text-6xl font-bold text-white">
              {(user?.balance || 0).toFixed(2)}
            </span>
            <span className="ml-2 text-gray-200">NGN</span>
          </div>
          <div className="mt-6 flex items-center space-x-2">
            <Button
              asChild
              variant="ringHover"
              className="rounded-sm bg-white/20 hover:bg-white/30"
            >
              <Link href={PATHS.TOP_UP_ACCOUNT}>ADD MONEY</Link>
            </Button>
            <Button
              onClick={() =>
                sendWhatsAppMessage(
                  "+2347040666904",
                  `Hello, I would like to fund my account. My user ID is ${user?._id}, and I would like to fund my account with `
                )
              }
              className="rounded-sm bg-slate-900 hover:bg-slate-900/60"
            >
              FUND MANUALLY
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-primary/80">
          PAYMENT METHODS
        </h2>
        <div className="border" />
        <div className="flex items-center gap-2">
          <CreditCard size={80} className="text-primary" />
          <div>
            <h2 className="font-semibold">Available Funding Options</h2>
            <Text className="text-xs">
              You can fund your account using your dedicated account number or
              you can fund manually with us.
            </Text>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-primary/80">TRANSACTIONS</h2>
        <div className="border" />
        <RecentActivity
          header="Recent Fundings"
          transactionType="funding"
          description="An overview of the current status of your most recent funding transactions."
        />
      </div>
    </div>
  );
};

export default Page;
