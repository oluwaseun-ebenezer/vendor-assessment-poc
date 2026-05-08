# Phase 4 — Dashboard & Analytics

**Duration:** Weeks 10–11  
**Goal:** Build the complete assessor dashboard providing a unified pipeline view of all vendors, role-based access per department, and time-to-onboard analytics to validate the PoC's efficiency gains.

---

## Deliverables

| #   | Deliverable               | Description                                           |
| --- | ------------------------- | ----------------------------------------------------- |
| 4.1 | Vendor pipeline dashboard | Full list of vendors with status, score, risk flag    |
| 4.2 | Vendor detail page        | Complete vendor profile + assessment history          |
| 4.3 | Role-based views          | Filtered views per department role                    |
| 4.4 | Metrics / analytics page  | Time-to-onboard, assessment counts, risk distribution |
| 4.5 | Analytics API             | Aggregated metrics endpoints                          |
| 4.6 | User management (admin)   | Create/manage assessor accounts                       |
| 4.7 | Search & filter           | Cross-vendor search, multi-filter support             |
| 4.8 | Notifications badge       | In-app notification count for assigned tasks          |

---

## Folder Structure Added in This Phase

```
backend/app/
├── api/
│   ├── analytics.py          # Metrics endpoints
│   └── users.py              # User management (admin)
└── services/
    └── analytics_service.py  # Aggregation queries

frontend/src/
├── pages/
│   ├── DashboardPage.tsx      # Vendor pipeline view
│   ├── VendorDetailPage.tsx   # Full vendor + assessment detail
│   ├── MetricsPage.tsx        # Analytics charts
│   └── AdminUsersPage.tsx     # User management
├── components/
│   ├── Dashboard/
│   │   ├── VendorTable.tsx
│   │   ├── VendorStatusBadge.tsx
│   │   ├── RiskFlagBadge.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   ├── Metrics/
│   │   ├── TimeToOnboardChart.tsx
│   │   ├── RiskDistributionPie.tsx
│   │   ├── AssessmentTrendLine.tsx
│   │   └── StatCard.tsx
│   └── shared/
│       ├── NotificationBadge.tsx
│       └── RoleGuard.tsx
└── hooks/
    ├── useCurrentUser.ts
    └── useNotifications.ts
```

---

## Step-by-Step Implementation Tasks

### Task 4.1 — Vendor Pipeline Dashboard (`DashboardPage.tsx`)

The main landing page after login. Shows the full vendor pipeline.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  🏢 Vendor Assessment   [+ Submit New Vendor]  🔔 3  👤 Anna │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Total    │ │ Cleared  │ │ In Review│ │ Rejected │        │
│  │ 14       │ │ 5 🟢     │ │ 7 🟡     │ │ 2 🔴     │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├──────────────────────────────────────────────────────────────┤
│  [Search vendors...]  [Status ▼] [Risk ▼] [Dept ▼] [Date ▼] │
├──────────────────────────────────────────────────────────────┤
│  Company         Score  Risk   Status     Submitted  Actions │
│  ──────────────────────────────────────────────────────────  │
│  Acme AI Ltd     72     🟡     In Review  2026-05-01  [View] │
│  DataFlow Inc    88     🟢     Cleared    2026-04-20  [View] │
│  NeuralSoft      31     🔴     Rejected   2026-04-15  [View] │
│  VisionAI        --     --     Submitted  2026-05-07  [View] │
└──────────────────────────────────────────────────────────────┘
```

**`VendorTable.tsx` columns:**

- Company name (clickable → VendorDetailPage)
- Composite score (-- if not assessed yet)
- Risk flag badge (🟢 / 🟡 / 🔴 / — )
- Status badge (submitted / in_review / cleared / rejected)
- Submitted date
- Last updated
- Actions: [View] [Run Assessment] [Download PDF]

**Sorting:** click column headers to sort by score, date, status.  
**Pagination:** 20 per page with page controls.  
**Live refresh:** polling every 30 seconds for status changes (React Query).

---

### Task 4.2 — Vendor Detail Page (`VendorDetailPage.tsx`)

Accessed via `[View]` from the dashboard or `/vendors/:id`.

**Tabs:**

1. **Overview** — Company info, contacts, tech stack, submitted docs list
2. **Assessment** — Run/re-run assessment button + per-dimension score cards (from Phase 2)
3. **Report** — Full report view (from Phase 3) + PDF download
4. **Tasks** — All tasks linked to this vendor (from Phase 3)
5. **History** — Timeline of assessment runs with dates and score changes

**Status workflow controls (admin/procurement only):**

```
[submitted] → [in_review] → [cleared]
                           → [rejected]
```

Manual status override button with reason text (stored in an `audit_log` table).

---

### Task 4.3 — Role-Based Views

Each role sees a customised experience:

**`RoleGuard.tsx`** — HOC that wraps pages/components to show/hide based on user role.

| Role            | Dashboard | Report        | Tasks        | Admin | Metrics |
| --------------- | --------- | ------------- | ------------ | ----- | ------- |
| `admin`         | ✅ Full   | ✅ Full       | ✅ All depts | ✅    | ✅      |
| `procurement`   | ✅ Full   | ✅ Dims 2,5,6 | ✅ Own dept  | ❌    | ✅      |
| `it_security`   | ✅ Full   | ✅ Dims 1,3   | ✅ Own dept  | ❌    | Limited |
| `legal`         | ✅ Full   | ✅ Dim 4      | ✅ Own dept  | ❌    | Limited |
| `ai_innovation` | ✅ Read   | ✅ Dim 8      | 👁 View only | ❌    | Limited |

**Role-specific task board:** when logged in as `legal`, the task board defaults to showing only Legal department tasks. Filter panel still allows cross-dept view if needed.

**Role-specific report sections:** the report page highlights the dimensions relevant to the viewer's role at the top, with other sections collapsed by default.

---

### Task 4.4 — Metrics / Analytics Page (`MetricsPage.tsx`)

The key PoC validation page — demonstrates the value of automation.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Assessment Metrics          Period: [Last 30 days ▼]     │
├──────────────┬───────────────────────────────────────────────┤
│ Stat Cards   │  Time-to-Onboard Chart                        │
│              │                                               │
│ Avg time:    │  ████                       ████             │
│ 2.4 days ↓   │       ████            ████                   │
│              │            ████   ████                        │
│ Manual est:  │  ──────────────────────────────── weeks       │
│ 6–8 weeks    │  W1   W2   W3   W4   W5   W6   W7            │
│              │                                               │
│ Assessments: │  [Avg automated: 2.4d vs Manual ~45d]        │
│ 14 total     │                                               │
├──────────────┼───────────────────────────────────────────────┤
│  Risk Distribution (Pie)   │  Score Distribution (Bar)       │
│                            │                                 │
│  🟢 36% (5)                │  90-100: ██ 2                  │
│  🟡 50% (7)                │  70-89:  ████ 4                │
│  🔴 14% (2)                │  40-69:  ██████ 6              │
│                            │  0-39:   ██ 2                  │
├────────────────────────────┴───────────────────────────────┤
│  Dimension Performance (avg score across all vendors)       │
│  Security      ████████████████████ 78                     │
│  Viability     ████████████████ 65                         │
│  Integration   ██████████████████ 72                       │
│  Legal         ████████████ 52                             │
│  Commercial    ██████████████ 58                           │
│  Operations    ████████████████ 64                         │
│  Scalability   ████████████████ 63                         │
│  Maturity      ██████████████████ 71                       │
└────────────────────────────────────────────────────────────┘
```

**Charts (all using Recharts):**

- `TimeToOnboardChart` — Line chart: days from vendor submission to `cleared` status, per vendor over time
- `RiskDistributionPie` — Pie chart: proportion of Green/Amber/Red vendors
- `AssessmentTrendLine` — Bar chart: number of assessments completed per week
- `DimensionPerformanceBar` — Horizontal bar chart: average score per dimension
- `ScoreDistributionHistogram` — Bar chart: vendors bucketed by score range

**Key stat cards:**

- **Avg time-to-assess:** days from submission to assessment complete
- **Avg time-to-onboard:** days from submission to `cleared` status
- **Estimated manual baseline:** hardcoded 45 days (6–8 weeks, used as comparison)
- **Efficiency gain %:** `(45 - avg_time_to_onboard) / 45 * 100`
- **Total assessed:** count of completed assessments
- **Clearance rate:** % of assessed vendors marked `cleared`

---

### Task 4.5 — Analytics API Endpoints

| Method | Path                                | Description                                |
| ------ | ----------------------------------- | ------------------------------------------ |
| `GET`  | `/api/analytics/summary`            | Stat cards data (counts, avg times)        |
| `GET`  | `/api/analytics/time-to-onboard`    | Per-vendor time series data                |
| `GET`  | `/api/analytics/risk-distribution`  | Green/Amber/Red counts                     |
| `GET`  | `/api/analytics/dimension-averages` | Avg score per dimension across all vendors |
| `GET`  | `/api/analytics/score-distribution` | Count per score bucket                     |

All endpoints accept optional `?from_date=` and `?to_date=` query params.

**`services/analytics_service.py`** — pure SQL aggregation queries via SQLAlchemy:

```python
# Time-to-onboard: average days from vendors.created_at to assessments.completed_at
# Risk distribution: count of assessments grouped by risk_flag
# Dimension averages: avg(composite_score) from dimension_scores GROUP BY dimension
```

---

### Task 4.6 — User Management (Admin)

`AdminUsersPage.tsx` — only visible to `admin` role.

Features:

- List all users (name, email, role, active/inactive)
- Create new user (name, email, role, temporary password)
- Deactivate/reactivate user
- Change user role

API endpoints added:

| Method  | Path              | Description                       |
| ------- | ----------------- | --------------------------------- |
| `GET`   | `/api/users`      | List all users (admin only)       |
| `POST`  | `/api/users`      | Create new user                   |
| `PATCH` | `/api/users/{id}` | Update user (role, active status) |

Default seed users (created by Alembic data migration):

```
admin@carlsberg.com        role: admin
procurement@carlsberg.com  role: procurement
security@carlsberg.com     role: it_security
legal@carlsberg.com        role: legal
innovation@carlsberg.com   role: ai_innovation
```

All with default password: `ChangeMe123!` (displayed in README for PoC)

---

### Task 4.7 — Search & Filter

**Backend:** All list endpoints accept query parameters:

- `GET /api/vendors?search=acme&status=in_review&risk_flag=amber&page=1&size=20`

**Frontend `FilterPanel.tsx`** persists filters in URL query params (using `useSearchParams`) so filters survive page refresh and can be bookmarked/shared.

Filter options:

- Free-text search (company name, description)
- Status: submitted / in_review / cleared / rejected / all
- Risk flag: green / amber / red / unassessed / all
- Submitted date range (date picker)
- Responsible dept (filters by which tasks exist for this vendor)

---

### Task 4.8 — In-App Notifications Badge

`NotificationBadge.tsx` in the top navigation bar.

Shows count of open tasks assigned to the current user.

Clicking the bell opens a dropdown list:

- Task title
- Vendor name
- Due date (red if overdue)
- "View" link

Polled every 60 seconds via React Query.

Backend endpoint: `GET /api/tasks/my?status=open` (already defined in Phase 3).

---

## Definition of Done ✅

Phase 4 is complete when:

- [ ] Dashboard shows all vendors with correct scores, risk flags, and status badges
- [ ] Clicking a vendor opens the full detail page with all 5 tabs working
- [ ] A `procurement` user cannot see the Legal dimension scorer tab (role guard works)
- [ ] The metrics page shows all 5 chart types with real data from the DB
- [ ] The time-to-onboard stat card shows a calculated average
- [ ] Admin can create a new user and that user can log in
- [ ] Search by vendor name works and filters the table correctly
- [ ] The notification badge shows the count of assigned open tasks
- [ ] All pages are mobile-responsive (Tailwind responsive classes)

---

## Risks & Mitigations

| Risk                                                               | Mitigation                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Metrics page has no data for charts during early testing           | Seed the database with synthetic vendor + assessment data for demo                                |
| Role guard bypassed by direct URL access                           | Backend enforces RBAC on every endpoint; frontend guard is UX-only                                |
| Dashboard pagination slow with many vendors                        | Add DB index on `vendors.status`, `vendors.created_at`; paginate at DB level                      |
| Time-to-onboard metric misleading if vendors never reach `cleared` | Show separate metrics for "time-to-assess" (always available) vs "time-to-onboard" (cleared only) |
