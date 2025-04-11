"use client";

import BalanceCard from "@/components/balance-card";
import EnterPin from "@/components/enter-pin";
import { ScrollArea } from "@/components/scroll-area";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavBar } from "@/hooks/use-nav-bar";
import {
  configs,
  FREQUENTLY_PURCHASE_ELECTRICITY_BILLS,
  METER_TYPE,
} from "@/lib/constants";
import {
  _verifyMeterNumber,
  api,
  cn,
  errorMessage,
  formatCurrency,
} from "@/lib/utils";
import { electricity, meterType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "@uidotdev/usehooks";
import { CheckCircle2, ChevronDown, Loader2, XCircle } from "lucide-react";
import React, { FC, ReactNode, useState } from "react";
import { toast } from "sonner";

const SelectElectricityCompany: FC<{
  children: ReactNode;
  onSelect: (e: electricity) => void;
}> = ({ children, onSelect }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, data: electricity = [] } = useQuery({
    queryKey: ["electricity"],
    queryFn: async () =>
      (await api.get<{ data: electricity[] }>(`/create/electricity/`)).data
        .data,
    enabled: isOpen,
  });

  console.log(electricity);

  const content = (
    <div>
      <Input
        className="w-full h-[3rem] rounded-none"
        placeholder="Search Company"
      />
      <div className="w-full mt-3">
        {isLoading ? (
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="w-full h-[3rem] rounded-none" />
            <Skeleton className="w-full h-[3rem] rounded-none" />
            <Skeleton className="w-full h-[3rem] rounded-none" />
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full flex flex-col gap-5">
            {electricity?.map((e) => (
              <div
                key={e._id}
                className="w-full rounded-none text-left mb-3 flex flex-row gap-3 items-center justify-start h-[3rem] cursor-pointer hover:bg-primary/10 p-3"
                onClick={() => {
                  onSelect(e);
                  setIsOpen(false);
                }}
              >
                <div className="bg-primary/50">
                  <img
                    src={e.logoUrl!}
                    alt={e.discoName}
                    width={30}
                    height={30}
                  />
                </div>
                <Text>
                  {e.discoName} ({e.type.toUpperCase()})
                </Text>
              </div>
            ))}
          </ScrollArea>
        )}
      </div>
    </div>
  );

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader className="px-0 py-2">
            <DialogTitle className="font-bold text-lg underline text-primary">
              Select Electricity Comapany
            </DialogTitle>
          </DialogHeader>
          <DialogTitle className="sr-only" />
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="p-3">
        <DrawerHeader className="px-0 py-2">
          <DrawerTitle className="font-bold text-lg underline text-primary">
            Select Electricity Comapany
          </DrawerTitle>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  );
};

const Page = () => {
  useNavBar("Electricity Payments");
  const [electricity, setElectricity] = useState<electricity>();
  const [meterType, setMeterType] = useState<meterType>();
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [amount, setAmount] = useState<number>();
  const [isPending, startTransition] = useState(false);

  const {
    isLoading,
    data: meter,
    error: meterVerificationError,
  } = useQuery({
    queryKey: ["verify-meter-number", meterNumber, meterType, electricity],
    queryFn: async () => _verifyMeterNumber(meterNumber, electricity?._id!),
    enabled: Boolean(electricity && meterNumber?.length === 13),
  });

  console.log(meter);

  const purchaseElectricity = async (pin: string, _amount?: number) => {
    try {
      startTransition(true);
      const payload = {
        electricity: electricity?.discoId,
        meterType,
        meterNumber,
        amount: amount || _amount,
        pin,
        byPassValidator: true,
      };

      const res = await api.post<{ message: string }>(
        `/purchase/electricity/`,
        payload
      );
      toast(res.data.message);
      setMeterNumber("");
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      startTransition(false);
    }
  };

  return (
    <div className="space-y-5">
      <BalanceCard />
      <Card className="p-4 rounded-none">
        <CardContent className="p-0 space-y-2">
          <SelectElectricityCompany onSelect={setElectricity}>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 cursor-pointer rounded-none"
            >
              <div>
                {!electricity ? (
                  <h2 className="font-semibold">Select Electricity</h2>
                ) : (
                  <div className="w-full rounded-none text-left flex flex-row gap-3 items-center justify-start h-[3rem] cursor-pointer p-3">
                    <img
                      src={electricity.logoUrl!}
                      alt={electricity.discoName}
                      width={30}
                      height={30}
                    />
                    {electricity.discoName}
                  </div>
                )}
              </div>
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
      <Card className="p-4 rounded-none">
        <CardHeader className="p-0">
          <CardTitle className="tracking-tight text-sm text-primary/80">
            PAYMENT DETAILS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <Input
            onChange={(e) => {
              if (isNaN(Number(e.target.value))) return;

              setMeterNumber(e.target.value);
            }}
            value={meterNumber || ""}
            className="w-full h-[3rem] rounded-none"
            placeholder="METER NUMBER"
          />
          <Separator />
          {
            <div className="flex items-center gap-2">
              {meter &&
                (isLoading ? (
                  <Loader2 size={19} className="animate-spin text-primary" />
                ) : !meterVerificationError ? (
                  <CheckCircle2 size={19} className="text-primary" />
                ) : (
                  <XCircle size={19} className="text-destructive" />
                ))}
              <Text
                className={cn("font-bold tracking-tight", {
                  "text-destructive": meterVerificationError,
                  "text-primary": !meterVerificationError,
                })}
              >
                {isLoading
                  ? "VERIFYING..."
                  : !meterVerificationError
                  ? meter?.customerName?.toUpperCase()
                  : "SOMETHING WENT WRONG, PLEASE CONTINUE"}
              </Text>
            </div>
          }
        </CardContent>
      </Card>
      <Card className="p-4 rounded-none">
        <CardHeader className="p-0">
          <CardTitle className="tracking-tight text-sm text-primary/80">
            AMOUNT
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {FREQUENTLY_PURCHASE_ELECTRICITY_BILLS.map((amount) => (
              <EnterPin
                key={amount}
                onVerify={(pin) => {
                  purchaseElectricity(pin, amount);
                  setAmount(amount);
                }}
              >
                <Button
                  variant="outline"
                  className="rounded-none text-primary hover:text-white"
                >
                  {formatCurrency(amount, 0)}
                </Button>
              </EnterPin>
            ))}
          </div>
          <Separator />
          <form action="" className="p-1 w-full h-[3.5rem] relative">
            <Input
              value={amount || ""}
              onChange={(e) => {
                if (isNaN(Number(e.target.value))) return;
                setAmount(Number(e.target.value));
              }}
              placeholder="AMOUNT"
              className="rounded-none h-full"
            />
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
      <EnterPin onVerify={purchaseElectricity}>
        <Button
          disabled={isPending}
          variant="ringHover"
          className="w-full h-[3rem] rounded-none"
        >
          PAY
        </Button>
      </EnterPin>
    </div>
  );
};

export default Page;
