from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, List
from datetime import datetime

BloodType = Literal["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]

class DonorRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    blood_type: BloodType
    latitude: Optional[float] = Field(default=28.6139, ge=-90, le=90)
    longitude: Optional[float] = Field(default=77.2090, ge=-180, le=180)
    city: Optional[str] = "Delhi NCR"
    last_donated_at: Optional[datetime] = None

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return v.replace(" ", "").replace("-", "")

class DonorLogin(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return v.replace(" ", "").replace("-", "")

class DonorAvailability(BaseModel):
    is_available: bool

class DonorResponse(BaseModel):
    id: str
    name: str
    phone: str
    blood_type: str
    distance_km: Optional[float] = None
    total_donations: int = 0
    is_available: bool = True
    lives_impacted: int = 0
    badges: List[str] = []
    last_donated_at: Optional[datetime] = None

class DonorDashboardResponse(BaseModel):
    id: str
    name: str
    phone: str
    blood_type: str
    total_donations: int
    lives_impacted: int
    next_eligible_days: int
    badges: List[str]
    is_available: bool
    recent_activity: List[dict]