import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    company_name: Mapped[str] = mapped_column(
        String, nullable=False, index=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    founded_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    employee_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    tech_stack: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True)  # list of technologies
    contacts: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True)  # [{name, email, role}]

    # Security fields
    iso27001: Mapped[bool | None] = mapped_column(nullable=True)
    soc2: Mapped[bool | None] = mapped_column(nullable=True)
    gdpr_dpa: Mapped[bool | None] = mapped_column(nullable=True)
    security_breach: Mapped[bool | None] = mapped_column(nullable=True)
    security_breach_description: Mapped[str |
                                        None] = mapped_column(Text, nullable=True)
    pen_test: Mapped[bool | None] = mapped_column(nullable=True)
    data_residency: Mapped[str | None] = mapped_column(String, nullable=True)

    # Technical fields
    cloud_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    api_docs_url: Mapped[str | None] = mapped_column(String, nullable=True)
    api_docs_available: Mapped[bool | None] = mapped_column(nullable=True)
    data_exchange_description: Mapped[str |
                                      None] = mapped_column(Text, nullable=True)
    sla_uptime: Mapped[str | None] = mapped_column(String, nullable=True)
    sla_response_time: Mapped[str | None] = mapped_column(
        String, nullable=True)

    # Legal fields
    company_registration_number: Mapped[str | None] = mapped_column(
        String, nullable=True)
    company_registration_country: Mapped[str | None] = mapped_column(
        String, nullable=True)
    ip_ownership_documented: Mapped[bool | None] = mapped_column(nullable=True)
    pending_litigation: Mapped[bool | None] = mapped_column(nullable=True)
    open_source_licence_clean: Mapped[bool |
                                      None] = mapped_column(nullable=True)

    # Commercial fields
    pricing_model: Mapped[str | None] = mapped_column(String, nullable=True)
    annual_cost_estimate: Mapped[str | None] = mapped_column(
        String, nullable=True)
    enterprise_pricing: Mapped[bool | None] = mapped_column(nullable=True)
    volume_discount: Mapped[bool | None] = mapped_column(nullable=True)

    # Operations fields
    deployment_method: Mapped[str | None] = mapped_column(
        String, nullable=True)
    dedicated_csm: Mapped[bool | None] = mapped_column(nullable=True)
    current_customers: Mapped[str | None] = mapped_column(Text, nullable=True)
    multilingual_support: Mapped[str |
                                 None] = mapped_column(Text, nullable=True)
    funding_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    business_continuity_plan: Mapped[bool |
                                     None] = mapped_column(nullable=True)
    in_production: Mapped[bool | None] = mapped_column(nullable=True)
    enterprise_customers: Mapped[bool | None] = mapped_column(nullable=True)
    product_roadmap_available: Mapped[bool |
                                      None] = mapped_column(nullable=True)
    multilingual_ui: Mapped[bool | None] = mapped_column(nullable=True)
    eu_data_residency: Mapped[bool | None] = mapped_column(nullable=True)
    multi_region: Mapped[bool | None] = mapped_column(nullable=True)
    operating_countries: Mapped[int | None] = mapped_column(
        Integer, nullable=True)

    # Project
    project_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Status
    submitted_by: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String, default="submitted"
    )  # submitted | in_review | cleared | rejected

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    documents: Mapped[list["VendorDocument"]] = relationship(
        "VendorDocument", back_populates="vendor", cascade="all, delete-orphan"
    )
    assessments: Mapped[list["Assessment"]] = relationship(  # noqa: F821
        "Assessment", back_populates="vendor"
    )
    project: Mapped["Project"] = relationship(  # noqa: F821
        "Project", back_populates="vendors", foreign_keys=[project_id]
    )


class VendorDocument(Base):
    __tablename__ = "vendor_documents"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id: Mapped[str] = mapped_column(
        String, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    doc_type: Mapped[str] = mapped_column(
        String, nullable=False
    )  # security_whitepaper | architecture_doc | legal_doc | financial_doc | other
    filename: Mapped[str] = mapped_column(String, nullable=False)
    file_path: Mapped[str] = mapped_column(String, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    vendor: Mapped["Vendor"] = relationship(
        "Vendor", back_populates="documents")
