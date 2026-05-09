import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Project } from "@/types";

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const r = await apiClient.get<Project[]>("/projects");
      return r.data;
    },
    enabled: !!localStorage.getItem("access_token"),
  });

export const useProject = (id?: string) =>
  useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const r = await apiClient.get<Project>(`/projects/${id}`);
      return r.data;
    },
    enabled: !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const r = await apiClient.post<Project>("/projects", data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const r = await apiClient.patch<Project>(`/projects/${id}`, data);
      return r.data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project", v.id] });
    },
  });
};

export const useArchiveProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/projects/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};
