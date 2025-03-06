import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/utils";

export const useAuthentication = (key?: any, retry?: number) => {
  //

  const {
    isLoading,
    data: user,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["user", key],
    queryFn: () => getUser(),
    refetchInterval: retry,
  });

  return {
    isLoading,
    user,
    error,
    isAuthenticated: isSuccess,
  };
};
