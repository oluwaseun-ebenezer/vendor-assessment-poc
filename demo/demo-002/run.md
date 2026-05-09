# Live Execution Script — demo-002

**Demo ID:** `demo-002`
**Vendor:** OpenAI (API + ChatGPT Enterprise)
**Total target time:** ~5 minutes
**Format:** Narrated Cline conversation (no browser, no UI)
**Best used:** After demo-001 — as the contrast case

---

## 🎬 Pre-Demo Checklist

- [ ] demo-001 has already been run (pipeline has AmberTech at AMBER/RED)
- [ ] Stack is running: `docker compose up` — all services healthy
- [ ] Backend reachable: `curl http://localhost:8000/health` returns 200
- [ ] Cline has `vendor-assessment` MCP server connected

---

## 🎤 Opening (~30 seconds)

> "You just saw a seed-stage startup score RED — obvious red flags, easy call. Now let's try something different. Carlsberg's AI Innovation team wants to standardise on OpenAI — the world's most valuable AI company, $157 billion valuation, backed by Microsoft. ISO 27001, SOC 2 Type II, 99.9% uptime SLA. Surely that's a green light?"

> "Let's find out what the system actually thinks."

---

## ▶️ Step 1 — Baseline Analytics (~20 seconds)

**Say to Cline:**

```
Show me the current state of the vendor assessment pipeline.
```

**What Cline does:** Calls `get_analytics`

**Expected output:**

```
Pipeline Analytics:
- Total vendors: 2
- 1 cleared (AmberTech), 1 in review (AcmeCorp)
- Risk distribution: 1 red / 1 amber
```

**Narrate:** "Two vendors already in the pipeline. Now let's add the biggest name in AI."

---

## ▶️ Step 2 — Submit the Vendor (~45 seconds)

**Say to Cline:**

```
Submit OpenAI for vendor assessment. They're a US-based AI company, incorporated in Delaware, 3,500 employees, founded 2015. They have SOC 2 Type II, ISO 27001, and a GDPR DPA through OpenAI Ireland. They offer API access and ChatGPT Enterprise with 99.9% uptime SLA, EU data residency on Azure, dedicated CSM, enterprise pricing, and full API docs. Tech stack: Python, Azure, AWS, PyTorch, Kubernetes. They have 50,000+ enterprise customers globally, operate in 50 countries, and have a business continuity plan. However: governing law is California USA, there is pending litigation related to training data copyright, and open-source licence compliance is disputed. IP ownership of outputs is documented and assigned to the customer.
```

**What Cline does:** Calls `submit_vendor`

**Narrate:** "Notice I've included both the positives and the concerns — just like a real procurement intake form."

**Expected output:**

```
✅ Vendor created successfully.
- Name: OpenAI
- ID: [uuid]
- Status: submitted
```

---

## ▶️ Step 3 — Upload the Service Agreement (~30 seconds)

**Say to Cline:**

```
Upload the OpenAI enterprise service agreement for legal review. The file is at demo/demo-002/assets/openai-enterprise-agreement-review.txt — treat it as a legal document.
```

**What Cline does:** Reads the file, base64-encodes it, calls `upload_document`

**What to say while it runs:**

> "This is Carlsberg's annotated review of OpenAI's actual Business Terms and Data Processing Addendum — the real document, with our legal team's notes embedded. We're feeding it to the LLM scorer."

**Expected output:**

```
✅ Document uploaded.
- Filename: openai-enterprise-agreement-review.txt
- Type: legal_doc
```

---

## ▶️ Step 4 — Trigger the Assessment (~20 seconds)

**Say to Cline:**

```
Run the vendor assessment for OpenAI.
```

**What Cline does:** Calls `run_assessment`

**Narrate:**

> "The 8-dimension engine is running. Security will score high — they have the certs. But let's see what happens when the LLM reads the contract."

**Expected output:**

```
🚀 Assessment started.
- Status: pending
```

---

## ▶️ Step 5 — Poll for Completion (~45 seconds)

**Say to Cline:**

```
Check the assessment status for OpenAI and keep checking until it's complete.
```

**What Cline does:** Calls `get_assessment_status` repeatedly

**What to say during the wait:**

> "The LLM is reading a 300-line legal agreement right now — looking for governing law clauses, liability caps, data transfer mechanisms, and breach notification obligations. This is what a junior lawyer would spend a day on."

**Expected output:**

```
✅ Assessment Status: COMPLETE
- Score: ~62/100
- Risk Flag: 🟡 AMBER
```

**Narrate:** "AMBER. Not green. A $157 billion company with ISO 27001 scores AMBER. Let's see why."

---

## ▶️ Step 6 — Read the Full Report (~60 seconds)

**Say to Cline:**

```
Give me the full risk report for OpenAI.
```

**What Cline does:** Calls `get_report` with `format: "summary"`

**Walk through the output:**

- Point out 🟢 Security: _"SOC 2, ISO 27001, pen-test, no breach — exactly what you'd expect. This dimension is green."_
- Point out 🟢 Viability: _"$157 billion, Microsoft backing, 3,500 employees — no viability risk."_
- Point out 🔴/🟡 Legal: _"Here it is. California governing law — that's not Danish law. Pending litigation from training data copyright cases. Liability cap that's only 12 months of fees. The LLM found all of this in the contract."_
- Point out ⚠️ Data: _"US CLOUD Act. Even though the data sits in the EU, OpenAI is a US company — US law enforcement can compel access. That requires a DPIA before Carlsberg's DPO will sign off."_

**Narrate:** "A human reading this contract might spend two days on it. The LLM surfaced the three critical legal risk signals in 45 seconds."

---

## ▶️ Step 7 — Surface the Action Items (~30 seconds)

**Say to Cline:**

```
What are the open action items for OpenAI?
```

**What Cline does:** Calls `get_tasks`

**Walk through the tasks:**

- 🔴 Group GC sign-off on California law → _"This goes to the General Counsel. Not IT, not Procurement — this is a governance decision."_
- 🔴 DPIA for CLOUD Act → _"IT Security and the DPO need to formally assess the US data access risk before any customer data flows through."_
- 🟡 Liability cap negotiation → _"Procurement: get this to EUR 5M minimum."_
- 🟡 Zero data retention mode → _"IT Security: verify this is actually configured in the API before we go live."_

**Narrate:** "Four high-priority tasks, each assigned to the right function. The system knows a DPIA goes to IT Security, governing law goes to Legal. Zero manual triage."

---

## ▶️ Step 8 — Make the Decision (~30 seconds)

**Say to Cline:**

```
Based on the assessment, approve OpenAI for internal use — but flag that it needs Group General Counsel sign-off on California governing law, a DPIA for CLOUD Act exposure, liability cap negotiation, and zero data retention mode confirmed before any customer data is processed. Not approved for production-critical supply chain systems until a multi-vendor fallback is in place.
```

**What Cline does:** Calls `approve_vendor` with `decision: "cleared"` and structured conditions

**Expected output:**

```
✅ Vendor CLEARED
- Company: OpenAI
- Decision: CLEARED (conditional)
- Status: cleared
```

---

## 🏁 Closing (~30 seconds)

> "Two vendors. Two completely different risk profiles. AmberTech: RED — technical security gaps, seed-stage viability risk. OpenAI: AMBER — strong technical security, but legal structure and data sovereignty create material risk for a European enterprise."

> "The same system, the same 8 dimensions, the same LLM — applied consistently to a startup and the world's biggest AI company. That's what defensible, auditable vendor assessment looks like. And it took under 5 minutes each."

> "In a traditional process, OpenAI's legal review alone would take Carlsberg's legal team 3–5 days. The DPIA another week. The CISO review another 2 days. We just ran all of that simultaneously and produced a documented, evidence-backed decision."

---

## ⏱️ Timing Summary

| Step | Action | Target Time |
|---|---|---|
| Opening | Context + contrast setup | 30s |
| Step 1 | `get_analytics` | 20s |
| Step 2 | `submit_vendor` | 45s |
| Step 3 | `upload_document` | 30s |
| Step 4 | `run_assessment` | 20s |
| Step 5 | `get_assessment_status` (poll) | 45s |
| Step 6 | `get_report` + narration | 60s |
| Step 7 | `get_tasks` + narration | 30s |
| Step 8 | `approve_vendor` | 30s |
| Closing | Wrap-up | 30s |
| **Total** | | **~5 min 20s** |
