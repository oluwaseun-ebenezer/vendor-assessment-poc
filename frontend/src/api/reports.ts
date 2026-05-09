import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

// Get report (summary format)
export const useReport = (vendorId?: string) => {
  return useQuery({
    queryKey: ["report", vendorId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/reports/vendor/${vendorId}?format=summary`,
      );
      return response.data;
    },
    enabled: !!vendorId,
  });
};

// Download PDF report
export const downloadPDFReport = async (vendorId: string) => {
  const response = await apiClient.get(`/reports/vendor/${vendorId}/pdf`, {
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `vendor-${vendorId}-report.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
