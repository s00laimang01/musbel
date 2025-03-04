"use client";

import BalanceCard from "@/components/balance-card";
import PhoneNumberBadge from "@/components/phone-number-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavBar } from "@/hooks/use-nav-bar";
import {
  AVIALABLE_NETWORKS,
  DEMO_PHONE_NUMBERS,
  FREQUENTLY_PURCHASE_AIRTIME,
} from "@/lib/constants";
import { formatCurrency, getNetworkLogo } from "@/lib/utils";
import { availableNetworks } from "@/types";
import Image from "next/image";

import React, { useState } from "react";
import { toast } from "sonner";

const Page = () => {
  useNavBar("Buy Airtime");

  const [amount, setAmount] = useState(0);
  const [network, setNetwork] = useState<availableNetworks | null>(null);
  const balance = 0;

  const buyAirtime = (a?: number) => {
    if (balance < Number(a || amount)) {
      toast.error("INSUFFIENT_BALANCE: Please Fund Your Account!");
      return;
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <BalanceCard />
      </div>
      <div className="w-full border" />
      <div className="space-y-3">
        <h2 className="text-primary font-bold tracking-tight">NETWORKS</h2>
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
        <Input
          className="w-full h-[3.5rem] rounded-none placeholder:text-[1rem]"
          placeholder="Phone Number (+234)"
        />
        <div className="mt-4 space-y-1">
          <h2 className="font-bold text-primary tracking-tight">
            RECENTLY USED
          </h2>
          <div className="flex items-center overflow-auto gap-3">
            {DEMO_PHONE_NUMBERS.map((p, idx) => (
              <PhoneNumberBadge {...p} key={idx} />
            ))}
          </div>
        </div>
        <Input
          className="rounded-none h-[3.5rem] w-full placeholder:text-[1rem]"
          placeholder="AMOUNT"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {FREQUENTLY_PURCHASE_AIRTIME.map((amount) => (
          <Button
            key={amount}
            onClick={() => buyAirtime(amount)}
            variant="outline"
            className="rounded-none text-primary font-bold tracking-tight hover:text-white"
          >
            {formatCurrency(amount)}
          </Button>
        ))}
      </div>
      <Button
        onClick={() => buyAirtime(1000)}
        variant="ringHover"
        className="w-full h-[3rem] rounded-none"
      >
        BUY AIRTIME
      </Button>
    </div>
  );
};

export default Page;
