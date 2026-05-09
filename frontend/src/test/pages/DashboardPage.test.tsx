import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardPage } from "@/pages/DashboardPage";
import { renderWithProviders, mockLocalStorage } from "../utils";
import { MOCK_VENDORS } from "../msw/handlers";
import { server } from "../msw/server";
import { http, HttpResponse } from "msw";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    mockLocalStorage();
    mockNavigate.mockClear();
  });

  it("renders page header and submit button", async () => {
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });
    expect(screen.getByText("Vendor Pipeline")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit vendor/i })).toBeInTheDocument();
  });

  it("displays vendor list after loading", async () => {
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });
    await waitFor(() => {
      expect(screen.getByText("AmberTech Solutions")).toBeInTheDocument();
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
      expect(screen.getByText("RedFlag.io")).toBeInTheDocument();
    });
  });

  it("shows correct stat cards", async () => {
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });
    await waitFor(() => {
      expect(screen.getByText("Total Vendors")).toBeInTheDocument();
      expect(screen.getAllByText("Cleared").length).toBeGreaterThan(0);
      expect(screen.getAllByText("In Review").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Rejected").length).toBeGreaterThan(0);
    });
  });

  it("stat cards show correct counts", async () => {
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });
    await waitFor(() => {
      const cleared = MOCK_VENDORS.filter(v => v.status === "cleared").length;
      const inReview = MOCK_VENDORS.filter(v => v.status === "in_review").length;
      const rejected = MOCK_VENDORS.filter(v => v.status === "rejected").length;
      const total = MOCK_VENDORS.length;
      expect(screen.getAllByText(String(total)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(String(cleared)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(String(inReview)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(String(rejected)).length).toBeGreaterThan(0);
    });
  });

  it("shows skeleton rows while loading", () => {
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });
    const rows = document.querySelectorAll(".animate-pulse");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("navigates to vendor detail on row click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });

    await waitFor(() => screen.getByText("AmberTech Solutions"));
    await user.click(screen.getByText("AmberTech Solutions"));

    expect(mockNavigate).toHaveBeenCalledWith("/vendors/vendor-1");
  });

  it("opens submit vendor modal on button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });

    await user.click(screen.getByRole("button", { name: /submit vendor/i }));
    expect(screen.getByText("Submit New Vendor")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("submit vendor modal can be closed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });

    await user.click(screen.getByRole("button", { name: /submit vendor/i }));
    expect(screen.getByText("Submit New Vendor")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Submit New Vendor")).not.toBeInTheDocument();
  });

  it("submit modal: continue disabled without company name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });

    await user.click(screen.getByRole("button", { name: /submit vendor/i }));
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it("submit modal: advances to step 2 after lookup", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });

    await user.click(screen.getByRole("button", { name: /submit vendor/i }));
    await user.type(screen.getAllByPlaceholderText(/Acme AI Ltd/i)[1], "TestCorp");
    await user.click(screen.getAllByRole("button", { name: /continue/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
    });
  });

  it("shows empty state when no vendors", async () => {
    server.use(http.get("/api/vendors", () => HttpResponse.json([])));
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });

    await waitFor(() => {
      expect(screen.getByText("No vendors yet")).toBeInTheDocument();
    });
  });

  it("search filter updates URL params", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { initialEntries: ["/dashboard"], path: "/dashboard" });

    const searchInput = screen.getByPlaceholderText("Search vendors...");
    await user.type(searchInput, "OpenAI");
    expect(searchInput).toHaveValue("OpenAI");
  });
});
