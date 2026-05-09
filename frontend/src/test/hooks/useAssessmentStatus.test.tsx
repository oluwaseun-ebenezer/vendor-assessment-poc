import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useAssessmentStatus } from "@/api/assessments";
import { server } from "../msw/server";
import { http, HttpResponse } from "msw";
import { mockLocalStorage } from "../utils";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAssessmentStatus", () => {
  beforeEach(() => mockLocalStorage());

  it("fetches assessment status successfully", async () => {
    const { result } = renderHook(() => useAssessmentStatus("vendor-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("complete");
    expect(result.current.data?.composite_score).toBe(52.5);
    expect(result.current.data?.risk_flag).toBe("amber");
  });

  it("does not fetch when vendorId is undefined", () => {
    const { result } = renderHook(() => useAssessmentStatus(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch when enabled=false", () => {
    const { result } = renderHook(() => useAssessmentStatus("vendor-1", false), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });

  it("returns running status when assessment is in progress", async () => {
    server.use(
      http.get("/api/assessments/:vendorId/status", () =>
        HttpResponse.json({ id: "a-1", vendor_id: "vendor-1", status: "running", created_at: "2026-01-01T00:00:00Z" })
      )
    );

    const { result } = renderHook(() => useAssessmentStatus("vendor-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("running");
  }, 10000);

  it("handles API error gracefully", async () => {
    server.use(
      http.get("/api/assessments/:vendorId/status", () =>
        HttpResponse.json({ detail: "Not found" }, { status: 404 })
      )
    );

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    const { result } = renderHook(() => useAssessmentStatus("vendor-404"), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
  }, 10000);
});
