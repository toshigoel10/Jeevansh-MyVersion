from pydantic import BaseModel
from typing import Optional, Dict

class BankLoginRequest(BaseModel):
    bank_id: str
    password: Optional[str] = None

class DonationVerifyRequest(BaseModel):
    token: str
    bank_id: Optional[str] = "bank-1"
    request_id: Optional[str] = None

class BankResponse(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    distance_km: Optional[float] = None
    stock: Dict[str, int]
    units_available: int = 0
    has_stock: bool = False
