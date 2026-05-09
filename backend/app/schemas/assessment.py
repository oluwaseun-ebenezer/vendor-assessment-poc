from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AssessmentResponse(BaseModel):
    id: str
    vendor_id: str
    status: str
    composite_score: Optional[float] = None
    risk_flag: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DimensionScoreResponse(BaseModel):
    id: str
    dimension: str
    rules_score: Optional[float] = None
    llm_score: Optional[float] = None
    composite_score: Optional[float] = None
    risk_flag: Optional[str] = None
    evidence: Optional[Any] = None
    llm_reasoning: Optional[str] = None

    model_config = {"from_attributes": True}


class AssessmentResultsResponse(BaseModel):
    assessment: AssessmentResponse
    dimension_scores: list[DimensionScoreResponse]


class ReportResponse(BaseModel):
    id: str
    assessment_id: str
    vendor_id: str
    report_json: Optional[Any] = None
    pdf_path: Optional[str] = None
    generated_at: datetime

    model_config = {"from_attributes": True}


class TaskResponse(BaseModel):
    id: str
    vendor_id: str
    assessment_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    department: str
    assigned_to: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[Any] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[Any] = None


class AnalyticsSummary(BaseModel):
    total_vendors: int
    total_assessments: int
    cleared_vendors: int
    rejected_vendors: int
    in_review_vendors: int
    green_count: int
    amber_count: int
    red_count: int
    avg_composite_score: Optional[float] = None
    avg_time_to_assess_minutes: Optional[float] = None
