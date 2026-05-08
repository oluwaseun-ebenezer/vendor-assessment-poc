# Phase 5 — PoC Validation

**Duration:** Week 12  
**Goal:** Validate the entire system end-to-end using realistic test data, measure the PoC's core success metrics (time-to-onboard reduction, scoring accuracy), collect stakeholder feedback, and document outcomes for the go/no-go decision.

---

## Deliverables

| #   | Deliverable             | Description                                                 |
| --- | ----------------------- | ----------------------------------------------------------- |
| 5.1 | Seed data script        | Realistic synthetic vendors + assessment data for demo      |
| 5.2 | End-to-end test run     | Full flow for 3 test vendors (1 pass, 1 borderline, 1 fail) |
| 5.3 | Metric capture          | Time-to-onboard, effort reduction, scoring consistency      |
| 5.4 | Stakeholder demo script | Guided walkthrough for Procurement / IT Security / Legal    |
| 5.5 | PoC outcomes report     | Written summary of results, gaps, and recommendations       |
| 5.6 | Next-steps roadmap      | What Phase 2 (production) would add beyond the PoC          |

---

## Step-by-Step Implementation Tasks

### Task 5.1 — Seed Data Script

**`backend/scripts/seed_demo_data.py`**

Creates 3 synthetic AI startup vendors with:

- Fully populated intake form fields
- Uploaded mock documents (use placeholder PDFs with realistic text)
- Pre-run assessments with dimension scores
- Generated reports and auto-created tasks

**Vendor 1 — "GreenLight AI" (Cleared — all GREEN)**

```
Profile: 4-year-old, 30-person UK AI company
Tech: Python, AWS, REST APIs
Security: ISO 27001 ✅, SOC2 ✅, GDPR DPA ✅, pen-test ✅
Viability: Series A funded, stable team, BCP documented
Legal: Clean IP, no litigation, MSA available
Commercial: Transparent pricing, enterprise tier, TCO provided
Expected score: ~87 / Risk: 🟢 GREEN
Expected outcome: Cleared for procurement
```

**Vendor 2 — "AmberTech Solutions" (In Review — AMBER)**

```
Profile: 18-month-old, 8-person Danish AI startup
Tech: Python, self-hosted, custom APIs
Security: GDPR DPA ✅, NO ISO 27001, NO pen-test in 12 months
Viability: Seed funded, 8 employees (key-person risk)
Legal: IP docs incomplete, no MSA yet
Commercial: Pricing available, no enterprise tier
Expected score: ~55 / Risk: 🟡 AMBER
Expected outcome: 4 tasks auto-created (IT Security, Legal, Procurement)
```

**Vendor 3 — "RedFlag.io" (Rejected — RED)**

```
Profile: 6-month-old, 3-person startup
Tech: OpenAI API (third-party dependency), no self-hosted infra
Security: NO certifications, breach disclosed 8 months ago
Viability: Pre-seed, 3 employees, no BCP
Legal: IP ownership unclear, open-source licensing issues flagged
Commercial: No enterprise pricing, no TCO
Expected score: ~28 / Risk: 🔴 RED
Expected outcome: 6 tasks auto-created, status → rejected
```

**Run the seed script:**

```bash
docker compose exec backend python scripts/seed_demo_data.py
```

---

### Task 5.2 — End-to-End Test Scenarios

Run these scenarios manually and document results:

#### Scenario A — Happy Path (GreenLight AI)

1. Log in as `procurement@carlsberg.com`
2. Submit GreenLight AI via the 5-step intake form with all fields filled
3. Upload mock ISO 27001 cert, GDPR DPA, architecture doc
4. Trigger assessment → wait for completion
5. Open the report → verify composite score ≥ 80, all 8 dimensions GREEN or AMBER
6. Verify no or minimal tasks auto-created
7. Change vendor status to `cleared`
8. Download PDF report → verify it opens and contains all sections
9. Check Mailhog → verify assessment-complete email received

**Expected duration (automated):** < 5 minutes end-to-end  
**Equivalent manual estimate:** 6–8 weeks

---

#### Scenario B — Partial Pass (AmberTech Solutions)

1. Log in as `procurement@carlsberg.com`
2. Submit AmberTech via the form with some security fields left incomplete
3. Trigger assessment
4. Verify score is in 40–69 range, risk flag = AMBER
5. Verify at least 3 tasks auto-created and assigned to IT Security + Legal + Procurement
6. Log out, log in as `security@carlsberg.com`
7. Verify IT Security tasks visible in task board
8. Mark IT Security task as "in progress"
9. Log in as `legal@carlsberg.com` → verify Legal tasks visible
10. Check that Legal user cannot see IT Security tasks (role guard)

---

#### Scenario C — Fail / Reject (RedFlag.io)

1. Submit RedFlag.io with minimal info, including disclosing the breach
2. Trigger assessment
3. Verify score < 40, risk flag = RED
4. Verify 5+ tasks auto-created across all departments
5. Verify admin receives summary email with RED risk alert
6. Change status to `rejected` with reason text
7. Verify vendor appears as Rejected (red badge) on dashboard

---

#### Scenario D — Role Isolation Test

1. Log in as `legal@carlsberg.com`
2. Open any vendor report → verify only Legal & IP dimension is expanded by default
3. Navigate to `/api/analytics/dimension-averages` directly → verify 403 Forbidden (legal role has limited access)
4. Navigate to `/admin/users` → verify redirect to dashboard (no access)
5. Log in as `admin@carlsberg.com` → verify `/admin/users` accessible

---

### Task 5.3 — Metric Capture

Record these metrics after completing all 3 test scenarios:

#### Primary PoC Metrics

| Metric                           | Target   | Actual  | Notes                                      |
| -------------------------------- | -------- | ------- | ------------------------------------------ |
| Time-to-complete assessment      | < 10 min | \_\_\_  | Stopwatch from form submit to report ready |
| Time-to-onboard (cleared vendor) | < 1 day  | \_\_\_  | With human review steps included           |
| Manual baseline (enterprise avg) | ~45 days | 45 days | Industry benchmark                         |
| Efficiency gain %                | > 90%    | \_\_\_  | `(45 - actual_days) / 45 * 100`            |

#### Secondary Metrics

| Metric                                         | Result               |
| ---------------------------------------------- | -------------------- |
| Scoring consistency (same vendor scored twice) | Scores within ±5 pts |
| Tasks auto-created per RED vendor              | Count                |
| Tasks auto-created per AMBER vendor            | Count                |
| PDF report generation time                     | Seconds              |
| LLM analysis per document                      | Avg seconds per doc  |
| False positives (Green vendor with real gaps)  | Qualitative          |

#### How to capture timing:

The backend logs `started_at` and `completed_at` on every assessment row. Query these after the test:

```sql
SELECT
    v.company_name,
    a.started_at,
    a.completed_at,
    EXTRACT(EPOCH FROM (a.completed_at - a.started_at)) / 60 AS minutes_to_assess,
    a.composite_score,
    a.risk_flag
FROM assessments a
JOIN vendors v ON v.id = a.vendor_id
WHERE a.status = 'complete'
ORDER BY a.completed_at;
```

---

### Task 5.4 — Stakeholder Demo Script

A 30-minute guided demo for Procurement, IT Security, and Legal stakeholders.

#### Agenda

| Time      | Activity                                             | Audience         |
| --------- | ---------------------------------------------------- | ---------------- |
| 0–5 min   | Intro: what the system does and PoC goals            | All              |
| 5–10 min  | Live: submit a new vendor (5-step form)              | Procurement lead |
| 10–15 min | Live: trigger assessment + watch it run              | All              |
| 15–20 min | Review: open the report, walk through each dimension | All              |
| 20–23 min | Show: auto-created tasks in Kanban board             | Each dept lead   |
| 23–25 min | Show: metrics page — "2 days vs 45 days"             | All              |
| 25–28 min | Q&A and feedback collection                          | All              |
| 28–30 min | Next steps discussion                                | All              |

#### Demo talking points

**For Procurement:**

- "Previously, you'd spend weeks chasing documentation. Now the system ingests everything in minutes and tells you exactly which documents are missing."
- "The task board ensures nothing falls through the cracks — each gap has an assigned owner and due date."

**For IT Security:**

- "The system automatically queries CVE databases for the vendor's tech stack and cross-references their security certifications."
- "Any critical finding triggers an immediate task assigned to your team."

**For Legal:**

- "IP ownership and licensing flags are extracted directly from uploaded contracts using AI document analysis."
- "Legal review time is focused only on the specific gaps the system identifies, not re-reading entire documents from scratch."

#### Feedback form questions (to distribute after demo)

1. On a scale of 1–5, how much time do you believe this system would save your team per vendor assessment?
2. Were the risk scores intuitive and easy to act on?
3. Which dimension would you like to see scored more rigorously?
4. What information was missing that you'd need before clearing a vendor?
5. Would you use this system in your real procurement workflow? (Y/N + comment)

---

### Task 5.5 — PoC Outcomes Report

A written Markdown document (`docs/poc-outcomes-report.md`) to be produced after the demo, covering:

**Structure:**

1. **Executive Summary** — 1-page summary of what was built and key results
2. **Objectives vs. Outcomes** — table comparing stated objectives to what was achieved
3. **Metric Results** — filled-in version of the metric table from Task 5.3
4. **System Performance** — stability, latency, any issues encountered
5. **Stakeholder Feedback Summary** — aggregated feedback form results
6. **Gaps & Limitations** — what the PoC does not cover (e.g., no real-time Crunchbase data, manual document quality dependency)
7. **Go / No-Go Recommendation** — based on results

**Objectives vs. Outcomes table (template):**

| Objective                        | Target                  | Achieved? | Evidence              |
| -------------------------------- | ----------------------- | --------- | --------------------- |
| Automated vetting engine working | All 8 dimensions scored | \_\_\_    | Screenshot / DB query |
| Time-to-onboard reduction        | > 90% vs manual         | \_\_\_    | Metric table          |
| Risk mitigation report generated | PDF with tasks assigned | \_\_\_    | PDF download          |
| Stakeholder approval             | > 3/5 avg on usefulness | \_\_\_    | Feedback forms        |

---

### Task 5.6 — Next-Steps Roadmap (Post-PoC)

If the PoC is approved, document what a production-ready v1.0 would add:

| Area             | PoC                       | Production v1.0                          |
| ---------------- | ------------------------- | ---------------------------------------- |
| Auth             | Local JWT                 | Azure AD / Entra ID SSO                  |
| Notifications    | Mailhog (local)           | Microsoft Teams webhooks + real SMTP     |
| External data    | 3 free APIs               | Crunchbase Pro, D&B, FinancialTimes      |
| LLM              | OpenRouter free models    | Azure OpenAI (GPT-4o, data residency)    |
| Hosting          | Local Docker              | Azure Kubernetes Service (AKS)           |
| Integration      | Standalone                | SAP Ariba / Coupa webhook integration    |
| Audit trail      | Basic status logs         | Full GDPR-compliant audit log            |
| Scoring          | 8 static dimensions       | Configurable scoring rubric per category |
| Multi-tenant     | Single Carlsberg instance | Multi-entity / subsidiary support        |
| Document signing | Upload only               | DocuSign / Adobe Sign for DPAs           |

**Estimated production timeline:** additional 3–4 months with a 3-person team.

---

## Definition of Done ✅

Phase 5 (and the full PoC) is complete when:

- [ ] All 3 seed vendors have been assessed end-to-end with correct risk flags
- [ ] Scenario A–D test scripts have been executed and results documented
- [ ] Time-to-complete-assessment metric is recorded (< 10 min target)
- [ ] The stakeholder demo has been conducted with at least 3 participants
- [ ] Feedback forms collected from demo attendees
- [ ] `docs/poc-outcomes-report.md` is written with all sections filled
- [ ] All Definition of Done items from Phases 1–4 remain passing
- [ ] Go/No-Go recommendation is documented

---

## PoC Success Criteria Summary

The PoC is a **success** if all of the following are true:

| Criterion               | Pass Condition                                                 |
| ----------------------- | -------------------------------------------------------------- |
| ⏱️ Speed                | Automated assessment completes in < 10 minutes                 |
| 📉 Effort reduction     | > 90% reduction vs. 45-day manual baseline                     |
| 🎯 Scoring accuracy     | Risk flags match stakeholder intuition for 2 of 3 test vendors |
| 📋 Task coverage        | All Red/Amber findings have at least 1 auto-created task       |
| 👤 Stakeholder approval | Average demo feedback score ≥ 3.5/5 on usefulness              |
| 🔒 Role isolation       | Each role can only see/do what they're permitted               |
| 📄 Report quality       | PDF report is readable, branded, and decision-ready            |

---

## Final Folder Structure (Full PoC on Completion)

```
vendor-assessment-poc/
├── README.md
├── docker-compose.yml
├── .env.example
├── docs/
│   ├── 00-architecture.md
│   ├── phase-1-foundation.md
│   ├── phase-2-scoring-engine.md
│   ├── phase-3-reporting-tasks.md
│   ├── phase-4-dashboard.md
│   ├── phase-5-validation.md
│   └── poc-outcomes-report.md        ← produced at end of Phase 5
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/versions/
│   ├── scripts/
│   │   └── seed_demo_data.py
│   └── app/
│       ├── main.py
│       ├── core/
│       ├── models/
│       ├── schemas/
│       ├── api/
│       ├── services/
│       ├── scoring/
│       └── templates/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       ├── pages/
│       ├── components/
│       └── hooks/
└── nginx/
    └── nginx.conf
```
