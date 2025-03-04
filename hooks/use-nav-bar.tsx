import { useDashboard } from "@/stores/dashboard.store";
import { useEffect } from "react";

export const useNavBar = (title: string) => {
  const { setTitle } = useDashboard();

  useEffect(() => {
    setTitle(title);
  }, [title]);
};
