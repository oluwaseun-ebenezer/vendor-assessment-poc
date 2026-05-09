import { DimensionType, UserRole } from "@/types";

// Role definitions
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  procurement: "Procurement",
  it_security: "IT Security",
  legal: "Legal",
  ai_innovation: "AI Innovation",
};

// Dimension metadata
export const DIMENSION_INFO: Record<
  DimensionType,
  { label: string; description: string; owner: string }
> = {
  security: {
    label: "Security, Privacy & Compliance",
    description: "Data protection, certifications, breach history",
    owner: "IT Security",
  },
  viability: {
    label: "Vendor Viability & Continuity",
    description: "Financial stability, business continuity planning",
    owner: "Procurement",
  },
  integration: {
    label: "Integration & Data Integrity",
    description: "API quality, data exchange, SLA commitments",
    owner: "IT / Engineering",
  },
  legal: {
    label: "Legal & IP",
    description: "Contracts, IP ownership, litigation risks",
    owner: "Legal",
  },
  commercial: {
    label: "Cost & Commercials",
    description: "Pricing models, enterprise terms, value for money",
    owner: "Procurement",
  },
  operations: {
    label: "Operations & Change Management",
    description: "Deployment, support, change management readiness",
    owner: "Procurement / IT",
  },
  scalability: {
    label: "Global Scalability",
    description: "Multi-region, multi-language, international readiness",
    owner: "IT / Engineering",
  },
  maturity: {
    label: "Product Maturity & Delivery",
    description: "Product stability, customer base, roadmap transparency",
    owner: "AI Innovation",
  },
};

// Status labels and colors
export const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  in_review: "In Review",
  cleared: "Cleared",
  rejected: "Rejected",
};

export const RISK_FLAG_LABELS: Record<string, string> = {
  green: "Green",
  amber: "Amber",
  red: "Red",
};

// Assessment status labels
export const ASSESSMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  running: "Running",
  complete: "Complete",
  failed: "Failed",
};

// Task priority & status
export const TASK_PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  done: "Done",
};

// Document types
export const DOC_TYPE_LABELS: Record<string, string> = {
  security_whitepaper: "Security Whitepaper",
  architecture_doc: "Architecture Document",
  legal_doc: "Legal Document",
  financial_doc: "Financial Document",
  other: "Other",
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Polling intervals (milliseconds)
export const ASSESSMENT_POLL_INTERVAL = 5000; // 5 seconds
export const DASHBOARD_REFRESH_INTERVAL = 30000; // 30 seconds
