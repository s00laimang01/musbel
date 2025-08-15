import { useDashboard } from "@/stores/dashboard.store";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";

export const useHealthChecker = async (type: "data" | "airtime" = "data") => {
  const { setNotification } = useDashboard();

  const { isLoading, isSuccess, data } = useQuery({
    queryKey: ["health-checker", type],
    queryFn: () =>
      axios.get<{ data: { successRate?: number; failureRate?: number } }>(
        `https://miscellaneous-kinta.vercel.app/api/health/${type}`
      ),
  });

  useEffect(() => {
    if (isLoading) return;

    if (!isSuccess) return;

    const showNotification =
      data?.data.data.failureRate! > data?.data.data.successRate!;

    setNotification(showNotification, {
      title: "Network Status",
      description:
        "The network for purchasing data might be a bit slow right now, but you can still try.",
      type: "pending",
    });
  }, [isLoading, isSuccess]);
};
