"""Task service — auto-creates action items from assessment results."""
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task

TASK_TEMPLATES = {
    "security": [
        ("Obtain ISO 27001 certification", "high", "IT Security"),
        ("Sign GDPR Data Processing Agreement", "high", "Legal"),
        ("Request SOC 2 Type II report", "medium", "IT Security"),
    ],
    "viability": [
        ("Request latest audited financial statements", "medium", "Procurement"),
        ("Assess key-person dependency risk", "medium", "Procurement"),
    ],
    "integration": [
        ("Review API documentation and integration spec",
         "medium", "IT / Engineering"),
        ("Validate SLA uptime commitments in contract", "high", "Procurement"),
    ],
    "legal": [
        ("Conduct IP ownership due diligence", "high", "Legal"),
        ("Review open-source licence compliance", "medium", "Legal"),
    ],
    "commercial": [
        ("Negotiate enterprise pricing and SLA", "medium", "Procurement"),
        ("Clarify data egress and exit fees", "high", "Procurement"),
    ],
    "operations": [
        ("Confirm dedicated Customer Success Manager", "low", "Procurement"),
        ("Define rollback and incident response process",
         "medium", "IT / Engineering"),
    ],
    "scalability": [
        ("Confirm EU data residency contractually", "high", "Legal"),
        ("Verify multi-region deployment capability", "medium", "IT / Engineering"),
    ],
    "maturity": [
        ("Request product roadmap and delivery schedule", "medium", "AI Innovation"),
        ("Check customer references for enterprise deployments", "medium", "Procurement"),
    ],
}

DEPT_MAP = {
    "IT Security": "it_security",
    "Legal": "legal",
    "Procurement": "procurement",
    "IT / Engineering": "it_security",
    "AI Innovation": "ai_innovation",
    "Procurement / IT": "procurement",
}


async def create_tasks_from_assessment(
    assessment_id: str,
    vendor_id: str,
    dimension_scores: list,
    vendor_name: str,
    db: AsyncSession,
):
    for ds in dimension_scores:
        if ds.risk_flag in ("amber", "red"):
            templates = TASK_TEMPLATES.get(ds.dimension, [])
            for title, priority, dept in templates:
                task = Task(
                    assessment_id=assessment_id,
                    vendor_id=vendor_id,
                    title=f"[{vendor_name}] {title}",
                    department=DEPT_MAP.get(dept, "procurement"),
                    priority=priority,
                    status="open",
                )
                db.add(task)
    await db.commit()
