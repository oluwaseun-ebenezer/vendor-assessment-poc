"""Base64 document upload — used by MCP server agent."""
import os
import uuid
import base64
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.core.config import settings
from app.models.vendor import Vendor, VendorDocument
from app.schemas.vendor import VendorDocumentResponse

router = APIRouter(prefix="/api/vendors", tags=["documents"])


class Base64UploadRequest(BaseModel):
    doc_type: str = "other"
    filename: str
    content_base64: str


@router.post("/{vendor_id}/upload-base64", response_model=VendorDocumentResponse, status_code=201)
async def upload_base64_document(
    vendor_id: str,
    body: Base64UploadRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    os.makedirs(settings.upload_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(body.filename)[1] or ".pdf"
    file_path = os.path.join(settings.upload_dir, f"{file_id}{ext}")

    try:
        content = base64.b64decode(body.content_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 content")

    with open(file_path, "wb") as f:
        f.write(content)

    doc = VendorDocument(
        vendor_id=vendor_id,
        doc_type=body.doc_type,
        filename=body.filename,
        file_path=file_path,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc
