# Gemini Canvas Presentation Prompt

Create a **short, precise, and complete presentation** (6–8 slides max) for a hackathon jury demo of the following solution. Use a clean, modern design with Carlsberg red (`#D4002A`) as the accent color.

---

## SOLUTION CONTEXT

**Project:** Automated Vendor Assessment Framework
**Built for:** Carlsberg Group (global FMCG enterprise)
**Event:** Hackathon

**The Problem:** Onboarding AI startup vendors at Carlsberg takes **45+ days** of manual coordination across Procurement, IT Security, Legal, and Finance — no consistent scoring, no audit trail.

**The Solution:** An MCP (Model Context Protocol) server that exposes the entire vendor vetting workflow as AI agent tools. An AI agent (Cline) submits a vendor, runs an 8-dimension hybrid assessment, and delivers a scored, evidence-backed risk report and action plan in **under 10 minutes** — a **99.5% time reduction**.

**Core Workflow:**
`submit_vendor → upload_document → run_assessment → get_report → approve_vendor`

**8 Scoring Dimensions (0–100 each):**
- Security, Privacy & Compliance (IT Security)
- Vendor Viability & Continuity (Procurement)
- Integration & Data Integrity (Engineering)
- Legal & IP (Legal)
- Cost & Commercials (Procurement)
- Operations & Change Management (Procurement/IT)
- Global Scalability (Engineering)
- Product Maturity & Delivery (AI Innovation)

**Scoring Formula:** `Final Score = 60% Rules-Based + 40% LLM Analysis`

**Tech Stack:**
- MCP Server: TypeScript + `@modelcontextprotocol/sdk`
- Backend: Python FastAPI + PostgreSQL + SQLAlchemy async
- Frontend: React 18 + Vite + Tailwind CSS + shadcn/ui
- LLM: OpenRouter API (free tier, with rate-limit fallback)
- External enrichment: NVD/NIST CVE API + Companies House UK API
- PDF reports: ReportLab (Carlsberg-branded)
- Infra: Docker Compose (5 services) + Nginx

**Key Features:**
- 13 MCP tools + 3 resources for full AI-agent orchestration
- AI-powered vendor lookup (pre-fills 30+ fields with confidence indicators)
- Auto-task creation for every Amber/Red dimension finding
- Multi-project support with per-project LLM model/temperature/weights config
- RBAC (5 roles: admin, procurement, it_security, legal, ai_innovation)
- Email notifications via SMTP
- Analytics dashboard (efficiency metrics vs. 45-day baseline)
- Pre-generated PDF reports as demo artifacts

---

## SLIDE STRUCTURE

1. **Title Slide** — Project name, one-line tagline, team/event
2. **The Problem** — 45-day manual process pain points, departments involved, inconsistency
3. **The Solution** — MCP-powered AI agent workflow, 10-minute assessment, 99.5% time reduction
4. **Architecture** — Visual diagram of 5 services (MCP Server ↔ FastAPI ↔ PostgreSQL, React UI, Nginx, Mailhog), the 10-step data flow
5. **Scoring Engine** — 8 dimensions table, hybrid scoring formula (rules + LLM), external enrichment (CVE, Companies House)
6. **Key Features** — 13 MCP tools, auto-tasks, RBAC, projects/multi-context, branded PDF reports
7. **Impact & Demo** — 45 days → <10 minutes, ROI framing, live demo workflow (5-step agent command sequence)
8. **Roadmap & Ask** — 5-stage roadmap to production, what we'd need to scale

---

## VOICE SCRIPT (per slide, for jury presentation)

**Slide 1 – Title:**
*"Thank you. What we built is an automated vendor assessment framework for Carlsberg — turning a 45-day cross-departmental bottleneck into a 10-minute AI-orchestrated workflow."*

**Slide 2 – Problem:**
*"Every time Carlsberg wants to onboard an AI startup vendor, four departments — Procurement, IT Security, Legal, and Finance — have to manually coordinate, chase documents, and score independently. There's no standard methodology, no audit trail, and the average cycle is 45 days. That's unacceptable in a world where AI vendors move fast."*

**Slide 3 – Solution:**
*"We built an MCP server — a Model Context Protocol server — that exposes the entire vetting workflow as AI agent tools. You give the agent a company name. It researches the vendor, runs an 8-dimension risk assessment, generates a scored report with evidence, creates department action items, and delivers a PDF — all in under 10 minutes. No human in the loop required for the assessment phase."*

**Slide 4 – Architecture:**
*"The system is five Docker services: the MCP server in TypeScript that the AI agent talks to, a FastAPI backend handling business logic and LLM orchestration, PostgreSQL for structured storage, a React dashboard for human oversight, and Nginx tying it together. The full data flow goes from agent command to scored report in 10 discrete steps."*

**Slide 5 – Scoring Engine:**
*"The scoring engine evaluates vendors across 8 dimensions, each owned by a department. The formula is deterministic rules — like ISO 27001 certification adds 20 points, a disclosed security breach subtracts 30 — combined 60/40 with LLM analysis of uploaded documents. We also enrich automatically from the NVD CVE database for known vulnerabilities and Companies House for registration validation."*

**Slide 6 – Features:**
*"On the capability side: 13 MCP tools cover the entire lifecycle from submission to approval. Every Amber or Red finding auto-creates a prioritized task for the responsible department. We have role-based access for all five stakeholder groups. And multi-project support means a supply chain assessment can weight security higher than a marketing AI assessment — each project has its own LLM model, temperature, and dimension weights."*

**Slide 7 – Impact:**
*"The headline number: 99.5% time reduction. 45 days to under 10 minutes. But beyond speed — consistent scoring methodology, full audit trail, evidence-backed decisions, and department-specific action plans. The live demo workflow is five agent commands: submit, upload, assess, report, approve."*

**Slide 8 – Roadmap:**
*"We see five stages to production: the MCP PoC you're looking at now, then enterprise SSO and ERP integration, then a fine-tuned Carlsberg-specific scoring model, then multi-region compliance packs, then a self-improving system that learns from past approvals. What we need to scale: access to Carlsberg's vendor history data and integration into the existing procurement system."*

---

## Design Notes for Canvas

- Slide 4 should include a simple architecture diagram with labeled boxes and arrows
- Slide 5 should include the 8-dimension table
- Use dark background (`#1a1a2e`) with Carlsberg red (`#D4002A`) highlights and white text
- Keep bullet points to max 4 per slide — this is a jury demo, not documentation
- Add a subtle Carlsberg-inspired geometric motif (hops/barley or hexagon pattern) as background texture
