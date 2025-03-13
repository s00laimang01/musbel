"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Text from "./text";
import { api } from "@/lib/utils";
import { transaction, VerifyingPaymentProps } from "@/types";

const VerifyingPayment: React.FC<VerifyingPaymentProps> = ({
  paymentId,
  onSuccess,
  onFailure,
}) => {
  const MAX_RETRY_TIME = 120; // 2 minutes in seconds
  const RETRY_INTERVAL = 5; // 5 seconds
  const MAX_RETRY_COUNT = Math.floor(MAX_RETRY_TIME / RETRY_INTERVAL);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  // Use React Query for payment verification
  const { data, isError, refetch } = useQuery({
    queryKey: ["paymentVerification", paymentId],
    queryFn: () =>
      api.get<{ data: transaction }>(
        `/transactions/get-transaction/?tx_ref=${paymentId}`
      ),
    retry: MAX_RETRY_COUNT,
    retryDelay: RETRY_INTERVAL * 1000,
    refetchInterval: (data) =>
      data?.state.data?.data.data.status === "success"
        ? false
        : RETRY_INTERVAL * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Handle success callback
  useEffect(() => {
    if (data?.data.data.status === "success") {
      onSuccess?.();
    }
  }, [data, onSuccess]);

  // Handle failure callback
  useEffect(() => {
    if (
      isError ||
      (elapsedTime >= MAX_RETRY_TIME && data?.data.data.status !== "success")
    ) {
      onFailure?.();
    }
  }, [isError, elapsedTime, data, onFailure]);

  // Update elapsed time and progress
  useEffect(() => {
    if (data?.data.data.status === "success" || isError) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= MAX_RETRY_TIME) {
          clearInterval(timer);
        }
        return newTime;
      });

      setProgress((prev) => {
        const newProgress = (elapsedTime / MAX_RETRY_TIME) * 100;
        return Math.min(newProgress, 100);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [elapsedTime, data, isError]);

  const getTimeRemaining = () => {
    const remaining = MAX_RETRY_TIME - elapsedTime;
    return remaining > 0 ? remaining : 0;
  };

  const getVerificationStatus = () => {
    if (data?.data.data.status === "success") return "success";
    if (isError || elapsedTime >= MAX_RETRY_TIME) return "failed";
    return "loading";
  };

  const status = getVerificationStatus();

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Payment Verification</h2>
        <Text className="text-sm">
          Verifying payment ID:{" "}
          <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            {paymentId}
          </span>
        </Text>
      </header>
      <div className="pt-7 pb-6">
        {status === "loading" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="sr-only">Verifying payment</span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">Verifying your payment</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we confirm your transaction
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Verification in progress
                </span>
                <span aria-live="polite" className="font-medium">
                  {getTimeRemaining()} seconds remaining
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label="Verification progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="rounded-full bg-green-50 p-3 dark:bg-green-900/20">
              <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-medium text-green-700 dark:text-green-400">
                Payment verified successfully!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your transaction has been confirmed and processed.
              </p>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="rounded-full bg-red-50 p-3 dark:bg-red-900/20">
              <XCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-medium text-red-700 dark:text-red-400">
                Verification failed
              </h3>
              <p className="text-sm text-muted-foreground">
                We couldn't verify your payment after multiple attempts.
              </p>
            </div>
          </div>
        )}
      </div>

      {status === "failed" && (
        <footer className="flex justify-center pt-2 pb-6">
          <Button
            onClick={() => refetch()}
            className="flex items-center gap-2 h-[3rem] rounded-none"
            aria-label="Try verifying payment again"
          >
            <AlertCircle className="h-4 w-4" />
            Try Again
          </Button>
        </footer>
      )}
    </div>
  );
};

export default VerifyingPayment;
