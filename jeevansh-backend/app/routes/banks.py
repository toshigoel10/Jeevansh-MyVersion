from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.bank import BankLoginRequest, DonationVerifyRequest
from app.in_memory_db import haversine_km

router = APIRouter(prefix="/api/banks", tags=["banks"])

DEFAULT_BANKS = [
    {
        "_id": "bank-1",
        "name": "City Hospital Blood Bank",
        "address": "Connaught Place, New Delhi",
        "phone": "+91 11 2345 6789",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "stock": {"O+": 12, "O-": 4, "A+": 8, "A-": 2, "B+": 14, "B-": 3, "AB+": 6, "AB-": 1},
    },
    {
        "_id": "bank-2",
        "name": "Red Cross Blood Bank",
        "address": "Red Cross Road, New Delhi",
        "phone": "+91 11 2371 6441",
        "latitude": 28.6219,
        "longitude": 77.2144,
        "stock": {"O+": 20, "O-": 1, "A+": 10, "A-": 5, "B+": 0, "B-": 2, "AB+": 7, "AB-": 0},
    },
    {
        "_id": "bank-3",
        "name": "AIIMS Blood Center",
        "address": "Ansari Nagar, New Delhi",
        "phone": "+91 11 2658 8500",
        "latitude": 28.5672,
        "longitude": 77.2100,
        "stock": {"O+": 35, "O-": 8, "A+": 22, "A-": 6, "B+": 28, "B-": 9, "AB+": 15, "AB-": 4},
    },
]

@router.get("")
async def get_banks(
    blood_type: Optional[str] = None,
    bloodType: Optional[str] = None,
    latitude: Optional[float] = 28.6139,
    longitude: Optional[float] = 77.2090,
):
    target_blood_type = blood_type or bloodType
    lat = float(latitude) if latitude is not None else 28.6139
    lng = float(longitude) if longitude is not None else 77.2090

    db = get_db()
    banks = []


    # Try querying db
    if hasattr(db, "banks"):
        cursor = db.banks.find({})
        async for doc in cursor:
            banks.append(doc)

    if not banks:
        banks = list(DEFAULT_BANKS)

    result = []
    for b in banks:
        b_lat = b.get("latitude", 28.6139)
        b_lng = b.get("longitude", 77.2090)
        dist_km = haversine_km(lat, lng, b_lat, b_lng)
        stock = b.get("stock", {})
        units_avail = stock.get(target_blood_type, 0) if target_blood_type else sum(stock.values())
        has_stock = units_avail > 0


        result.append({
            "id": str(b.get("_id", b.get("id"))),
            "name": b.get("name"),
            "address": b.get("address"),
            "phone": b.get("phone"),
            "distance": dist_km,
            "distance_km": dist_km,
            "stock": stock,
            "hasStock": has_stock,
            "unitsAvailable": units_avail,
        })

    result.sort(key=lambda x: x["distance"])
    return result

@router.post("/login")
async def bank_login(payload: BankLoginRequest):
    bank_id = payload.bank_id or "bank-1"
    name = "City Hospital Blood Bank"
    if "2" in bank_id:
        name = "Red Cross Blood Bank"
    elif "3" in bank_id:
        name = "AIIMS Blood Center"

    return {
        "token": f"bank-token-{bank_id}-{int(datetime.utcnow().timestamp())}",
        "bank": {
            "id": bank_id,
            "name": name,
        }
    }

@router.post("/verify")
async def verify_donation(payload: DonationVerifyRequest):
    db = get_db()
    token = payload.token.strip()

    donor_name = "Rahul Sharma"
    blood_type = "B+"
    req_id = payload.request_id or "REQ-782910"

    # Token format: JEEVANSH:donor_id:blood_type:timestamp or SIMULATED_TOKEN
    if token.startswith("JEEVANSH:"):
        parts = token.split(":")
        if len(parts) >= 3:
            donor_id = parts[1]
            blood_type = parts[2]
            # Lookup donor in db
            donor = await db.donors.find_one({"_id": donor_id})
            if donor:
                donor_name = donor.get("name", donor_name)
                # Increment donation count
                await db.donors.update_one(
                    {"_id": donor["_id"]},
                    {"$inc": {"total_donations": 1, "lives_impacted": 3}, "$set": {"last_donated_at": datetime.utcnow()}}
                )

    return {
        "success": True,
        "donorName": donor_name,
        "bloodType": blood_type,
        "requestId": req_id,
        "verifiedAt": datetime.utcnow().isoformat(),
        "message": f"Successfully verified donation for {donor_name} ({blood_type})",
    }
