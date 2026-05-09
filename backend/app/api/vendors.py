import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.core.config import settings
from app.models.vendor import Vendor, VendorDocument
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorResponse, VendorDocumentResponse, VendorListResponse

router = APIRouter(prefix="/api/vendors", tags=["vendors"])


@router.post("/lookup")
async def lookup_vendor(
    body: dict,
    current_user_id: str = Depends(get_current_user_id),
):
    from app.services.lookup_service import lookup_vendor as _lookup
    query = body.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=422, detail="query is required")
    return await _lookup(query)


@router.post("", response_model=VendorResponse, status_code=201)
async def create_vendor(
    body: VendorCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump(exclude_none=True)
    vendor = Vendor(
        **data, submitted_by=current_user_id if current_user_id != "mcp-service" else None)
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    result = await db.execute(
        select(Vendor).options(selectinload(Vendor.documents)).where(
            Vendor.id == vendor.id)
    )
    return result.scalar_one()


@router.get("", response_model=list[VendorListResponse])
async def list_vendors(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    risk_flag: Optional[str] = None,
    project_id: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    query = select(Vendor)
    if search:
        query = query.where(
            or_(
                Vendor.company_name.ilike(f"%{search}%"),
                Vendor.description.ilike(f"%{search}%"),
            )
        )
    if status_filter:
        query = query.where(Vendor.status == status_filter)
    if project_id:
        query = query.where(Vendor.project_id == project_id)

    query = query.offset(
        (page - 1) * size).limit(size).order_by(Vendor.created_at.desc())
    result = await db.execute(query)
    vendors = result.scalars().all()

    # Enrich with latest assessment risk/score
    output = []
    for v in vendors:
        from app.models.assessment import Assessment
        a_result = await db.execute(
            select(Assessment)
            .where(Assessment.vendor_id == v.id, Assessment.status == "complete")
            .order_by(Assessment.completed_at.desc())
            .limit(1)
        )
        latest = a_result.scalar_one_or_none()
        item = VendorListResponse(
            id=v.id,
            company_name=v.company_name,
            country=v.country,
            status=v.status,
            risk_flag=latest.risk_flag if latest else None,
            composite_score=float(
                latest.composite_score) if latest and latest.composite_score else None,
            project_id=v.project_id,
            created_at=v.created_at,
        )
        if risk_flag and item.risk_flag != risk_flag:
            continue
        output.append(item)
    return output


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Vendor).options(selectinload(Vendor.documents)).where(
            Vendor.id == vendor_id)
    )
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.patch("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: str,
    body: VendorUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Vendor).options(selectinload(Vendor.documents)).where(
            Vendor.id == vendor_id)
    )
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(vendor, field, value)

    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.post("/{vendor_id}/documents", response_model=VendorDocumentResponse, status_code=201)
async def upload_document(
    vendor_id: str,
    file: UploadFile = File(...),
    doc_type: str = Form(default="other"),
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Save file
    os.makedirs(settings.upload_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "doc.pdf")[1]
    filename = f"{file_id}{ext}"
    file_path = os.path.join(settings.upload_dir, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = VendorDocument(
        vendor_id=vendor_id,
        doc_type=doc_type,
        filename=file.filename or filename,
        file_path=file_path,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/{vendor_id}/documents", response_model=list[VendorDocumentResponse])
async def list_documents(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(VendorDocument).where(VendorDocument.vendor_id == vendor_id)
    )
    return result.scalars().all()
