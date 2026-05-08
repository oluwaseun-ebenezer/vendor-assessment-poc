# Phase 3 — Reporting & Task Management

**Duration:** Weeks 7–9  
**Goal:** Generate standardised risk reports (PDF + dashboard view), auto-create actionable tasks from report findings, and send email notifications to responsible stakeholders via Mailhog.

---

## Deliverables

| #   | Deliverable           | Description                                                 |
| --- | --------------------- | ----------------------------------------------------------- |
| 3.1 | Report generator      | Builds structured JSON report + PDF from assessment results |
| 3.2 | PDF template          | Styled HTML/CSS template rendered by WeasyPrint             |
| 3.3 | Report API            | Serve JSON report and PDF download                          |
| 3.4 | Task auto-creator     | Generates tasks from Red/Amber dimension findings           |
| 3.5 | Task API              | CRUD + assignment for tasks                                 |
| 3.6 | Notification service  | Email alerts via Mailhog SMTP                               |
| 3.7 | Frontend: Report view | Per-vendor report page with scores, findings, evidence      |
| 3.8 | Frontend: Task board  | Kanban board of tasks per department                        |

---

## Folder Structure Added in This Phase

```
backend/app/
├── services/
│   ├── report_service.py
│   ├── task_service.py
│   └── notify_service.py
├── templates/
│   ├── report_base.html          # WeasyPrint HTML template
│   ├── report_styles.css
│   └── email_task_assigned.html  # Email template
└── api/
    ├── reports.py
    └── tasks.py

frontend/src/
├── pages/
│   ├── VendorReportPage.tsx
│   └── TaskBoardPage.tsx
└── components/
    ├── Report/
    │   ├── ScoreRadarChart.tsx
    │   ├── DimensionCard.tsx
    │   ├── EvidenceTable.tsx
    │   └── RecommendationList.tsx
    └── TaskBoard/
        ├── KanbanColumn.tsx
        └── TaskCard.tsx
```

---

## Step-by-Step Implementation Tasks

### Task 3.1 — Report Service

**`services/report_service.py`**

Called automatically at the end of a completed assessment (Phase 2 orchestrator triggers it).

**Report JSON structure:**

```json
{
  "report_id": "uuid",
  "vendor_id": "uuid",
  "vendor_name": "Acme AI Ltd",
  "assessment_id": "uuid",
  "generated_at": "2026-05-08T09:00:00Z",
  "composite_score": 72.4,
  "overall_risk_flag": "amber",
  "executive_summary": "Acme AI shows strong technical foundations but requires attention to legal IP documentation and global scalability.",
  "dimensions": [
    {
      "dimension": "security",
      "label": "Security, Privacy & Compliance",
      "composite_score": 85.0,
      "rules_score": 90.0,
      "llm_score": 78.0,
      "risk_flag": "green",
      "responsible_dept": "IT Security",
      "evidence": [
        {
          "signal": "ISO 27001 certified",
          "value": true,
          "impact": "+20",
          "source": "vendor_form"
        },
        {
          "signal": "GDPR DPA signed",
          "value": true,
          "impact": "+20",
          "source": "vendor_form"
        },
        {
          "signal": "Pen-test in last 12 months",
          "value": false,
          "impact": "0",
          "source": "vendor_form"
        }
      ],
      "llm_reasoning": "The uploaded security whitepaper demonstrates strong encryption standards...",
      "recommendations": []
    },
    {
      "dimension": "legal",
      "label": "Legal & IP",
      "composite_score": 42.0,
      "risk_flag": "amber",
      "responsible_dept": "Legal",
      "recommendations": [
        {
          "action": "Request signed IP ownership declaration",
          "priority": "high",
          "dept": "legal",
          "task_title": "Obtain IP Ownership Declaration from Acme AI"
        }
      ]
    }
  ]
}
```

**Executive summary generation:**

- Send composite scores + top risk flags to OpenRouter LLM
- Prompt: _"Write a 2-sentence executive summary of this vendor assessment for an enterprise procurement team."_
- This is a single cheap LLM call using a free model.

---

### Task 3.2 — PDF Report Template

**`templates/report_base.html`** — Jinja2 template rendered by WeasyPrint.

**Report PDF sections:**

1. **Cover page** — Carlsberg logo placeholder, vendor name, date, overall risk badge
2. **Executive Summary** — 2–3 sentence LLM-generated summary
3. **Overall Score** — Large composite score + colour-coded risk indicator
4. **Dimension Radar Chart** — Spider/radar chart image (generated as SVG, embedded in HTML)
5. **Per-Dimension Detail** ×8 — For each dimension:
   - Score bar (0–100) with green/amber/red colouring
   - Evidence table (signal, value, source)
   - LLM reasoning paragraph
   - Recommended actions list
6. **Action Items Table** — All auto-generated tasks with assigned department
7. **Appendix** — List of uploaded documents analysed

**Radar chart generation:**

- Use `matplotlib` (adds to requirements.txt) to generate the radar chart as a PNG
- Embed as base64 in the HTML so WeasyPrint renders it inline
- Chart axes: one per dimension, score 0–100, filled polygon

**PDF styling:**

- A4 format
- Carlsberg red `#D4002A` as accent colour (enterprise-branded, placeholder)
- Clean table styling with alternating row colours
- Risk badges styled as coloured pills: 🟢 `#22c55e` / 🟡 `#f59e0b` / 🔴 `#ef4444`

---

### Task 3.3 — Report API Endpoints

| Method | Path                                  | Description                                        |
| ------ | ------------------------------------- | -------------------------------------------------- |
| `GET`  | `/api/reports/{vendor_id}`            | Get full report JSON for a vendor                  |
| `GET`  | `/api/reports/{vendor_id}/pdf`        | Download report as PDF                             |
| `POST` | `/api/reports/{vendor_id}/regenerate` | Re-generate report (e.g., after new docs uploaded) |

---

### Task 3.4 — Task Auto-Creator

**`services/task_service.py`**

Called immediately after report generation. Iterates over all dimension results and applies this rule:

```python
TASK_RULES = {
    "security": {
        "red": [
            {
                "title": "Urgent: Resolve critical security compliance gaps",
                "description": "Vendor scored RED on Security. Immediate review required. See evidence: {evidence}",
                "dept": "it_security",
                "priority": "high"
            }
        ],
        "amber": [
            {
                "title": "Request pen-test report and GDPR DPA from {vendor_name}",
                "description": "Vendor is missing pen-test documentation and/or GDPR DPA.",
                "dept": "it_security",
                "priority": "medium"
            }
        ]
    },
    "legal": {
        "red": [...],
        "amber": [
            {
                "title": "Obtain IP Ownership Declaration from {vendor_name}",
                "dept": "legal",
                "priority": "high"
            }
        ]
    },
    "viability": {
        "red": [
            {
                "title": "Financial health review required for {vendor_name}",
                "dept": "procurement",
                "priority": "high"
            }
        ]
    },
    # ... all 8 dimensions covered
}
```

**Task auto-assignment logic:**

- Each task has a `department` field
- The system looks up the default assignee for that department from the `users` table (role matching)
- If multiple users share a role, assign to the first active one (can be manually reassigned via UI)
- Set `due_date` = today + 7 days for HIGH priority, today + 14 days for MEDIUM

---

### Task 3.5 — Task API Endpoints

| Method  | Path                      | Description                                        |
| ------- | ------------------------- | -------------------------------------------------- |
| `GET`   | `/api/tasks`              | List all tasks (filter by dept, status, vendor_id) |
| `GET`   | `/api/tasks/{id}`         | Get single task                                    |
| `PATCH` | `/api/tasks/{id}`         | Update task (status, assignee, due_date)           |
| `GET`   | `/api/tasks/my`           | Get tasks assigned to current user                 |
| `GET`   | `/api/vendors/{id}/tasks` | Get all tasks for a specific vendor                |

---

### Task 3.6 — Notification Service

**`services/notify_service.py`**

Uses Python's `smtplib` (stdlib, no extra package) pointing at Mailhog `smtp://mailhog:1025`.

**Trigger points:**

1. **Assessment complete** → email to all stakeholders (one per dept) with report link + summary
2. **Task created** → email to assigned person with task title, description, due date, link
3. **Task status changed** → email to assignee when overdue (future enhancement)

**Email template (`templates/email_task_assigned.html`):**

```html
Subject: [Action Required] {{ task.priority | upper }}: {{ task.title }} Hi {{
assignee.full_name }}, A new task has been assigned to you as part of the vendor
assessment for {{ vendor.company_name }}. Task: {{ task.title }} Priority: {{
task.priority }} Due Date: {{ task.due_date }} Department: {{ task.department }}
Description: {{ task.description }} View full report:
http://localhost:3000/vendors/{{ vendor.id }}/report View task board:
http://localhost:3000/tasks Regards, Automated Vendor Assessment System
```

**Mailhog web UI** at `http://localhost:8025` — all emails visible here during development/PoC.

---

### Task 3.7 — Frontend: Report View (`VendorReportPage.tsx`)

This is the primary output page. Key components:

**`ScoreRadarChart.tsx`**

- Radar/spider chart using `Recharts RadarChart`
- 8 axes (one per dimension), scale 0–100
- Filled polygon in green/amber/red based on overall flag

**`DimensionCard.tsx`**

- One card per dimension
- Expandable accordion to show evidence table + LLM reasoning
- Progress bar showing score (0–100) colour-coded
- Risk badge (🟢 / 🟡 / 🔴)
- List of recommendations for that dimension

**`EvidenceTable.tsx`**

- Signal | Value | Impact | Source columns
- Positive impacts in green, negative in red

**`RecommendationList.tsx`**

- List of auto-created tasks with "View Task" link
- Shows task status (open / in progress / done)

**Page layout:**

```
┌────────────────────────────────────────────┐
│ Vendor Name          Overall Score: 72/100 │
│ Assessment date      Risk: 🟡 AMBER        │
│ [Download PDF]                             │
├────────────────────────────────────────────┤
│ Executive Summary (text)                   │
├────────────┬───────────────────────────────┤
│            │  Dimension Cards ×8           │
│  Radar     │  1. Security   ████████ 85 🟢 │
│  Chart     │  2. Viability  ██████   65 🟡 │
│            │  3. Integration████████ 80 🟢 │
│            │  ...                          │
├────────────┴───────────────────────────────┤
│ Action Items (tasks table)                 │
└────────────────────────────────────────────┘
```

---

### Task 3.8 — Frontend: Task Board (`TaskBoardPage.tsx`)

Kanban-style board with 3 columns: **Open | In Progress | Done**

Filters:

- By department (All / Procurement / IT Security / Legal / AI Innovation)
- By vendor
- By priority

Each `TaskCard.tsx` shows:

- Vendor name
- Task title
- Priority badge
- Assigned to (avatar/initials)
- Due date (highlighted red if overdue)
- "View Report" link

Drag-to-update: clicking a card opens a side drawer to update status/assignee.

---

## Definition of Done ✅

Phase 3 is complete when:

- [ ] After a completed assessment, a report JSON is automatically saved to the `reports` table
- [ ] `GET /api/reports/{vendor_id}/pdf` returns a downloadable, formatted PDF
- [ ] The PDF contains all 8 dimension sections with scores, evidence, and recommendations
- [ ] Tasks are auto-created in the `tasks` table for every Red/Amber dimension
- [ ] Tasks are auto-assigned to the correct department user
- [ ] Emails appear in Mailhog UI (`http://localhost:8025`) when tasks are created
- [ ] `VendorReportPage` renders all 8 dimension cards with scores and risk badges
- [ ] The radar chart renders correctly with all 8 dimension scores
- [ ] `TaskBoardPage` shows all tasks grouped in Kanban columns with dept filter

---

## Risks & Mitigations

| Risk                                               | Mitigation                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| WeasyPrint CSS rendering differs from browser      | Test PDF output early with a minimal template; avoid complex CSS                              |
| Matplotlib not available in backend Docker image   | Add `matplotlib` to requirements.txt; pre-generate chart PNG during report build              |
| LLM executive summary is poor quality              | Tune the prompt; use a slightly larger free model (e.g. `mistralai/mistral-7b-instruct:free`) |
| Task assignment fails if no user exists for a dept | Assign to `admin` as fallback; log a warning                                                  |
| Email delivery silently fails                      | Log every SMTP call; check Mailhog UI; add error handling around `smtplib.sendmail`           |
