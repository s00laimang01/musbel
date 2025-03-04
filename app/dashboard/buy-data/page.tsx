"use client";

import DataPlanCard from "@/components/data-plan-card";
import PhoneNumberBadge from "@/components/phone-number-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavBar } from "@/hooks/use-nav-bar";
import {
  AVIALABLE_NETWORKS,
  dataPlans,
  DEMO_PHONE_NUMBERS,
} from "@/lib/constants";
import { generateDate, getNetworkLogo, sortPlan } from "@/lib/utils";
import { availableNetworks, recentPurchaseNumbers } from "@/types";
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "motion/react";
import BalanceCard from "@/components/balance-card";

const Page = () => {
  useNavBar("Buy Data");
  const [network, setNetwork] = useState<availableNetworks | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <div className="w-full overflow-hidden">
      <div className=" overflow-y-auto">
        <div className="space-y-5 w-full">
          <BalanceCard />

          <div className="w-full p-1">
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number (+234)"
              className="h-[3.5rem] rounded-none placeholder:text-lg text-lg"
            />

            <div className="mt-4 space-y-1">
              <h2 className="font-bold text-primary tracking-tight">
                RECENTLY USED
              </h2>
              <div className="flex items-center overflow-auto gap-3">
                {DEMO_PHONE_NUMBERS.map((p, idx) => (
                  <PhoneNumberBadge
                    {...p}
                    key={idx}
                    onSelect={setPhoneNumber}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pb-3">
            <h2 className="font-bold tracking-tight text-primary">
              DATA PLANS
            </h2>
            <div className="flex items-center overflow-auto gap-3">
              {AVIALABLE_NETWORKS.map((n, idx) => (
                <Button
                  onClick={() => setNetwork(n)}
                  variant={network === n ? "default" : "secondary"}
                  size="sm"
                  key={idx}
                  className="gap-3 hover:bg-primary/80 hover:text-white border cursor-pointer flex items-center py-2 px-1 rounded-none w-[8rem] shrink-0"
                >
                  <Image
                    src={getNetworkLogo(n)}
                    alt={n}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {n.toUpperCase()}
                </Button>
              ))}
            </div>
            <div className="w-full border" />
            <motion.div
              layout
              transition={{
                default: { ease: "linear" },
                layout: { duration: 0.3 },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4"
            >
              {sortPlan(dataPlans || [], network || undefined).map(
                (plan, idx) => (
                  <DataPlanCard {...plan} key={idx} />
                )
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
