from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.vendor import Vendor
from app.models.assessment import Assessment
from app.models.dimension_score import DimensionScore
from app.schemas.assessment import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Vendor counts
    total_vendors = (await db.execute(select(func.count(Vendor.id)))).scalar() or 0
    cleared = (await db.execute(select(func.count(Vendor.id)).where(Vendor.status == "cleared"))).scalar() or 0
    rejected = (await db.execute(select(func.count(Vendor.id)).where(Vendor.status == "rejected"))).scalar() or 0
    in_review = (await db.execute(select(func.count(Vendor.id)).where(Vendor.status == "in_review"))).scalar() or 0

    # Assessment counts
    total_assessments = (await db.execute(select(func.count(Assessment.id)).where(Assessment.status == "complete"))).scalar() or 0

    # Risk distribution
    green = (await db.execute(select(func.count(Assessment.id)).where(Assessment.risk_flag == "green", Assessment.status == "complete"))).scalar() or 0
    amber = (await db.execute(select(func.count(Assessment.id)).where(Assessment.risk_flag == "amber", Assessment.status == "complete"))).scalar() or 0
    red = (await db.execute(select(func.count(Assessment.id)).where(Assessment.risk_flag == "red", Assessment.status == "complete"))).scalar() or 0

    # Avg score
    avg_score = (await db.execute(select(func.avg(Assessment.composite_score)).where(Assessment.status == "complete"))).scalar()

    # Avg time to assess (minutes)
    avg_time = None
    time_result = await db.execute(
        select(
            func.avg(
                func.extract("epoch", Assessment.completed_at) -
                func.extract("epoch", Assessment.started_at)
            ) / 60
        ).where(Assessment.status == "complete", Assessment.started_at.isnot(None), Assessment.completed_at.isnot(None))
    )
    avg_time = time_result.scalar()

    return AnalyticsSummary(
        total_vendors=total_vendors,
        total_assessments=total_assessments,
        cleared_vendors=cleared,
        rejected_vendors=rejected,
        in_review_vendors=in_review,
        green_count=green,
        amber_count=amber,
        red_count=red,
        avg_composite_score=float(avg_score) if avg_score else None,
        avg_time_to_assess_minutes=float(avg_time) if avg_time else None,
    )


@router.get("/risk-distribution")
async def get_risk_distribution(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Assessment.risk_flag, func.count(Assessment.id))
        .where(Assessment.status == "complete")
        .group_by(Assessment.risk_flag)
    )
    return [{"risk_flag": row[0], "count": row[1]} for row in result.all()]


@router.get("/dimension-averages")
async def get_dimension_averages(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DimensionScore.dimension, func.avg(
            DimensionScore.composite_score))
        .group_by(DimensionScore.dimension)
    )
    return [{"dimension": row[0], "avg_score": float(row[1]) if row[1] else 0} for row in result.all()]


@router.get("/time-to-onboard")
async def get_time_to_onboard(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Vendor.company_name,
            Assessment.started_at,
            Assessment.completed_at,
            Assessment.composite_score,
            Assessment.risk_flag,
        )
        .join(Assessment, Assessment.vendor_id == Vendor.id)
        .where(Assessment.status == "complete")
        .order_by(Assessment.completed_at.desc())
        .limit(50)
    )
    rows = result.all()
    output = []
    for row in rows:
        minutes = None
        if row.started_at and row.completed_at:
            delta = row.completed_at - row.started_at
            minutes = delta.total_seconds() / 60
        output.append({
            "vendor_name": row.company_name,
            "completed_at": row.completed_at.isoformat() if row.completed_at else None,
            "minutes_to_assess": round(minutes, 1) if minutes else None,
            "composite_score": float(row.composite_score) if row.composite_score else None,
            "risk_flag": row.risk_flag,
        })
    return output
