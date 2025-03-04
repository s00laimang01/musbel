"use client";

import { PrivacyFooter } from "@/components/privacy-footer";
import { ScrollArea } from "@/components/scroll-area";
import Text from "@/components/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavBar } from "@/hooks/use-nav-bar";
import { configs } from "@/lib/constants";
import { Copy, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const titles = ["Top Up", "Amount", "Review"];
  const [step, setStep] = useState(0);
  useNavBar(titles[step]);

  const [open, setOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(538);

  // This is the count down of the time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // This function is use to buy car
  const copyAccountNumber = (text = "") => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard", {
        richColors: true,
        closeButton: true,
      });
    });
  };

  const onSubmit = () => {
    const stepCount = Math.min(3, step + 1);
    setOpen(stepCount === 3);
    setStep(stepCount);
  };

  const optionsList = (
    <div className="space-y-5">
      <header>
        <h2 className="text-3xl font-bold">
          How would you like to fund your account?
        </h2>
        <Text className="text-sm font-light">
          Transfer money to the bank account shown below or choose from any of
          the other options listed.
        </Text>
      </header>

      <Card className="bg-primary/80 rounded-sm mt-4">
        <CardContent className="space-y-3">
          <Text className="font-semibold text-white/80">
            PREMIUM TRUST BANK
          </Text>
          <div className="w-full flex items-center justify-between">
            <CardTitle className="text-4xl font-bold text-white">
              4051440580
            </CardTitle>
            <Button
              onClick={() => copyAccountNumber("4051440580")}
              className="rounded-sm bg-white/20 hover:bg-white/30"
            >
              Copy
            </Button>
          </div>
          <Text className="text-white/80">
            {configs.appName} / Suleiman Abubakar
          </Text>
        </CardContent>
      </Card>

      <div className="space-y-3 px-1">
        <Label
          htmlFor="virtualbank-transfer"
          className="flex items-center justify-between"
        >
          <Text>Virtual Bank Transfer</Text>
          <Checkbox id="virtualbank-transfer" className="rounded-full" />
        </Label>
        <div className="border" />
      </div>
    </div>
  );
  const amountToFund = (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold">
          How much are you adding to your account?
        </h2>
      </header>
      <form action="" className="p-1 w-full h-[4rem] relative">
        <Input
          //   value={100}
          placeholder="AMOUNT"
          className="rounded-none h-full"
        />
        <Text className="absolute right-3 top-4 text-primary text-lg font-semibold">
          NGN
        </Text>
      </form>
    </div>
  );
  const review = (
    <div className=" space-y-8">
      <header className="space-y-2">
        <h2 className="font-light text-sm text-primary">ADD FUNDS</h2>
        <div className="flex items-end gap-2">
          <h2 className="text-5xl font-semibold">100.00</h2>
          <Text>NGN</Text>
        </div>
      </header>
      <div className="divide-y flex flex-col gap-3">
        <div className="flex items-center justify-between pb-5">
          <Text className="text-xs">PAY WITH VIRTUAL</Text>
          <h3>Virtual Bank Transfer</h3>
        </div>
        <div className="flex items-center justify-between pb-5">
          <Text className="text-xs">AMOUNT TO ADD</Text>
          <h3>100.00</h3>
        </div>
        <div className="flex items-center justify-between pb-5">
          <Text className="text-xs">TRANSACTION FEES</Text>
          <h3>1.40</h3>
        </div>
        <div className="flex items-center justify-between pb-5">
          <Text className="text-xs">AMOUNT TO PAY</Text>
          <h3>101.40</h3>
        </div>
      </div>
    </div>
  );

  const completePayment = (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-[85%] md:max-w-lg rounded-none border-0 shadow-lg">
          <DialogTitle className="sr-only" />
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                NGN 101.40
              </h2>
              <p className="text-sm text-slate-500">FUND ACCOUNT</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center p-8 pt-12 pb-6">
            <p className="text-xl font-medium">
              Transfer{" "}
              <span className="text-primary font-semibold">NGN 101.40</span>
            </p>
            <p className="text-xl font-medium mb-10">
              to the account number displayed below
            </p>

            <p className="text-sm text-slate-700 font-medium mb-2">
              PAYSTACK-TITAN
            </p>
            <div className="flex items-center mb-4">
              <span className="text-primary text-4xl font-semibold">
                9900613124
              </span>
              <button
                onClick={() => copyAccountNumber("9900613124")}
                className="ml-2"
              >
                <Copy className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-600 text-sm">
              Use this account for this transaction only.
            </p>
            <p className="text-slate-600 text-sm">
              Account expires in{" "}
              <span className="text-primary">{formattedTime} mins</span>
            </p>
          </div>

          <div className="p-4">
            <Button
              onClick={() => {
                setStep(0);
                setOpen(false);
              }}
              variant="ringHover"
              className="w-full bg-primary hover:bg-primary/80 text-white py-6 rounded-none"
            >
              I HAVE SENT THE MONEY
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const multiSteps = [optionsList, amountToFund, review, completePayment];

  return (
    <div>
      <ScrollArea className="p-0 h-[73vh]">{multiSteps[step]}</ScrollArea>
      <footer className="space-y-2">
        <PrivacyFooter />
        <Button
          onClick={onSubmit}
          variant="ringHover"
          className="w-full h-[3rem] rounded-none"
        >
          CONTINUE
        </Button>
      </footer>
    </div>
  );
};

export default Page;
