import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, ForeignKey, Text, Date, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    assessment_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=True, index=True
    )
    vendor_id: Mapped[str] = mapped_column(
        String, ForeignKey("vendors.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    department: Mapped[str] = mapped_column(
        String, nullable=False
    )  # procurement | it_security | legal | ai_innovation
    assigned_to: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )
    priority: Mapped[str] = mapped_column(
        String, default="medium")  # high | medium | low
    status: Mapped[str] = mapped_column(
        String, default="open"
    )  # open | in_progress | done
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    assessment: Mapped["Assessment | None"] = relationship(  # noqa: F821
        "Assessment", back_populates="tasks"
    )
