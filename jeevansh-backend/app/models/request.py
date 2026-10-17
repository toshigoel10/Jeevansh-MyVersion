from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.donor import BloodType

class BloodRequestCreate(BaseModel):
    blood_type: BloodType
    latitude: Optional[float] = Field(default=28.6139, ge=-90, le=90)
    longitude: Optional[float] = Field(default=77.2090, ge=-180, le=180)
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    units: int = Field(1, ge=1, le=10)
    hospital_name: Optional[str] = None
    location_text: Optional[str] = None

class BloodRequestResponse(BaseModel):
    id: str
    blood_type: str
    status: str
    alerted_donors: int
    created_at: datetime
    matched_donors: list = []
    accepted_donor: Optional[dict] = None

class RequestAccept(BaseModel):
    donor_id: Optional[str] = None
    donor_name: Optional[str] = None
    donor_phone: Optional[str] = None
    distance_km: Optional[float] = 2.4