from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.assessment import Assessment
from app.models.vendor import Vendor
from app.schemas.assessment import AssessmentResponse, AssessmentResultsResponse, DimensionScoreResponse

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.post("/{vendor_id}/run", response_model=AssessmentResponse, status_code=202)
async def run_assessment(
    vendor_id: str,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Create assessment record
    assessment = Assessment(
        vendor_id=vendor_id,
        status="pending",
        triggered_by=current_user_id if current_user_id != "mcp-service" else None,
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)

    # Run scoring in background
    from app.services.scoring_engine import run_assessment_task
    background_tasks.add_task(run_assessment_task, assessment.id, vendor_id)

    return assessment


@router.get("/{vendor_id}/status", response_model=AssessmentResponse)
async def get_assessment_status(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Assessment)
        .where(Assessment.vendor_id == vendor_id)
        .order_by(Assessment.created_at.desc())
        .limit(1)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(
            status_code=404, detail="No assessment found for this vendor")
    return assessment


@router.get("/{vendor_id}/results", response_model=AssessmentResultsResponse)
async def get_assessment_results(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.dimension_scores))
        .where(Assessment.vendor_id == vendor_id, Assessment.status == "complete")
        .order_by(Assessment.completed_at.desc())
        .limit(1)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(
            status_code=404, detail="No completed assessment found")

    return AssessmentResultsResponse(
        assessment=AssessmentResponse.model_validate(assessment),
        dimension_scores=[
            DimensionScoreResponse.model_validate(ds) for ds in assessment.dimension_scores
        ],
    )


@router.get("/by-id/{assessment_id}", response_model=AssessmentResultsResponse)
async def get_assessment_by_id(
    assessment_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.dimension_scores))
        .where(Assessment.id == assessment_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return AssessmentResultsResponse(
        assessment=AssessmentResponse.model_validate(assessment),
        dimension_scores=[
            DimensionScoreResponse.model_validate(ds) for ds in assessment.dimension_scores
        ],
    )
