"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dataPlan } from "@/types";
import Text from "./text";
import { formatCurrency } from "@/lib/utils";

export function DataPlanCalculator({ dataPlans }: { dataPlans: dataPlan[] }) {
  const [network, setNetwork] = useState<string>("");
  const [dataNeeded, setDataNeeded] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const networks = Array.from(new Set(dataPlans.map((plan) => plan.network)));

  const handleCalculate = () => {
    setIsCalculating(true);

    // Convert user input to GB for comparison
    const dataInGB = Number.parseFloat(dataNeeded);
    if (isNaN(dataInGB)) {
      setResults([]);
      setIsCalculating(false);
      return;
    }

    // Filter plans by network if selected
    let filteredPlans = [...dataPlans];
    if (network) {
      filteredPlans = filteredPlans.filter((plan) => plan.network === network);
    }

    // Convert plan data to GB for comparison
    const plansWithGB = filteredPlans.map((plan) => {
      const dataString = plan.data.toUpperCase();
      let dataValue = 0;

      if (dataString.includes("MB")) {
        dataValue = Number.parseFloat(dataString) / 1000; // Convert MB to GB
      } else if (dataString.includes("GB")) {
        dataValue = Number.parseFloat(dataString);
      }

      return {
        ...plan,
        dataInGB: dataValue,
      };
    });

    // Find plans that meet or exceed the user's data needs
    const suitablePlans = plansWithGB
      .filter((plan) => plan.dataInGB >= dataInGB)
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 5);

    setResults(suitablePlans);
    setIsCalculating(false);
  };

  return (
    <div className="sticky top-4 p-4 space-y-5">
      <header>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Data Plan Calculator
        </div>
        <Text>Find the best plan for your data needs</Text>
      </header>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="network">Network (Optional)</Label>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger id="network" className="rounded-none capitalize">
              <SelectValue placeholder="All Networks" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">All Networks</SelectItem>
              {networks.map((net) => (
                <SelectItem
                  key={net}
                  value={net}
                  className="capitalize rounded-none"
                >
                  {net}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="data-needed">Data Needed (GB)</Label>
          <Input
            id="data-needed"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="e.g. 2"
            value={dataNeeded}
            onChange={(e) => setDataNeeded(e.target.value)}
            className="rounded-none"
          />
        </div>
        <Button
          className="w-full rounded-none h-3[rem]"
          onClick={handleCalculate}
          variant="ringHover"
          disabled={isCalculating || !dataNeeded}
        >
          {isCalculating ? "Calculating..." : "Calculate"}
        </Button>
      </div>
      {results.length > 0 && (
        <footer className="flex flex-col">
          <div className="mb-2 text-sm font-medium">Recommended Plans:</div>
          <div className="w-full space-y-2">
            {results.map((plan) => (
              <div
                key={plan.planId}
                className="flex items-center justify-between rounded-none border p-3 text-sm"
              >
                <div>
                  <div className="font-medium capitalize">
                    {plan.network} - {plan.data}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {plan.type} • {plan.availability}
                  </div>
                </div>
                <div className="font-bold text-primary">
                  {formatCurrency(plan.amount, 2)}
                </div>
              </div>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
