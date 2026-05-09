from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.vendor import Vendor
from app.schemas.vendor import VendorResponse

router = APIRouter(prefix="/api/vendors", tags=["approval"])


class ApprovalRequest(BaseModel):
    decision: str  # cleared | rejected
    reason: Optional[str] = None


@router.post("/{vendor_id}/approve", response_model=VendorResponse)
async def approve_vendor(
    vendor_id: str,
    body: ApprovalRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    if body.decision not in ("cleared", "rejected"):
        raise HTTPException(
            status_code=400, detail="Decision must be 'cleared' or 'rejected'")

    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Vendor).options(selectinload(Vendor.documents)).where(
            Vendor.id == vendor_id)
    )
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.status = body.decision
    await db.commit()
    await db.refresh(vendor)
    return vendor
