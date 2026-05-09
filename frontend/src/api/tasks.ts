import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Task, TaskFilters, TaskStatus, TaskPriority } from "@/types";

// Get tasks
export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.vendor_id) params.append("vendor_id", filters.vendor_id);
      if (filters?.department) params.append("department", filters.department);
      if (filters?.status) params.append("status_filter", filters.status);

      const response = await apiClient.get<Task[]>(
        `/tasks?${params.toString()}`,
      );
      return response.data;
    },
  });
};

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      assignedTo,
      priority,
    }: {
      taskId: string;
      status?: TaskStatus;
      assignedTo?: string;
      priority?: TaskPriority;
    }) => {
      const response = await apiClient.patch<Task>(`/tasks/${taskId}`, {
        status,
        assigned_to: assignedTo,
        priority,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
