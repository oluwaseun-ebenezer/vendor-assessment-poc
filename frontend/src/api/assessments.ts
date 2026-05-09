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

// Get assessment status (for polling) — invalidates results + vendor when complete
export const useAssessmentStatus = (vendorId?: string, enabled = true) => {
  const queryClient = useQueryClient();

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
      if (data?.status === "pending" || data?.status === "running") {
        return ASSESSMENT_POLL_INTERVAL;
      }
      return false;
    },
    select: (data) => {
      if (data?.status === "complete" || data?.status === "failed") {
        // Invalidate so results, vendor, tasks all refresh automatically
        queryClient.invalidateQueries({ queryKey: ["assessmentResults", vendorId] });
        queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["vendors"] });
      }
      return data;
    },
  });
};

// Get assessment results — refetches while assessment is still running
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
    refetchInterval: (query) => {
      const status = query.state.data?.assessment?.status;
      if (status === "pending" || status === "running") {
        return ASSESSMENT_POLL_INTERVAL;
      }
      return false;
    },
  });
};
