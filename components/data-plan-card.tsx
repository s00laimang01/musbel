"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { dataPlan } from "@/types";
import { toast } from "sonner";

export default function DataPlanCard(dataPlan: dataPlan) {
  const [isLoading, setIsLoading] = useState(false);
  const balance = 0;

  const handleBuyData = () => {
    if (balance < dataPlan.amount) {
      toast.error("INSUFFICIENT_BALANCE: Please Fund Your Account, Thank you!");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Data purchase successful!");
    }, 1500);
  };

  return (
    <Card className="w-full rounded-none overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl p-0">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            <h3 className="font-bold text-lg">{dataPlan?.network}</h3>
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
          <p className="text-sm text-muted-foreground">{dataPlan.type} plan</p>
        </div>

        <div className="space-y-1 mt-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground text-sm">Price</span>
            <span className="font-semibold text-sm">₦{dataPlan.amount}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground text-sm">Validity</span>
            <span className="font-semibold text-sm">
              {dataPlan.availability}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-1">
        <Button
          className="w-full bg-green-600/80 hover:bg-primary/80 text-white rounded-none"
          onClick={handleBuyData}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Buy Data"}
        </Button>
      </CardFooter>
    </Card>
  );
}
