# Live Execution Script — demo-001

**Demo ID:** `demo-001`
**Vendor:** AmberTech Solutions
**Total target time:** ~5 minutes
**Format:** Narrated Cline conversation (no browser, no UI)

---

## 🎬 Pre-Demo Checklist

Before starting the recording:

- [ ] `docker compose up --build` is running — all services healthy
- [ ] Cline has `vendor-assessment` MCP server connected (check MCP settings)
- [ ] Backend is reachable: `curl http://localhost:8000/health` returns 200
- [ ] Screen recording is capturing the full Cline chat window
- [ ] Font size is readable at 1080p
- [ ] Slides 1A and 1B are ready to show first (see `manifest.md` for script)

---

## 🎤 Opening (before Cline — ~60 seconds)

**Show Slide 1A:**

> "We're building for enterprise procurement and IT security professionals at large corporations like Carlsberg — people whose job is to safely vet and onboard AI startup vendors. Today that takes 45 days, 6 departments, and 40 hours of manual work per vendor. I'm going to show you that same process completed in under 5 minutes."

**Show Slide 1B:**

> "The goal is a confident, defensible, evidence-backed onboarding decision — fast. And it's mission-critical: GDPR Article 28 requires documented due diligence on every data processor. A bad vendor decision for a company like Carlsberg could mean a fine upwards of DKK 2.9 billion. The process today is bottlenecking Carlsberg's entire AI strategy."

**Then transition to Cline:**

> "Let me show you what happens when you give this workflow to an AI agent."

---

## ▶️ Step 1 — Baseline Analytics (~30 seconds)

**Say to Cline:**

```
Show me the current state of our vendor assessment pipeline.
```

**What Cline does:** Calls `get_analytics`

**What to say while it runs:**

> "First, let's see the current state of the pipeline before our new vendor enters."

**Expected output:**

```
Pipeline Analytics:
- Total vendors: N
- Risk distribution: X green / Y amber / Z red
- Average assessment score: XX/100
```

**Narrate:** "This is our live vendor pipeline. Now let's add a new one."

---

## ▶️ Step 2 — Submit the Vendor (~45 seconds)

**Say to Cline:**

```
Submit a new vendor for assessment: AmberTech Solutions — a Danish AI startup, founded in 2024, 8 employees, seed funded. They've signed a GDPR DPA and have EU data residency on AWS (Ireland), but they have no ISO 27001, no SOC 2, and no pen-test report. They're in production with a SaaS forecasting tool. Their tech stack is Python, PyTorch, FastAPI, PostgreSQL, AWS. Registration number DK-39201847, website https://ambertech.io. No enterprise customers yet, no enterprise pricing, no dedicated CSM, IP ownership is undocumented, no business continuity plan.
```

**What Cline does:** Calls `submit_vendor` with all the intake data

**What to say while it runs:**

> "I've just described a real-world vendor scenario to Cline. Watch it build the structured intake record automatically."

**Expected output:**

```
✅ Vendor created successfully.
- Name: AmberTech Solutions
- ID: [uuid]
- Status: submitted
```

**Narrate:** "Vendor is in the system. Note the ID — Cline will use this for every subsequent operation."

---

## ▶️ Step 3 — Upload the MSA Document (~30 seconds)

**Say to Cline:**

```
Upload the MSA draft document for AmberTech Solutions. The file is at demo/demo-001/assets/ambertech-msa.txt — treat it as a legal document.
```

**What Cline does:** Reads the file, base64-encodes it, calls `upload_document`

**What to say while it runs:**

> "We have a draft MSA from AmberTech's legal team. We're attaching it so the LLM scorer can analyse it during the assessment."

**Expected output:**

```
✅ Document uploaded.
- Filename: ambertech-msa.txt
- Type: legal_doc
- Vendor: AmberTech Solutions
```

**Narrate:** "The document is attached. The scoring engine will read it during assessment — no human needs to read it first."

---

## ▶️ Step 4 — Trigger the Assessment (~20 seconds)

**Say to Cline:**

```
Run the vendor assessment for AmberTech Solutions.
```

**What Cline does:** Calls `run_assessment`

**What to say while it runs:**

> "This triggers our 8-dimension scoring engine. It runs asynchronously — just like sending an email to a colleague and waiting for their response. But instead of 6 weeks, we'll have results in under a minute."

**Expected output:**

```
🚀 Assessment started.
- Vendor: AmberTech Solutions
- Status: pending
```

---

## ▶️ Step 5 — Poll for Completion (~45 seconds)

**Say to Cline:**

```
Check the assessment status for AmberTech Solutions and keep checking until it's complete.
```

**What Cline does:** Calls `get_assessment_status` repeatedly until `complete`

**What to say during the wait:**

> "The engine is now running rules-based checks across 40+ structured fields AND sending the MSA document to an LLM for legal analysis. All 8 dimensions in parallel."

**Expected final output:**

```
✅ Assessment Status: COMPLETE
- Score: ~52/100
- Risk Flag: 🟡 AMBER
```

**Narrate:** "52 out of 100 — Amber. Not a clear pass, not a rejection. This is exactly the kind of nuanced case that takes human experts weeks to evaluate. Let's see why."

---

## ▶️ Step 6 — Read the Full Report (~60 seconds)

**Say to Cline:**

```
Give me the full risk report for AmberTech Solutions.
```

**What Cline does:** Calls `get_report` with `format: "summary"`

**What to say while it loads:**

> "The report has scores for all 8 compliance dimensions, with evidence for each score and an executive summary."

**Walk through the output as it appears:**

- Point out the 🔴 RED security dimension: _"No ISO 27001, no SOC 2, no pen-test — that's the critical finding."_
- Point out the 🟡 AMBER viabilities: _"Seed funded, 8 employees — key-person risk. If the founders leave, the vendor collapses."_
- Point out the Legal dimension: _"The MSA the LLM just read has IP assignment gaps — flagged automatically."_
- Point out the 🟢 GREEN integration/scalability: _"Their tech stack is solid, API docs are available, EU data residency checks out."_

**Narrate:** "In a traditional process, this report would take a Legal review, an IT Security review, a Finance review, and a Procurement sign-off — weeks of coordination. We just ran all of that simultaneously."

---

## ▶️ Step 7 — Surface the Action Items (~45 seconds)

**Say to Cline:**

```
What are the open action items for AmberTech Solutions?
```

**What Cline does:** Calls `get_tasks` filtered to this vendor

**What to say while it loads:**

> "Here's where the system does something no spreadsheet can do — it auto-generates structured tasks and assigns them to the right department."

**Walk through each task:**

- 🔴 Pen-test report → _"IT Security needs this within 7 days."_
- 🔴 IP assignment clause → _"Legal has 14 days to resolve the MSA gap."_
- 🟡 Financial continuity → _"Procurement: seed-stage vendor needs a continuity review."_
- 🟡 Enterprise pricing → _"Procurement: no pricing model aligned to our scale yet."_

**Narrate:** "Four tasks — auto-generated, prioritised, assigned to the right owners. Zero manual triage. No one had to read a report and think about who should own what."

---

## ▶️ Step 8 — Make the Decision (~30 seconds)

**Say to Cline:**

```
Based on the assessment, approve AmberTech Solutions for a conditional 90-day pilot — flag that they need to provide a pen-test or ISO 27001 roadmap within 30 days and fix the IP clause in the MSA before full onboarding.
```

**What Cline does:** Calls `approve_vendor` with `decision: "cleared"` and a structured reason

**What to say while it runs:**

> "We're not auto-approving blindly — the AI surfaces the evidence, the human makes the call. This is AI-assisted judgment, not AI replacing it."

**Expected output:**

```
✅ Vendor decision recorded.
- Vendor: AmberTech Solutions
- Decision: CLEARED
- Status: cleared
```

**Final narrate:**

> "AmberTech Solutions is conditionally cleared. The decision is documented, auditable, and backed by evidence from 8 dimensions. That process — 45 days, 40 staff hours — just happened in under 5 minutes. And I didn't open a single browser tab."

---

## 🏁 Closing (~20 seconds)

> "This isn't a prototype that simulates the process. The backend is production-grade — PostgreSQL, JWT auth, async FastAPI, an LLM via OpenRouter, and WeasyPrint PDF reports. The MCP server is the AI-native interface to a real enterprise system. And because it's MCP, this same workflow can be triggered by any AI agent, integrated into any enterprise AI system, or run in batch for 20 vendors overnight."

> "Vendor assessment as a service. That's what we built."

---

## ⏱️ Timing Summary

| Step           | Action                         | Target Time    |
| -------------- | ------------------------------ | -------------- |
| Opening slides | Narrate 1A + 1B                | 60s            |
| Step 1         | `get_analytics`                | 30s            |
| Step 2         | `submit_vendor`                | 45s            |
| Step 3         | `upload_document`              | 30s            |
| Step 4         | `run_assessment`               | 20s            |
| Step 5         | `get_assessment_status` (poll) | 45s            |
| Step 6         | `get_report` + narration       | 60s            |
| Step 7         | `get_tasks` + narration        | 45s            |
| Step 8         | `approve_vendor`               | 30s            |
| Closing        | Wrap-up                        | 20s            |
| **Total**      |                                | **~6 min 25s** |

> Aim to narrate briskly during tool execution to keep within a 5–7 minute demo window.
