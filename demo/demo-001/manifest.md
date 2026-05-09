# Demo Manifest — demo-001

**Demo ID:** `demo-001`
**Date:** 2026-05-09
**Scenario:** Amber-risk AI startup onboarding assessment
**Vendor:** AmberTech Solutions
**Expected Outcome:** 🟡 AMBER — ~52/100 composite score
**Purpose:** Hackathon judging demo video

---

## 🎯 Persona Being Played

> **Sophie Andersen — Head of Procurement, Carlsberg Group**
>
> Sophie receives a request from the AI Innovation team: _"We've found a Danish AI startup called AmberTech Solutions that can handle our demand forecasting — can you fast-track the vendor vetting?"_
>
> Normally this would take Sophie 6–8 weeks of back and forth with Legal, IT Security, and Finance.
> Today, she asks Cline.

---

## 📊 Jury Slide Script

### Slide 1A — Who is the target user?

> **Enterprise Procurement, IT Security, and Legal professionals** at large FMCG corporations like Carlsberg who are responsible for vetting and onboarding AI startup vendors safely.

| Person                           | Role                              | Pain today                                               |
| -------------------------------- | --------------------------------- | -------------------------------------------------------- |
| **Head of Procurement** (Sophie) | Owns the onboarding process       | Manually chasing 6–8 departments for sign-off            |
| **IT Security Lead**             | Reviews certs and CVEs            | Re-reading the same documents for every new vendor       |
| **Legal Counsel**                | Checks IP ownership and contracts | Same due diligence checklist, manually, every time       |
| **AI Innovation Manager**        | Evaluating AI startup maturity    | No standardised scoring — just gut feel and spreadsheets |

### Slide 1B — What goal are we helping them attain? Why is it mission-critical?

> Successfully vet AI startup vendors across 8 compliance risk dimensions and make a **confident, defensible, evidence-backed onboarding decision — fast**.

Why mission-critical:

| Risk                        | Consequence                                                    |
| --------------------------- | -------------------------------------------------------------- |
| 🔐 Vendor has security gaps | Data breach → GDPR fine up to **4% of global annual turnover** |
| ⚖️ IP ownership unclear     | Licensing dispute → product shutdown mid-rollout               |
| 💸 Vendor goes bust         | Pre-seed startup folding mid-contract                          |
| 🌐 No EU data residency     | Regulatory non-compliance across 50+ markets                   |

**Current state: 45+ days, 40–60 staff hours per vendor, no consistent scoring.**
Carlsberg is accelerating AI adoption — the backlog is growing. This is the bottleneck.

---

## 🏢 Vendor Intake Data — AmberTech Solutions

All fields pre-filled for the `submit_vendor` MCP tool call:

```json
{
  "company_name": "AmberTech Solutions",
  "website": "https://ambertech.io",
  "description": "AI-powered demand forecasting and inventory optimisation for FMCG supply chains. Uses transformer-based models trained on historical sales and external signals.",
  "country": "Denmark",
  "founded_year": 2024,
  "employee_count": 8,
  "funding_stage": "seed",
  "company_registration_number": "DK-39201847",
  "operating_countries": 2,
  "tech_stack": ["Python", "PyTorch", "FastAPI", "PostgreSQL", "AWS"],
  "cloud_provider": "AWS",
  "deployment_method": "SaaS",
  "soc2": false,
  "iso27001": false,
  "gdpr_dpa": true,
  "pen_test": false,
  "security_breach": false,
  "eu_data_residency": true,
  "data_residency": "eu-west-1 (Ireland)",
  "sla_uptime": "99.5%",
  "api_docs_available": true,
  "multi_region": false,
  "enterprise_customers": false,
  "enterprise_pricing": false,
  "dedicated_csm": false,
  "pricing_model": "usage_based",
  "pending_litigation": false,
  "ip_ownership_documented": false,
  "business_continuity_plan": false,
  "in_production": true
}
```

### Why This Vendor Is Interesting for the Demo

AmberTech is a deliberate **amber-risk** case:

| Factor                      | Assessment | Risk                         |
| --------------------------- | ---------- | ---------------------------- |
| GDPR DPA signed             | ✅ Yes     | Low                          |
| ISO 27001                   | ❌ No      | 🔴 Red flag                  |
| SOC 2                       | ❌ No      | 🔴 Red flag                  |
| Pen-test report             | ❌ No      | 🔴 Red flag                  |
| Seed funded, 8 employees    | ⚠️ Yes     | 🟡 Amber — key-person risk   |
| EU data residency           | ✅ Yes     | Low                          |
| No enterprise customers yet | ⚠️ None    | 🟡 Amber — unproven at scale |
| IP ownership undocumented   | ❌ No      | 🟡 Amber                     |
| No business continuity plan | ❌ No      | 🟡 Amber                     |
| In production               | ✅ Yes     | Low                          |

**This makes the outcome realistic** — not a slam-dunk approval, not a clear rejection. A conditional amber approval with action items is the most realistic and impressive outcome to show judges.

---

## 📄 Document Upload

**File:** `demo/demo-001/assets/ambertech-msa.txt`
**Type:** `legal_doc`
**Filename for upload:** `ambertech-msa-draft.txt`

This is a truncated MSA draft with intentionally incomplete IP assignment clauses — which the LLM scorer will flag.

---

## 📐 Expected Outputs Per Step

### Step 1 — `get_analytics` (baseline)

```
Pipeline Analytics:
- Total vendors: [N existing]
- Risk distribution: [existing breakdown]
- Avg assessment score: [existing avg]
```

_Talking point: "This is the current state of Carlsberg's AI vendor pipeline before AmberTech enters."_

---

### Step 2 — `submit_vendor`

```
✅ Vendor created successfully.
- Name: AmberTech Solutions
- ID: [uuid]
- Status: submitted
➡ Next: run_assessment({ vendor_id: "[uuid]" })
```

---

### Step 3 — `upload_document`

```
✅ Document uploaded.
- Filename: ambertech-msa-draft.txt
- Type: legal_doc
- Vendor: AmberTech Solutions
```

---

### Step 4 — `run_assessment`

```
🚀 Assessment started.
- Vendor: AmberTech Solutions
- Status: pending
➡ Poll get_assessment_status until complete.
```

---

### Step 5 — `get_assessment_status` (poll)

```
⚙️ Assessment Status: RUNNING
...
✅ Assessment Status: COMPLETE
- Score: ~52/100
- Risk Flag: 🟡 AMBER
```

_Talking point: "The scoring engine has just run deterministic rules across 8 dimensions AND sent the MSA to an LLM for legal analysis — all in under a minute."_

---

### Step 6 — `get_report` (summary format)

Expected output structure:

```
# Vendor Risk Report: AmberTech Solutions
**Overall Score: 52/100 🟡 AMBER**

## Dimension Scores
| Dimension | Score | Flag | Key Finding |
|---|---|---|---|
| Security, Privacy & Compliance | 35/100 | 🔴 RED | No ISO 27001, no SOC 2, no pen-test |
| Vendor Viability & Continuity | 45/100 | 🟡 AMBER | Seed funded, 8 employees, key-person risk |
| Legal & IP | 48/100 | 🟡 AMBER | IP ownership undocumented, MSA incomplete |
| Integration & Data Integrity | 65/100 | 🟢 GREEN | API docs available, PostgreSQL, documented stack |
| Cost & Commercials | 50/100 | 🟡 AMBER | No enterprise pricing, no dedicated CSM |
| Operations & Change Management | 55/100 | 🟡 AMBER | No BCP, SaaS deployment, in production |
| Global Scalability | 60/100 | 🟢 GREEN | EU data residency, AWS SaaS |
| Product Maturity & Delivery | 58/100 | 🟡 AMBER | In production but no enterprise customers |

## Executive Summary
AmberTech Solutions scores AMBER overall. The primary concern is the Security dimension...

## Top Action Items
1. [HIGH] Request ISO 27001 roadmap or pen-test report (IT Security)
2. [HIGH] Obtain IP ownership assignment clause in MSA (Legal)
3. [MEDIUM] Financial continuity review for seed-stage vendor (Procurement)
4. [MEDIUM] Clarify enterprise pricing and SLA (Procurement)
```

---

### Step 7 — `get_tasks`

```
4 open tasks for AmberTech Solutions:

🔴 [HIGH] Request pen-test or ISO 27001 roadmap — IT Security — Due: 7 days
🔴 [HIGH] Obtain IP assignment clause in MSA — Legal — Due: 14 days
🟡 [MEDIUM] Financial continuity review (seed vendor) — Procurement — Due: 21 days
🟡 [MEDIUM] Confirm enterprise pricing model — Procurement — Due: 14 days
```

_Talking point: "These tasks were auto-generated from the assessment findings and assigned to the right departments. Zero manual triage."_

---

### Step 8 — `approve_vendor`

Decision: **`cleared`** (conditional approval)

```json
{
  "vendor_id": "[uuid]",
  "decision": "cleared",
  "reason": "AmberTech Solutions scores 52/100 AMBER. Approved conditionally pending: (1) pen-test report or ISO 27001 roadmap within 30 days, (2) IP assignment clause added to MSA. EU data residency confirmed, GDPR DPA signed, in production. Risk acceptable for a 90-day pilot with data access review at Day 30."
}
```

Expected output:

```
✅ Vendor decision recorded.
- Vendor: AmberTech Solutions
- Decision: CLEARED
- Status: cleared
```

_Talking point: "A 45-day process just completed in under 5 minutes — with a documented, evidence-backed, auditable decision."_

---

## 🎤 Jury Q&A Talking Points

### Q1: How well did you articulate the process you're helping users succeed with?

> "The process is enterprise AI vendor vetting — from a new AI startup entering the pipeline to a final go/no-go onboarding decision. It involves 6–8 departments, 40+ evaluation criteria, document review, external data lookups, and a signed-off decision. Today this lives in email inboxes and spreadsheets. We've turned it into 10 MCP tools."

### Q2: How business-critical is this target process?

> "GDPR Article 28 requires documented due diligence on all data processors. Carlsberg's FY2024 revenue is DKK 73 billion — 4% of that is DKK 2.9 billion in potential GDPR fines for a bad vendor decision. Beyond fines: IP disputes, vendor collapse, reputational damage from a breach. And Carlsberg's entire AI strategy is blocked by this bottleneck."

### Q3: How much impact could a great tech solution have?

> "Every step of this process is automatable: structured intake → form. Document analysis → LLMs. Rules-based checks → deterministic scoring. External data → free APIs. Report writing → LLMs again. Task assignment → rules. Decision support → composite score + evidence. Zero steps require physical presence or genuinely novel judgment. A great solution could take 40 hours of human work down to under 30 minutes."

### Q4: How much impact does this demo solution have?

> "45 days → under 10 minutes. 40–60 staff hours → under 1 hour of human review. 100% consistent scoring — same rules, same LLM, every time. Full evidence trail per dimension. Auto-generated tasks assigned to the right department. And because it's MCP — this isn't just a faster web app. An AI agent can now batch-assess 20 vendors overnight, or answer 'Is SupplierX cleared?' in seconds from any other system."

---

## ⚠️ Fallback Notes

| Situation                                | What to do                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Backend not responding                   | Show the manifest expected outputs and explain them — the architecture speaks for itself                                       |
| Assessment takes > 60s                   | Explain polling pattern: "The agent fires the trigger and monitors asynchronously — just like a human would check their inbox" |
| Score comes back different than expected | That's fine — the actual LLM scoring is non-deterministic. Narrate the real result                                             |
| Task list is empty                       | Call `get_tasks` without the vendor filter — show all open tasks across the pipeline                                           |
