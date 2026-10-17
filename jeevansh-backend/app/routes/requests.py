from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from bson import ObjectId
from app.database import get_db
from app.models.request import BloodRequestCreate, RequestAccept
from app.services.geo_search import find_nearby_donors

router = APIRouter(prefix="/api/requests", tags=["requests"])

async def _find_request_doc(db, request_id: str):
    # Try finding as direct string/uuid
    doc = await db.requests.find_one({"_id": request_id})
    if doc:
        return doc
    # Try finding as ObjectId
    try:
        oid = ObjectId(request_id)
        doc = await db.requests.find_one({"_id": oid})
        if doc:
            return doc
    except Exception:
        pass
    return None

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_request(payload: BloodRequestCreate):
    db = get_db()

    # Find compatible donors near the patient
    donors = await find_nearby_donors(
        patient_blood_type=payload.blood_type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_km=15,
        limit=20,
    )

    request_doc = {
        "blood_type": payload.blood_type,
        "location": {
            "type": "Point",
            "coordinates": [payload.longitude, payload.latitude],
        },
        "location_text": payload.location_text,
        "patient_age": payload.patient_age,
        "patient_gender": payload.patient_gender,
        "units": payload.units,
        "hospital_name": payload.hospital_name,
        "status": "searching",
        "alerted_donors": len(donors),
        "matched_donor_ids": [d["id"] for d in donors],
        "matched_donors": donors,
        "accepted_donor": None,
        "created_at": datetime.utcnow(),
    }

    result = await db.requests.insert_one(request_doc)
    request_id = str(result.inserted_id)

    return {
        "id": request_id,
        "blood_type": payload.blood_type,
        "bloodType": payload.blood_type,
        "status": "searching",
        "alerted_donors": len(donors),
        "alertedDonors": len(donors),
        "matched_donors": donors,
        "matchedDonors": donors,
        "created_at": request_doc["created_at"],
        "createdAt": request_doc["created_at"].isoformat(),
        "accepted_donor": None,
        "acceptedDonor": None,
    }

@router.get("/{request_id}/status")
async def get_request_status(request_id: str):
    db = get_db()
    request_doc = await _find_request_doc(db, request_id)

    if not request_doc:
        raise HTTPException(status_code=404, detail="Request not found")

    accepted_donor = request_doc.get("accepted_donor")
    # For interactive demo feeling: if status is searching and there are matched donors,
    # simulate a donor accepting after 8 seconds if not already accepted
    status_val = request_doc.get("status", "searching")
    if status_val == "searching" and request_doc.get("created_at"):
        elapsed_sec = (datetime.utcnow() - request_doc["created_at"]).total_seconds()
        if elapsed_sec > 8:
            matched = request_doc.get("matched_donors", [])
            if matched:
                donor = matched[0]
                accepted_donor = {
                    "name": donor.get("name", "Rahul Sharma"),
                    "phone": donor.get("phone", "+919810123456"),
                    "distance": donor.get("distance_km", 2.4),
                    "blood_type": donor.get("blood_type", request_doc["blood_type"]),
                }
            else:
                accepted_donor = {
                    "name": "Rahul Sharma",
                    "phone": "+919810123456",
                    "distance": 2.4,
                    "blood_type": request_doc["blood_type"],
                }
            status_val = "donor_found"
            await db.requests.update_one(
                {"_id": request_doc["_id"]},
                {"$set": {"status": "donor_found", "accepted_donor": accepted_donor}}
            )

    return {
        "id": str(request_doc["_id"]),
        "blood_type": request_doc["blood_type"],
        "bloodType": request_doc["blood_type"],
        "status": status_val,
        "alerted_donors": request_doc.get("alerted_donors", 0),
        "alertedDonors": request_doc.get("alerted_donors", 0),
        "accepted_donor": accepted_donor,
        "acceptedDonor": accepted_donor,
        "created_at": request_doc["created_at"],
    }

@router.post("/{request_id}/accept")
async def accept_request(request_id: str, payload: RequestAccept):
    db = get_db()
    request_doc = await _find_request_doc(db, request_id)

    if not request_doc:
        raise HTTPException(status_code=404, detail="Request not found")

    accepted_donor = {
        "id": payload.donor_id or "donor-demo",
        "name": payload.donor_name or "Rahul Sharma",
        "phone": payload.donor_phone or "+919810123456",
        "distance": payload.distance_km or 2.4,
    }

    await db.requests.update_one(
        {"_id": request_doc["_id"]},
        {"$set": {"status": "donor_found", "accepted_donor": accepted_donor}}
    )

    return {
        "success": True,
        "id": str(request_doc["_id"]),
        "status": "donor_found",
        "accepted_donor": accepted_donor,
        "acceptedDonor": accepted_donor,
    }

@router.post("/{request_id}/complete")
async def complete_request(request_id: str):
    db = get_db()
    request_doc = await _find_request_doc(db, request_id)

    if not request_doc:
        raise HTTPException(status_code=404, detail="Request not found")

    await db.requests.update_one(
        {"_id": request_doc["_id"]},
        {"$set": {"status": "completed"}}
    )

    return {
        "success": True,
        "id": str(request_doc["_id"]),
        "status": "completed",
    }