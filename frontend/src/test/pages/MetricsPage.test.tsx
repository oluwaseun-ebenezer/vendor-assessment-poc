import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { MetricsPage } from "@/pages/MetricsPage";
import { renderWithProviders, mockLocalStorage } from "../utils";
import { MOCK_ANALYTICS } from "../msw/handlers";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

describe("MetricsPage", () => {
  beforeEach(() => mockLocalStorage());

  it("renders page heading", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("Analytics & Metrics")).toBeInTheDocument();
    });
  });

  it("shows efficiency gain banner", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("Efficiency Gain")).toBeInTheDocument();
      expect(screen.getByText(/vs\. 45-day manual baseline/i)).toBeInTheDocument();
    });
  });

  it("shows 45 days vs automated comparison", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("45")).toBeInTheDocument();
      expect(screen.getByText("days manual")).toBeInTheDocument();
      expect(screen.getByText("automated")).toBeInTheDocument();
    });
  });

  it("displays efficiency percentage above 90%", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      const els = screen.getAllByText(/\d+%/);
      const pcts = els.map(el => parseInt(el.textContent || "0")).filter(n => n > 0);
      expect(pcts.some(p => p > 90)).toBe(true);
    });
  });

  it("shows total vendors stat card", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("Total Vendors")).toBeInTheDocument();
      expect(screen.getAllByText(String(MOCK_ANALYTICS.total_vendors)).length).toBeGreaterThan(0);
    });
  });

  it("shows average score stat card", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("Avg Score")).toBeInTheDocument();
      expect(screen.getByText(MOCK_ANALYTICS.avg_composite_score.toFixed(1))).toBeInTheDocument();
    });
  });

  it("shows risk distribution chart section", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("Risk Distribution")).toBeInTheDocument();
      expect(screen.getByText("Vendors by risk flag")).toBeInTheDocument();
    });
  });

  it("shows vendor status chart section", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("Vendor Status")).toBeInTheDocument();
    });
  });

  it("shows assessment time stat card", async () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    await waitFor(() => {
      expect(screen.getByText("Avg Assess Time")).toBeInTheDocument();
      expect(screen.getByText("from submit to report")).toBeInTheDocument();
    });
  });

  it("renders loading skeleton before data arrives", () => {
    renderWithProviders(<MetricsPage />, { initialEntries: ["/metrics"], path: "/metrics" });
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
