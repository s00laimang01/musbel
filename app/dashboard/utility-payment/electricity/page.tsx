"use client";

import BalanceCard from "@/components/balance-card";
import Text from "@/components/text";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useNavBar } from "@/hooks/use-nav-bar";
import {
  configs,
  FREQUENTLY_PURCHASE_ELECTRICITY_BILLS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, ChevronDown } from "lucide-react";
import React, { FC, ReactNode } from "react";

const SelectElectricityCompany: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className=" sr-only" />
        Compannies
      </DrawerContent>
    </Drawer>
  );
};

const SelectMeterType: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className=" sr-only" />
        Meter Type
      </DrawerContent>
    </Drawer>
  );
};

const Page = () => {
  useNavBar("Electricity Payments");
  return (
    <div className="space-y-5">
      <BalanceCard />
      <Card className="p-4 rounded-md">
        <CardContent className="p-0 space-y-2">
          <SelectElectricityCompany>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 cursor-pointer"
            >
              <h2 className="font-semibold">Select Electricity</h2>
              <ChevronDown className="text-primary " />
            </Button>
          </SelectElectricityCompany>
          <div className="border-b" />
          <CardDescription className=" tracking-tight">
            You can choose from above the name of the electricity provider you
            want to use for your electricity bill.
          </CardDescription>
        </CardContent>
      </Card>
      <Card className="p-4 rounded-md">
        <CardHeader className="p-0">
          <CardTitle className="tracking-tight text-sm text-primary/80">
            PAYMENT DETAILS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <SelectMeterType>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 cursor-pointer"
            >
              <h2 className="font-semibold">Select Meter Type</h2>
              <ChevronDown className="text-primary " />
            </Button>
          </SelectMeterType>
          <Separator />
          <Input
            className="w-full h-[3rem] rounded-sm"
            placeholder="METER NUMBER"
          />
          <Separator />
          <div className="flex items-center gap-2">
            <CheckCircle2 size={19} className="text-primary" />
            <Text className="font-bold tracking-tight">
              SULEIMAN GITSU ABUBAKAR
            </Text>
          </div>
        </CardContent>
      </Card>
      <Card className="p-4 rounded-md">
        <CardHeader className="p-0">
          <CardTitle className="tracking-tight text-sm text-primary/80">
            AMOUNT
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {FREQUENTLY_PURCHASE_ELECTRICITY_BILLS.map((amount) => (
              <Button
                variant="outline"
                className="rounded-sm text-primary hover:text-white"
                key={amount}
              >
                {formatCurrency(amount, 0)}
              </Button>
            ))}
          </div>
          <Separator />
          <form action="" className="p-1 w-full h-[3.5rem] relative">
            <Input placeholder="AMOUNT" className="rounded-none h-full" />
            <Text className="absolute right-3 top-4 text-primary text-sm font-semibold">
              NGN
            </Text>
          </form>
          <div className="flex items-center gap-2">
            <Text className="font-bold tracking-tight text-primary">
              SECURED BY {configs.appName}
            </Text>
          </div>
        </CardContent>
      </Card>
      <Button variant="ringHover" className="w-full h-[3rem] rounded-sm">
        PAY
      </Button>
    </div>
  );
};

export default Page;
