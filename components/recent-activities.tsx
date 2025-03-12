import Empty from "./empty";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/utils";
import { PATHS, transactionType, type transaction } from "@/types";
import TransactionCard from "./transaction-card";
import { Button } from "./ui/button";
import Link from "next/link";

export default function RecentActivity({
  transactionType,
  description = "An overview of the current status of your most recent transactions.",
  header = "Recent Transactions",
}: {
  transactionType?: transactionType;
  description?: string;
  header?: string;
}) {
  const { isLoading, data } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions({ limit: 10, type: transactionType }),
  });

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{header}</h2>
      <p className="text-gray-500 text-sm mb-6">{description}</p>

      <div>
        {isLoading ? (
          // Show loading skeletons when loading
          <div className="space-y-3">
            <TransactionCard isLoading={true} />
            <TransactionCard isLoading={true} />
            <TransactionCard isLoading={true} />
          </div>
        ) : !!data?.transactions?.length ? (
          <div>
            <div className="space-y-3">
              {data.transactions.map((transaction: transaction) => (
                <TransactionCard
                  key={transaction.tx_ref}
                  transaction={transaction}
                />
              ))}
            </div>
            <div className="flex w-full items-center justify-center mt-3">
              <Button asChild variant="link">
                <Link href={PATHS.TRANSACTIONS}>View all transactions</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}
