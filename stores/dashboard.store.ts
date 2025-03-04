import { dashboardStore } from "@/types";
import { create } from "zustand";

export const useDashboard = create<dashboardStore>((set) => ({
  title: "Hello",
  setTitle(title) {
    set((state) => ({
      ...state,
      title,
    }));
  },
}));
