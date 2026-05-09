from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.report import Report
from app.models.assessment import Assessment
from app.schemas.assessment import ReportResponse

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{vendor_id}", response_model=ReportResponse)
async def get_report(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .where(Report.vendor_id == vendor_id)
        .order_by(Report.generated_at.desc())
        .limit(1)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(
            status_code=404, detail="No report found for this vendor")
    return report


@router.get("/{vendor_id}/pdf")
async def download_pdf(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .where(Report.vendor_id == vendor_id)
        .order_by(Report.generated_at.desc())
        .limit(1)
    )
    report = result.scalar_one_or_none()
    if not report or not report.pdf_path:
        raise HTTPException(
            status_code=404, detail="PDF not available for this vendor")

    import os
    if not os.path.exists(report.pdf_path):
        raise HTTPException(
            status_code=404, detail="PDF file not found on disk")

    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=f"vendor_report_{vendor_id}.pdf",
    )


@router.post("/{vendor_id}/regenerate", response_model=ReportResponse)
async def regenerate_report(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Get latest completed assessment
    a_result = await db.execute(
        select(Assessment)
        .where(Assessment.vendor_id == vendor_id, Assessment.status == "complete")
        .order_by(Assessment.completed_at.desc())
        .limit(1)
    )
    assessment = a_result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(
            status_code=404, detail="No completed assessment found")

    from app.services.report_service import generate_report
    report = await generate_report(assessment.id, vendor_id, db)
    return report
