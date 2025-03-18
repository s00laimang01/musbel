"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Download,
  Loader2,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/utils";

interface BillDetails {
  id: string;
  customer: string;
  customerEmail: string;
  amount: number;
  usage: number;
  status: string;
  dueDate: string;
  meterNumber: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  note: string;
}

export default function BillDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;

  const {
    data: bill,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bill", billId],
    queryFn: async () => {
      const response = await fetch(`/api/electricity-bills/${billId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bill details");
      }
      return response.json() as Promise<BillDetails>;
    },
  });

  const handleMarkAsPaid = async () => {
    try {
      await api.patch(`/api/admin/electricity/${billId}`, {
        status: "success",
      });

      toast("The bill has been marked as paid.");

      // Refresh the data
      router.refresh();
    } catch (error) {
      toast("There was an error processing your request.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading bill details...</p>
      </div>
    );
  }

  if (isError || !bill) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-destructive">
          Error loading bill details. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bills
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bill #{bill.id}</h1>
          <p className="text-muted-foreground">View and manage bill details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-none">
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          {bill.status !== "Paid" && (
            <Button className="rounded-none" onClick={handleMarkAsPaid}>
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
            <CardDescription>
              Details about this electricity bill
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge
                className="rounded-none"
                variant={
                  bill.status === "Paid"
                    ? "default"
                    : bill.status === "Pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {bill.status}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">${bill.amount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Usage</span>
              <span className="font-medium">{bill.usage} kWh</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {bill.dueDate}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium capitalize">
                {bill.paymentMethod}
              </span>
            </div>
            {bill.note && (
              <>
                <Separator />
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Note</span>
                  <span className="font-medium">{bill.note}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Details about the customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium flex items-center">
                <User className="h-4 w-4 mr-1" />
                {bill.customer}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{bill.customerEmail || "N/A"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Meter Number</span>
              <span className="font-medium">{bill.meterNumber || "N/A"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                {bill.provider || "N/A"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created Date</span>
              <span className="font-medium">
                {new Date(bill.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
