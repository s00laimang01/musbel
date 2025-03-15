"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTypeFilter } from "@/hooks/use-type-filter";
import { dataPlan } from "@/types";

export function TypeFilter({ dataPlans }: { dataPlans: dataPlan[] }) {
  const { selectedType, setSelectedType } = useTypeFilter();

  // Get unique plan types
  const types = Array.from(new Set(dataPlans.map((plan) => plan.type)));

  return (
    <div className="w-full sm:w-auto">
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-full rounded-none">
          <SelectValue placeholder="All Plan Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plan Types</SelectItem>
          {types.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
