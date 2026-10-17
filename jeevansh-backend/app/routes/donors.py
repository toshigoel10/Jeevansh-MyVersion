from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
from app.database import get_db
from app.models.donor import DonorRegister, DonorLogin, DonorAvailability
from app.services.geo_search import find_nearby_donors

router = APIRouter(prefix="/api/donors", tags=["donors"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_donor(payload: DonorRegister):
    db = get_db()

    existing = await db.donors.find_one({"phone": payload.phone})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A donor with this phone number already exists.",
        )

    donor_doc = {
        "name": payload.name,
        "phone": payload.phone,
        "blood_type": payload.blood_type,
        "location": {
            "type": "Point",
            "coordinates": [payload.longitude, payload.latitude],
        },
        "city": payload.city or "Delhi NCR",
        "is_available": True,
        "total_donations": 0,
        "lives_impacted": 0,
        "last_donated_at": payload.last_donated_at,
        "created_at": datetime.utcnow(),
    }

    result = await db.donors.insert_one(donor_doc)
    donor_id = str(result.inserted_id)

    return {
        "success": True,
        "donor_id": donor_id,
        "id": donor_id,
        "name": payload.name,
        "phone": payload.phone,
        "blood_type": payload.blood_type,
        "city": donor_doc["city"],
        "is_available": True,
        "total_donations": 0,
        "message": f"Welcome, {payload.name}! You'll receive WhatsApp alerts for nearby requests.",
    }

@router.post("/login")
async def login_donor(payload: DonorLogin):
    db = get_db()
    donor = await db.donors.find_one({"phone": payload.phone})

    if not donor:
        # Check first donor for demo convenience if user just clicks Login with empty or mock phone
        first_donor = await db.donors.find_one({})
        if first_donor:
            donor = first_donor
        else:
            raise HTTPException(status_code=404, detail="Donor not found with this phone number")

    donor_id = str(donor.get("_id"))
    return {
        "token": f"donor-token-{donor_id}",
        "donor": {
            "id": donor_id,
            "name": donor.get("name", "Donor"),
            "phone": donor.get("phone"),
            "blood_type": donor.get("blood_type"),
            "bloodType": donor.get("blood_type"),
            "city": donor.get("city", "Delhi NCR"),
            "is_available": donor.get("is_available", True),
            "totalDonations": donor.get("total_donations", 0),
            "livesImpacted": donor.get("lives_impacted", donor.get("total_donations", 0) * 3),
        }
    }

@router.get("/{donor_id}/dashboard")
async def get_donor_dashboard(donor_id: str):
    db = get_db()
    donor = await db.donors.find_one({"_id": donor_id})

    if not donor:
        donor = await db.donors.find_one({})
        if not donor:
            raise HTTPException(status_code=404, detail="Donor not found")

    total_donations = donor.get("total_donations", 0)
    lives_impacted = donor.get("lives_impacted", total_donations * 3)

    # Calculate days to next eligible donation (90 days cooldown)
    last_donated_at = donor.get("last_donated_at")
    next_eligible_days = 0
    if last_donated_at:
        days_passed = (datetime.utcnow() - last_donated_at).days
        next_eligible_days = max(0, 90 - days_passed)

    badges = ["First Drop"] if total_donations >= 1 else []
    if total_donations >= 3:
        badges.append("Regular Hero")
    if total_donations >= 5:
        badges.append("Life Saver")
    if total_donations >= 8:
        badges.append("Century Pillar")

    recent_activity = [
        {"text": "Available for emergency blood dispatch in Delhi NCR", "date": "Active now", "status": "Ready", "color": "text-blue-600 bg-blue-50"},
    ]
    if total_donations > 0:
        recent_activity.insert(0, {
            "text": "Completed blood donation at City Hospital Blood Bank",
            "date": f"{next_eligible_days} days ago" if next_eligible_days > 0 else "Recently",
            "status": "Verified",
            "color": "text-emerald-600 bg-emerald-50",
        })

    return {
        "id": str(donor.get("_id")),
        "name": donor.get("name"),
        "phone": donor.get("phone"),
        "bloodType": donor.get("blood_type"),
        "blood_type": donor.get("blood_type"),
        "totalDonations": total_donations,
        "livesImpacted": lives_impacted,
        "nextEligibleDays": next_eligible_days,
        "badges": badges,
        "available": donor.get("is_available", True),
        "is_available": donor.get("is_available", True),
        "recent_activity": recent_activity,
    }

@router.patch("/{donor_id}/availability")
async def toggle_availability(donor_id: str, payload: DonorAvailability):
    db = get_db()
    await db.donors.update_one(
        {"_id": donor_id},
        {"$set": {"is_available": payload.is_available}}
    )
    return {"success": True, "is_available": payload.is_available}

@router.get("/{donor_id}/qr")
async def get_donor_qr(donor_id: str):
    db = get_db()
    donor = await db.donors.find_one({"_id": donor_id})
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    token = f"JEEVANSH:{donor_id}:{donor.get('blood_type')}:{int(datetime.utcnow().timestamp())}"
    return {
        "token": token,
        "donor_id": donor_id,
        "name": donor.get("name"),
        "blood_type": donor.get("blood_type"),
    }

@router.get("/count")
async def donor_count():
    db = get_db()
    count = await db.donors.count_documents({})
    return {"total_donors": count}

@router.post("/search")
async def search_donors(
    blood_type: str,
    latitude: float,
    longitude: float,
    radius_km: float = 15,
):
    donors = await find_nearby_donors(blood_type, latitude, longitude, radius_km)
    return {"count": len(donors), "donors": donors}