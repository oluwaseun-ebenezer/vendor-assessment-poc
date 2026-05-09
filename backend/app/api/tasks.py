from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.task import Task
from app.schemas.assessment import TaskResponse, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    vendor_id: Optional[str] = None,
    department: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    query = select(Task)
    if vendor_id:
        query = query.where(Task.vendor_id == vendor_id)
    if department:
        query = query.where(Task.department == department)
    if status_filter:
        query = query.where(Task.status == status_filter)
    query = query.order_by(Task.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/my", response_model=list[TaskResponse])
async def get_my_tasks(
    status_filter: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    query = select(Task).where(Task.assigned_to == current_user_id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    body: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return task


@router.get("/vendor/{vendor_id}", response_model=list[TaskResponse])
async def get_vendor_tasks(
    vendor_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).where(Task.vendor_id == vendor_id).order_by(
            Task.created_at.desc())
    )
    return result.scalars().all()
