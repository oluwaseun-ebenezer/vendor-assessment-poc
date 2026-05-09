# Automated Vendor Assessment Framework — MCP-Powered AI Agent Interface

> **Hackathon Challenge:** Build an MCP server that empowers AI agents to deliver reliable production-ready enterprise software faster.  
> **Our answer:** An MCP server that lets an AI agent orchestrate the entire enterprise vendor vetting workflow — from submission to approved onboarding decision — in under 10 minutes, replacing a 45-day manual process.

---

## 🎯 What This Is

**Client:** Carlsberg (Enterprise)  
**Problem:** Onboarding AI startup vendors at Carlsberg takes 45+ days of manual cross-department coordination (Procurement, IT Security, Legal, Finance). With no consistent scoring, every assessment is only as good as the person doing it.

**Solution:** An MCP server that exposes the full vendor vetting workflow as AI tools. Cline (or any MCP client) can now:

```
submit_vendor → upload_document → run_assessment → get_report → approve_vendor
```

**Result:** Assessments complete in < 10 minutes. Evidence-backed. Fully auditable. AI-native.

---

## ⚡ Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- An [OpenRouter](https://openrouter.ai/) API key (free tier works)

### Run the full stack

```bash
cp .env.example .env
# Edit .env — add your OPENROUTER_API_KEY, set JWT_SECRET and POSTGRES_PASSWORD
docker compose up --build
```

| Service               | URL                        | Purpose                   |
| --------------------- | -------------------------- | ------------------------- |
| Frontend (React)      | http://localhost:3000      | Assessor dashboard UI     |
| Backend API (FastAPI) | http://localhost:8000/docs | REST API + Swagger UI     |
| MCP Server (HTTP)     | http://localhost:3100      | AI agent interface        |
| PostgreSQL            | localhost:5432             | Primary database          |
| Mailhog (email UI)    | http://localhost:8025      | Email notifications (dev) |

### Connect Cline to the MCP Server

Add this to your Cline MCP settings (`~/.cline/mcp_settings.json` or via VS Code settings):

```json
{
  "mcpServers": {
    "vendor-assessment": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": {
        "BACKEND_URL": "http://localhost:8000",
        "MCP_SERVICE_TOKEN": "your_service_token_here"
      }
    }
  }
}
```

Then tell Cline: _"Assess vendor AcmeCorp — UK AI startup, ISO 27001 certified, Series A funded"_ — and watch it run the full workflow.

---

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│           AI AGENT (Cline / Claude Desktop / any MCP client)       │
│   "Assess vendor X" → tools → report → approve                    │
└─────────────────────────────┬─────────────────────────────────────┘
                              │ MCP Protocol (stdio / HTTP port 3100)
┌─────────────────────────────▼─────────────────────────────────────┐
│                 MCP SERVER  ← PRIMARY INNOVATION                   │
│                 TypeScript · @modelcontextprotocol/sdk             │
│                                                                    │
│  10 Tools: submit_vendor, upload_document, run_assessment,        │
│            get_assessment_status, get_report, list_vendors,        │
│            get_tasks, update_task, approve_vendor, get_analytics  │
│                                                                    │
│  3 Resources: vendor://list, vendor://{id}/report,                │
│               tasks://{department}                                 │
└─────────────────────────────┬─────────────────────────────────────┘
                              │ HTTP REST (JWT service token)
┌─────────────────────────────▼─────────────────────────────────────┐
│  React Frontend (port 3000)   FastAPI Backend (port 8000)          │
│  • Assessor dashboard         • Vendor intake API                  │
│  • Risk report viewer         • Scoring Engine (rules + LLM)       │
│  • Task board                 • Report Generator (PDF/WeasyPrint)  │
│  • Metrics & analytics        • Task Orchestration                 │
│                               • Notification Service (Mailhog)     │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
             ┌────────────────┴────────────────┐
     ┌───────▼───────┐              ┌──────────▼──────────┐
     │  PostgreSQL   │              │  External Free APIs │
     │  (Docker)     │              │  • NVD / CVE        │
     └───────────────┘              │  • Companies House  │
                                    │  • OpenCorporates   │
                                    │  • OpenRouter LLM   │
                                    └─────────────────────┘
```

See [`docs/00-architecture.md`](docs/00-architecture.md) for the full system design.

---

## 🤖 MCP Tools Reference

The MCP server is the primary interface to this system. All 10 tools are fully implemented.

| Tool                    | Description                                | Key Inputs                                |
| ----------------------- | ------------------------------------------ | ----------------------------------------- |
| `submit_vendor`         | Create a vendor record (full intake form)  | `company_name`, 40+ optional risk fields  |
| `upload_document`       | Attach document for LLM analysis           | `vendor_id`, `doc_type`, `content_base64` |
| `run_assessment`        | Trigger 8-dimension scoring engine         | `vendor_id`                               |
| `get_assessment_status` | Poll assessment progress                   | `vendor_id`                               |
| `get_report`            | Get full risk report (JSON or summary)     | `vendor_id`, `format`                     |
| `list_vendors`          | Query vendor pipeline with filters         | `status?`, `risk_flag?`, `search?`        |
| `get_tasks`             | Get auto-generated action items            | `vendor_id?`, `department?`, `status?`    |
| `update_task`           | Update task status / assignee              | `task_id`, `status?`, `assigned_to?`      |
| `approve_vendor`        | Set final onboarding decision              | `vendor_id`, `decision`, `reason?`        |
| `get_analytics`         | Pipeline metrics and time-to-onboard stats | `from_date?`, `to_date?`                  |

**MCP Resources:**

| URI                    | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `vendor://list`        | Live snapshot of all vendors in pipeline                          |
| `vendor://{id}/report` | Full assessment report for a vendor                               |
| `tasks://{department}` | Open tasks for: procurement / it_security / legal / ai_innovation |

See [`docs/phase-0-mcp-server.md`](docs/phase-0-mcp-server.md) for full tool specifications.

---

## 📐 The 8 Assessment Dimensions

Each vendor is scored 0–100 across 8 risk dimensions. Each score is a blend of rules-based checks (60%) and LLM document analysis (40%).

| #   | Dimension                      | Owner            | Key Signals                                |
| --- | ------------------------------ | ---------------- | ------------------------------------------ |
| 1   | Security, Privacy & Compliance | IT Security      | ISO 27001, SOC 2, GDPR DPA, pen-test, CVEs |
| 2   | Vendor Viability & Continuity  | Procurement      | Funding stage, age, headcount, BCP         |
| 3   | Integration & Data Integrity   | IT / Engineering | API docs, SLA uptime, SSO support          |
| 4   | Legal & IP                     | Legal            | IP ownership, litigation, MSA available    |
| 5   | Cost & Commercials             | Procurement      | Pricing transparency, enterprise tier      |
| 6   | Operations & Change Management | Procurement / IT | CSM, support tiers, deployment method      |
| 7   | Global Scalability             | IT / Engineering | Multi-region, EU residency, multilingual   |
| 8   | Product Maturity & Delivery    | AI Innovation    | In production, enterprise customers, TRL   |

**Risk flags:** 🟢 Green (≥70) / 🟡 Amber (40–69) / 🔴 Red (<40)

---

## 📋 Delivery Phases

| Phase                                      | Focus                       | Status       | Key Deliverable                                |
| ------------------------------------------ | --------------------------- | ------------ | ---------------------------------------------- |
| [Phase 0](docs/phase-0-mcp-server.md)      | MCP Server                  | ✅ Delivered | 10 tools + 3 resources, full agent workflow    |
| [Phase 1](docs/phase-1-foundation.md)      | Foundation & Infrastructure | 🔲 Pending   | Docker stack, DB schema, vendor intake form    |
| [Phase 2](docs/phase-2-scoring-engine.md)  | Scoring Engine              | 🔲 Pending   | Rules + LLM scoring across 8 dimensions        |
| [Phase 3](docs/phase-3-reporting-tasks.md) | Reporting & Task Management | 🔲 Pending   | PDF reports, auto-task creation, notifications |
| [Phase 4](docs/phase-4-dashboard.md)       | Dashboard & Analytics       | 🔲 Pending   | Full assessor UI, role views, metrics          |
| [Phase 5](docs/phase-5-validation.md)      | PoC Validation              | 🔲 Pending   | End-to-end test, metrics, stakeholder demo     |

---

## 🗂️ Project Structure

```
vendor-assessment-poc/
├── README.md
├── docker-compose.yml
├── .env.example
├── criteria.txt                  # Hackathon judging criteria
├── docs/
│   ├── hackathon-pitch.md        ← Jury Q&A, demo script, pitch narrative
│   ├── 00-architecture.md        ← Full system design
│   ├── phase-0-mcp-server.md     ← MCP tools + resources spec (PRIMARY)
│   ├── phase-1-foundation.md
│   ├── phase-2-scoring-engine.md
│   ├── phase-3-reporting-tasks.md
│   ├── phase-4-dashboard.md
│   └── phase-5-validation.md
├── mcp-server/                   ← PRIMARY INNOVATION LAYER
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts              ← MCP server (10 tools + 3 resources)
│       └── client.ts             ← Authenticated HTTP client to FastAPI
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── api/                  # Route handlers (thin controllers)
│   │   ├── services/             # Business logic
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic v2 schemas
│   │   ├── scoring/              # 8 dimension scorers + LLM analyser
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                     # React + Vite + TypeScript (assessor UI)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
└── nginx/
    └── nginx.conf
```

---

## 🔐 Environment Variables

See `.env.example` for all required variables.

```env
# Core secrets (required)
OPENROUTER_API_KEY=your_key_here   # Free tier: https://openrouter.ai/
POSTGRES_PASSWORD=changeme
JWT_SECRET=changeme
MCP_SERVICE_TOKEN=changeme         # Service account token for MCP → backend auth

# Database
DATABASE_URL=postgresql+asyncpg://vendor_user:changeme@db:5432/vendor_assessment

# MCP Server
BACKEND_URL=http://backend:8000
```

---

## 📖 Hackathon Pitch

See [`docs/hackathon-pitch.md`](docs/hackathon-pitch.md) for:

- Demo opening slides (Target User + Mission-Criticality)
- Full answers to all 4 jury scoring questions
- The Cline agent demo script (step-by-step)
- Why this solution wins on the challenge theme

---

## 💡 Default Demo Accounts

All created by the Alembic seed migration:

| Email                       | Role            | Password       |
| --------------------------- | --------------- | -------------- |
| `admin@carlsberg.com`       | `admin`         | `ChangeMe123!` |
| `procurement@carlsberg.com` | `procurement`   | `ChangeMe123!` |
| `security@carlsberg.com`    | `it_security`   | `ChangeMe123!` |
| `legal@carlsberg.com`       | `legal`         | `ChangeMe123!` |
| `innovation@carlsberg.com`  | `ai_innovation` | `ChangeMe123!` |
