import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Assessment, AssessmentResults } from "@/types";
import { ASSESSMENT_POLL_INTERVAL } from "@/lib/constants";

// Run assessment
export const useRunAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await apiClient.post<Assessment>(
        `/assessments/${vendorId}/run`,
      );
      return response.data;
    },
    onSuccess: (_, vendorId) => {
      queryClient.invalidateQueries({ queryKey: ["assessment", vendorId] });
      queryClient.invalidateQueries({
        queryKey: ["assessmentStatus", vendorId],
      });
    },
  });
};

// Get assessment status (for polling)
export const useAssessmentStatus = (vendorId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["assessmentStatus", vendorId],
    queryFn: async () => {
      const response = await apiClient.get<Assessment>(
        `/assessments/${vendorId}/status`,
      );
      return response.data;
    },
    enabled: !!vendorId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Only poll if status is pending or running
      if (data?.status === "pending" || data?.status === "running") {
        return ASSESSMENT_POLL_INTERVAL;
      }
      return false;
    },
  });
};

// Get assessment results
export const useAssessmentResults = (vendorId?: string) => {
  return useQuery({
    queryKey: ["assessmentResults", vendorId],
    queryFn: async () => {
      const response = await apiClient.get<AssessmentResults>(
        `/assessments/${vendorId}/results`,
      );
      return response.data;
    },
    enabled: !!vendorId,
  });
};
