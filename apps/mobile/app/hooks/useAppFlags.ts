import { useQuery } from "@tanstack/react-query";
import { client } from "../services";

interface AppFlags {
  paywall: {
    showWeeklyCalculation: boolean;
  };
}

const fetchAppFlags = async (): Promise<AppFlags> => {
  const response = await client.get("app-flags");
  return response.data;
};

export const useAppFlags = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["appFlags"],
    queryFn: fetchAppFlags,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data,
    isLoading: isLoading,
    error: error,
  };
};
