# Phase 1 — Foundation & Infrastructure

**Duration:** Weeks 1–3  
**Goal:** Get the entire Docker stack running, the database schema in place, and a working vendor intake form that can accept and store a startup's submission.

---

## Deliverables

| #   | Deliverable          | Description                                     |
| --- | -------------------- | ----------------------------------------------- |
| 1.1 | Docker Compose stack | All services start with `docker compose up`     |
| 1.2 | PostgreSQL schema    | All core tables created via Alembic migrations  |
| 1.3 | FastAPI skeleton     | Health check endpoint + CRUD for vendors        |
| 1.4 | React skeleton       | App shell + routing + login page                |
| 1.5 | Vendor intake form   | Multi-step form to submit a startup             |
| 1.6 | File upload          | Upload documents (PDF, DOCX) attached to vendor |
| 1.7 | Auth (JWT)           | Login endpoint + protected routes               |
| 1.8 | .env config          | All secrets/config in `.env.example`            |

---

## Folder Structure to Create

```
vendor-assessment-poc/
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── security.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── vendor.py
│       │   ├── assessment.py
│       │   ├── dimension_score.py
│       │   ├── report.py
│       │   ├── task.py
│       │   └── user.py
│       ├── schemas/
│       │   ├── vendor.py
│       │   └── auth.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── vendors.py
│       │   └── auth.py
│       └── services/
│           └── vendor_service.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/
        │   └── client.ts
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   └── VendorSubmitPage.tsx
        └── components/
            ├── Layout.tsx
            └── VendorForm/
                ├── Step1Company.tsx
                ├── Step2Security.tsx
                ├── Step3Technical.tsx
                ├── Step4Legal.tsx
                ├── Step5Commercial.tsx
                └── FormStepper.tsx
```

---

## Step-by-Step Implementation Tasks

### Task 1.1 — Docker Compose Setup

Create `docker-compose.yml` with these services:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    depends_on: [db]
    volumes:
      - ./backend:/app
      - uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    depends_on: [backend]

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on: [frontend, backend]

volumes:
  pgdata:
  uploads:
```

---

### Task 1.2 — Environment Variables

Create `.env.example`:

```
# Database
POSTGRES_USER=vendor_user
POSTGRES_PASSWORD=changeme
POSTGRES_DB=vendor_assessment
DATABASE_URL=postgresql+asyncpg://vendor_user:changeme@db:5432/vendor_assessment

# Auth
JWT_SECRET=supersecretkeychangethis
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# OpenRouter
OPENROUTER_API_KEY=your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct:free

# Email (Mailhog)
SMTP_HOST=mailhog
SMTP_PORT=1025
EMAIL_FROM=noreply@vendor-assessment.local

# External APIs
NVD_API_KEY=                    # optional, increases rate limit
COMPANIES_HOUSE_API_KEY=        # free key from Companies House
OPENCORPORATES_API_KEY=         # free tier, no key needed for basic

# App
ENVIRONMENT=development
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=20
```

---

### Task 1.3 — Backend Python Setup

**`requirements.txt`:**

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
pydantic==2.7.1
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
aiofiles==23.2.1
httpx==0.27.0
weasyprint==62.3
jinja2==3.1.4
python-dotenv==1.0.1
```

**`app/core/config.py`** — load all env vars via Pydantic BaseSettings.

**`app/core/database.py`** — async SQLAlchemy engine + session factory.

**`app/main.py`** — FastAPI app with:

- CORS middleware (allow localhost:3000)
- Router inclusion
- `/health` GET endpoint returning `{"status": "ok"}`
- Lifespan event to verify DB connection on startup

---

### Task 1.4 — Database Schema (Alembic Migration 001)

Tables to create in the initial migration:

**`users`**

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
email       TEXT UNIQUE NOT NULL
full_name   TEXT NOT NULL
hashed_password TEXT NOT NULL
role        TEXT NOT NULL  -- admin | procurement | it_security | legal | ai_innovation
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMPTZ DEFAULT now()
```

**`vendors`**

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
company_name    TEXT NOT NULL
website         TEXT
country         TEXT
founded_year    INT
employee_count  INT
description     TEXT
tech_stack      JSONB         -- list of technologies
contacts        JSONB         -- [{name, email, role}]
submitted_by    UUID REFERENCES users(id)
status          TEXT DEFAULT 'submitted'  -- submitted | in_review | cleared | rejected
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

**`vendor_documents`**

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
vendor_id   UUID REFERENCES vendors(id) ON DELETE CASCADE
doc_type    TEXT  -- security_whitepaper | architecture_doc | legal_doc | financial_doc | other
filename    TEXT
file_path   TEXT
uploaded_at TIMESTAMPTZ DEFAULT now()
```

**`assessments`**

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
vendor_id       UUID REFERENCES vendors(id)
status          TEXT DEFAULT 'pending'  -- pending | running | complete | failed
triggered_by    UUID REFERENCES users(id)
started_at      TIMESTAMPTZ
completed_at    TIMESTAMPTZ
composite_score NUMERIC(5,2)
risk_flag       TEXT  -- green | amber | red
created_at      TIMESTAMPTZ DEFAULT now()
```

**`dimension_scores`**

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
assessment_id   UUID REFERENCES assessments(id) ON DELETE CASCADE
dimension       TEXT  -- security | viability | integration | legal | commercial | operations | scalability | maturity
rules_score     NUMERIC(5,2)
llm_score       NUMERIC(5,2)
composite_score NUMERIC(5,2)
risk_flag       TEXT  -- green | amber | red
evidence        JSONB  -- [{signal, value, impact}]
llm_reasoning   TEXT
created_at      TIMESTAMPTZ DEFAULT now()
```

**`tasks`**

```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE
vendor_id     UUID REFERENCES vendors(id)
title         TEXT NOT NULL
description   TEXT
department    TEXT  -- procurement | it_security | legal | ai_innovation
assigned_to   UUID REFERENCES users(id)
priority      TEXT  -- high | medium | low
status        TEXT DEFAULT 'open'  -- open | in_progress | done
due_date      DATE
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

**`reports`**

```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
assessment_id UUID REFERENCES assessments(id)
vendor_id     UUID REFERENCES vendors(id)
pdf_path      TEXT
report_json   JSONB
generated_at  TIMESTAMPTZ DEFAULT now()
```

**`enrichment_cache`**

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
vendor_id   UUID REFERENCES vendors(id)
source      TEXT  -- nvd | companies_house | opencorporates
data        JSONB
fetched_at  TIMESTAMPTZ DEFAULT now()
expires_at  TIMESTAMPTZ
```

---

### Task 1.5 — Vendor API Endpoints

| Method  | Path                          | Description                                      |
| ------- | ----------------------------- | ------------------------------------------------ |
| `POST`  | `/api/vendors`                | Create new vendor + save basic info              |
| `GET`   | `/api/vendors`                | List all vendors (paginated, with status filter) |
| `GET`   | `/api/vendors/{id}`           | Get single vendor full detail                    |
| `PATCH` | `/api/vendors/{id}`           | Update vendor info                               |
| `POST`  | `/api/vendors/{id}/documents` | Upload document(s)                               |
| `GET`   | `/api/vendors/{id}/documents` | List uploaded documents                          |

---

### Task 1.6 — Auth Endpoints

| Method | Path                | Description                           |
| ------ | ------------------- | ------------------------------------- |
| `POST` | `/api/auth/login`   | Returns access + refresh tokens       |
| `POST` | `/api/auth/refresh` | Exchange refresh for new access token |
| `GET`  | `/api/auth/me`      | Get current user profile              |

---

### Task 1.7 — Frontend: Multi-Step Vendor Intake Form

The form is split into 5 steps aligned with the assessment dimensions:

**Step 1 — Company Info**

- Company name, website, country, founded year, employee count
- Short description of product/service
- Technology stack (multi-select tags)
- Key contacts (name, email, role)

**Step 2 — Security & Compliance**
Checkboxes + upload fields:

- ISO 27001 certified? (Y/N + upload cert)
- SOC 2 Type II? (Y/N + upload report)
- GDPR DPA available? (Y/N + upload)
- Security breach in last 2 years? (Y/N + description)
- Pen-test in last 12 months? (Y/N + upload report)
- Data residency region (select)

**Step 3 — Technical & Integration**

- Primary cloud/hosting provider
- API documentation available? (Y/N + URL)
- Upload: architecture diagram / technical spec
- What data will be exchanged with Carlsberg? (text)
- SLA commitments (uptime %, response time)

**Step 4 — Legal & Commercial**

- Company registration number + country
- Upload: IP ownership declaration
- Upload: most recent audited accounts
- Pricing model (SaaS subscription / usage / perpetual / other)
- Estimated annual cost for enterprise licence (£/€)
- Upload: draft contract / MSA if available

**Step 5 — Operations & Product**

- Deployment method (cloud / on-premise / hybrid)
- Dedicated customer success contact? (Y/N)
- Current production customers (names optional)
- Product demo URL or upload
- Upload: product roadmap
- Describe multilingual support capabilities

---

### Task 1.8 — Nginx Config

```nginx
server {
    listen 80;

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 25M;
    }
}
```

---

## Definition of Done ✅

Phase 1 is complete when:

- [ ] `docker compose up --build` starts all 5 services with no errors
- [ ] `GET http://localhost:8000/health` returns `{"status": "ok"}`
- [ ] `GET http://localhost:8000/docs` shows the FastAPI Swagger UI
- [ ] A user can log in at `http://localhost:3000/login`
- [ ] A logged-in user can complete the 5-step vendor intake form and submit it
- [ ] The submitted vendor appears in the database (`vendors` table)
- [ ] Uploaded files are saved to the `uploads/` volume
- [ ] All 7 database tables exist with correct schema (verified via `psql`)

---

## Risks & Mitigations

| Risk                                    | Mitigation                                                              |
| --------------------------------------- | ----------------------------------------------------------------------- |
| WeasyPrint has many system dependencies | Use the official WeasyPrint Docker image as base for backend            |
| Large file uploads timing out           | Set `client_max_body_size 25M` in Nginx; use async streaming in FastAPI |
| asyncpg connection pool exhausted       | Set pool size in SQLAlchemy config; use connection pooling              |
