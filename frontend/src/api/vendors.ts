import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Vendor, VendorListItem, VendorFilters } from "@/types";

// Lookup vendor by URL or name (LLM prefill)
export const lookupVendor = async (query: string) => {
  const response = await apiClient.post("/vendors/lookup", { query });
  return response.data;
};

// List vendors
export const useVendors = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: ["vendors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status_filter", filters.status);
      if (filters?.risk_flag) params.append("risk_flag", filters.risk_flag);
      if (filters?.project_id) params.append("project_id", filters.project_id);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.size) params.append("size", filters.size.toString());

      const response = await apiClient.get<VendorListItem[]>(
        `/vendors?${params.toString()}`,
      );
      return response.data;
    },
  });
};

// Get single vendor
export const useVendor = (vendorId?: string) => {
  return useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      const response = await apiClient.get<Vendor>(`/vendors/${vendorId}`);
      return response.data;
    },
    enabled: !!vendorId,
  });
};

// Create vendor
export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      const response = await apiClient.post<Vendor>("/vendors", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

// Update vendor
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: Partial<Vendor>;
    }) => {
      const response = await apiClient.patch<Vendor>(
        `/vendors/${vendorId}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vendor", variables.vendorId],
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

// Upload document
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vendorId,
      file,
      docType,
    }: {
      vendorId: string;
      file: File;
      docType: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);

      const response = await apiClient.post(
        `/vendors/${vendorId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vendor", variables.vendorId],
      });
    },
  });
};
