import { userStore } from "@/types";
import { create } from "zustand";

export const useUserStore = create<userStore>((set) => ({
  user: null,
  setUser(user) {
    set((state) => ({
      ...state,
      user,
    }));
  },
  getUserFirstName(fullName) {
    return fullName;
  },
}));
