import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class EnrichmentCache(Base):
    __tablename__ = "enrichment_cache"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id: Mapped[str] = mapped_column(
        String, ForeignKey("vendors.id"), nullable=False, index=True
    )
    source: Mapped[str] = mapped_column(
        String, nullable=False
    )  # nvd | companies_house | opencorporates
    data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True)
