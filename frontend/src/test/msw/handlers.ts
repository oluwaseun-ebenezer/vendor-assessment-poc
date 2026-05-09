import { http, HttpResponse } from "msw";

export const MOCK_USER = {
  id: "user-1",
  email: "admin@carlsberg.com",
  full_name: "Admin User",
  role: "admin",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
};

export const MOCK_VENDORS = [
  {
    id: "vendor-1",
    company_name: "AmberTech Solutions",
    country: "Denmark",
    status: "in_review",
    risk_flag: "amber",
    composite_score: 52.5,
    created_at: "2026-05-01T10:00:00Z",
  },
  {
    id: "vendor-2",
    company_name: "OpenAI",
    country: "US",
    status: "cleared",
    risk_flag: "amber",
    composite_score: 70.0,
    created_at: "2026-05-02T10:00:00Z",
  },
  {
    id: "vendor-3",
    company_name: "RedFlag.io",
    country: "Unknown",
    status: "rejected",
    risk_flag: "red",
    composite_score: 22.0,
    created_at: "2026-05-03T10:00:00Z",
  },
];

export const MOCK_VENDOR_DETAIL = {
  id: "vendor-1",
  company_name: "AmberTech Solutions",
  website: "https://ambertech.io",
  country: "Denmark",
  founded_year: 2024,
  employee_count: 8,
  description: "AI-powered demand forecasting for FMCG supply chains.",
  tech_stack: ["Python", "PyTorch", "FastAPI"],
  status: "in_review",
  created_at: "2026-05-01T10:00:00Z",
  updated_at: "2026-05-01T10:00:00Z",
  documents: [
    {
      id: "doc-1",
      vendor_id: "vendor-1",
      doc_type: "legal_doc",
      filename: "ambertech-msa.txt",
      file_path: "/app/uploads/ambertech-msa.txt",
      uploaded_at: "2026-05-01T11:00:00Z",
    },
  ],
};

export const MOCK_ASSESSMENT = {
  id: "assessment-1",
  vendor_id: "vendor-1",
  status: "complete",
  composite_score: 52.5,
  risk_flag: "amber",
  created_at: "2026-05-01T10:05:00Z",
  started_at: "2026-05-01T10:05:10Z",
  completed_at: "2026-05-01T10:05:45Z",
};

export const MOCK_DIMENSION_SCORES = [
  { id: "ds-1", assessment_id: "assessment-1", dimension: "security", composite_score: 65.0, rules_score: 60.0, llm_score: 72.0, risk_flag: "green", evidence: [], llm_reasoning: "Vendor has GDPR DPA signed and EU data residency confirmed.", created_at: "2026-05-01T10:05:45Z" },
  { id: "ds-2", assessment_id: "assessment-1", dimension: "viability", composite_score: 35.0, rules_score: 30.0, llm_score: 42.0, risk_flag: "red", evidence: [], llm_reasoning: "Seed-stage with only 8 employees. Key-person risk is high.", created_at: "2026-05-01T10:05:45Z" },
  { id: "ds-3", assessment_id: "assessment-1", dimension: "legal", composite_score: 55.0, rules_score: 50.0, llm_score: 62.0, risk_flag: "amber", evidence: [], llm_reasoning: "IP ownership incomplete. MSA draft missing indemnification clause.", created_at: "2026-05-01T10:05:45Z" },
  { id: "ds-4", assessment_id: "assessment-1", dimension: "integration", composite_score: 70.0, rules_score: 75.0, llm_score: 63.0, risk_flag: "green", evidence: [], llm_reasoning: "REST API with documented endpoints. SLA at 99.5%.", created_at: "2026-05-01T10:05:45Z" },
  { id: "ds-5", assessment_id: "assessment-1", dimension: "commercial", composite_score: 48.0, rules_score: 45.0, llm_score: 52.0, risk_flag: "amber", evidence: [], llm_reasoning: "Usage-based pricing only, no enterprise tier yet.", created_at: "2026-05-01T10:05:45Z" },
  { id: "ds-6", assessment_id: "assessment-1", dimension: "operations", composite_score: 50.0, rules_score: 55.0, llm_score: 43.0, risk_flag: "amber", evidence: [], llm_reasoning: "No dedicated CSM. BCP not documented.", created_at: "2026-05-01T10:05:45Z" },
  { id: "ds-7", assessment_id: "assessment-1", dimension: "scalability", composite_score: 55.0, rules_score: 60.0, llm_score: 48.0, risk_flag: "amber", evidence: [], llm_reasoning: "Single region deployment. EU data residency confirmed.", created_at: "2026-05-01T10:05:45Z" },
  { id: "ds-8", assessment_id: "assessment-1", dimension: "maturity", composite_score: 42.0, rules_score: 40.0, llm_score: 45.0, risk_flag: "amber", evidence: [], llm_reasoning: "In production but no enterprise customers yet.", created_at: "2026-05-01T10:05:45Z" },
];

export const MOCK_TASKS = [
  { id: "task-1", vendor_id: "vendor-1", assessment_id: "assessment-1", title: "[AmberTech] Obtain ISO 27001 certification", department: "it_security", priority: "high", status: "open", created_at: "2026-05-01T10:06:00Z", updated_at: "2026-05-01T10:06:00Z", description: "" },
  { id: "task-2", vendor_id: "vendor-1", assessment_id: "assessment-1", title: "[AmberTech] Conduct IP ownership due diligence", department: "legal", priority: "high", status: "open", created_at: "2026-05-01T10:06:00Z", updated_at: "2026-05-01T10:06:00Z", description: "" },
  { id: "task-3", vendor_id: "vendor-1", assessment_id: "assessment-1", title: "[AmberTech] Request financial statements", department: "procurement", priority: "medium", status: "in_progress", created_at: "2026-05-01T10:06:00Z", updated_at: "2026-05-01T10:06:00Z", description: "" },
];

export const MOCK_ANALYTICS = {
  total_vendors: 3,
  total_assessments: 3,
  cleared_vendors: 1,
  in_review_vendors: 1,
  rejected_vendors: 1,
  avg_composite_score: 48.2,
  green_count: 0,
  amber_count: 2,
  red_count: 1,
  avg_time_to_assess_minutes: 0.58,
};

export const handlers = [
  http.post("/api/auth/login", () =>
    HttpResponse.json({
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      token_type: "bearer",
    })
  ),

  http.get("/api/auth/me", () => HttpResponse.json(MOCK_USER)),

  http.get("/api/vendors", () => HttpResponse.json(MOCK_VENDORS)),

  http.get("/api/vendors/:id", ({ params }) => {
    const vendor = params.id === "vendor-1" ? MOCK_VENDOR_DETAIL : { ...MOCK_VENDOR_DETAIL, id: params.id as string };
    return HttpResponse.json(vendor);
  }),

  http.post("/api/vendors", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...MOCK_VENDOR_DETAIL, id: "vendor-new", company_name: body.company_name as string }, { status: 201 });
  }),

  http.post("/api/assessments/:vendorId/run", () =>
    HttpResponse.json({ ...MOCK_ASSESSMENT, status: "pending" }, { status: 202 })
  ),

  http.get("/api/assessments/:vendorId/status", () =>
    HttpResponse.json(MOCK_ASSESSMENT)
  ),

  http.get("/api/assessments/:vendorId/results", () =>
    HttpResponse.json({ assessment: MOCK_ASSESSMENT, dimension_scores: MOCK_DIMENSION_SCORES })
  ),

  http.get("/api/tasks", () => HttpResponse.json(MOCK_TASKS)),

  http.patch("/api/tasks/:taskId", async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const task = MOCK_TASKS.find(t => t.id === params.taskId) || MOCK_TASKS[0];
    return HttpResponse.json({ ...task, ...body });
  }),

  http.get("/api/analytics/summary", () => HttpResponse.json(MOCK_ANALYTICS)),

  http.get("/api/reports/:vendorId/pdf", () =>
    new HttpResponse(new Blob(["PDF content"], { type: "application/pdf" }), {
      headers: { "Content-Type": "application/pdf" },
    })
  ),

  http.post("/api/vendors/:vendorId/approve", () =>
    HttpResponse.json({ status: "cleared" })
  ),
];
