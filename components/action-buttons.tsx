"use client";

import type React from "react";
import { Plus, ArrowDown, Search } from "lucide-react";
import { ActionButtonProps, PATHS } from "@/types";
import { useRouter } from "next/navigation";

function ActionButton({ icon, label, onClick = () => {} }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-6 w-full"
    >
      <div className="mb-2">{icon}</div>
      <span className="text-sm text-gray-800 font-bold">{label}</span>
    </button>
  );
}

export default function ActionButtons() {
  const n = useRouter();
  return (
    <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
      <ActionButton
        icon={<Plus className="h-6 w-6 text-gray-500" />}
        label="ADD MONEY"
        onClick={() => {
          n.push(PATHS.TOP_UP_ACCOUNT);
        }}
      />
      <ActionButton
        icon={<ArrowDown className="h-6 w-6 text-gray-500" />}
        label="BUY DATA"
        onClick={() => {
          n.push(PATHS.BUY_DATA);
        }}
      />
      <ActionButton
        icon={<Search className="h-6 w-6 text-gray-500" />}
        label="BUY AIRTIME"
        onClick={() => {
          n.push(PATHS.BUY_AIRTIME);
        }}
      />
    </div>
  );
}
