# Hackathon Pitch — Automated Vendor Assessment via MCP

> **Challenge:** Build an MCP server that empowers AI agents to deliver reliable production-ready enterprise software faster.  
> **Team:** Carlsberg AI Vendor Vetting PoC  
> **Submission:** Vendor Assessment MCP Server — end-to-end AI startup vetting via 10 MCP tools + 3 resources

---

## 📊 Scoring the Criteria

The jury scores on three dimensions: **A (Mission-Criticality)**, **B (Solution Opportunity)**, **C (Solution Impact)** using a 1–10 scale, then applies:

```
Score = A' × (B' + C') / 2
```

Where A'–C' are Fibonacci-converted (6→1, 7→2, 8→3, 9→5, 10→8).

**Our target:** A=9, B=9, C=8 → **A'(5) × ((B'(5) + C'(3)) / 2) = 5 × 4 = 20 points**

---

## 🎤 Demo Opening Slides

### Slide 1 — Target User (1A)

**Who are we building for?**

> **Enterprise Procurement, IT Security, and Legal professionals at large corporations** (e.g. Carlsberg, FMCG companies, financial institutions) whose job is to vet and onboard AI startup vendors safely.

Specifically:

| Person                    | Role                                     | Pain                                                            |
| ------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| **Head of Procurement**   | Owns the vendor onboarding process       | Manually chasing 6–8 departments for sign-off                   |
| **IT Security Lead**      | Reviews security certifications and CVEs | Re-reading documents they've already reviewed for other vendors |
| **Legal Counsel**         | Checks IP ownership and contract terms   | Same due diligence checklist, every time, manually              |
| **AI Innovation Manager** | Evaluating AI startup maturity           | No standardised scoring — gut feel and spreadsheets             |

These people work at companies that are **actively adopting AI** — which means a high and growing volume of vendor assessments, with **no scalable process** to handle it.

---

### Slide 2 — Goal + Mission-Criticality (1B)

**What goal are we helping them attain?**

> Successfully vet AI startup vendors across 8 compliance risk dimensions and make a confident, defensible, evidence-backed onboarding decision — **fast**.

**Why is this mission-critical for the organisation?**

Getting this wrong is an existential risk:

| Risk                        | Consequence                                                    |
| --------------------------- | -------------------------------------------------------------- |
| 🔐 Vendor has security gaps | Data breach → GDPR fine up to **4% of global annual turnover** |
| ⚖️ IP ownership unclear     | Licensing dispute → product shutdown mid-rollout               |
| 💸 Vendor goes bust         | Pre-seed startup with 3 employees folding mid-contract         |
| 🌐 No EU data residency     | Regulatory non-compliance across Carlsberg's 50+ markets       |
| 🔒 No SOC 2 audit           | Third-party audit failure → IT Security rejected by board      |

**Current state: 45+ days, no structured process**

- 6–8 weeks of back-and-forth emails between Procurement, Legal, IT Security, Finance
- No consistent scoring — risk assessment quality depends on which person is doing it
- 40–60 stakeholder hours per vendor, multiplied by 20+ vendors per year
- Carlsberg is currently accelerating its AI adoption strategy — the backlog is growing

**This is the bottleneck preventing Carlsberg from moving fast on AI.**

---

## 🏆 Jury Question Answers

### Question 1: How well did the team articulate which process they are trying to help users succeed better with?

**The process:** Enterprise AI vendor vetting and onboarding approval workflow.

End-to-end: A new AI startup enters the pipeline → assessed across 8 risk dimensions (Security, Viability, Legal/IP, Integration, Commercials, Operations, Scalability, Product Maturity) → a structured risk report is generated with evidence → tasks auto-assigned to responsible departments → final go/no-go decision made.

Today this process lives in email inboxes, shared spreadsheets, and tribal knowledge. It's:

- **Inconsistent** (different assessors score differently)
- **Slow** (45+ days of coordination)
- **Unauditable** (no evidence trail)
- **Unscalable** (each vendor requires the same manual effort)

---

### Question 2: How business-critical is this target process?

**Score target: 9/10**

This is mission-critical because:

1. **Regulatory exposure** — GDPR Article 28 requires documented due diligence on all data processors. Failing to vet an AI vendor is not just a business risk — it's a legal violation. Fines are up to 4% of global turnover (Carlsberg FY2024 revenue: DKK 73.4 billion → potential fine: **~DKK 2.9 billion**).

2. **Strategic dependence** — Carlsberg's AI strategy depends on rapidly onboarding capable AI vendors. The vetting bottleneck = the AI strategy bottleneck.

3. **Reputational risk** — A breach traced back to a poorly-vetted AI vendor is a public relations catastrophe for a 175-year-old brand.

4. **Financial risk** — Enterprise contracts with seed-funded startups represent real financial exposure if the vendor collapses.

5. **Competitive disadvantage** — Competitors who can vet and onboard AI vendors in days, not months, move faster.

The process is not optional, not low-stakes, and not infrequent. It is a structural bottleneck in enterprise AI adoption.

---

### Question 3: How much impact could a great tech solution have on how well users succeed with this process?

**Score target: 9/10**

The vendor vetting process is **perfectly suited** for AI automation:

- **Structured intake** — The same 40+ questions are asked every time → ideal for a form + MCP tool
- **Document analysis** — Legal, security, and financial documents require reading + scoring → LLMs are excellent at this
- **Rules-based checks** → "ISO 27001? +20pts" → 100% automatable
- **External data** → CVE databases, Companies House → free APIs that can be queried programmatically
- **Report writing** → Executive summaries → LLMs generate these directly
- **Task assignment** → "Amber vendor needs IP review" → deterministic rules
- **Decision support** → Composite risk score + evidence trail → structured enough for confident human sign-off

The process has **zero steps that require physical presence or genuinely novel human judgment** for the initial screening. Every step can be automated or AI-assisted. A great solution could reduce 40–60 hours to **< 30 minutes of human time** — the rest is AI.

---

### Question 4: How much impact do you think the demo solution would have on how well users succeed with the target process?

**Score target: 8/10**

Our solution delivers:

| Metric                     | Manual Baseline    | This System                         | Improvement           |
| -------------------------- | ------------------ | ----------------------------------- | --------------------- |
| Assessment completion time | 45 days            | < 10 minutes                        | **~99.5% reduction**  |
| Human effort per vendor    | 40–60 hours        | < 1 hour (review only)              | **~97% reduction**    |
| Scoring consistency        | Varies by assessor | 100% deterministic rules + same LLM | **100% consistent**   |
| Evidence/audit trail       | Email chains       | Structured DB + evidence per signal | **Full traceability** |
| Task creation              | Manual             | Automatic, assigned, with due dates | **Zero drop-through** |
| Batch processing           | 1 vendor at a time | AI agent can run N in parallel      | **N× throughput**     |

**But what makes this particularly impactful vs. a standard web app:**

The system is exposed as **MCP tools** — which means an AI agent (Cline) can:

- Assess a vendor in 5 minutes from a natural language request
- Batch-assess 20 vendors overnight without any human initiating each one
- Integrate vendor vetting into ANY enterprise AI workflow (e.g., "before we build this integration, check if the vendor is cleared")
- Be queried by other systems: "Is SupplierX cleared? What's their security score?" — answered in seconds

This is not just a faster version of the current process. It is a **fundamentally different capability** — vendor vetting as a service that AI agents can call on demand.

---

## 🤖 How Cline Uses This MCP Server (Demo Script)

This is what to show in the Cline demo. The judge sees Cline (not a browser) assess a vendor end-to-end.

### Demo Flow

**Setup:** Stack is running (`docker compose up`). Cline has the `vendor-assessment` MCP server configured.

**Step 1 — Cline submits a vendor**

```
User: "Assess AmberTech Solutions — Danish AI startup, 18 months old, 8 employees, seed funded. They claim GDPR DPA but no ISO 27001 or pen-test."

Cline calls: submit_vendor({ company_name: "AmberTech Solutions", country: "Denmark",
                              founded_year: 2024, employee_count: 8,
                              gdpr_dpa: true, iso27001: false, pen_test: false,
                              funding_stage: "seed" })
→ "✅ Vendor created. ID: [uuid]. Next: run_assessment."
```

**Step 2 — Cline uploads a document**

```
Cline calls: upload_document({ vendor_id: "[uuid]", doc_type: "legal_doc",
                                filename: "msa-draft.pdf", content_base64: "..." })
→ "✅ Document uploaded: msa-draft.pdf"
```

**Step 3 — Cline triggers and polls**

```
Cline calls: run_assessment({ vendor_id: "[uuid]" })
→ "🚀 Assessment started."

Cline calls: get_assessment_status({ vendor_id: "[uuid]" })  [polls every 5s]
→ "⚙️ RUNNING..."
→ "✅ COMPLETE — Score: 52/100 — 🟡 AMBER"
```

**Step 4 — Cline reads the report**

```
Cline calls: get_report({ vendor_id: "[uuid]", format: "summary" })
→ "# AmberTech Solutions — 52/100 🟡 AMBER
   Security: 38/100 🔴 — Missing ISO 27001, no pen-test
   Viability: 45/100 🟡 — Seed funded, key-person risk
   Legal: 48/100 🟡 — IP docs incomplete
   ..."
```

**Step 5 — Cline surfaces action items**

```
Cline calls: get_tasks({ vendor_id: "[uuid]", status: "open" })
→ "4 tasks:
   🔴 [HIGH] Request pen-test report (IT Security) — due in 7 days
   🟡 [MEDIUM] Obtain IP ownership declaration (Legal) — due in 14 days
   🟡 [MEDIUM] Clarify enterprise pricing (Procurement)
   🟡 [MEDIUM] Financial continuity review (Procurement)"
```

**Result for judge:** The entire assessment was orchestrated by Cline using MCP tools — no browser, no manual form, no waiting. A process that takes 45 days was just demonstrated in under 5 minutes.

---

## 📐 Why This Wins on the Hackathon Theme

**Theme: "Build an MCP server that empowers AI agents to deliver reliable production-ready enterprise software faster."**

Let's map this directly:

| Theme Component                          | Our Solution                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **MCP server**                           | TypeScript MCP server with official SDK, 10 tools + 3 resources                                     |
| **Empowers AI agents**                   | An AI agent orchestrates the full vetting workflow autonomously                                     |
| **Reliable**                             | Rules-based scoring (deterministic) + external data (NVD, Companies House) + audited evidence trail |
| **Production-ready enterprise software** | RBAC, JWT auth, async background processing, PDF reports, PostgreSQL, Docker                        |
| **Faster**                               | 45 days → < 10 minutes (99.5% reduction)                                                            |

This is not a toy demo. The **backend is production-viable** — it runs on Docker, uses PostgreSQL with Alembic migrations, JWT with refresh tokens, WeasyPrint PDF generation, async FastAPI, and a real LLM (OpenRouter free tier). The MCP server is the AI-native interface to this enterprise system.

---

## 🎬 30-Second Elevator Pitch

> "Carlsberg evaluates 20+ AI startups a year for potential onboarding. Each one takes 45 days and 40+ hours of cross-department review. We built an MCP server that exposes the entire vendor vetting workflow as AI tools — submit, assess, report, and approve — in under 10 minutes instead of 45 days. An AI agent like Cline can now vet a vendor from a single natural language request. That's the combination of MCP infrastructure, hybrid AI scoring, and enterprise-grade reliability that the challenge is asking for."

---

## 📎 Supporting Docs

| Document                                                      | Purpose                                      |
| ------------------------------------------------------------- | -------------------------------------------- |
| [`docs/phase-0-mcp-server.md`](phase-0-mcp-server.md)         | Full MCP tool + resource specifications      |
| [`docs/00-architecture.md`](00-architecture.md)               | Full system architecture including MCP layer |
| [`docs/phase-2-scoring-engine.md`](phase-2-scoring-engine.md) | The 8-dimension hybrid scoring engine        |
| [`docs/phase-5-validation.md`](phase-5-validation.md)         | End-to-end test scenarios + success criteria |
| [`mcp-server/src/index.ts`](../mcp-server/src/index.ts)       | The actual MCP server implementation         |
