import { describe, it, expect } from "vitest";
import {
  formatDate, formatScore, getScoreColor, getRiskFlagColor,
  getRiskFlagBgColor, getRiskFlagIcon, getStatusColor,
  getErrorMessage, formatFileSize, truncate,
} from "@/lib/utils";

describe("formatDate", () => {
  it("formats ISO string to readable date", () => {
    expect(formatDate("2026-05-09T10:00:00Z")).toBe("May 09, 2026");
  });

  it("formats Date object", () => {
    expect(formatDate(new Date("2026-01-15T00:00:00Z"))).toBe("Jan 15, 2026");
  });
});

describe("formatScore", () => {
  it("formats score to 1 decimal", () => {
    expect(formatScore(72.456)).toBe("72.5");
  });

  it("returns N/A for undefined", () => {
    expect(formatScore(undefined)).toBe("N/A");
  });

  it("returns N/A for null", () => {
    expect(formatScore(null as unknown as number)).toBe("N/A");
  });

  it("formats 100", () => {
    expect(formatScore(100)).toBe("100.0");
  });
});

describe("getScoreColor", () => {
  it("returns green for score >= 70", () => {
    expect(getScoreColor(70)).toBe("text-green-600");
    expect(getScoreColor(85)).toBe("text-green-600");
    expect(getScoreColor(100)).toBe("text-green-600");
  });

  it("returns amber for score 40-69", () => {
    expect(getScoreColor(40)).toBe("text-amber-600");
    expect(getScoreColor(55)).toBe("text-amber-600");
    expect(getScoreColor(69)).toBe("text-amber-600");
  });

  it("returns red for score < 40", () => {
    expect(getScoreColor(0)).toBe("text-red-600");
    expect(getScoreColor(39)).toBe("text-red-600");
  });
});

describe("getRiskFlagColor", () => {
  it("returns correct text colors", () => {
    expect(getRiskFlagColor("green")).toBe("text-risk-green");
    expect(getRiskFlagColor("amber")).toBe("text-risk-amber");
    expect(getRiskFlagColor("red")).toBe("text-risk-red");
  });

  it("returns gray for undefined", () => {
    expect(getRiskFlagColor(undefined)).toBe("text-gray-400");
  });
});

describe("getRiskFlagBgColor", () => {
  it("returns correct background classes", () => {
    expect(getRiskFlagBgColor("green")).toContain("green");
    expect(getRiskFlagBgColor("amber")).toContain("amber");
    expect(getRiskFlagBgColor("red")).toContain("red");
  });

  it("returns gray for undefined", () => {
    expect(getRiskFlagBgColor(undefined)).toBe("bg-gray-100");
  });
});

describe("getRiskFlagIcon", () => {
  it("returns correct emoji icons", () => {
    expect(getRiskFlagIcon("green")).toBe("🟢");
    expect(getRiskFlagIcon("amber")).toBe("🟡");
    expect(getRiskFlagIcon("red")).toBe("🔴");
  });

  it("returns white circle for undefined", () => {
    expect(getRiskFlagIcon(undefined)).toBe("⚪");
  });
});

describe("getStatusColor", () => {
  it("returns correct badge colors for all statuses", () => {
    expect(getStatusColor("submitted")).toContain("blue");
    expect(getStatusColor("in_review")).toContain("amber");
    expect(getStatusColor("cleared")).toContain("green");
    expect(getStatusColor("rejected")).toContain("red");
  });
});

describe("getErrorMessage", () => {
  it("extracts detail from API error response", () => {
    const err = { response: { data: { detail: "Invalid credentials" } } };
    expect(getErrorMessage(err)).toBe("Invalid credentials");
  });

  it("falls back to error message", () => {
    const err = { message: "Network Error" };
    expect(getErrorMessage(err)).toBe("Network Error");
  });

  it("returns generic message for unknown error", () => {
    expect(getErrorMessage({})).toBe("An unexpected error occurred");
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(500)).toBe("500 Bytes");
  });

  it("formats KB", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("formats MB", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
  });
});

describe("truncate", () => {
  it("does not truncate short strings", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates long strings with ellipsis", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("handles exact length", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});
