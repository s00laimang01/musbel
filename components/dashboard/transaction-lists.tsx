"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowDownUp,
  CreditCard,
  FileText,
  Phone,
  Wifi,
  Receipt,
  BookOpen,
  DollarSign,
  Search,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PATHS, transaction } from "@/types";
import Link from "next/link";

interface TransactionsListProps {
  transactions: transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions =
    transactions?.filter(
      (transaction) =>
        transaction.tx_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.note &&
          transaction.note.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="mt-6 rounded-none">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No transactions found</h3>
          <p className="text-muted-foreground">
            This user hasn't made any transactions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm rounded-none"
        />
      </div>

      <Card className="rounded-none">
        <CardHeader className="pb-3">
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.tx_ref}>
                  <TableCell className="font-medium">
                    {transaction.createdAt
                      ? format(new Date(transaction.createdAt), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {transaction.tx_ref}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionTypeIcon(transaction.type)}
                      <span className="capitalize">{transaction.type}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={`font-medium ${
                      transaction.type === "funding" ? "text-green-600" : ""
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {transaction.paymentMethod
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href={`${PATHS.ADMIN_TRANSACTIONS + transaction._id}`}
                      >
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function getTransactionTypeIcon(type: string) {
  switch (type) {
    case "funding":
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case "airtime":
      return <Phone className="h-4 w-4 text-blue-500" />;
    case "data":
      return <Wifi className="h-4 w-4 text-purple-500" />;
    case "bill":
      return <Receipt className="h-4 w-4 text-orange-500" />;
    case "recharge-card":
      return <CreditCard className="h-4 w-4 text-indigo-500" />;
    case "exam":
      return <BookOpen className="h-4 w-4 text-teal-500" />;
    default:
      return <ArrowDownUp className="h-4 w-4 text-gray-500" />;
  }
}

function TransactionStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "success":
      return <Badge className="rounded-none">Success</Badge>;
    case "failed":
      return (
        <Badge className="rounded-none" variant="destructive">
          Failed
        </Badge>
      );
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
