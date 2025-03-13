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
import { Skeleton } from "@/components/ui/skeleton";
import VerifyEmail from "@/components/verify-email";
import VerifyingPayment from "@/components/verifying-payment";
import { useNavBar } from "@/hooks/use-nav-bar";
import { api, errorMessage, getDedicatedAccount } from "@/lib/utils";
import {
  createOneTimeVirtualAccountResponse,
  dedicatedAccountNumber,
  transaction,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const titles = ["Top Up", "Amount", "Review", "Awaiting Payment"];
  const [step, setStep] = useState(0);
  useNavBar(titles[step]);

  const r = useRouter();
  const q = useSearchParams();
  const { data: session } = useSession();
  const [open, setOpen] = useState(true);
  const [virtualAccount, setVirtualAccount] =
    useState<createOneTimeVirtualAccountResponse>();
  const [isPending, startTransition] = useState(false);
  const [data, setData] = useState({
    useVBT: true,
    amount: 0,
    iHaveMadePayment: false,
    expiryTime: "",
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
        const res = await api.post<{
          data: createOneTimeVirtualAccountResponse;
        }>(`/account/bank/create-transaction-charge/`, {
          amount: data.amount,
        });

        setVirtualAccount(res.data.data);
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);

        setData({ ...data, expiryTime: now.toISOString() });

        r.push(`?tx_ref=${res.data.data.tx_ref}`);

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

  const sendVerificationCode = async () => {
    try {
      await api.post(`users/me/verify-account/`, { type: "email" });

      toast.success("Verification code sent successfully");
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  const disableBtn: Record<number, boolean> = {
    0: !data.useVBT,
    1: data.amount < 100,
    2: false,
    3: false,
  };

  const { data: _data } = useQuery({
    queryKey: ["transaction", q.get("tx_ref")],
    queryFn: async () =>
      (
        await api.get<{
          data: transaction<{
            expirationTime: string;
            accountNumber: string;
            accountName: string;
            bankName: string;
          }>;
        }>(`/transactions/get-transaction?tx_ref=${q.get("tx_ref")}`)
      ).data,
    enabled: Boolean(q.get("tx_ref") && !virtualAccount),
  });

  const { data: transaction } = _data || {};

  const { isLoading, data: __data } = useQuery({
    queryKey: ["get-dedicated-account"],
    queryFn: getDedicatedAccount,
    refetchInterval: 5000,
  });

  const { data: account } = __data || {};

  console.log({ account });

  useEffect(() => {
    if (transaction) {
      setStep(3);
      setOpen(true);

      setData({
        ...data,
        expiryTime: transaction.meta?.expirationTime!,
        amount: transaction.amount,
      });

      setVirtualAccount({
        data: {
          account_name: transaction.meta?.accountName!,
          account_number: transaction.meta?.accountNumber!,
          bank_name: transaction.meta?.bankName!,
        },
        message: "Virtual account generated successfully",
        status: true,
      });
    }
  }, [transaction]);

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

      {isLoading ? (
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
                <VerifyEmail email={session?.user.email!}>
                  <Button
                    onClick={sendVerificationCode}
                    className="rounded-sm bg-white/20 hover:bg-white/30"
                  >
                    VERIFY EMAIL
                  </Button>
                </VerifyEmail>
              )}
            </div>
            <Text className="text-white/80">
              {account?.accountDetails.accountName || "EMAIL NOT YET VERIFIED"}
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
          <h2 className="text-5xl font-semibold">{data?.amount.toFixed(2)}</h2>
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
          <h3>0.00</h3>
        </div>
        <div className="flex items-center justify-between pb-5">
          <Text className="text-xs">AMOUNT TO PAY</Text>
          <h3>{data.amount.toFixed(2)}</h3>
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
                    NGN {data.amount}
                  </h2>
                  <p className="text-sm text-slate-500">FUND ACCOUNT</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center p-8 pt-12 pb-6">
                <p className="text-xl font-medium">
                  Transfer{" "}
                  <span className="text-primary font-semibold">
                    NGN {data.amount}
                  </span>
                </p>
                <p className="text-xl font-medium mb-10">
                  to the account number displayed below
                </p>

                <p className="text-sm text-slate-700 font-medium mb-2">
                  {virtualAccount?.data.bank_name}
                </p>
                <div className="flex items-center mb-4">
                  <span className="text-primary text-4xl font-semibold">
                    {virtualAccount?.data.account_number}
                  </span>
                  <button
                    onClick={() =>
                      copyAccountNumber(virtualAccount?.data.account_number)
                    }
                    className="ml-2"
                  >
                    <Copy className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                <p className="text-sm text-slate-700 font-medium mb-2">
                  {virtualAccount?.data.account_name}
                </p>

                <p className="text-slate-600 text-sm">
                  Use this account for this transaction only.
                </p>
                <p className="text-slate-600 text-sm">
                  Account expires by{" "}
                  <span className="text-primary">{data.expiryTime}</span>
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
