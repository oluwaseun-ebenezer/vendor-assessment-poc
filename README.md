# Automated Vendor Assessment Framework for AI Startups (PoC)

**Client:** Carlsberg (Enterprise)  
**Goal:** Automate the vetting and risk-scoring of AI startups across 8 compliance dimensions, reducing time-to-onboard and providing structured, actionable reports.

---

## 🚀 Quick Start (Local / Docker)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [Node.js 20+](https://nodejs.org/) (for frontend dev)
- [Python 3.11+](https://python.org/) (for backend dev)
- An [OpenRouter](https://openrouter.ai/) API key

### Run the full stack

```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
docker compose up --build
```

| Service               | URL                        |
| --------------------- | -------------------------- |
| Frontend (React)      | http://localhost:3000      |
| Backend API (FastAPI) | http://localhost:8000/docs |
| PostgreSQL            | localhost:5432             |
| Mailhog (email UI)    | http://localhost:8025      |

---

## 🏗️ Architecture Overview

See [`docs/00-architecture.md`](docs/00-architecture.md) for the full system design.

```
┌──────────────────────────────────────────────────────┐
│  React Frontend (Vite + TypeScript)                  │
│  • Vendor submission form                            │
│  • Assessor dashboard                                │
│  • Risk report viewer                                │
│  • Task board                                        │
└────────────────────┬─────────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼─────────────────────────────────┐
│  FastAPI Backend                                      │
│  • Vendor Intake API                                  │
│  • Scoring Engine (rules + LLM via OpenRouter)       │
│  • Report Generator (PDF via WeasyPrint)             │
│  • Task Orchestration                                 │
│  • Notification Service (Mailhog SMTP)               │
└──────┬─────────────────────────┬─────────────────────┘
       │                         │
┌──────▼──────┐        ┌─────────▼──────────┐
│ PostgreSQL  │        │ External Free APIs │
│ (Docker)    │        │ • NVD/CVE          │
└─────────────┘        │ • Companies House  │
                       │ • OpenCorporates   │
                       │ • OpenRouter LLM   │
                       └────────────────────┘
```

---

## 📐 The 8 Assessment Dimensions

| #   | Dimension                      | Owner            |
| --- | ------------------------------ | ---------------- |
| 1   | Security, Privacy & Compliance | IT Security      |
| 2   | Vendor Viability & Continuity  | Procurement      |
| 3   | Integration & Data Integrity   | IT / Engineering |
| 4   | Legal & IP                     | Legal            |
| 5   | Cost & Commercials             | Procurement      |
| 6   | Operations & Change Management | Procurement / IT |
| 7   | Global Scalability             | IT / Engineering |
| 8   | Product Maturity & Delivery    | AI Innovation    |

Each dimension is scored **0–100** and flagged **🟢 Green / 🟡 Amber / 🔴 Red**.

---

## 📋 Delivery Phases

| Phase                                      | Focus                       | Key Deliverable                                |
| ------------------------------------------ | --------------------------- | ---------------------------------------------- |
| [Phase 1](docs/phase-1-foundation.md)      | Foundation & Infrastructure | Docker stack, DB schema, vendor intake form    |
| [Phase 2](docs/phase-2-scoring-engine.md)  | Scoring Engine              | Rules + LLM scoring across 8 dimensions        |
| [Phase 3](docs/phase-3-reporting-tasks.md) | Reporting & Task Management | PDF reports, auto-task creation, notifications |
| [Phase 4](docs/phase-4-dashboard.md)       | Dashboard & Analytics       | Full assessor UI, role views, metrics          |
| [Phase 5](docs/phase-5-validation.md)      | PoC Validation              | End-to-end test, metrics, stakeholder demo     |

---

## 🗂️ Project Structure

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
│   └── phase-5-validation.md
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # DB models (SQLAlchemy)
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── scoring/          # Scoring engine
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
└── nginx/
    └── nginx.conf
```

---

## 🔐 Environment Variables

See `.env.example` for all required variables. Key ones:

```
OPENROUTER_API_KEY=your_key_here
POSTGRES_PASSWORD=changeme
JWT_SECRET=changeme
```
