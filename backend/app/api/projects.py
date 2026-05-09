from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.project import Project
from app.models.vendor import Vendor
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, DEFAULT_AI_CONFIG

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ai_config = {**DEFAULT_AI_CONFIG, **(body.ai_config or {})}
    project = Project(
        name=body.name,
        description=body.description,
        owner_id=current_user_id if current_user_id != "mcp-service" else None,
        ai_config=ai_config,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return {**project.__dict__, "vendor_count": 0}


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.status != "deleted").order_by(Project.created_at.desc())
    )
    projects = result.scalars().all()
    output = []
    for p in projects:
        count_result = await db.execute(
            select(func.count()).where(Vendor.project_id == p.id)
        )
        count = count_result.scalar() or 0
        output.append({**p.__dict__, "vendor_count": count})
    return output


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    count_result = await db.execute(select(func.count()).where(Vendor.project_id == project_id))
    count = count_result.scalar() or 0
    return {**project.__dict__, "vendor_count": count}


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    body: ProjectUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update = body.model_dump(exclude_none=True)
    if "ai_config" in update:
        update["ai_config"] = {**(project.ai_config or {}), **update["ai_config"]}

    for k, v in update.items():
        setattr(project, k, v)

    await db.commit()
    await db.refresh(project)
    count_result = await db.execute(select(func.count()).where(Vendor.project_id == project_id))
    count = count_result.scalar() or 0
    return {**project.__dict__, "vendor_count": count}


@router.delete("/{project_id}", status_code=204)
async def archive_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.status = "archived"
    await db.commit()


@router.get("/{project_id}/vendors")
async def get_project_vendors(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    from app.models.assessment import Assessment
    from app.schemas.vendor import VendorListResponse
    vendors_result = await db.execute(
        select(Vendor).where(Vendor.project_id == project_id).order_by(Vendor.created_at.desc())
    )
    vendors = vendors_result.scalars().all()
    output = []
    for v in vendors:
        a_result = await db.execute(
            select(Assessment)
            .where(Assessment.vendor_id == v.id, Assessment.status == "complete")
            .order_by(Assessment.completed_at.desc()).limit(1)
        )
        latest = a_result.scalar_one_or_none()
        output.append(VendorListResponse(
            id=v.id, company_name=v.company_name, country=v.country, status=v.status,
            risk_flag=latest.risk_flag if latest else None,
            composite_score=float(latest.composite_score) if latest and latest.composite_score else None,
            created_at=v.created_at,
        ))
    return output
