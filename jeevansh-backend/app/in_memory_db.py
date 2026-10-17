import math
import random
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
FIRST_NAMES = [
    "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit",
    "Neha", "Karan", "Pooja", "Arjun", "Divya", "Suresh", "Meera",
    "Aditya", "Kavya", "Manish", "Ritu", "Sanjay", "Shreya"
]
LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Mehta", "Patel",
    "Reddy", "Nair", "Joshi", "Chopra", "Bansal"
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class AsyncCursor:
    def __init__(self, items: List[Dict[str, Any]]):
        self._items = items
        self._limit: Optional[int] = None
        self._idx = 0

    def limit(self, n: int):
        self._limit = n
        return self

    def __aiter__(self):
        self._idx = 0
        return self

    async def __anext__(self):
        items = self._items if self._limit is None else self._items[:self._limit]
        if self._idx < len(items):
            item = items[self._idx]
            self._idx += 1
            return item
        raise StopAsyncIteration


class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []

    async def create_index(self, keys, **kwargs):
        pass

    async def count_documents(self, filter_query: Optional[Dict[str, Any]] = None) -> int:
        return len(self._filter_docs(filter_query or {}))

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self.docs.append(doc_copy)

        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id

        return InsertResult(doc_copy["_id"])

    async def insert_many(self, docs: List[Dict[str, Any]]):
        for doc in docs:
            await self.insert_one(doc)

    async def delete_many(self, filter_query: Optional[Dict[str, Any]] = None):
        if not filter_query:
            self.docs = []
            return
        to_keep = [d for d in self.docs if not self._matches(d, filter_query)]
        self.docs = to_keep

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for d in self.docs:
            if self._matches(d, query):
                return dict(d)
        return None

    def find(self, query: Dict[str, Any]) -> AsyncCursor:
        matched = self._filter_docs(query)
        # Handle $near query ordering if present
        if "location" in query and "$near" in query["location"]:
            near_spec = query["location"]["$near"]
            coords = near_spec.get("$geometry", {}).get("coordinates", [77.2090, 28.6139])
            target_lng, target_lat = coords[0], coords[1]
            max_dist_m = near_spec.get("$maxDistance", 15000)

            filtered = []
            for d in matched:
                loc = d.get("location", {}).get("coordinates", [0, 0])
                lng, lat = loc[0], loc[1]
                dist_km = haversine_km(target_lat, target_lng, lat, lng)
                if dist_km * 1000 <= max_dist_m:
                    d_copy = dict(d)
                    d_copy["distance_km"] = dist_km
                    filtered.append(d_copy)

            filtered.sort(key=lambda x: x.get("distance_km", 999))
            return AsyncCursor(filtered)

        return AsyncCursor([dict(d) for d in matched])

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for d in self.docs:
            if self._matches(d, query):
                if "$set" in update:
                    d.update(update["$set"])
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        d[k] = d.get(k, 0) + v
                return True
        return False

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or":
                sub_matched = any(self._matches(doc, sub_q) for sub_q in v)
                if not sub_matched:
                    return False
                continue
            if k == "location" and isinstance(v, dict) and "$near" in v:
                continue

            doc_val = doc.get(k)
            # Support matching string id if query is string or ObjectId string representation
            if k == "_id":
                if str(doc_val) != str(v):
                    return False
                continue

            if isinstance(v, dict):
                if "$in" in v:
                    if doc_val not in v["$in"]:
                        return False
                elif "$lt" in v:
                    if doc_val is None or doc_val >= v["$lt"]:
                        return False
                elif "$gt" in v:
                    if doc_val is None or doc_val <= v["$gt"]:
                        return False
            else:
                if doc_val != v:
                    return False
        return True

    def _filter_docs(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [d for d in self.docs if self._matches(d, query)]


class InMemoryDatabase:
    def __init__(self):
        self.donors = InMemoryCollection("donors")
        self.requests = InMemoryCollection("requests")
        self.banks = InMemoryCollection("banks")
        self._seed_initial_data()

    def _seed_initial_data(self):
        # Seed 200 demo donors across Delhi NCR
        for i in range(200):
            lat = round(random.uniform(28.40, 28.88), 4)
            lng = round(random.uniform(76.84, 77.40), 4)
            is_available = random.random() > 0.15
            last_donated = None
            if random.random() > 0.5:
                days_ago = random.choice([30, 60, 100, 150, 200])
                last_donated = datetime.utcnow() - timedelta(days=days_ago)

            first = FIRST_NAMES[i % len(FIRST_NAMES)]
            last = LAST_NAMES[i % len(LAST_NAMES)]
            phone = f"+9198{str(10000000 + i)}"
            b_type = BLOOD_TYPES[i % len(BLOOD_TYPES)]

            self.donors.docs.append({
                "_id": f"donor-{i + 1}",
                "name": f"{first} {last}",
                "phone": phone,
                "blood_type": b_type,
                "location": {
                    "type": "Point",
                    "coordinates": [lng, lat],
                },
                "city": "Delhi NCR",
                "is_available": is_available,
                "total_donations": random.randint(0, 8),
                "lives_impacted": random.randint(0, 20),
                "last_donated_at": last_donated,
                "created_at": datetime.utcnow(),
            })

        # Seed demo blood banks
        demo_banks = [
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
        self.banks.docs = demo_banks
