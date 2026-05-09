# Demo Manifest — demo-002

**Demo ID:** `demo-002`
**Date:** 2026-05-09
**Scenario:** Large enterprise AI vendor — governance, legal, and data sovereignty concerns
**Vendor:** OpenAI (API + ChatGPT Enterprise)
**Expected Outcome:** 🟡 AMBER — ~62/100 composite score
**Purpose:** Contrast demo — shows the system handles big-name vendors differently from startups

---

## 🎯 Persona Being Played

> **Marcus Jensen — CISO & IT Security Lead, Carlsberg Group**
>
> The AI Innovation team wants to standardise on OpenAI's API and ChatGPT Enterprise for internal use across 50+ markets. Marcus needs to sign off on the vendor from a security, data sovereignty, and legal perspective before Carlsberg's DPO will allow any customer data to flow through the platform.
>
> This isn't a startup with obvious red flags — OpenAI is the market leader. But that doesn't mean it's automatically safe for enterprise use under EU law. Marcus asks Cline to run the formal assessment.

---

## 🎯 Why This Demo Is Powerful

This is the **contrast demo** to demo-001. It shows:

| Factor | AmberTech (demo-001) | OpenAI (demo-002) |
|---|---|---|
| Security certs | ❌ None | ✅ SOC 2 + ISO 27001 |
| Financial viability | ⚠️ Seed, 8 employees | ✅ $157B valuation, Microsoft-backed |
| GDPR/DPA | ✅ Signed | ✅ Full DPA (OpenAI Ireland) |
| IP ownership | ❌ Unclear | ✅ Output assigned to Customer |
| Governing law | ✅ Denmark | 🔴 California, USA |
| Liability cap | ⚠️ EUR 250K | 🔴 12-month fees (negotiable) |
| US CLOUD Act risk | ✅ None (EU startup) | 🔴 US company — DPIA required |
| Output uniqueness | ✅ N/A | ⚠️ Non-unique outputs |
| Vendor lock-in | 🟢 Low | 🔴 High (60% market share) |
| Overall | 🔴 RED ~42/100 | 🟡 AMBER ~62/100 |

**The key message:** A $157B company with ISO 27001 and SOC 2 still scores AMBER — because *legal structure, data sovereignty, and contractual terms* matter as much as technical security. The scoring engine catches what a checklist misses.

---

## 🏢 Vendor Intake Data — OpenAI

```json
{
  "company_name": "OpenAI",
  "website": "https://openai.com",
  "description": "AI research and deployment company. Services: GPT-4o and GPT-4 Turbo API for internal application development, ChatGPT Enterprise for internal productivity. Use cases: demand forecasting fine-tuning, supply chain analytics, internal knowledge management.",
  "country": "US",
  "founded_year": 2015,
  "employee_count": 3500,
  "funding_stage": "growth",
  "company_registration_number": "US-DE-OpenAI-OpCo-LLC",
  "operating_countries": 50,
  "tech_stack": ["Python", "Azure", "AWS", "Kubernetes", "PyTorch"],
  "cloud_provider": "Azure",
  "deployment_method": "SaaS",
  "soc2": true,
  "iso27001": true,
  "gdpr_dpa": true,
  "pen_test": true,
  "security_breach": false,
  "eu_data_residency": true,
  "data_residency": "EU (OpenAI Ireland Ltd., SCCs applicable)",
  "sla_uptime": "99.9%",
  "api_docs_available": true,
  "multi_region": true,
  "enterprise_customers": true,
  "enterprise_pricing": true,
  "dedicated_csm": true,
  "pricing_model": "usage_based",
  "pending_litigation": true,
  "ip_ownership_documented": true,
  "business_continuity_plan": true,
  "open_source_licence_clean": false,
  "in_production": true
}
```

### Why This Vendor Is Interesting for the Demo

| Factor | Value | Risk |
|---|---|---|
| SOC 2 Type II | ✅ Yes | 🟢 Green |
| ISO 27001 | ✅ Yes | 🟢 Green |
| GDPR DPA (OpenAI Ireland) | ✅ Yes + SCCs | 🟢 Green |
| EU data residency | ✅ Yes (Azure EU) | 🟢 Green |
| Governing law | 🔴 California, USA | 🔴 Red flag |
| Pending litigation | ✅ Yes (multiple active cases) | 🔴 Red flag |
| US CLOUD Act exposure | ⚠️ US company | 🟡 Amber |
| Liability cap | ⚠️ 12-month fees only | 🟡 Amber |
| Open-source licence | ⚠️ Non-clean (training data disputes) | 🟡 Amber |
| Vendor lock-in risk | 🔴 60% market share, proprietary models | 🟡 Amber |
| Output uniqueness | ⚠️ Non-unique by design | 🟡 Amber |
| Financial viability | ✅ $157B, Microsoft-backed | 🟢 Green |
| Enterprise customers | ✅ Thousands globally | 🟢 Green |
| API docs | ✅ Excellent | 🟢 Green |
| Uptime SLA | ✅ 99.9% with credits | 🟢 Green |

**The amber outcome is driven entirely by legal and contractual risk, not technical risk** — which is the most realistic enterprise scenario and makes the best talking point.

---

## 📄 Document Upload

**File:** `demo/demo-002/assets/openai-service-agreement.txt`
**Type:** `legal_doc`
**Filename for upload:** `openai-enterprise-agreement-review.txt`

This is a Carlsberg-annotated review copy of OpenAI's real Business Terms and DPA (Jan 2026), with embedded legal notes highlighting California governing law, liability cap concerns, US CLOUD Act exposure, and the breach notification timing gap.

The LLM scorer should flag:
- California governing law vs EU-expected Danish law
- "Without undue delay" breach notification vs 24-hour requirement
- Sub-processor US CLOUD Act risk
- Liability cap negotiation needed
- Pending litigation noted

---

## 📐 Expected Outputs Per Step

### Step 1 — `get_analytics` (baseline)

```
Pipeline Analytics:
- Total vendors: 2 (AcmeCorp AI + AmberTech from demo-001)
- Risk distribution: 1 red, 1 amber
- Avg assessment score: ~50/100
```

---

### Step 2 — `submit_vendor`

```
✅ Vendor created successfully.
- Name: OpenAI
- ID: [uuid]
- Status: submitted
```

---

### Step 3 — `upload_document`

```
✅ Document uploaded.
- Filename: openai-enterprise-agreement-review.txt
- Type: legal_doc
```

---

### Step 4 — `run_assessment`

```
🚀 Assessment started.
- Status: pending
```

---

### Step 5 — `get_assessment_status`

```
✅ Assessment Status: COMPLETE
- Score: ~62/100
- Risk Flag: 🟡 AMBER
```

_Talking point: "Notice how a company with ISO 27001 and SOC 2 still scores AMBER. The LLM read the contract and flagged California governing law, the liability cap, and the CLOUD Act exposure. A human reading 50 pages of legal text might miss that. Cline didn't."_

---

### Step 6 — `get_report` (summary)

Expected dimension breakdown:

```
# Vendor Risk Report: OpenAI

**Overall Score: ~62/100 🟡 AMBER**

## Dimension Scores
| Dimension | Score | Flag | Key Finding |
|---|---|---|---|
| Security, Privacy & Compliance | 75/100 | 🟢 GREEN | SOC 2 + ISO 27001 + pen-test + no breach |
| Vendor Viability & Continuity | 80/100 | 🟢 GREEN | $157B, Microsoft-backed, 3500 employees |
| Legal & IP | 50/100 | 🟡 AMBER | California law, CLOUD Act, liability cap, pending litigation |
| Integration & Data Integrity | 70/100 | 🟢 GREEN | Excellent API docs, multi-region, strong stack |
| Cost & Commercials | 60/100 | 🟡 AMBER | Enterprise pricing available but usage-based unpredictability |
| Operations & Change Management | 65/100 | 🟢 GREEN | BCP in place, dedicated CSM, 99.9% SLA |
| Global Scalability | 75/100 | 🟢 GREEN | 50 countries, multi-region, EU data residency |
| Product Maturity & Delivery | 80/100 | 🟢 GREEN | Market leader, thousands of enterprise customers |

## Key Findings
- LEGAL: California governing law is non-standard for EU enterprise (requires GC sign-off)
- LEGAL: Pending litigation (training data copyright cases) — material risk
- LEGAL: Liability cap = 12-month fees only — insufficient for supply chain dependency
- DATA: US CLOUD Act — US government can compel data access despite EU residency
- DATA: Sub-processor list includes US entities (Microsoft Azure, AWS)
- POSITIVE: Output ownership fully assigned to Carlsberg
- POSITIVE: Zero data retention mode available for API (GDPR compliant)
- POSITIVE: SOC 2 Type II + ISO 27001 — strongest security posture in pipeline
```

---

### Step 7 — `get_tasks`

```
Open tasks for OpenAI:

🔴 [HIGH] Obtain Group General Counsel sign-off on California governing law — Legal
🔴 [HIGH] Complete DPIA for US CLOUD Act sub-processor exposure — IT Security / DPO
🟡 [MEDIUM] Negotiate liability cap (min EUR 5M or 24-month fees) — Procurement
🟡 [MEDIUM] Negotiate 24-hour breach notification SLA — Legal
🟡 [MEDIUM] Confirm ZDR (zero data retention) mode technically via API config — IT Security
🟡 [MEDIUM] Develop multi-vendor AI fallback strategy — CTO / AI Innovation
🟡 [MEDIUM] Assess open-source training data litigation impact — Legal
```

---

### Step 8 — `approve_vendor`

Decision: **`cleared`** (conditional — same pattern as demo-001 but different reasons)

```json
{
  "vendor_id": "[uuid]",
  "decision": "cleared",
  "reason": "OpenAI scores 62/100 AMBER. Strong technical security (SOC 2, ISO 27001, 99.9% SLA). Approved conditionally pending: (1) Group GC sign-off on California governing law, (2) DPIA completion for CLOUD Act exposure, (3) liability cap negotiation to min EUR 5M, (4) zero data retention mode confirmed in API config. NOT approved for production-critical supply chain workloads until multi-vendor fallback strategy is in place."
}
```

_Talking point: "Two vendors, two very different risk profiles, same systematic process. One is a seed startup with no certs — the other is the world's most valuable AI company. Both score AMBER for completely different reasons. That's what consistent, evidence-based assessment looks like."_

---

## 🎤 Jury Talking Points

### The contrast narrative:

> "Demo-001 showed you a seed startup with obvious red flags — no certs, key-person risk, incomplete MSA. You might expect this system to just wave through a $157 billion company with ISO 27001 and SOC 2. It didn't. OpenAI scores AMBER because our LLM read the contract and found California governing law, a liability cap that's insufficient for enterprise use, and US CLOUD Act exposure that requires a DPIA. That's legal analysis that would normally take a Carlsberg lawyer two days to surface. It happened in 45 seconds."

### Why CLOUD Act matters for Carlsberg:

> "Carlsberg operates in 50+ markets including the EU. If they store Carlsberg supply chain data with a US vendor — even on EU servers — the US CLOUD Act means US law enforcement can compel OpenAI to hand over that data without necessarily notifying Carlsberg first. That's a data sovereignty risk that's invisible to a checklist but visible to a system that reads the contract."

---

## ⚠️ Fallback Notes

| Situation | What to do |
|---|---|
| Score comes back GREEN (not AMBER) | The rules-based scoring for SOC 2 + ISO 27001 may push it green without LLM input — narrate the real score, explain the legal dimension is what should pull it to amber |
| LLM doesn't flag CLOUD Act | Point to the document's legal notes directly — the evidence is visible in the report even if the LLM summarisation varies |
| Assessment takes > 60s | Explain the LLM is reading a 300-line legal agreement and extracting risk signals — worth the wait |
