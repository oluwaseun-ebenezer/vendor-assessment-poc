import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id: Mapped[str] = mapped_column(
        String, ForeignKey("vendors.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String, default="pending"
    )  # pending | running | complete | failed
    triggered_by: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True)
    composite_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True)
    risk_flag: Mapped[str | None] = mapped_column(
        String, nullable=True)  # green | amber | red
    error_message: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="assessments")  # noqa: F821
    dimension_scores: Mapped[list["DimensionScore"]] = relationship(  # noqa: F821
        "DimensionScore", back_populates="assessment", cascade="all, delete-orphan"
    )
    report: Mapped["Report | None"] = relationship(  # noqa: F821
        "Report", back_populates="assessment", uselist=False
    )
    tasks: Mapped[list["Task"]] = relationship(  # noqa: F821
        "Task", back_populates="assessment", cascade="all, delete-orphan"
    )
