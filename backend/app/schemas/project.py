from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

DEFAULT_AI_CONFIG = {
    "model": "openai/gpt-oss-20b:free",
    "temperature": 0.2,
    "max_tokens": 800,
    "system_prompt": "",
    "dimension_weights": {
        "security": 0.20,
        "viability": 0.15,
        "integration": 0.15,
        "legal": 0.15,
        "commercial": 0.10,
        "operations": 0.10,
        "scalability": 0.10,
        "maturity": 0.05,
    },
}


class AIConfig(BaseModel):
    model: str = "openai/gpt-oss-20b:free"
    temperature: float = 0.2
    max_tokens: int = 800
    system_prompt: str = ""
    dimension_weights: dict = {}

    model_config = {"extra": "allow"}


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    ai_config: Optional[dict] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    ai_config: Optional[dict] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    status: str
    ai_config: Any
    created_at: datetime
    updated_at: datetime
    vendor_count: Optional[int] = 0

    model_config = {"from_attributes": True}
