"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  User,
  XCircle,
} from "lucide-react";
import { formatCurrency, getTransactionById } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { paymentMethod, transactionStatus, transactionType } from "@/types";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const { isLoading, data, error } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId,
  });

  console.log({ data });
  const transaction = data?.data;

  const handleGoBack = () => {
    router.back();
  };

  // Helper function to render status badge
  const renderStatusBadge = (status: transactionStatus) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="rounded-none">
            <CheckCircle className="mr-1 h-3 w-3" />
            Successful
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="rounded-none">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="rounded-none">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-none">
            {status}
          </Badge>
        );
    }
  };

  // Helper function to render payment method
  const renderPaymentMethod = (method: paymentMethod) => {
    return (
      <Badge variant="outline" className="rounded-none">
        {method}
      </Badge>
    );
  };

  // Helper function to render transaction type
  const renderTransactionType = (type: transactionType) => {
    return (
      <Badge
        variant="outline"
        className="rounded-none bg-primary/10 text-primary"
      >
        {type}
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-none" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Card className="rounded-none border">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Transaction Details</h1>
        </div>

        <Alert variant="destructive" className="rounded-none">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load transaction details. Please try again."}
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          className="rounded-none"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // No data state
  if (!transaction) {
    return (
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Transaction Details</h1>
        </div>

        <Alert className="rounded-none">
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The transaction you are looking for could not be found.
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          className="rounded-none"
          onClick={handleGoBack}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Transaction Details</h1>
      </div>

      <Card className="rounded-none border py-0">
        <CardHeader className="border-b bg-primary/10 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                Transaction #{transaction.transaction_id}
              </CardTitle>
              <CardDescription>Reference: {transaction.tx_ref}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {renderStatusBadge(transaction.status)}
              {renderTransactionType(transaction.type)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Amount and Date Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Amount
              </h3>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Date & Time
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{format(new Date(transaction.createdAt), "PPP")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p>{format(new Date(transaction.createdAt), "p")}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">User Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </h4>
                </div>
                <p>{transaction.userfullName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h4>
                </div>
                <p>{transaction.userEmail}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </h4>
                <div>{renderPaymentMethod(transaction.paymentMethod)}</div>
              </div>
              {transaction.accountId && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Account ID
                  </h4>
                  <p>{transaction.accountId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          {transaction.note && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Notes</h3>
                <p className="text-muted-foreground">{transaction.note}</p>
              </div>
            </>
          )}

          {/* Meta Information */}
          {transaction.meta && Object.keys(transaction.meta).length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(transaction.meta).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </h4>
                      <p>
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="border-t bg-primary/10 flex flex-wrap gap-2 py-4">
          <Button variant="outline" className="rounded-none">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          {transaction.status === "success" && (
            <Button
              disabled
              variant="outline"
              className="rounded-none text-destructive hover:bg-destructive/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Refund Transaction
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
