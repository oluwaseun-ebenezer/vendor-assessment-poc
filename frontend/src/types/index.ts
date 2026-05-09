// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type UserRole =
  | "admin"
  | "procurement"
  | "it_security"
  | "legal"
  | "ai_innovation";

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Vendor types
export interface Vendor {
  id: string;
  company_name: string;
  website?: string;
  country?: string;
  founded_year?: number;
  employee_count?: number;
  description?: string;
  tech_stack?: string[];
  contacts?: Contact[];
  status: VendorStatus;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
  documents?: VendorDocument[];
}

export interface VendorListItem {
  id: string;
  company_name: string;
  country?: string;
  status: VendorStatus;
  risk_flag?: RiskFlag;
  composite_score?: number;
  created_at: string;
}

export interface VendorDocument {
  id: string;
  vendor_id: string;
  doc_type: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

export interface Contact {
  name: string;
  email: string;
  role?: string;
}

export type VendorStatus = "submitted" | "in_review" | "cleared" | "rejected";
export type RiskFlag = "green" | "amber" | "red";

// Assessment types
export interface Assessment {
  id: string;
  vendor_id: string;
  status: AssessmentStatus;
  composite_score?: number;
  risk_flag?: RiskFlag;
  triggered_by?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export type AssessmentStatus = "pending" | "running" | "complete" | "failed";

export interface DimensionScore {
  id: string;
  assessment_id: string;
  dimension: DimensionType;
  composite_score: number;
  rules_score: number;
  llm_score: number;
  risk_flag: RiskFlag;
  evidence: Record<string, any>;
  llm_reasoning?: string;
  created_at: string;
}

export type DimensionType =
  | "security"
  | "viability"
  | "integration"
  | "legal"
  | "commercial"
  | "operations"
  | "scalability"
  | "maturity";

export interface AssessmentResults {
  assessment: Assessment;
  dimension_scores: DimensionScore[];
}

// Task types
export interface Task {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  department: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  vendor?: {
    company_name: string;
  };
}

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "open" | "in_progress" | "done";

// Analytics types
export interface Analytics {
  total_vendors: number;
  cleared_vendors: number;
  in_review_vendors: number;
  rejected_vendors: number;
  avg_composite_score: number;
  risk_distribution: {
    green: number;
    amber: number;
    red: number;
  };
  avg_time_to_assess_hours: number;
  avg_time_to_onboard_days: number;
  efficiency_gain_percentage: number;
}

// Report types
export interface Report {
  id: string;
  vendor_id: string;
  assessment_id: string;
  format: "pdf" | "json";
  file_path?: string;
  generated_at: string;
}

// Filter types
export interface VendorFilters {
  search?: string;
  status?: VendorStatus;
  risk_flag?: RiskFlag;
  page?: number;
  size?: number;
}

export interface TaskFilters {
  vendor_id?: string;
  department?: string;
  status?: TaskStatus;
}
