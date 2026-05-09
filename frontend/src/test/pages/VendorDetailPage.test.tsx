import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VendorDetailPage } from "@/pages/VendorDetailPage";
import { renderWithProviders, mockLocalStorage } from "../utils";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "vendor-1" }),
  };
});

describe("VendorDetailPage", () => {
  beforeEach(() => {
    mockLocalStorage();
    mockNavigate.mockClear();
  });

  it("renders vendor name after loading", async () => {
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => {
      expect(screen.getByText("AmberTech Solutions")).toBeInTheDocument();
    });
  });

  it("renders vendor description", async () => {
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => {
      expect(screen.getByText(/AI-powered demand forecasting/i)).toBeInTheDocument();
    });
  });

  it("shows all four tabs", async () => {
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    const tabs = ["Overview", "Assessment", "Tasks", "Documents"];
    tabs.forEach(tab => {
      expect(screen.getAllByRole("button", { name: new RegExp(tab, "i") }).length).toBeGreaterThan(0);
    });
  });

  it("shows company info on Overview tab", async () => {
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    expect(screen.getByText("Company Details")).toBeInTheDocument();
    expect(screen.getAllByText("Denmark").length).toBeGreaterThan(0);
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("shows tech stack badges", async () => {
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("PyTorch")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
  });

  it("switches to Assessment tab and shows dimension scores", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    const assessmentTab = screen.getAllByRole("button", { name: /^assessment$/i })[0];
    await user.click(assessmentTab);

    await waitFor(() => {
      expect(screen.getByText("Security, Privacy & Compliance")).toBeInTheDocument();
      expect(screen.getByText("Legal & IP")).toBeInTheDocument();
      expect(screen.getByText("Vendor Viability & Continuity")).toBeInTheDocument();
    });
  });

  it("expands LLM reasoning on Assessment tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    const assessmentTab = screen.getAllByRole("button", { name: /^assessment$/i })[0];
    await user.click(assessmentTab);
    await waitFor(() => screen.getByText("Security, Privacy & Compliance"));

    const reasoningBtns = screen.getAllByText(/show llm reasoning/i);
    await user.click(reasoningBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/GDPR DPA signed/i)).toBeInTheDocument();
    });
  });

  it("switches to Tasks tab and shows tasks", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    await user.click(screen.getByRole("button", { name: /tasks/i }));

    await waitFor(() => {
      expect(screen.getByText(/Obtain ISO 27001 certification/i)).toBeInTheDocument();
      expect(screen.getByText(/Conduct IP ownership due diligence/i)).toBeInTheDocument();
    });
  });

  it("switches to Documents tab and shows uploaded files", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    const docsTab = screen.getAllByRole("button", { name: /documents/i })[0];
    await user.click(docsTab);

    await waitFor(() => {
      expect(screen.getByText("ambertech-msa.txt")).toBeInTheDocument();
      expect(screen.getAllByText(/legal_doc/i).length).toBeGreaterThan(0);
    });
  });

  it("shows Run Assessment button", async () => {
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));
    expect(screen.getByRole("button", { name: /run assessment/i })).toBeInTheDocument();
  });

  it("shows Download PDF button", async () => {
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
  });

  it("back button navigates to dashboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    await user.click(screen.getByText(/back to pipeline/i));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("opens approve modal when Make Decision is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VendorDetailPage />, {
      initialEntries: ["/vendors/vendor-1"],
      path: "/vendors/:id",
    });
    await waitFor(() => screen.getByText("AmberTech Solutions"));

    await user.click(screen.getByRole("button", { name: /make decision/i }));
    expect(screen.getByText("Final Decision")).toBeInTheDocument();
    expect(screen.getByText(/Clear Vendor/i)).toBeInTheDocument();
    expect(screen.getByText(/Reject Vendor/i)).toBeInTheDocument();
  });
});
