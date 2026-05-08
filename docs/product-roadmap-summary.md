# Automated Vendor Assessment — Product Roadmap Summary

> **For:** Product Managers, Project Sponsors & Stakeholders  
> **Project:** Carlsberg AI Vendor Vetting & Risk Scoring PoC  
> **Total Duration:** ~12 weeks across 5 stages  
> **Goal:** Replace a 6–8 week manual vendor vetting process with an automated system that scores, reports, and assigns actions in under 10 minutes.

---

## 🗺️ The Big Picture

Today, onboarding an AI startup vendor takes Carlsberg's Procurement, IT Security, and Legal teams **45+ days** of back-and-forth emails, manual document review, and coordination across departments.

This system **automates that entire flow** — from the moment a vendor submits their details, through AI-powered risk scoring across 8 compliance dimensions, to generating a PDF report and assigning tasks to the right teams — all within minutes.

---

## 📦 Stage-by-Stage Breakdown

---

### 🏗️ Stage 1 — Foundation & Infrastructure

**Weeks 1–3 | "Get the machine running"**

**What we're building:**
The full technical foundation — database, login system, and the vendor intake form.

**What you'll be able to do when this is done:**

- ✅ Any team member logs in with their role (Procurement, IT Security, Legal, etc.)
- ✅ A user can fill out a structured **5-step vendor submission form** capturing company info, security certifications, technical setup, legal status, and commercial details
- ✅ Uploaded documents (PDFs, contracts, whitepapers) are saved and attached to the vendor record
- ✅ The entire stack runs locally via Docker — no cloud costs during PoC

**Why it matters:**
Nothing else can be built without a clean, structured place to capture vendor data. This stage standardises what information we collect — which is the foundation for consistent scoring.

---

### ⚙️ Stage 2 — Scoring Engine

**Weeks 4–6 | "The AI brain"**

**What we're building:**
The automated scoring engine that evaluates a vendor across **8 risk dimensions** using a combination of rule-based logic and AI document analysis (via OpenRouter LLM).

**The 8 dimensions scored:**

| #   | Dimension                      | Owner            |
| --- | ------------------------------ | ---------------- |
| 1   | Security, Privacy & Compliance | IT Security      |
| 2   | Vendor Viability & Continuity  | Procurement      |
| 3   | Integration & Data Integrity   | Engineering      |
| 4   | Legal & IP                     | Legal            |
| 5   | Cost & Commercials             | Procurement      |
| 6   | Operations & Change Management | Procurement / IT |
| 7   | Global Scalability             | Engineering      |
| 8   | Product Maturity & Delivery    | AI Innovation    |

**How scoring works:**

- Each dimension is scored **0–100**
- Rules-based checks run instantly on the form data (e.g. "ISO 27001 certified? → +20 pts")
- Uploaded documents are analysed by AI (LLM) to extract deeper evidence
- Final score = **60% rules + 40% AI analysis**
- Each dimension gets a risk flag: 🟢 Green (≥70) / 🟡 Amber (40–69) / 🔴 Red (<40)
- The system also pulls live public data: CVE databases for known tech vulnerabilities, Companies House for UK company registration status

**What you'll be able to do when this is done:**

- ✅ Click **"Run Assessment"** on any submitted vendor
- ✅ Watch the assessment complete in the background (no waiting on a page — status updates automatically)
- ✅ See all 8 dimension scores with colour-coded risk flags appear on the vendor page
- ✅ Each score comes with traceable evidence — you can see exactly _why_ a vendor scored as they did

**Why it matters:**
This is the core value proposition. What previously took weeks of human review now happens in minutes — with consistent, auditable, evidence-backed scores.

---

### 📄 Stage 3 — Reports & Task Management

**Weeks 7–9 | "Turn scores into actions"**

**What we're building:**
Automated report generation (PDF + web view) and a task management system that assigns follow-up actions to the right people automatically.

**What you'll be able to do when this is done:**

- ✅ A **full risk report** is generated automatically when an assessment completes — no manual writing
- ✅ Download a **branded PDF report** with: executive summary, radar chart of all 8 dimensions, per-dimension evidence tables, and recommended actions
- ✅ For every Red or Amber finding, the system **auto-creates tasks** assigned to the responsible department (e.g. "Obtain IP Ownership Declaration" → assigned to Legal; "Request pen-test report" → assigned to IT Security)
- ✅ Email notifications are sent to assigned team members with the task details and due dates
- ✅ A **Kanban task board** shows all open actions by department, with priority and overdue flags

**Example output for an Amber vendor:**

> "AmberTech Solutions scores 55/100 — AMBER risk. 4 tasks have been created: IT Security must obtain a pen-test report within 7 days; Legal must request IP documentation; Procurement must clarify enterprise pricing."

**Why it matters:**
The report replaces hours of manual report writing. The task system ensures gaps don't get lost in email chains — every finding has a named owner and a due date.

---

### 📊 Stage 4 — Dashboard & Analytics

**Weeks 10–11 | "The control centre"**

**What we're building:**
The full assessor interface — a pipeline dashboard showing all vendors in one view, role-specific screens per department, and a metrics page that proves the PoC's value.

**What you'll be able to do when this is done:**

- ✅ See the **entire vendor pipeline** at a glance: who's submitted, in review, cleared, or rejected — with scores and risk flags
- ✅ **Search and filter** vendors by name, status, risk level, or submission date
- ✅ Each role sees a **tailored view**: Legal only sees legal-relevant dimensions; IT Security sees security and integration; Procurement sees commercial and viability
- ✅ A **notification badge** shows each user their personally assigned open tasks
- ✅ The **metrics page** shows:
  - Average time-to-assess (target: < 10 minutes)
  - Average time-to-onboard (target: < 1 day including human review)
  - Efficiency gain vs. 45-day manual baseline
  - Risk distribution across all assessed vendors
  - Weakest dimensions across the vendor portfolio
- ✅ Admin users can **manage team accounts** — create/deactivate assessors, assign roles

**Why it matters:**
This turns the system from a point-in-time tool into an ongoing operational capability. Leadership can see the full vendor pipeline and the ROI of the automation in real time.

---

### ✅ Stage 5 — Validation & Demo

**Week 12 | "Prove it works"**

**What we're doing:**
Running the full system end-to-end with realistic test vendors to validate accuracy, capture metrics, and present findings to stakeholders for a go/no-go decision.

**Three test vendor scenarios:**

| Vendor                     | Profile                                     | Expected Outcome              |
| -------------------------- | ------------------------------------------- | ----------------------------- |
| 🟢 **GreenLight AI**       | 4-year-old, ISO 27001, Series A, clean IP   | Score ~87 — Cleared           |
| 🟡 **AmberTech Solutions** | 18-month-old, seed funded, missing certs    | Score ~55 — 4 tasks created   |
| 🔴 **RedFlag.io**          | 6-month startup, disclosed breach, no certs | Score ~28 — 6 tasks, Rejected |

**What we'll prove:**

- ⏱️ Assessment completes in **< 10 minutes** (vs. 45-day manual process)
- 📉 **> 90% time reduction** in vendor vetting effort
- 🎯 Risk flags match stakeholder intuition for all 3 scenarios
- 📋 Every Red/Amber finding has at least one auto-created, assigned task
- 📄 PDF report is readable, branded, and decision-ready

**30-minute stakeholder demo agenda:**

- Submit a vendor live and trigger assessment
- Walk through the full report together
- Show auto-created tasks in each department's board
- Show the metrics page — "2 days vs. 45 days"
- Collect feedback and discuss go/no-go

**Outcome:**
A written PoC outcomes report documenting what was achieved, any gaps, stakeholder feedback scores, and a recommendation on whether to proceed to production.

---

## 🚀 What Comes After the PoC (If Approved)

If the PoC succeeds, a production-ready v1.0 would add:

| Area                    | PoC                    | Production v1.0                          |
| ----------------------- | ---------------------- | ---------------------------------------- |
| Login / Auth            | Local accounts         | Azure AD / SSO                           |
| Notifications           | Local email (Mailhog)  | Microsoft Teams + real email             |
| External data           | 3 free APIs            | Crunchbase Pro, D&B, Financial Times     |
| AI model                | Free OpenRouter models | Azure OpenAI (GPT-4o, EU data residency) |
| Hosting                 | Local Docker           | Azure Kubernetes Service                 |
| Procurement integration | Standalone             | SAP Ariba / Coupa webhook                |
| Document signing        | Upload only            | DocuSign / Adobe Sign for DPAs           |

**Estimated production timeline:** 3–4 additional months with a 3-person team.

---

## 📅 Timeline Summary

```
Week 1–3   ████████████░░░░░░░░░░░░░░░░░░░░  Stage 1 — Foundation
Week 4–6   ░░░░░░░░░░░░████████████░░░░░░░░  Stage 2 — Scoring Engine
Week 7–9   ░░░░░░░░░░░░░░░░░░░░░░░░████████  Stage 3 — Reports & Tasks
Week 10–11 ░░░░░░░░░░░░░░░░░░░░░░░░████████  Stage 4 — Dashboard
Week 12    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████  Stage 5 — Validation
```

**Total: 12 weeks to a fully working, demo-ready PoC.**

---

> 💡 **Bottom line for a product manager:**  
> By the end of week 12, you'll have a running system that takes a vendor from "just submitted" to "scored, reported, tasks assigned, and ready for a go/no-go decision" in under 10 minutes — with a full audit trail, role-based access for every team, and a downloadable PDF report. The metrics page will show the exact efficiency gain to justify production investment.
