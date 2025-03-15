"use client";

import { create } from "zustand";

interface TypeFilterState {
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export const useTypeFilter = create<TypeFilterState>((set) => ({
  selectedType: "",
  setSelectedType: (type) => set({ selectedType: type }),
}));
