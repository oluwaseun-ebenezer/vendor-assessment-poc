# System Architecture — Automated Vendor Assessment Framework

---

## 1. Guiding Principles

| Principle           | Decision                                                                         |
| ------------------- | -------------------------------------------------------------------------------- |
| **Zero cloud cost** | Every service runs in Docker on local hardware                                   |
| **LLM-powered**     | OpenRouter API (free-tier models: Llama 3, Mistral, Gemma) for document analysis |
| **Modular**         | Each assessment dimension is an independent scoring module                       |
| **Auditable**       | Every score has a traceable evidence record in the database                      |
| **Role-aware**      | Four roles: Procurement, IT Security, Legal, AI Innovation                       |

---

## 2. Full System Diagram

```
                        ┌─────────────────────────────────────────────┐
                        │          BROWSER (Assessor / Stakeholder)    │
                        └──────────────────┬──────────────────────────┘
                                           │ HTTPS (port 3000 → Nginx)
                        ┌──────────────────▼──────────────────────────┐
                        │          Nginx Reverse Proxy (port 80)       │
                        │  /          → React Frontend (port 3000)     │
                        │  /api/*     → FastAPI Backend (port 8000)    │
                        └──────────┬───────────────────────────────────┘
                                   │
          ┌────────────────────────▼────────────────────────────────────┐
          │                   FastAPI Backend (port 8000)                │
          │                                                              │
          │   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
          │   │ Vendor API  │  │ Scoring API  │  │  Report API      │  │
          │   │ (CRUD)      │  │ (trigger,    │  │  (generate PDF,  │  │
          │   │             │  │  status)     │  │   view report)   │  │
          │   └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
          │          │                │                    │            │
          │   ┌──────▼────────────────▼────────────────────▼─────────┐  │
          │   │                  Service Layer                         │  │
          │   │  VendorService  │  ScoringEngine  │  ReportService   │  │
          │   │  TaskService    │  EnrichService  │  NotifyService   │  │
          │   └──────┬──────────────────┬──────────────────┬─────────┘  │
          │          │                  │                  │            │
          └──────────┼──────────────────┼──────────────────┼────────────┘
                     │                  │                  │
          ┌──────────▼──────┐  ┌────────▼──────────┐  ┌───▼──────────┐
          │  PostgreSQL DB  │  │  OpenRouter API   │  │  Mailhog     │
          │  (port 5432)    │  │  (LLM scoring)    │  │  SMTP / UI   │
          │  Docker volume  │  │  Free models      │  │  port 8025   │
          └─────────────────┘  └───────────────────┘  └──────────────┘
                                        │
                               ┌────────▼──────────┐
                               │  External Free    │
                               │  Public APIs      │
                               │  • NVD / CVE      │
                               │  • Companies House│
                               │  • OpenCorporates │
                               └───────────────────┘
```

---

## 3. Service Breakdown

### 3.1 Frontend — React + Vite + TypeScript

| Page / Component   | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `VendorSubmitPage` | Multi-step form for submitting a new startup for assessment |
| `DashboardPage`    | Pipeline view of all vendors + their status                 |
| `VendorReportPage` | Full 8-dimension risk report for one vendor                 |
| `TaskBoardPage`    | Kanban-style task board per department                      |
| `MetricsPage`      | Time-to-onboard analytics                                   |
| `LoginPage`        | JWT-based login with role selection                         |

**Key Libraries:**

- `React Query` — server state management
- `React Hook Form + Zod` — form validation
- `Recharts` — score visualisation
- `shadcn/ui` — component library (Tailwind-based)

---

### 3.2 Backend — FastAPI (Python 3.11)

**Module structure:**

```
app/
├── api/
│   ├── vendors.py        # POST /vendors, GET /vendors, GET /vendors/{id}
│   ├── assessments.py    # POST /assessments/{vendor_id}/run, GET status
│   ├── reports.py        # GET /reports/{vendor_id}, GET PDF
│   ├── tasks.py          # GET/PATCH /tasks, PATCH assign
│   └── auth.py           # POST /auth/login, /auth/refresh
├── services/
│   ├── vendor_service.py
│   ├── scoring_engine.py   # Orchestrates all 8 dimension scorers
│   ├── enrichment.py       # Calls external APIs
│   ├── report_service.py   # Generates PDF + structured JSON report
│   ├── task_service.py     # Creates tasks from report findings
│   └── notify_service.py   # Sends emails via Mailhog SMTP
├── scoring/
│   ├── base_scorer.py         # Abstract base class
│   ├── security_scorer.py     # Dimension 1
│   ├── viability_scorer.py    # Dimension 2
│   ├── integration_scorer.py  # Dimension 3
│   ├── legal_scorer.py        # Dimension 4
│   ├── commercial_scorer.py   # Dimension 5
│   ├── operations_scorer.py   # Dimension 6
│   ├── scalability_scorer.py  # Dimension 7
│   └── maturity_scorer.py     # Dimension 8
├── models/
│   ├── vendor.py
│   ├── assessment.py
│   ├── dimension_score.py
│   ├── report.py
│   ├── task.py
│   └── user.py
├── schemas/           # Pydantic request/response schemas
├── core/
│   ├── config.py      # Settings from env vars
│   ├── database.py    # SQLAlchemy async engine
│   └── security.py    # JWT helpers
└── main.py
```

---

### 3.3 Scoring Engine — Hybrid Rules + LLM

Each dimension scorer follows the same two-step process:

**Step 1 — Rules-Based Scoring (structured fields)**

Deterministic checks on fields provided in the vendor intake form:

```
e.g. security_scorer:
  ISO27001 certified?         → +20 pts
  SOC 2 Type II?              → +20 pts
  GDPR DPA signed?            → +20 pts
  Breach in last 2 years?     → -30 pts
  Pen-test in last 12 months? → +15 pts
  ...
```

**Step 2 — LLM-Assisted Scoring (unstructured documents)**

Documents uploaded (security whitepapers, architecture docs, legal docs) are:

1. Extracted to text
2. Sent to OpenRouter (using a free model, e.g. `meta-llama/llama-3-8b-instruct:free`)
3. Prompted with dimension-specific criteria
4. Response is parsed to extract a sub-score and reasoning

**Final Dimension Score = 0.6 × RulesScore + 0.4 × LLMScore**

---

### 3.4 Database — PostgreSQL

**Core tables:**

```sql
vendors          -- company info, submitted docs, status
assessments      -- one per vendor, tracks run state + timestamps
dimension_scores -- one row per dimension per assessment (score, flags, evidence)
reports          -- generated report metadata + PDF path
tasks            -- action items: title, description, dept, assignee, status
users            -- assessor accounts with roles
enrichment_cache -- cached external API results (TTL 7 days)
```

---

### 3.5 External Data Sources (Free)

| Source                   | Data pulled                                  | API                                                         |
| ------------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| **NVD (NIST)**           | CVE vulnerabilities for vendor's tech stack  | `https://services.nvd.nist.gov/rest/json/cves/2.0`          |
| **Companies House (UK)** | Legal registration, directors, filing status | `https://api.company-information.service.gov.uk` (free key) |
| **OpenCorporates**       | International company registry               | `https://api.opencorporates.com` (free tier)                |
| **OpenRouter**           | LLM inference for document analysis          | `https://openrouter.ai/api/v1`                              |

---

### 3.6 Docker Compose Services

| Service    | Image                             | Port                   |
| ---------- | --------------------------------- | ---------------------- |
| `frontend` | `node:20-alpine` (custom build)   | 3000                   |
| `backend`  | `python:3.11-slim` (custom build) | 8000                   |
| `db`       | `postgres:16-alpine`              | 5432                   |
| `mailhog`  | `mailhog/mailhog`                 | 1025 (SMTP), 8025 (UI) |
| `nginx`    | `nginx:alpine`                    | 80                     |

---

## 4. Data Flow — Vendor Assessment

```
1. Assessor submits vendor via form
        ↓
2. Backend stores vendor record in PostgreSQL
        ↓
3. Assessor triggers "Run Assessment"
        ↓
4. Enrichment Service calls external APIs (NVD, Companies House)
        ↓
5. Scoring Engine runs all 8 dimension scorers:
   a. Rules-based scoring on structured fields
   b. LLM scoring via OpenRouter on uploaded docs
        ↓
6. Dimension scores + evidence stored in DB
        ↓
7. Report Service generates:
   a. Structured JSON report
   b. PDF (WeasyPrint)
        ↓
8. Task Service auto-creates action tasks per Red/Amber finding
        ↓
9. Notify Service emails assigned dept leads via Mailhog
        ↓
10. Dashboard refreshes — report available
```

---

## 5. Security & Auth

- **JWT tokens** (HS256) — short-lived access token (15 min) + refresh token (7 days)
- **Role-based access control (RBAC):**
  - `admin` — full access
  - `procurement` — vendor intake + commercial dimension + tasks
  - `it_security` — security dimension + integration dimension + tasks
  - `legal` — legal/IP dimension + tasks
  - `ai_innovation` — product maturity dimension + read-only
- **No secrets in code** — all config via `.env` file

---

## 6. Key Design Decisions

| Decision                     | Rationale                                                 |
| ---------------------------- | --------------------------------------------------------- |
| FastAPI over Django          | Async-native, faster to prototype, excellent OpenAPI docs |
| PostgreSQL over SQLite       | Concurrent writes, JSON column support, production-viable |
| OpenRouter over local Ollama | Reliable free-tier models without GPU requirements        |
| Mailhog over real SMTP       | Zero config, zero cost, PoC-appropriate                   |
| WeasyPrint over Puppeteer    | Pure Python, simpler Docker build, no Chromium dependency |
| React + shadcn/ui            | Fast to build enterprise-looking UI without a designer    |
