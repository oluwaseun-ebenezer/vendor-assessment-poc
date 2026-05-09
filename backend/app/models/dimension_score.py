import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class DimensionScore(Base):
    __tablename__ = "dimension_scores"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    assessment_id: Mapped[str] = mapped_column(
        String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    dimension: Mapped[str] = mapped_column(
        String, nullable=False
    )  # security | viability | integration | legal | commercial | operations | scalability | maturity
    rules_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True)
    llm_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True)
    composite_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True)
    risk_flag: Mapped[str | None] = mapped_column(
        String, nullable=True)  # green | amber | red
    evidence: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True)  # [{signal, value, impact, source}]
    llm_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    assessment: Mapped["Assessment"] = relationship(  # noqa: F821
        "Assessment", back_populates="dimension_scores"
    )
