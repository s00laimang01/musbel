"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Phone } from "lucide-react";
import BalanceCard from "@/components/balance-card";
import PhoneNumberBadge from "@/components/phone-number-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavBar } from "@/hooks/use-nav-bar";
import {
  AVIALABLE_NETWORKS,
  FREQUENTLY_PURCHASE_AIRTIME,
} from "@/lib/constants";
import {
  api,
  errorMessage,
  formatCurrency,
  getNetworkLogo,
  getRecentlyUsedContacts,
} from "@/lib/utils";
import type { AirtimeVendingResponse, IBuyVtuNetworks } from "@/types";
import EnterPin from "@/components/enter-pin";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "@/stores/user.store";

const Page = () => {
  useNavBar("Buy Airtime");

  const [amount, setAmount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState<IBuyVtuNetworks | null>(null);
  const [isPending, startTransaction] = useState(false);
  const [byPassValidator, setByPassValidator] = useState(false);
  const { user } = useUserStore();

  const { data: recentlyContact = [] } = useQuery({
    queryKey: ["recently-used"],
    queryFn: () => getRecentlyUsedContacts("airtime", 3),
  });

  const buyAirtime = async (a?: number, pin?: string) => {
    const idempotencyKey = `${
      user?._id
    }-airtime-${Date.now()}-${Math.random()}`;
    try {
      startTransaction(true);
      const amountToBuy = a || amount;

      if (!network) {
        toast.error("Please select a network provider");
        return;
      }

      if (!phoneNumber) {
        toast.error("Please enter a phone number");
        return;
      }

      const res = await api.post<{
        data: AirtimeVendingResponse;
        message: string;
      }>(`/purchase/airtime/`, {
        pin,
        amount: amountToBuy,
        network: network[0].toUpperCase() + network.slice(1).toLowerCase(),
        phoneNumber,
        byPassValidator,
        idempotencyKey,
      });

      toast(res.data.message);
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      startTransaction(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(Number(value));
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+]/g, "");
    setPhoneNumber(value);
  };

  const selectPhoneNumber = (number: string, network?: IBuyVtuNetworks) => {
    setPhoneNumber(number);
    setNetwork(network!);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="mb-4">
        <BalanceCard />
      </div>

      <div className="bg-muted/30 h-px w-full" />

      <section className="space-y-4">
        <h2 className="text-primary font-semibold text-sm tracking-wide">
          Select Network
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {AVIALABLE_NETWORKS.map((n, idx) => (
            <Button
              onClick={() => setNetwork(n)}
              variant={network === n ? "default" : "outline"}
              size="sm"
              key={idx}
              className={`gap-2 transition-all duration-200 rounded-none ${
                network === n ? "shadow-sm" : "hover:border-primary/50"
              }`}
            >
              <Image
                src={getNetworkLogo(n) || "/placeholder.svg"}
                alt={n}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="capitalize">{n}</span>
            </Button>
          ))}
        </div>
      </section>

      <Card className="shadow-sm border-muted/60 rounded-none">
        <CardContent className="p-4 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-muted-foreground"
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-10 h-11 rounded-none"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {recentlyContact.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Recently Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentlyContact.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      selectPhoneNumber(p?.meta?.recipients!, p.meta?.network)
                    }
                    className={`cursor-pointer transition-all duration-200 ${
                      phoneNumber === p?.meta?.recipients!
                        ? "ring-2 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <PhoneNumberBadge
                      //@ts-ignore
                      network={
                        //@ts-ignore
                        p.meta?.network?.[0].toUpperCase() +
                        //@ts-ignore
                        p?.meta?.network.slice(1).toLowerCase()
                      }
                      number={p?.meta?.payerNumber! || p?.meta?.customerPhone!}
                      dataPlan=""
                      amount={p.meta?.amount!}
                      date={p.lastUsed}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-muted-foreground"
            >
              Amount
            </label>
            <Input
              id="amount"
              value={amount > 0 ? amount : ""}
              onChange={handleAmountChange}
              className="h-11 rounded-none"
              placeholder="Enter amount"
            />
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Quick Amounts
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENTLY_PURCHASE_AIRTIME.map((amt) => (
            <EnterPin
              onVerify={(pin) => {
                setAmount(amt);
                buyAirtime(amt, pin);
              }}
              key={amt}
              moreChild={
                <div className="w-full flex items-center justify-between pb-4">
                  <h3 className="underline text-sm font-bold text-primary">
                    ByPass Number Validator?
                  </h3>

                  <Switch
                    checked={byPassValidator}
                    onCheckedChange={setByPassValidator}
                    disabled={isPending}
                  />
                </div>
              }
            >
              <Button
                disabled={isPending}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 hover:text-primary font-medium rounded-none"
              >
                {formatCurrency(amt)}
              </Button>
            </EnterPin>
          ))}
        </div>
      </section>

      <EnterPin onVerify={(pin) => buyAirtime(undefined, pin)}>
        <Button
          disabled={isPending}
          variant="ringHover"
          className="w-full h-12 mt-4 font-semibold shadow-sm transition-all duration-200 hover:shadow-md rounded-none"
        >
          Buy Airtime
        </Button>
      </EnterPin>
    </div>
  );
};

export default Page;
