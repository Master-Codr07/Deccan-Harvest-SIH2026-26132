"""Farmer Ration Card Verification Service — Maharashtra PDS simulation."""

import re
from typing import Optional

MAHARASHTRA_DISTRICTS = {
    "2712": "Nashik",
    "2725": "Pune",
    "2721": "Nagpur",
    "2710": "Mumbai",
    "2715": "Amravati",
    "2718": "Akola",
    "2720": "Wardha",
    "2722": "Beed",
    "2723": "Latur",
    "2724": "Osmanabad",
    "2726": "Ahmednagar",
    "2728": "Kolhapur",
    "2729": "Sangli",
    "2730": "Solapur",
    "2731": "Satara",
    "2732": "Raigad",
    "2733": "Ratnagiri",
    "2734": "Sindhudurg",
    "2736": "Jalgaon",
    "2737": "Dhule",
    "2738": "Nandurbar",
    "2739": "Chandrapur",
    "2740": "Gadchiroli",
    "2741": "Bhandara",
    "2742": "Gondia",
    "2743": "Yavatmal",
    "2744": "Hingoli",
    "2745": "Parbhani",
    "2746": "Nanded",
    "2747": "Palghar",
    "2748": "Thane",
    "2749": "Mumbai Suburban",
}

SIMULATED_REGISTRY = {
    "271234567890": {
        "name": "Ravi Shankar Patil",
        "head_of_household": "Ravi Shankar Patil",
        "family_size": 5,
        "district": "Nashik",
        "status": "active",
        "nfsa_eligible": True,
    },
    "279876543210": {
        "name": "Suresh Kumar Jadhav",
        "head_of_household": "Suresh Kumar Jadhav",
        "family_size": 4,
        "district": "Pune",
        "status": "active",
        "nfsa_eligible": True,
    },
    "272567890123": {
        "name": "Anil Vitthal Deshmukh",
        "head_of_household": "Anil Vitthal Deshmukh",
        "family_size": 6,
        "district": "Pune",
        "status": "active",
        "nfsa_eligible": True,
    },
    "272112345678": {
        "name": "Priya Rajendra Bhosale",
        "head_of_household": "Rajendra Bhosale",
        "family_size": 3,
        "district": "Nagpur",
        "status": "active",
        "nfsa_eligible": True,
    },
    "271512345678": {
        "name": "Manoj Ramchandra Sharma",
        "head_of_household": "Manoj Ramchandra Sharma",
        "family_size": 7,
        "district": "Amravati",
        "status": "active",
        "nfsa_eligible": True,
    },
    "272212345678": {
        "name": "Kavita Bhanudas Powar",
        "head_of_household": "Bhanudas Powar",
        "family_size": 4,
        "district": "Beed",
        "status": "active",
        "nfsa_eligible": True,
    },
    "272512345678": {
        "name": "Rajesh Dattatray More",
        "head_of_household": "Rajesh Dattatray More",
        "family_size": 5,
        "district": "Pune",
        "status": "active",
        "nfsa_eligible": True,
    },
    "273212345678": {
        "name": "Sunita Ramchandra Kadam",
        "head_of_household": "Ramchandra Kadam",
        "family_size": 6,
        "district": "Raigad",
        "status": "active",
        "nfsa_eligible": True,
    },
}


def validate_ration_card(card_number: str) -> dict:
    """
    Validate a Maharashtra ration card number against PDS standards.
    Returns verification result dict.
    """
    card = card_number.strip()

    if not re.match(r"^\d{12}$", card):
        return {"valid": False, "error": "Ration card must be exactly 12 digits"}

    if not card.startswith("27"):
        return {"valid": False, "error": "Invalid state code. Maharashtra ration cards start with 27"}

    district_code = card[:4]
    if district_code not in MAHARASHTRA_DISTRICTS:
        return {"valid": False, "error": f"Unknown district code {district_code} for Maharashtra"}

    district_name = MAHARASHTRA_DISTRICTS[district_code]

    if card in SIMULATED_REGISTRY:
        record = SIMULATED_REGISTRY[card]
        return {
            "valid": True,
            "card_number": card,
            "head_of_household": record["head_of_household"],
            "family_size": record["family_size"],
            "district": record["district"],
            "status": record["status"],
            "nfsa_eligible": record["nfsa_eligible"],
            "message": f"Card verified — Head of household: {record['head_of_household']}, District: {record['district']}",
        }

    return {
        "valid": True,
        "card_number": card,
        "head_of_household": None,
        "district": district_name,
        "status": "unregistered",
        "nfsa_eligible": False,
        "message": f"Card format valid (District: {district_name}) but not found in simulated NFSA registry. For demo, use: 271234567890, 279876543210, 272567890123",
    }
