import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskFlagBadge } from "@/components/shared/RiskFlagBadge";

describe("StatusBadge", () => {
  it.each([
    ["submitted", "Submitted"],
    ["in_review", "In Review"],
    ["cleared", "Cleared"],
    ["rejected", "Rejected"],
  ] as const)("renders '%s' status with correct label", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("applies green class for cleared status", () => {
    const { container } = render(<StatusBadge status="cleared" />);
    expect(container.firstChild).toHaveClass("bg-green-100");
  });

  it("applies red class for rejected status", () => {
    const { container } = render(<StatusBadge status="rejected" />);
    expect(container.firstChild).toHaveClass("bg-red-100");
  });

  it("applies amber class for in_review status", () => {
    const { container } = render(<StatusBadge status="in_review" />);
    expect(container.firstChild).toHaveClass("bg-amber-100");
  });

  it("applies blue class for submitted status", () => {
    const { container } = render(<StatusBadge status="submitted" />);
    expect(container.firstChild).toHaveClass("bg-blue-100");
  });
});

describe("RiskFlagBadge", () => {
  it("renders green flag", () => {
    render(<RiskFlagBadge flag="green" />);
    expect(screen.getByText(/green/i)).toBeInTheDocument();
    expect(screen.getByText(/🟢/)).toBeInTheDocument();
  });

  it("renders amber flag", () => {
    render(<RiskFlagBadge flag="amber" />);
    expect(screen.getByText(/amber/i)).toBeInTheDocument();
    expect(screen.getByText(/🟡/)).toBeInTheDocument();
  });

  it("renders red flag", () => {
    render(<RiskFlagBadge flag="red" />);
    expect(screen.getByText(/red/i)).toBeInTheDocument();
    expect(screen.getByText(/🔴/)).toBeInTheDocument();
  });

  it("renders N/A for undefined flag", () => {
    render(<RiskFlagBadge />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
