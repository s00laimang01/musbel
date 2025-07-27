import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/utils";

export const useAuthentication = (key?: any, retry = 1000) => {
  //

  const {
    isLoading,
    data: user,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["user", key],
    queryFn: () => getUser(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  return {
    isLoading,
    user,
    error,
    isAuthenticated: isSuccess,
  };
};
