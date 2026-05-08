# Phase 2 — Scoring Engine

**Duration:** Weeks 4–6  
**Goal:** Build the automated scoring engine that evaluates a vendor across all 8 dimensions using a hybrid of rules-based logic and LLM-assisted document analysis via OpenRouter.

---

## Deliverables

| #   | Deliverable           | Description                                                     |
| --- | --------------------- | --------------------------------------------------------------- |
| 2.1 | Base scorer interface | Abstract class all dimension scorers inherit                    |
| 2.2 | 8 dimension scorers   | One module per dimension with rules + LLM scoring               |
| 2.3 | Enrichment service    | Pulls free external data (NVD, Companies House, OpenCorporates) |
| 2.4 | LLM document analyser | Extracts text from PDFs and sends to OpenRouter                 |
| 2.5 | Scoring orchestrator  | Runs all 8 scorers in sequence, stores results                  |
| 2.6 | Assessment API        | Trigger assessment, poll status, get results                    |
| 2.7 | Frontend trigger      | "Run Assessment" button on vendor detail page                   |

---

## Folder Structure Added in This Phase

```
backend/app/
├── scoring/
│   ├── __init__.py
│   ├── base_scorer.py
│   ├── security_scorer.py
│   ├── viability_scorer.py
│   ├── integration_scorer.py
│   ├── legal_scorer.py
│   ├── commercial_scorer.py
│   ├── operations_scorer.py
│   ├── scalability_scorer.py
│   ├── maturity_scorer.py
│   └── llm_analyser.py
├── services/
│   ├── scoring_engine.py       # Orchestrator
│   └── enrichment_service.py  # External API calls
└── api/
    └── assessments.py          # New API routes
```

---

## Step-by-Step Implementation Tasks

### Task 2.1 — Base Scorer Interface

**`scoring/base_scorer.py`**

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

@dataclass
class ScorerInput:
    vendor: dict          # vendor DB record as dict
    documents: list[dict] # list of {doc_type, file_path, text_content}
    enrichment: dict      # pre-fetched external data

@dataclass
class DimensionResult:
    dimension: str
    rules_score: float       # 0-100
    llm_score: float         # 0-100, or None if no docs
    composite_score: float   # 0.6*rules + 0.4*llm
    risk_flag: str           # green | amber | red
    evidence: list[dict]     # [{signal, value, impact, source}]
    llm_reasoning: str       # raw LLM explanation

class BaseDimensionScorer(ABC):
    DIMENSION_NAME: str = ""
    WEIGHT_RULES: float = 0.6
    WEIGHT_LLM: float = 0.4

    @abstractmethod
    def score_with_rules(self, inp: ScorerInput) -> tuple[float, list[dict]]:
        """Returns (score_0_to_100, evidence_list)"""
        ...

    @abstractmethod
    def get_llm_prompt(self, inp: ScorerInput) -> str:
        """Returns the prompt to send to the LLM"""
        ...

    def compute_risk_flag(self, score: float) -> str:
        if score >= 70:
            return "green"
        elif score >= 40:
            return "amber"
        return "red"

    async def score(self, inp: ScorerInput, llm_analyser) -> DimensionResult:
        rules_score, evidence = self.score_with_rules(inp)

        llm_score = 0.0
        llm_reasoning = ""
        if inp.documents:
            prompt = self.get_llm_prompt(inp)
            llm_score, llm_reasoning = await llm_analyser.analyse(prompt)

        composite = (self.WEIGHT_RULES * rules_score + self.WEIGHT_LLM * llm_score)
        if not inp.documents:
            composite = rules_score  # No documents → use rules only

        return DimensionResult(
            dimension=self.DIMENSION_NAME,
            rules_score=rules_score,
            llm_score=llm_score,
            composite_score=round(composite, 2),
            risk_flag=self.compute_risk_flag(composite),
            evidence=evidence,
            llm_reasoning=llm_reasoning,
        )
```

---

### Task 2.2 — The 8 Dimension Scorers

#### Dimension 1 — Security, Privacy & Compliance (`security_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                   | Points |
| ---------------------------------------- | ------ |
| ISO 27001 certified                      | +20    |
| SOC 2 Type II                            | +20    |
| GDPR DPA signed/available                | +20    |
| Pen-test conducted in last 12 months     | +15    |
| No known security breach in last 2 years | +15    |
| Data residency in EU/EEA                 | +10    |
| Security breach in last 2 years          | −30    |

**LLM prompt focus:** Extract evidence of GDPR data handling, data minimisation, breach notification procedures, encryption standards from uploaded security documents.

**Responsible dept:** IT Security

---

#### Dimension 2 — Vendor Viability & Continuity (`viability_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                      | Points      |
| ------------------------------------------- | ----------- |
| Founded > 2 years ago                       | +15         |
| Employee count ≥ 10                         | +15         |
| Employee count ≥ 25                         | +10 (bonus) |
| Has raised ≥ Seed funding                   | +15         |
| Has raised ≥ Series A                       | +10 (bonus) |
| Key person risk: > 1 technical founder/lead | +15         |
| Business continuity plan documented         | +20         |
| Active on Companies House / no red flags    | +10         |

**External enrichment used:** Companies House (company status, filing history), OpenCorporates (incorporation data)

**LLM prompt focus:** Extract evidence of financial health, runway indicators, team stability signals from uploaded financial docs.

**Responsible dept:** Procurement

---

#### Dimension 3 — Integration & Data Integrity (`integration_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                        | Points |
| --------------------------------------------- | ------ |
| Public API documentation available            | +20    |
| REST/GraphQL API (standard protocols)         | +15    |
| SLA uptime commitment ≥ 99.5%                 | +20    |
| Data format: standard (JSON/XML/CSV)          | +10    |
| Supports SSO / SAML / OAuth2                  | +15    |
| Data validation / integrity checks documented | +10    |
| Disaster recovery / backup plan documented    | +10    |

**LLM prompt focus:** Assess technical architecture quality, data governance practices, API maturity from uploaded architecture docs.

**Responsible dept:** IT Security / Engineering

---

#### Dimension 4 — Legal & IP (`legal_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                | Points |
| ------------------------------------- | ------ |
| Company legally registered (verified) | +20    |
| IP ownership clearly documented       | +25    |
| No pending litigation disclosed       | +20    |
| Open-source licence review clean      | +15    |
| MSA / contract template available     | +20    |

**External enrichment used:** Companies House (legal status, charges, insolvency), OpenCorporates

**LLM prompt focus:** Assess IP ownership clarity, licence grant terms, indemnification clauses, liability caps from uploaded legal docs.

**Responsible dept:** Legal

---

#### Dimension 5 — Cost & Commercials (`commercial_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                    | Points |
| ----------------------------------------- | ------ |
| Pricing model is transparent / documented | +20    |
| Enterprise pricing tier available         | +20    |
| Annual cost estimate provided             | +15    |
| TCO breakdown available                   | +15    |
| Volume discount offered                   | +15    |
| No vendor lock-in clauses identified      | +15    |

**LLM prompt focus:** Evaluate pricing clarity, hidden costs, data egress fees, contract lock-in terms from uploaded commercial docs.

**Responsible dept:** Procurement

---

#### Dimension 6 — Operations & Change Management (`operations_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                          | Points |
| ----------------------------------------------- | ------ |
| Dedicated customer success contact offered      | +20    |
| Named support tiers with SLA                    | +15    |
| User training / onboarding programme documented | +20    |
| Change management / release notes process       | +15    |
| Deployment method suitable for enterprise       | +15    |
| Rollback / downtime mitigation process          | +15    |

**LLM prompt focus:** Evaluate operational maturity, change management process, support responsiveness from uploaded operational docs.

**Responsible dept:** Procurement / IT

---

#### Dimension 7 — Global Scalability (`scalability_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                            | Points |
| ------------------------------------------------- | ------ |
| Data hosted in multiple regions                   | +20    |
| EU data residency option                          | +20    |
| Multi-language UI support                         | +15    |
| Local regulatory compliance (e.g., Danish, EU)    | +20    |
| Already operating in 3+ countries                 | +15    |
| Scalable infrastructure (auto-scaling documented) | +10    |

**LLM prompt focus:** Assess global readiness, regulatory compliance coverage, hosting architecture from uploaded architecture/compliance docs.

**Responsible dept:** IT Engineering

---

#### Dimension 8 — Product Maturity & Delivery (`maturity_scorer.py`)

**Rules signals (max 100 pts):**

| Signal                                             | Points |
| -------------------------------------------------- | ------ |
| Product is in live production (not beta)           | +25    |
| At least 1 named enterprise customer               | +20    |
| Product roadmap provided and credible              | +20    |
| Demo available (URL or file)                       | +15    |
| Delivery track record: no missed milestones stated | +10    |
| Public G2/Capterra/reviews exist                   | +10    |

**LLM prompt focus:** Evaluate product TRL (Technology Readiness Level), roadmap credibility, delivery evidence from uploaded product docs.

**Responsible dept:** AI Innovation

---

### Task 2.3 — LLM Document Analyser

**`scoring/llm_analyser.py`**

Responsibilities:

1. Accept a prompt string (constructed by each scorer)
2. Call OpenRouter API via `httpx` async client
3. Parse the JSON response to extract a numeric score (0–100) and reasoning text
4. Return `(score: float, reasoning: str)`

**OpenRouter call pattern:**

```python
async def analyse(self, prompt: str) -> tuple[float, str]:
    payload = {
        "model": settings.OPENROUTER_MODEL,  # e.g. meta-llama/llama-3-8b-instruct:free
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an enterprise vendor risk analyst. "
                    "Always respond with valid JSON: "
                    '{"score": <integer 0-100>, "reasoning": "<explanation>"}'
                )
            },
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}
    }
    response = await self.client.post(
        f"{settings.OPENROUTER_BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}"},
        json=payload,
        timeout=60
    )
    data = response.json()
    content = json.loads(data["choices"][0]["message"]["content"])
    return float(content["score"]), content["reasoning"]
```

**Document text extraction:**

- PDF → `pypdf` (pure Python, no system deps)
- DOCX → `python-docx`
- Text is truncated to 6000 tokens before sending to LLM

---

### Task 2.4 — Enrichment Service

**`services/enrichment_service.py`**

Pulls free public data once per vendor, caches for 7 days in `enrichment_cache` table.

**NVD / CVE lookup:**

```
GET https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch={tech}
```

For each technology in `vendor.tech_stack`, fetch known CVEs → add to security scorer input.

**Companies House lookup:**

```
GET https://api.company-information.service.gov.uk/search/companies?q={name}
GET https://api.company-information.service.gov.uk/company/{company_number}
```

Returns: company status (active/dissolved), filing history, charges, insolvency status.

**OpenCorporates lookup:**

```
GET https://api.opencorporates.com/v0.4/companies/search?q={name}&country_code={cc}
```

Returns: incorporation data, registered agents, inactive flag.

**Fallback:** If all external APIs fail or return no match, enrichment returns empty data and scorers proceed with rules-only scoring. This is logged as a warning.

---

### Task 2.5 — Scoring Orchestrator

**`services/scoring_engine.py`**

```python
async def run_assessment(assessment_id: UUID, vendor_id: UUID, db: AsyncSession):
    # 1. Mark assessment as "running"
    # 2. Load vendor + documents from DB
    # 3. Extract text from all uploaded documents
    # 4. Call enrichment service (or load from cache)
    # 5. Build ScorerInput
    # 6. Run all 8 scorers concurrently (asyncio.gather)
    # 7. Save each DimensionResult to dimension_scores table
    # 8. Compute composite score (average of 8 dimension scores)
    # 9. Determine overall risk_flag
    # 10. Mark assessment as "complete" with composite_score + risk_flag
    # 11. Trigger report generation (Phase 3)
```

**Composite score formula:**

```
composite_score = mean(all 8 dimension composite scores)
```

**Overall risk flag:**

- Any dimension is 🔴 RED → overall = 🔴 RED
- Any dimension is 🟡 AMBER (no RED) → overall = 🟡 AMBER
- All dimensions 🟢 GREEN → overall = 🟢 GREEN

---

### Task 2.6 — Assessment API Endpoints

| Method | Path                                   | Description                                      |
| ------ | -------------------------------------- | ------------------------------------------------ |
| `POST` | `/api/assessments/{vendor_id}/run`     | Trigger a new assessment (async background task) |
| `GET`  | `/api/assessments/{vendor_id}/status`  | Poll current assessment status                   |
| `GET`  | `/api/assessments/{vendor_id}/results` | Get all dimension scores when complete           |
| `GET`  | `/api/assessments/{id}`                | Get a single assessment by ID                    |

The `run` endpoint launches the scoring engine as a **FastAPI BackgroundTask** so the HTTP response returns immediately while scoring runs in the background.

---

### Task 2.7 — Frontend Updates

Add to `VendorDetailPage`:

- Show current assessment status (pending / running / complete / failed)
- **"Run Assessment" button** → calls `POST /api/assessments/{id}/run`
- Auto-polling every 5 seconds while status is `running` (use React Query `refetchInterval`)
- When complete: show a summary card per dimension with score + risk flag badge (🟢/🟡/🔴)

---

## Definition of Done ✅

Phase 2 is complete when:

- [ ] All 8 dimension scorers exist and return a `DimensionResult`
- [ ] A vendor with structured fields gets a rules-based score for each dimension
- [ ] A vendor with uploaded documents gets an LLM-augmented score (verified with real OpenRouter call)
- [ ] External enrichment data is fetched and cached in `enrichment_cache`
- [ ] `POST /api/assessments/{vendor_id}/run` triggers scoring and returns `202 Accepted`
- [ ] Polling `GET /api/assessments/{vendor_id}/status` transitions from `running` to `complete`
- [ ] 8 rows exist in `dimension_scores` table after a completed assessment
- [ ] The composite score and overall risk flag are stored on the `assessments` row
- [ ] The frontend shows per-dimension scores with coloured risk badges

---

## Risks & Mitigations

| Risk                                        | Mitigation                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| OpenRouter rate limits on free models       | Add exponential backoff retry (3 attempts) with `tenacity` library      |
| LLM returns malformed JSON                  | Wrap parse in try/except; fall back to rules-only score if LLM fails    |
| PDF text extraction fails on scanned images | Log warning, skip LLM scoring for that doc, continue with others        |
| External API (NVD, Companies House) down    | Cache results; if no cache, proceed with rules-only + log warning       |
| Scoring takes too long (many docs)          | Run 8 scorers concurrently with `asyncio.gather`; set LLM timeout = 60s |
