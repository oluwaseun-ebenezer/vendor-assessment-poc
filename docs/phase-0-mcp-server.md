# Phase 0 — MCP Server (Primary Innovation Layer)

**Status:** ✅ Delivered  
**Priority:** P0 — This is the primary hackathon deliverable  
**Goal:** Expose the entire vendor assessment workflow as MCP tools and resources so AI agents (Cline, Claude Desktop, any MCP-compatible client) can orchestrate end-to-end vendor vetting without any human UI interaction.

---

## Why This Phase Comes First

The challenge theme is:

> **"Build an MCP server that empowers AI agents to deliver reliable production-ready enterprise software faster."**

This phase IS the challenge response. The backend, frontend, and scoring engine all exist to support the MCP server — not the other way around. An AI agent using this MCP server can:

1. Submit a vendor for assessment (`submit_vendor`)
2. Attach documents for AI analysis (`upload_document`)
3. Trigger the 8-dimension scoring engine (`run_assessment`)
4. Poll until complete (`get_assessment_status`)
5. Read the full structured risk report (`get_report`)
6. View and action tasks (`get_tasks`, `update_task`)
7. Make the final onboarding decision (`approve_vendor`)
8. Track portfolio metrics (`get_analytics`)

**No browser. No UI. No human in the loop.**

This means the vendor vetting workflow — previously a 45-day, multi-team, manual coordination process — can be run by an AI agent in under 10 minutes.

---

## Deliverables

| #   | Deliverable                | Status | Description                                         |
| --- | -------------------------- | ------ | --------------------------------------------------- |
| 0.1 | MCP Server (stdio)         | ✅     | TypeScript MCP server using official SDK            |
| 0.2 | 10 MCP Tools               | ✅     | Full vendor assessment workflow exposed as tools    |
| 0.3 | 3 MCP Resources            | ✅     | Live data resources (vendor list, reports, tasks)   |
| 0.4 | HTTP client to FastAPI     | ✅     | Authenticated HTTP client to backend (JWT)          |
| 0.5 | Input validation (Zod)     | ✅     | All tool inputs validated with Zod schemas          |
| 0.6 | Friendly tool responses    | ✅     | Human-readable + structured output per tool         |
| 0.7 | Error handling             | ✅     | All errors return user-friendly messages (no leaks) |
| 0.8 | Docker service             | ⬜     | `mcp-server` container in docker-compose.yml        |
| 0.9 | HTTP transport (port 3100) | ⬜     | Optional HTTP transport alongside stdio             |

---

## Architecture Position

```
┌─────────────────────────────────────────────────────────────────────┐
│                   AI AGENT (Cline / Claude Desktop)                  │
│                                                                       │
│  "Assess vendor AcmeCorp"                                            │
│  → submit_vendor → upload_document → run_assessment                  │
│  → get_assessment_status (poll) → get_report → approve_vendor        │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ MCP Protocol (stdio / HTTP)
┌───────────────────────────────▼─────────────────────────────────────┐
│                   MCP SERVER (port 3100 / stdio)                      │
│                   TypeScript · @modelcontextprotocol/sdk              │
│                                                                       │
│  Tools:           Resources:                                          │
│  • submit_vendor  • vendor://list                                     │
│  • upload_document• vendor://{id}/report                             │
│  • run_assessment • tasks://{department}                              │
│  • get_assessment_status                                              │
│  • get_report                                                         │
│  • list_vendors                                                       │
│  • get_tasks                                                          │
│  • update_task                                                        │
│  • approve_vendor                                                     │
│  • get_analytics                                                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTP REST (MCP_SERVICE_TOKEN JWT)
┌───────────────────────────────▼─────────────────────────────────────┐
│                   FastAPI Backend (port 8000)                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
mcp-server/
├── package.json            # Dependencies: @modelcontextprotocol/sdk, zod, axios
├── tsconfig.json           # TypeScript config (ESM, Node 20)
├── package-lock.json
└── src/
    ├── index.ts            # MCP server entry point (stdio transport)
    └── client.ts           # Authenticated HTTP client to FastAPI backend
```

> **Note:** The current implementation is intentionally monolithic in `index.ts` (all 10 tools in one file) for clarity and demo speed. A production version should split into `src/tools/<tool-name>.ts` and `src/resources/<resource-name>.ts` per the `.clinerules` convention.

---

## The 10 MCP Tools

### `submit_vendor`

Create a new vendor record with the full 8-dimension intake form fields.

**Key inputs:** `company_name` (required), plus 40+ optional structured fields covering all 8 assessment dimensions (security certs, legal status, commercials, tech stack, etc.)

**Returns:** Vendor ID + guided next step (`run_assessment`)

**How it empowers agents:** An agent can generate realistic vendor intake data from a company website, PDF, or prior research and submit it directly — no form UI needed.

---

### `upload_document`

Attach a document to a vendor for LLM analysis during the scoring phase.

**Key inputs:** `vendor_id`, `doc_type` (security_whitepaper | architecture_doc | legal_doc | financial_doc | other), `filename`, `content_base64`

**Returns:** Document ID + type confirmation

**How it empowers agents:** An agent can read a local PDF, base64-encode it, and attach it as evidence — enabling AI-driven document ingestion at scale.

---

### `run_assessment`

Trigger the 8-dimension hybrid scoring engine (rules + LLM via OpenRouter) for a vendor.

**Key inputs:** `vendor_id`

**Returns:** Assessment ID + `pending` status. Returns immediately (async background processing).

**How it empowers agents:** Fire-and-forget trigger. The agent moves on other work and polls for completion.

---

### `get_assessment_status`

Poll the latest assessment status for a vendor.

**Key inputs:** `vendor_id`

**Returns:** Status (pending → running → complete | failed), composite score, risk flag (🟢/🟡/🔴)

**How it empowers agents:** An agent can poll at intervals and proceed to `get_report` only when complete, enabling robust async orchestration patterns.

---

### `get_report`

Retrieve the full structured vendor risk report.

**Key inputs:** `vendor_id`, `format` (json | summary)

**Returns (`summary`):** Human-readable Markdown with overall score, all 8 dimension scores with risk flags, executive summary, and top action items.

**Returns (`json`):** Full structured JSON with evidence arrays, LLM reasoning, recommendations per dimension.

**How it empowers agents:** The `summary` format is optimised for agent consumption — an agent can read the report and explain findings in natural language. The `json` format gives full programmatic access for downstream automation.

---

### `list_vendors`

Query the vendor pipeline with filters.

**Key inputs:** `search?`, `status?`, `risk_flag?`, `page`, `size`

**Returns:** Paginated list of vendors with score + risk flag + status

**How it empowers agents:** An agent can monitor the entire pipeline, identify stale vendors, or batch-process all `amber` vendors needing follow-up.

---

### `get_tasks`

Get auto-generated action items from assessment findings.

**Key inputs:** `vendor_id?`, `department?`, `status?`

**Returns:** Task list with priority, assignee, department

**How it empowers agents:** An agent can surface "what does IT Security need to do today" by calling `get_tasks({ department: "it_security", status: "open" })`.

---

### `update_task`

Change a task's status, priority, or assignee.

**Key inputs:** `task_id` (required), `status?`, `assigned_to?`, `priority?`

**Returns:** Updated task confirmation

**How it empowers agents:** An agent processing a batch of completed tasks can mark them done in one sweep.

---

### `approve_vendor`

Set the final onboarding decision: cleared or rejected.

**Key inputs:** `vendor_id`, `decision` (cleared | rejected), `reason?`

**Returns:** Updated vendor status confirmation

**How it empowers agents:** If the report score exceeds a threshold (e.g. ≥70 composite, no RED dimensions), an agent can auto-approve. This is the most direct example of replacing a human decision with AI judgment.

---

### `get_analytics`

Get pipeline analytics and efficiency metrics.

**Key inputs:** `from_date?`, `to_date?`

**Returns:** Total vendors, risk distribution, avg score, avg time-to-assess, clearance rate

**How it empowers agents:** An agent can report portfolio health to a user in natural language: _"You have 14 vendors in the pipeline: 5 cleared, 2 rejected, 7 awaiting review. Average assessment time is 4.2 minutes."_

---

## The 3 MCP Resources

### `vendor://list`

Live snapshot of all vendors in the pipeline.

**Use case:** An agent or user reads this resource to get instant situational awareness without calling `list_vendors`.

---

### `vendor://{id}/report`

Full assessment report JSON for a specific vendor.

**Use case:** An agent reads this to check status or incorporate the report into a larger document or workflow.

---

### `tasks://{department}`

All open action items for a specific department.

**Values:** `procurement` | `it_security` | `legal` | `ai_innovation`

**Use case:** A department head's Cline workspace can surface their team's open tasks automatically on startup.

---

## Authentication

The MCP server authenticates to the FastAPI backend using a **service account JWT** stored in the `MCP_SERVICE_TOKEN` environment variable.

```typescript
// client.ts
headers: {
  Authorization: `Bearer ${process.env.MCP_SERVICE_TOKEN}`,
  "Content-Type": "application/json",
}
```

This token is issued at startup via the `/api/auth/login` endpoint using a dedicated service account (`mcp-service@carlsberg.local` with `admin` role). It is stored as an env var and never exposed in tool responses.

---

## Environment Variables

```env
# MCP Server
BACKEND_URL=http://backend:8000       # FastAPI backend URL
MCP_SERVICE_TOKEN=your_jwt_token_here  # Service account JWT

# When running via Docker
BACKEND_URL=http://localhost:8000     # For local dev outside Docker
```

---

## Running the MCP Server

### Via stdio (for Cline / Claude Desktop)

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "vendor-assessment": {
      "command": "node",
      "args": ["/path/to/vendor-assessment-poc/mcp-server/dist/index.js"],
      "env": {
        "BACKEND_URL": "http://localhost:8000",
        "MCP_SERVICE_TOKEN": "your_jwt_token_here"
      }
    }
  }
}
```

### Via Docker Compose

```bash
docker compose up --build
# MCP server accessible on port 3100 (HTTP transport)
# Stdio transport also available via docker exec
```

---

## Example: Full Agent Workflow

This is what an AI agent executing `Assess vendor "AcmeCorp AI"` looks like end-to-end:

```
Agent: submit_vendor({ company_name: "AcmeCorp AI", country: "UK",
                       iso27001: true, soc2: true, gdpr_dpa: true,
                       funding_stage: "series_a", ... })
→ "✅ Vendor created. ID: abc-123. Next: call run_assessment."

Agent: upload_document({ vendor_id: "abc-123", doc_type: "security_whitepaper",
                         filename: "security-policy.pdf", content_base64: "..." })
→ "✅ Document uploaded. ID: doc-456. Type: security_whitepaper"

Agent: run_assessment({ vendor_id: "abc-123" })
→ "🚀 Assessment started. Poll get_assessment_status until complete."

Agent: get_assessment_status({ vendor_id: "abc-123" })  [× 3 times]
→ "⚙️ Assessment Status: RUNNING - Score: —"
→ "✅ Assessment Status: COMPLETE - Score: 84/100 - Risk: 🟢 GREEN"

Agent: get_report({ vendor_id: "abc-123", format: "summary" })
→ "# Vendor Risk Report: AcmeCorp AI
   Overall Score: 84/100 🟢 GREEN
   Security: 90/100 🟢 | Viability: 80/100 🟢 | Integration: 85/100 🟢 ..."

Agent: approve_vendor({ vendor_id: "abc-123", decision: "cleared",
                        reason: "All dimensions GREEN, score 84/100" })
→ "✅ Vendor CLEARED - AcmeCorp AI - Status: cleared"
```

**Total time: < 5 minutes. Human effort: zero.**

---

## Definition of Done ✅

Phase 0 is complete when:

- [x] MCP server starts via `node dist/index.js` with no errors
- [x] All 10 tools are listed by `ListToolsRequest`
- [x] All 3 resources are listed by `ListResourcesRequest`
- [x] `submit_vendor` creates a vendor and returns the ID
- [x] `upload_document` attaches a base64 document to a vendor
- [x] `run_assessment` triggers background scoring and returns `pending`
- [x] `get_assessment_status` polls correctly and reflects real-time status
- [x] `get_report` returns a structured summary with all 8 dimension scores
- [x] `approve_vendor` sets vendor status to cleared/rejected
- [x] `get_analytics` returns pipeline metrics
- [x] All errors return user-friendly messages (no stack traces or DB errors)
- [x] MCP server authenticates to FastAPI using `MCP_SERVICE_TOKEN`
- [ ] Docker Compose includes `mcp-server` service on port 3100
- [ ] Cline MCP settings snippet tested end-to-end with live backend
