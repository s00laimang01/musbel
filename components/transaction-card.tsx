"use client";

import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCardIcon,
  FileTextIcon,
  PhoneIcon,
  WifiIcon,
} from "lucide-react";
import { PATHS, transaction, transactionType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TransactionCardProps {
  transaction?: transaction | null;
  isLoading?: boolean;
}

export default function TransactionCard({
  transaction,
  isLoading = false,
}: TransactionCardProps) {
  const r = useRouter();
  const [lastTx, setLastTx] = useState<transaction | null>(transaction || null);

  useEffect(() => {
    if (transaction) {
      setLastTx(transaction);
    }
  }, [transaction]);

  if (isLoading) {
    return (
      <div className="mt-2 px-4 py-3 bg-gray-50 rounded-none animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!lastTx) {
    return (
      <div className="mt-2 px-4 py-3 bg-gray-50 rounded-lg">
        <p className="text-gray-400 text-sm">No recent transactions</p>
      </div>
    );
  }

  // Format date
  const formattedDate = lastTx.createdAt
    ? new Date(lastTx.createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  // Get transaction icon based on type
  const getTransactionIcon = () => {
    switch (lastTx.type) {
      case "funding":
        return <ArrowDownIcon className="w-4 h-4 text-green-500" />;
      case "airtime":
        return <PhoneIcon className="w-4 h-4 text-blue-500" />;
      case "data":
        return <WifiIcon className="w-4 h-4 text-blue-500" />;
      case "bill":
        return <FileTextIcon className="w-4 h-4 text-orange-500" />;
      case "recharge-card":
        return <CreditCardIcon className="w-4 h-4 text-purple-500" />;
      case "exam":
        return <FileTextIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <ArrowUpIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (lastTx.status) {
      case "success":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // Format transaction type for display
  const formatType = (type: transactionType) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const goToTransaction = () => {
    r.push(PATHS.TRANSACTIONS + `?tx_ref=${transaction?.tx_ref}`);
  };

  return (
    <div
      onClick={goToTransaction}
      className="mt-2 px-4 py-3 bg-gray-50 rounded-none"
    >
      <p className="text-xs text-gray-400 font-bold mb-1">Transaction</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            {getTransactionIcon()}
          </div>
          <div>
            <p className="text-sm font-medium">{formatType(lastTx.type)}</p>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-bold ${
              lastTx.type === "funding" ? "text-green-500" : "text-red-500"
            }`}
          >
            {lastTx.type === "funding" ? "+" : "-"}
            {formatCurrency(lastTx.amount, 2)}
          </p>
          <p className={`text-xs ${getStatusColor()}`}>
            {lastTx.status.charAt(0).toUpperCase() + lastTx.status.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
