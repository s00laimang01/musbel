import React from "react";
import { Card, CardContent, CardTitle } from "./ui/card";
import Text from "./text";
import {
  api,
  errorMessage,
  getDedicatedAccount,
  sendWhatsAppMessage,
} from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import VerifyEmail from "./verify-email";
import { useSession } from "next-auth/react";
import { Skeleton } from "./ui/skeleton";
import { useUserStore } from "@/stores/user.store";

const TopUpCard = () => {
  const { data: session } = useSession();
  const { user } = useUserStore();

  const { isLoading, data: __data } = useQuery({
    queryKey: ["get-dedicated-account"],
    queryFn: getDedicatedAccount,
    refetchInterval: 5000,
  });

  const { data: account } = __data || {};

  const copyAccountNumber = (text = "") => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard", {
        richColors: true,
        closeButton: true,
      });
    });
  };

  const sendVerificationCode = async () => {
    try {
      await api.post(`users/me/verify-account/`, { type: "email" });

      toast.success("Verification code sent successfully");
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[11rem]" />;
  }

  return (
    <Card className="bg-primary/80 rounded-sm mt-4">
      <CardContent className="space-y-3">
        <Text className="font-semibold text-white">
          {account?.accountDetails.bankName.toUpperCase()
            ? `Bank Name: ${account?.accountDetails.bankName.toUpperCase()}`
            : "ACCOUNT CREATION IN PROGRESS"}
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
          ) : !user?.isEmailVerified ? (
            <VerifyEmail email={session?.user.email!}>
              <Button
                onClick={sendVerificationCode}
                className="rounded-sm bg-white/20 hover:bg-white/30"
              >
                VERIFY EMAIL
              </Button>
            </VerifyEmail>
          ) : (
            <Button
              onClick={() =>
                sendWhatsAppMessage(
                  "2347040666904",
                  `I want to fund my account, my userId is ${user._id?.toString()}`
                )
              }
              className="rounded-sm bg-white/20 hover:bg-white/30"
            >
              MANUAL FUNDING
            </Button>
          )}
        </div>
        <Text className="text-white/80">
          {account?.accountDetails.accountName ||
            "WE WILL SEND YOU AN EMAIL WHEN YOUR ACCOUNT IS READY"}
        </Text>
      </CardContent>
    </Card>
  );
};

export default TopUpCard;
