"use client";

import CreateDedicatedAccount from "@/components/create-dedicated-account";
import { PrivacyFooter } from "@/components/privacy-footer";
import { ScrollArea } from "@/components/scroll-area";
import Text from "@/components/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import VerifyingPayment from "@/components/verifying-payment";
import { useNavBar } from "@/hooks/use-nav-bar";
import { configs } from "@/lib/constants";
import { api, errorMessage, getDedicatedAccount } from "@/lib/utils";
import { dedicatedAccountNumber, VirtualAccountData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const titles = ["Top Up", "Amount", "Review", "Awaiting Payment"];
  const [step, setStep] = useState(0);
  useNavBar(titles[step]);

  const { data: session } = useSession();
  const [open, setOpen] = useState(true);
  const [account, setAccount] = useState<dedicatedAccountNumber>();
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccountData>();
  const [isPending, startTransition] = useState(false);
  const [data, setData] = useState({
    useVBT: true,
    amount: 0,
    iHaveMadePayment: false,
  });

  // This function is use to buy car
  const copyAccountNumber = (text = "") => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard", {
        richColors: true,
        closeButton: true,
      });
    });
  };

  const onSubmit = async () => {
    const stepCount = Math.min(3, step + 1);

    if (stepCount === 3) {
      try {
        startTransition(true);
        const res = await api.post<{ data: VirtualAccountData }>(
          `/account/bank/create-transaction-charge/`,
          {
            amount: data.amount,
          }
        );

        setVirtualAccount(res.data.data);

        toast.success(
          `Charge initiated successfully for - ${session?.user.name}`
        );

        setOpen(true);
        setStep(3);
      } catch (error) {
        toast.error(errorMessage(error).message);
        console.log(error);
      } finally {
        startTransition(false);
      }
    }

    if (stepCount !== 3) {
      setStep(stepCount);
    }
  };

  const disableBtn: Record<number, boolean> = {
    0: !data.useVBT,
    1: data.amount < 100,
    2: false,
    3: false,
  };

  const { isLoading, data: _data } = useQuery({
    queryKey: ["transaction-fess", data.amount],
    queryFn: async () =>
      api.get<{
        data: {
          currency: string;
          fee_type: string;
          fee: number;
        };
      }>(`/account/bank/get-transfer-fee?amount=${data.amount}`),
    enabled: Boolean(!disableBtn[1] && step === 2),
  });

  useEffect(() => {
    const init = async () => {
      startTransition(true);
      const account = await getDedicatedAccount();
      startTransition(false);
      if (account) {
        setAccount(account);
      }
    };

    init();
  }, []);

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

      {isPending ? (
        <Skeleton className="w-full h-[11rem]" />
      ) : (
        <Card className="bg-primary/80 rounded-sm mt-4">
          <CardContent className="space-y-3">
            <Text className="font-semibold text-white/80">
              {account?.accountDetails.bankName.toUpperCase() ||
                "USER ACCOUNT NOT VERIFIED"}
            </Text>
            <div className="w-full flex items-center justify-between">
              <CardTitle className="text-4xl font-bold text-white">
                {account?.accountDetails?.accountNumber || "N/A"}
              </CardTitle>
              {account?.hasDedicatedAccountNumber ? (
                <Button
                  onClick={() =>
                    copyAccountNumber(account.accountDetails.accountNumber)
                  }
                  className="rounded-sm bg-white/20 hover:bg-white/30"
                >
                  Copy
                </Button>
              ) : (
                <CreateDedicatedAccount>
                  <Button className="rounded-sm bg-white/20 hover:bg-white/30">
                    VERIFY ACCOUNT
                  </Button>
                </CreateDedicatedAccount>
              )}
            </div>
            <Text className="text-white/80">
              {account?.accountDetails.accountName ||
                "ACCOUNT NOT YET VERIFIED"}
            </Text>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 px-1">
        <Label
          htmlFor="virtualbank-transfer"
          className="flex items-center justify-between"
        >
          <Text>Virtual Bank Transfer</Text>
          <Checkbox
            id="virtualbank-transfer"
            className="rounded-full"
            checked={data.useVBT}
            onCheckedChange={(e: boolean) => setData({ ...data, useVBT: e })}
          />
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
          value={data.amount}
          onChange={(e) => {
            if (isNaN(Number(e.target.value))) return;
            setData({ ...data, amount: Number(e.target.value) });
          }}
          placeholder="AMOUNT"
          className="rounded-none h-full"
          inputMode="numeric"
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
          <h2 className="text-5xl font-semibold">{data.amount.toFixed(2)}</h2>
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
          <h3>{data.amount.toFixed(2)}</h3>
        </div>
        <div className="flex items-center justify-between pb-5">
          <Text className="text-xs">TRANSACTION FEES</Text>
          <h3>
            {isLoading
              ? "loading..."
              : (_data?.data?.data?.fee || 0).toFixed(2)}
          </h3>
        </div>
        <div className="flex items-center justify-between pb-5">
          <Text className="text-xs">AMOUNT TO PAY</Text>
          <h3>{(data.amount + (_data?.data?.data?.fee || 0)).toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );

  const completePayment = (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Dialog
        open={open}
        onOpenChange={(e) => {
          if (!e) {
            setStep(0);
            setData({ ...data, iHaveMadePayment: false });
            return;
          }

          setOpen(e);
        }}
      >
        <DialogContent className="p-0 overflow-hidden max-w-[85%] md:max-w-lg rounded-none border-0 shadow-lg">
          <DialogTitle className="sr-only" />
          {data.iHaveMadePayment ? (
            <VerifyingPayment
              paymentId={virtualAccount?.tx_ref!}
              onSuccess={() => {}}
              onFailure={() => {
                toast.error("Payment Verification failed");
              }}
            />
          ) : (
            <React.Fragment>
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    NGN {virtualAccount?.amount}
                  </h2>
                  <p className="text-sm text-slate-500">FUND ACCOUNT</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center p-8 pt-12 pb-6">
                <p className="text-xl font-medium">
                  Transfer{" "}
                  <span className="text-primary font-semibold">
                    NGN {virtualAccount?.amount}
                  </span>
                </p>
                <p className="text-xl font-medium mb-10">
                  to the account number displayed below
                </p>

                <p className="text-sm text-slate-700 font-medium mb-2">
                  {virtualAccount?.bank_name}
                </p>
                <div className="flex items-center mb-4">
                  <span className="text-primary text-4xl font-semibold">
                    {virtualAccount?.account_number}
                  </span>
                  <button
                    onClick={() =>
                      copyAccountNumber(virtualAccount?.account_number)
                    }
                    className="ml-2"
                  >
                    <Copy className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <p className="text-slate-600 text-sm">
                  Use this account for this transaction only.
                </p>
                <p className="text-slate-600 text-sm">
                  Account expires by{" "}
                  <span className="text-primary">
                    {virtualAccount?.expiry_date}
                  </span>
                </p>
              </div>

              <div className="p-4">
                <Button
                  onClick={() => {
                    setData({ ...data, iHaveMadePayment: true });
                  }}
                  variant="ringHover"
                  className="w-full bg-primary hover:bg-primary/80 text-white py-6 rounded-none"
                >
                  I HAVE SENT THE MONEY
                </Button>
              </div>
            </React.Fragment>
          )}
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
          disabled={disableBtn[step] || isPending}
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
