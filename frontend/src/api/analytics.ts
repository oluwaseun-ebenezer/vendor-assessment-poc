import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Analytics } from "@/types";

// Get analytics
export const useAnalytics = (fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: ["analytics", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      const response = await apiClient.get<Analytics>(
        `/analytics?${params.toString()}`,
      );
      return response.data;
    },
  });
};
