"use client";

import { create } from "zustand";

interface NetworkFilterState {
  selectedNetwork: string;
  setSelectedNetwork: (network: string) => void;
}

export const useNetworkFilter = create<NetworkFilterState>((set) => ({
  selectedNetwork: "",
  setSelectedNetwork: (network) => set({ selectedNetwork: network }),
}));
