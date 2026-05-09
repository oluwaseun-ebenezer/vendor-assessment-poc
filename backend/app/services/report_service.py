"""Report service — generates structured JSON report and PDF."""
import logging
import os
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.assessment import Assessment
from app.models.vendor import Vendor
from app.models.dimension_score import DimensionScore
from app.models.report import Report
from app.models.task import Task

logger = logging.getLogger(__name__)

DIMENSION_LABELS = {
    "security": "Security, Privacy & Compliance",
    "viability": "Vendor Viability & Continuity",
    "integration": "Integration & Data Integrity",
    "legal": "Legal & IP",
    "commercial": "Cost & Commercials",
    "operations": "Operations & Change Management",
    "scalability": "Global Scalability",
    "maturity": "Product Maturity & Delivery",
}

DIMENSION_DEPTS = {
    "security": "IT Security",
    "viability": "Procurement",
    "integration": "IT / Engineering",
    "legal": "Legal",
    "commercial": "Procurement",
    "operations": "Procurement / IT",
    "scalability": "IT / Engineering",
    "maturity": "AI Innovation",
}


async def generate_report(assessment_id: str, vendor_id: str, db: AsyncSession) -> Report:
    a_result = await db.execute(
        select(Assessment).options(selectinload(Assessment.dimension_scores)).where(
            Assessment.id == assessment_id)
    )
    assessment = a_result.scalar_one()

    v_result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = v_result.scalar_one()

    dimensions = []
    for ds in assessment.dimension_scores:
        dimensions.append({
            "dimension": ds.dimension,
            "label": DIMENSION_LABELS.get(ds.dimension, ds.dimension),
            "composite_score": float(ds.composite_score or 0),
            "rules_score": float(ds.rules_score or 0),
            "llm_score": float(ds.llm_score or 0),
            "risk_flag": ds.risk_flag,
            "responsible_dept": DIMENSION_DEPTS.get(ds.dimension, ""),
            "evidence": ds.evidence or [],
            "llm_reasoning": ds.llm_reasoning or "",
            "recommendations": [],
        })

    # Get tasks for this assessment
    t_result = await db.execute(select(Task).where(Task.assessment_id == assessment_id))
    tasks = t_result.scalars().all()

    report_json = {
        "report_id": None,
        "vendor_id": vendor_id,
        "vendor_name": vendor.company_name,
        "assessment_id": assessment_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "composite_score": float(assessment.composite_score or 0),
        "overall_risk_flag": assessment.risk_flag,
        "executive_summary": f"{vendor.company_name} has been assessed across 8 compliance dimensions with an overall score of {assessment.composite_score:.1f}/100 — {(assessment.risk_flag or 'unknown').upper()} risk.",
        "dimensions": dimensions,
        "action_items": [
            {"task_id": t.id, "title": t.title, "department": t.department,
                "priority": t.priority, "status": t.status}
            for t in tasks
        ],
    }

    # Try PDF generation
    pdf_path = None
    try:
        pdf_path = await _generate_pdf(report_json, vendor_id)
    except Exception as e:
        logger.warning(f"PDF generation failed: {e}")

    # Check for existing report
    existing = await db.execute(select(Report).where(Report.assessment_id == assessment_id))
    report = existing.scalar_one_or_none()

    if report:
        report.report_json = report_json
        report.pdf_path = pdf_path
        report.generated_at = datetime.now(timezone.utc)
    else:
        report = Report(
            assessment_id=assessment_id,
            vendor_id=vendor_id,
            report_json=report_json,
            pdf_path=pdf_path,
        )
        db.add(report)

    await db.commit()
    await db.refresh(report)
    report_json["report_id"] = report.id
    report.report_json = report_json
    await db.commit()

    # Auto-create tasks
    from app.services.task_service import create_tasks_from_assessment
    await create_tasks_from_assessment(assessment_id, vendor_id, assessment.dimension_scores, vendor.company_name, db)

    return report


async def _generate_pdf(report_json: dict, vendor_id: str) -> str:
    from jinja2 import Template
    from weasyprint import HTML

    os.makedirs("/app/uploads/reports", exist_ok=True)
    pdf_path = f"/app/uploads/reports/report_{vendor_id}.pdf"

    dims_html = ""
    for d in report_json.get("dimensions", []):
        color = {"green": "#22c55e", "amber": "#f59e0b",
                 "red": "#ef4444"}.get(d["risk_flag"], "#888")
        dims_html += f"""
        <div style="margin-bottom:16px;padding:12px;border-left:4px solid {color};background:#f9f9f9">
          <h3 style="margin:0;color:{color}">{d['label']} — {d['composite_score']:.0f}/100</h3>
          <p style="margin:4px 0;font-size:12px">{d.get('llm_reasoning','')[:200]}</p>
        </div>"""

    html = f"""<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:40px">
    <h1 style="color:#D4002A">Vendor Risk Assessment Report</h1>
    <h2>{report_json['vendor_name']}</h2>
    <p><strong>Overall Score:</strong> {report_json['composite_score']:.1f}/100 —
       <span style="color:{'#22c55e' if report_json['overall_risk_flag']=='green' else '#f59e0b' if report_json['overall_risk_flag']=='amber' else '#ef4444'}">
       {(report_json['overall_risk_flag'] or '').upper()}</span></p>
    <p>{report_json['executive_summary']}</p>
    <h2>Dimension Scores</h2>{dims_html}
    <p style="font-size:10px;color:#888">Generated: {report_json['generated_at']}</p>
    </body></html>"""

    HTML(string=html).write_pdf(pdf_path)
    return pdf_path
