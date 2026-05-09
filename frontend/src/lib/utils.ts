import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { RiskFlag, VendorStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM dd, yyyy");
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM dd, yyyy HH:mm");
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Risk flag utilities
export function getRiskFlagColor(flag?: RiskFlag): string {
  if (!flag) return "text-gray-400";
  const colors = {
    green: "text-risk-green",
    amber: "text-risk-amber",
    red: "text-risk-red",
  };
  return colors[flag];
}

export function getRiskFlagBgColor(flag?: RiskFlag): string {
  if (!flag) return "bg-gray-100";
  const colors = {
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
  };
  return colors[flag];
}

export function getRiskFlagIcon(flag?: RiskFlag): string {
  if (!flag) return "⚪";
  const icons = {
    green: "🟢",
    amber: "🟡",
    red: "🔴",
  };
  return icons[flag];
}

// Status utilities
export function getStatusColor(status: VendorStatus): string {
  const colors = {
    submitted: "bg-blue-100 text-blue-800",
    in_review: "bg-amber-100 text-amber-800",
    cleared: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status];
}

// Score utilities
export function formatScore(score?: number): string {
  if (score === undefined || score === null) return "N/A";
  return score.toFixed(1);
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

// API error handling
export function getErrorMessage(error: any): string {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
