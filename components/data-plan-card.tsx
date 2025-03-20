"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2, Wifi } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import type { dataPlan, DataVendingResponse } from "@/types";
import { toast } from "sonner";
import EnterPin from "./enter-pin";
import { Switch } from "./ui/switch";
import { api, errorMessage } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export default function DataPlanCard({
  _id,
  phoneNumber,
  _isLoading = false,
  ...dataPlan
}: dataPlan & { phoneNumber?: string; _isLoading?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [byPassValidator, setByPassValidator] = useState(false);

  const handleBuyData = async (pin?: string) => {
    try {
      if (!phoneNumber) {
        return toast.error("Please provide a valid phone number");
      }

      setIsLoading(true);
      const payload = {
        pin,
        _id,
        phoneNumber,
        byPassValidator,
      };

      const res = await api.post<{
        data: DataVendingResponse;
        message: string;
      }>(`/purchase/data/`, payload);

      toast(res.data.message);
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (_isLoading) {
    return <Skeleton className="w-full h-[20rem]" />;
  }

  console.log({ dataPlan });

  return (
    <Card
      className={`w-full rounded-none overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl p-0 ${
        isLoading ? "opacity-80 pointer-events-none" : ""
      }`}
    >
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            <h3 className="font-bold text-lg">
              {dataPlan?.network.toUpperCase()}
            </h3>
          </div>
          {dataPlan.isPopular && (
            <Badge className="bg-yellow-400 text-black hover:bg-yellow-500">
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold mb-1">{dataPlan.data}</h2>
          <p className="text-sm text-muted-foreground">{dataPlan.type} Plan</p>
        </div>

        <div className="space-y-1 mt-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground text-sm">Price</span>
            <span className="font-semibold text-sm">₦{dataPlan.amount}</span>
          </div>
          <div className="flex justify-between w-full py-1 border-b gap-6">
            <span className="text-muted-foreground text-sm">Validity</span>
            <span className="font-semibold text-sm line-clamp-1">
              {dataPlan.availability}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-1 w-full">
        <EnterPin
          onVerify={handleBuyData}
          moreChild={
            <div className="w-full flex items-center justify-between pb-4">
              <h3 className="underline text-sm font-bold text-primary">
                ByPass Number Validator?
              </h3>

              <Switch
                checked={byPassValidator}
                onCheckedChange={setByPassValidator}
                disabled={isLoading}
              />
            </div>
          }
        >
          <Button
            className="w-full bg-green-600/80 hover:bg-primary/80 text-white rounded-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Buy Data"
            )}
          </Button>
        </EnterPin>
      </CardFooter>
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </Card>
  );
}
