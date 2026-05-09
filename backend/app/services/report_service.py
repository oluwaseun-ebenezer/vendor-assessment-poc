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

    # Send email notification
    try:
        from app.services.email_service import send_assessment_complete
        await send_assessment_complete(
            vendor_name=vendor.company_name,
            vendor_id=vendor_id,
            composite_score=float(assessment.composite_score or 0),
            risk_flag=assessment.risk_flag or "unknown",
            dimension_scores=[
                {
                    "dimension": ds.dimension,
                    "label": DIMENSION_LABELS.get(ds.dimension, ds.dimension),
                    "composite_score": float(ds.composite_score or 0),
                    "risk_flag": ds.risk_flag,
                }
                for ds in assessment.dimension_scores
            ],
            tasks=report_json.get("action_items", []),
        )
    except Exception as e:
        logger.warning(f"Email notification failed: {e}")

    return report


async def _generate_pdf(report_json: dict, vendor_id: str) -> str:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.enums import TA_LEFT, TA_CENTER

    os.makedirs("/app/uploads/reports", exist_ok=True)
    pdf_path = f"/app/uploads/reports/report_{vendor_id}.pdf"

    flag = report_json.get("overall_risk_flag", "unknown")
    FLAG_COLORS = {
        "green": colors.HexColor("#22c55e"),
        "amber": colors.HexColor("#f59e0b"),
        "red":   colors.HexColor("#ef4444"),
    }
    CARLSBERG_RED = colors.HexColor("#D4002A")
    flag_color = FLAG_COLORS.get(flag, colors.grey)

    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm,
                            topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(
        '<font color="#D4002A"><b>Vendor Risk Assessment Report</b></font>',
        ParagraphStyle("title", fontSize=20, spaceAfter=2)
    ))
    story.append(Paragraph(
        "Carlsberg Group — Confidential",
        ParagraphStyle("sub", fontSize=9, textColor=colors.grey, spaceAfter=10)
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=CARLSBERG_RED, spaceAfter=12))

    # Vendor name + score
    story.append(Paragraph(
        f"<b>{report_json['vendor_name']}</b>",
        ParagraphStyle("vname", fontSize=16, spaceAfter=6)
    ))
    score_data = [[
        Paragraph(f'<font size="24"><b>{report_json["composite_score"]:.1f}/100</b></font>', styles["Normal"]),
        Paragraph(f'<b>{flag.upper()} RISK</b>', ParagraphStyle("flag", fontSize=12, textColor=flag_color)),
    ]]
    score_table = Table(score_data, colWidths=[80*mm, 80*mm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8f9fa")),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINECOLOR", (0, 0), (-1, -1), flag_color),
        ("LINEWIDTH", (0, 0), (0, -1), 4),
        ("LINEBEFORE", (0, 0), (0, -1), 4, flag_color),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 10))
    story.append(Paragraph(report_json.get("executive_summary", ""), styles["Normal"]))
    story.append(Spacer(1, 14))

    # Dimension scores table
    story.append(Paragraph("<b>Dimension Scores</b>",
                           ParagraphStyle("h2", fontSize=13, textColor=CARLSBERG_RED, spaceAfter=6)))
    dim_header = [
        Paragraph("<b>Dimension</b>", styles["Normal"]),
        Paragraph("<b>Score</b>", styles["Normal"]),
        Paragraph("<b>Flag</b>", styles["Normal"]),
        Paragraph("<b>Key Findings</b>", styles["Normal"]),
    ]
    dim_rows = [dim_header]
    for d in report_json.get("dimensions", []):
        dc = FLAG_COLORS.get(d.get("risk_flag", ""), colors.grey)
        reasoning = (d.get("llm_reasoning") or "")[:200]
        dim_rows.append([
            Paragraph(d.get("label", d.get("dimension", "")), styles["Normal"]),
            Paragraph(f'<font color="{dc.hexval()}"><b>{d.get("composite_score", 0):.0f}/100</b></font>', styles["Normal"]),
            Paragraph(f'<font color="{dc.hexval()}">{d.get("risk_flag","").upper()}</font>', styles["Normal"]),
            Paragraph(f'<font size="8">{reasoning}</font>', styles["Normal"]),
        ])
    dim_table = Table(dim_rows, colWidths=[50*mm, 22*mm, 18*mm, 75*mm])
    dim_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f1f1")),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#eeeeee")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(dim_table)
    story.append(Spacer(1, 14))

    # Action items
    tasks = report_json.get("action_items", [])
    if tasks:
        story.append(Paragraph("<b>Action Items</b>",
                               ParagraphStyle("h2", fontSize=13, textColor=CARLSBERG_RED, spaceAfter=6)))
        task_header = [
            Paragraph("<b>Task</b>", styles["Normal"]),
            Paragraph("<b>Department</b>", styles["Normal"]),
            Paragraph("<b>Priority</b>", styles["Normal"]),
        ]
        task_rows = [task_header]
        for t in tasks:
            pc = {"high": colors.HexColor("#ef4444"),
                  "medium": colors.HexColor("#f59e0b"),
                  "low": colors.HexColor("#22c55e")}.get(t.get("priority", ""), colors.grey)
            task_rows.append([
                Paragraph(t.get("title", ""), styles["Normal"]),
                Paragraph(t.get("department", ""), styles["Normal"]),
                Paragraph(f'<font color="{pc.hexval()}"><b>{t.get("priority","").upper()}</b></font>', styles["Normal"]),
            ])
        task_table = Table(task_rows, colWidths=[100*mm, 40*mm, 25*mm])
        task_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f1f1")),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#eeeeee")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(task_table)

    # Footer
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Paragraph(
        f'Generated: {report_json.get("generated_at","")}  |  '
        f'Vendor ID: {report_json.get("vendor_id","")}',
        ParagraphStyle("footer", fontSize=7, textColor=colors.grey, spaceBefore=4)
    ))

    doc.build(story)
    return pdf_path
