# Vendor Assessment — Demo Runs

This folder contains end-to-end demo plans for the Vendor Assessment MCP PoC.
Each demo run has a unique ID and is self-contained with everything needed to execute and narrate the demo.

---

## Folder Structure

```
demo/
├── README.md          ← You are here
├── demo-001/
│   ├── manifest.md    ← Full demo plan: scenario, intake data, expected outputs, talking points
│   ├── run.md         ← Live execution script (step-by-step what to say and do)
│   └── assets/
│       └── ambertech-msa.txt          ← Mock MSA with incomplete IP clauses
└── demo-002/
    ├── manifest.md    ← Full demo plan: scenario, intake data, expected outputs, talking points
    ├── run.md         ← Live execution script (step-by-step what to say and do)
    └── assets/
        └── openai-service-agreement.txt  ← Carlsberg-annotated real OpenAI Business Terms + DPA
```

---

## Demo Index

| ID         | Scenario                                  | Vendor              | Expected Outcome | Purpose                                        |
| ---------- | ----------------------------------------- | ------------------- | ---------------- | ---------------------------------------------- |
| `demo-001` | Amber-risk AI startup                     | AmberTech Solutions | 🟡 AMBER ~52/100 | Hackathon judging demo video                   |
| `demo-002` | Large enterprise — legal & data sovereignty | OpenAI              | 🟡 AMBER ~62/100 | Contrast demo — big name ≠ automatic green light |

---

## Prerequisites

Before running any demo, ensure the full stack is running:

```bash
docker compose up --build
```

Services required:

- `backend` on port 8000
- `db` (PostgreSQL) on port 5432
- `mcp-server` connected via Cline MCP settings

Verify connectivity:

```bash
curl http://localhost:8000/health
```

---

## How to Run a Demo

1. Open this folder in VS Code with Cline active
2. Open `demo/demo-001/manifest.md` to review the scenario and intake data
3. Follow `demo/demo-001/run.md` step by step — it tells you exactly what to say to Cline
4. Each step shows the expected MCP tool call and expected output
5. Narrate using the talking points in `manifest.md` for the jury Q&A slides

---

## Adding a New Demo Run

1. Copy `demo-001/` → `demo-002/` (increment the ID)
2. Update `manifest.md` with the new vendor scenario
3. Add the new run to the Demo Index table above
