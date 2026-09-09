import httpx
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

AGMARKNET_API_URL = "https://data.gov.in/backend/dmspublic/v1/resources"
AGMARKNET_RESOURCE_ID = "5c60e9584f2d6d0f88d7e8b8"

FALLBACK_DATA = [
    {"commodity": "Red Onion", "market": "Nashik", "state": "Maharashtra", "min_price": 22.0, "max_price": 32.0, "modal_price": 25.80},
    {"commodity": "Soybean", "market": "Latur", "state": "Maharashtra", "min_price": 50.0, "max_price": 65.0, "modal_price": 57.25},
    {"commodity": "Wheat", "market": "Pune", "state": "Maharashtra", "min_price": 20.0, "max_price": 28.0, "modal_price": 24.50},
    {"commodity": "Tomato", "market": "Nagpur", "state": "Maharashtra", "min_price": 25.0, "max_price": 40.0, "modal_price": 32.00},
    {"commodity": "Cotton", "market": "Wardha", "state": "Maharashtra", "min_price": 120.0, "max_price": 150.0, "modal_price": 136.00},
    {"commodity": "Chilli", "market": "Beed", "state": "Maharashtra", "min_price": 75.0, "max_price": 95.0, "modal_price": 85.00},
    {"commodity": "Potato", "market": "Pune", "state": "Maharashtra", "min_price": 15.0, "max_price": 22.0, "modal_price": 18.90},
    {"commodity": "Rice", "market": "Raigad", "state": "Maharashtra", "min_price": 32.0, "max_price": 45.0, "modal_price": 38.50},
    {"commodity": "Groundnut", "market": "Jalna", "state": "Maharashtra", "min_price": 55.0, "max_price": 72.0, "modal_price": 63.00},
    {"commodity": "Green Gram", "market": "Akola", "state": "Maharashtra", "min_price": 68.0, "max_price": 88.0, "modal_price": 78.50},
    {"commodity": "Black Gram", "market": "Amravati", "state": "Maharashtra", "min_price": 62.0, "max_price": 82.0, "modal_price": 72.00},
    {"commodity": "Bengal Gram", "market": "Nanded", "state": "Maharashtra", "min_price": 48.0, "max_price": 65.0, "modal_price": 56.50},
    {"commodity": "Jowar", "market": "Solapur", "state": "Maharashtra", "min_price": 28.0, "max_price": 38.0, "modal_price": 33.00},
    {"commodity": "Bajra", "market": "Ahmednagar", "state": "Maharashtra", "min_price": 22.0, "max_price": 30.0, "modal_price": 26.00},
    {"commodity": "Maize", "market": "Kolhapur", "state": "Maharashtra", "min_price": 18.0, "max_price": 26.0, "modal_price": 22.00},
]


async def fetch_agmarknet_data(commodity: Optional[str] = None, state: Optional[str] = None) -> List[Dict]:
    """Fetch live market data from data.gov.in Agmarknet API with fallback."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            params = {"api-key": "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b", "format": "json", "limit": 50}
            if commodity:
                params["filters[commodity]"] = commodity
            if state:
                params["filters[state]"] = state
            resp = await client.get(AGMARKNET_API_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            records = data.get("records", [])
            if records:
                return [
                    {
                        "commodity": r.get("commodity", "Unknown"),
                        "market": r.get("market", "Unknown"),
                        "state": r.get("state", "Unknown"),
                        "min_price": float(r.get("min_price", 0)),
                        "max_price": float(r.get("max_price", 0)),
                        "modal_price": float(r.get("modal_price", 0)),
                    }
                    for r in records[:20]
                ]
    except Exception as e:
        logger.warning(f"Agmarknet API failed, using fallback data: {e}")

    results = FALLBACK_DATA
    if commodity:
        results = [r for r in results if commodity.lower() in r["commodity"].lower()]
    if state:
        results = [r for r in results if state.lower() in r["state"].lower()]
    return results


def get_fallback_prices() -> List[Dict]:
    """Return fallback market prices."""
    return FALLBACK_DATA
