import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    assessment_id: Mapped[str] = mapped_column(
        String, ForeignKey("assessments.id"), nullable=False, index=True
    )
    vendor_id: Mapped[str] = mapped_column(
        String, ForeignKey("vendors.id"), nullable=False, index=True
    )
    pdf_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    assessment: Mapped["Assessment"] = relationship(  # noqa: F821
        "Assessment", back_populates="report"
    )
