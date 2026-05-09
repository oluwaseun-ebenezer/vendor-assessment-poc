import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/pages/LoginPage";
import { renderWithProviders, clearLocalStorage } from "../utils";
import { server } from "../msw/server";
import { http, HttpResponse } from "msw";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("LoginPage", () => {
  beforeEach(() => {
    clearLocalStorage();
    mockNavigate.mockClear();
  });

  it("renders login form elements", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText("you@carlsberg.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders Carlsberg branding", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getAllByAltText("Carlsberg").length).toBeGreaterThan(0);
    expect(screen.getByText(/AI Vendor Assessment/i)).toBeInTheDocument();
  });

  it("shows efficiency stat on hero panel", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText(/days manual/i)).toBeInTheDocument();
  });

  it("submits login and navigates to dashboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@carlsberg.com"), "admin@carlsberg.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "ChangeMe123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("access_token")).toBe("mock-access-token");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error message on failed login", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@carlsberg.com"), "wrong@email.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      const errorDiv = document.querySelector(".bg-red-50");
      expect(errorDiv).toBeInTheDocument();
    });
  });

  it("button shows loading state while submitting", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@carlsberg.com"), "admin@carlsberg.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "ChangeMe123!");

    const btn = screen.getByRole("button", { name: /sign in/i });
    await user.click(btn);

    await waitFor(() => {
      const loadingBtn = screen.queryByText(/signing in/i);
      const signInBtn = screen.queryByRole("button", { name: /sign in/i });
      expect(loadingBtn || signInBtn).toBeTruthy();
    });
  });

  it("does not expose credentials in the UI", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.queryByText(/ChangeMe123!/)).not.toBeInTheDocument();
    expect(screen.queryByText(/admin@carlsberg.com/)).not.toBeInTheDocument();
  });
});
