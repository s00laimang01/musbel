import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getInitials, getNetworkLogo } from "@/lib/utils";
import { dataPlan, transaction } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { configs } from "@/lib/constants";
import { Skeleton } from "./ui/skeleton";
import React from "react";

export function TransactionReceiptSkeleton() {
  return (
    <Card className="w-full rounded-none bg-white text-slate-900 border-gray-700 overflow-hidden py-0">
      <CardContent className="p-0 rounded-none">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-700 relative">
          <div className="flex justify-center mb-4">
            <div className="text-primary font-bold text-xl flex items-center gap-2">
              <Avatar>
                <Skeleton className="h-10 w-10 rounded-full" />
              </Avatar>
              {configs.appName}
            </div>
          </div>

          <div className="w-full flex items-center justify-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>

          <Skeleton className="h-8 w-32 mx-auto mb-2" />
          <Skeleton className="h-6 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-36 mx-auto" />
        </div>

        {/* Transaction Details */}
        <div className="p-6 space-y-4">
          {/* Skeleton rows for transaction details */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 text-center space-y-2 border-t border-gray-700">
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-4 w-44 mx-auto" />
          <Skeleton className="h-4 w-52 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionReceipt(
  transaction: transaction,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { data: session } = useSession();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: transaction["status"]) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getTransactionTypeDisplay = (type: transaction["type"]) => {
    switch (type) {
      case "funding":
        return "Wallet Funding";
      case "airtime":
        return "Top up Airtime";
      case "data":
        return "Data Bundle";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Card
      ref={ref}
      className="w-full rounded-none bg-white text-slate-900 border-gray-700 overflow-hidden py-0"
    >
      <CardContent className="p-0 rounded-none">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-700 relative">
          <div className="flex justify-center mb-4">
            <div className="text-green-800 font-bold text-xl flex items-center gap-2">
              <Avatar className="shadow-md">
                <AvatarImage src="/kinta-sme-logo.jpg" />
                <AvatarFallback className="bg-primary">
                  {getInitials("KintaSme")}
                </AvatarFallback>
              </Avatar>
              {configs.appName}
            </div>
          </div>

          {/* Provider Logo for airtime/data */}
          {(transaction.type === "airtime" || transaction.type === "data") && (
            <div className="w-full flex items-center justify-center">
              <Image
                src={getNetworkLogo(
                  (transaction.meta as dataPlan).network || "Mtn"
                )}
                alt="Provider Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
            </div>
          )}

          <div className="text-3xl font-bold text-green-800 mb-2">
            {formatCurrency(transaction.amount)}
          </div>
          <div
            className={`text-lg font-medium ${getStatusColor(
              transaction.status
            )}`}
          >
            {transaction.status === "success"
              ? "Successful transaction"
              : transaction.status === "failed"
              ? "Failed transaction"
              : "Pending transaction"}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {formatDate(transaction.createdAt)}
          </div>

          {/* Decorative border */}
        </div>

        {/* Transaction Details */}
        <div className="p-6 space-y-4">
          {/* Common Fields */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction Type</span>
            <span className="text-slate-950 font-medium">
              {getTransactionTypeDisplay(transaction.type)}
            </span>
          </div>

          {/* Funding-specific fields */}
          {transaction.type === "funding" && transaction.meta && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Account Number</span>
                <span className="text-slate-950 font-mono">
                  {transaction.meta.account_number}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Account Name</span>
                <span className="text-slate-950 text-right">
                  {transaction.meta.account_name}
                </span>
              </div>
            </>
          )}

          {/* Airtime-specific fields */}
          {transaction.type === "airtime" && transaction.meta && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Bill Provider</span>
                <span className="text-slate-950 font-medium">
                  {transaction.meta.network || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Recipient Mobile Number</span>
                <span className="text-slate-950 font-mono">
                  {Object.keys(transaction.meta.vendReport)[0]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order Amount</span>
                <span className="text-slate-950 font-medium">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              {transaction.meta?.kintaSmePointsEarned && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">PayPoints Earned</span>
                  <span className="text-green-400 font-medium">
                    + {transaction.meta.kintaSmePointsEarned}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payer Mobile Number</span>
                <span className="text-slate-950 font-mono">
                  {transaction.meta?.payerNumber || session?.user?.phoneNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payer Name</span>
                <span className="text-slate-950">
                  {transaction.meta?.payerName || session?.user?.name}
                </span>
              </div>
            </>
          )}

          {/* Data-specific fields */}
          {transaction.type === "data" && transaction.meta && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Bill Provider</span>
                <span className="text-slate-950 font-medium">
                  {transaction?.meta?.network}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Recipient Mobile Number</span>
                <span className="text-slate-950 font-mono">
                  {transaction?.meta?.phoneNumber ||
                    Object.keys(
                      transaction.meta?.vendingResponse?.vendReport
                    )[0]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Account Name</span>
                <span className="text-slate-950 text-right">
                  {transaction.meta?.payerName || session?.user?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order Amount</span>
                <span className="text-slate-950 font-medium">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Amount</span>
                <span className="text-slate-950 font-medium">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Item</span>
                <span className="text-slate-950 text-right">
                  {`${transaction.meta?.data} - ${transaction.meta?.availability}` ||
                    "Unknown"}
                </span>
              </div>
              {transaction.meta.completionTime && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completion Time</span>
                  <span className="text-slate-950">
                    {transaction.meta.completionTime}
                  </span>
                </div>
              )}
              {transaction.meta.customerPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Customer Phone</span>
                  <span className="text-slate-950 font-mono">
                    {transaction.meta.customerPhone}
                  </span>
                </div>
              )}
              {transaction.meta.applicableCountry && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Applicable Country</span>
                  <span className="text-slate-950">
                    {transaction.meta.applicableCountry}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Common bottom fields */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction ID</span>
            <span className="text-slate-950 font-mono text-sm">
              {transaction.tx_ref}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction Time</span>
            <span className="text-slate-950">
              {formatDate(transaction.createdAt)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Payment Method</span>
            <span className="text-slate-950 font-medium">
              {transaction.paymentMethod}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Status</span>
            <span
              className={`font-medium ${getStatusColor(transaction.status)}`}
            >
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-gray-400 border-t border-gray-700">
          <p className="mb-1">Data, Airtime, Funding and Bill Payment</p>
          <p className="mb-1">No Funding Percentage</p>
          <p className="mb-1">Secure and fast processing</p>
          <p className="text-green-500 font-medium">
            Thank you for choosing KintaSME!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

TransactionReceipt.displayName = "TransactionReceipt";

export default React.forwardRef<HTMLDivElement, transaction>(
  TransactionReceipt
);
