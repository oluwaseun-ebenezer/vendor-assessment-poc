from pydantic import BaseModel, HttpUrl
from typing import Optional, Any
from datetime import datetime


class VendorCreate(BaseModel):
    company_name: str
    project_id: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    founded_year: Optional[int] = None
    employee_count: Optional[int] = None
    description: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    contacts: Optional[list[dict]] = None

    # Security
    iso27001: Optional[bool] = None
    soc2: Optional[bool] = None
    gdpr_dpa: Optional[bool] = None
    security_breach: Optional[bool] = None
    security_breach_description: Optional[str] = None
    pen_test: Optional[bool] = None
    data_residency: Optional[str] = None

    # Technical
    cloud_provider: Optional[str] = None
    api_docs_url: Optional[str] = None
    api_docs_available: Optional[bool] = None
    data_exchange_description: Optional[str] = None
    sla_uptime: Optional[str] = None
    sla_response_time: Optional[str] = None

    # Legal
    company_registration_number: Optional[str] = None
    company_registration_country: Optional[str] = None
    ip_ownership_documented: Optional[bool] = None
    pending_litigation: Optional[bool] = None
    open_source_licence_clean: Optional[bool] = None

    # Commercial
    pricing_model: Optional[str] = None
    annual_cost_estimate: Optional[str] = None
    enterprise_pricing: Optional[bool] = None
    volume_discount: Optional[bool] = None

    # Operations / Product
    deployment_method: Optional[str] = None
    dedicated_csm: Optional[bool] = None
    current_customers: Optional[str] = None
    multilingual_support: Optional[str] = None
    funding_stage: Optional[str] = None
    business_continuity_plan: Optional[bool] = None
    in_production: Optional[bool] = None
    enterprise_customers: Optional[bool] = None
    product_roadmap_available: Optional[bool] = None
    multilingual_ui: Optional[bool] = None
    eu_data_residency: Optional[bool] = None
    multi_region: Optional[bool] = None
    operating_countries: Optional[int] = None


class VendorUpdate(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    # Allow updating any intake field
    model_config = {"extra": "allow"}


class VendorDocumentResponse(BaseModel):
    id: str
    vendor_id: str
    doc_type: str
    filename: str
    file_path: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class VendorResponse(BaseModel):
    id: str
    company_name: str
    website: Optional[str] = None
    country: Optional[str] = None
    founded_year: Optional[int] = None
    employee_count: Optional[int] = None
    description: Optional[str] = None
    tech_stack: Optional[Any] = None
    contacts: Optional[Any] = None
    status: str
    submitted_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    documents: list[VendorDocumentResponse] = []

    model_config = {"from_attributes": True}


class VendorListResponse(BaseModel):
    id: str
    company_name: str
    country: Optional[str] = None
    status: str
    risk_flag: Optional[str] = None
    composite_score: Optional[float] = None
    project_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
