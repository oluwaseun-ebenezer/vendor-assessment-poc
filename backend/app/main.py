from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base, AsyncSessionLocal
from app.api import auth, vendors, assessments, reports, tasks, analytics, users, approve, upload_base64


async def _seed_users():
    from sqlalchemy import select
    from app.models.user import User
    from app.core.security import hash_password

    seed = [
        ("admin@carlsberg.com", "Admin User", "admin"),
        ("procurement@carlsberg.com", "Procurement Officer", "procurement"),
        ("security@carlsberg.com", "Security Analyst", "it_security"),
        ("legal@carlsberg.com", "Legal Counsel", "legal"),
        ("innovation@carlsberg.com", "Innovation Lead", "ai_innovation"),
    ]
    async with AsyncSessionLocal() as db:
        for email, full_name, role in seed:
            result = await db.execute(select(User).where(User.email == email))
            if result.scalar_one_or_none() is None:
                db.add(User(email=email, full_name=full_name,
                            hashed_password=hash_password("ChangeMe123!"), role=role))
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _seed_users()
    yield


app = FastAPI(
    title="Vendor Assessment API",
    description="Automated AI Startup Vendor Vetting & Risk Scoring for Carlsberg",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://localhost", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(assessments.router)
app.include_router(reports.router)
app.include_router(tasks.router)
app.include_router(analytics.router)
app.include_router(users.router)
app.include_router(approve.router)
app.include_router(upload_base64.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "vendor-assessment-api"}
