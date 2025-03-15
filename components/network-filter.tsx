"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNetworkFilter } from "@/hooks/use-network-filter";
import { dataPlan } from "@/types";

export function NetworkFilter({ dataPlans }: { dataPlans: dataPlan[] }) {
  const { selectedNetwork, setSelectedNetwork } = useNetworkFilter();

  // Get unique networks
  const networks = Array.from(new Set(dataPlans.map((plan) => plan.network)));

  return (
    <div className="w-full sm:w-auto">
      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
        <SelectTrigger className="w-full capitalize rounded-none">
          <SelectValue className=" capitalize" placeholder="All Networks" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectItem value="all">All Networks</SelectItem>
          {networks.map((network) => (
            <SelectItem
              key={network}
              value={network}
              className="capitalize rounded-none"
            >
              {network}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
