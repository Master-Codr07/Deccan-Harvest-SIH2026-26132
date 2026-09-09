from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image
import io
import random
import math

from ..ml.ml_service import price_predictor, crop_recommender
from ..database import get_db
from ..models.models import MarketPrice
from ..schemas.schemas import QualityAssessmentResponse

router = APIRouter(prefix="/api/ml", tags=["ml"])


class PricePredictionRequest(BaseModel):
    quantity: float
    category_encoded: int
    season: int


class CropRecommendationRequest(BaseModel):
    soil_ph: float
    rainfall: float
    humidity: float
    temperature: float


def analyze_crop_image(image_bytes: bytes) -> dict:
    """Analyze crop image for quality using PIL color analysis."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    pixels = list(img.getdata())
    total = len(pixels)

    r_avg = sum(p[0] for p in pixels) / total
    g_avg = sum(p[1] for p in pixels) / total
    b_avg = sum(p[2] for p in pixels) / total

    brightness = (r_avg + g_avg + b_avg) / 3.0

    r_var = sum((p[0] - r_avg) ** 2 for p in pixels) / total
    g_var = sum((p[1] - g_avg) ** 2 for p in pixels) / total
    b_var = sum((p[2] - b_avg) ** 2 for p in pixels) / total
    color_uniformity = 1.0 - min(1.0, math.sqrt((r_var + g_var + b_var) / 3) / 128.0)

    green_ratio = g_avg / max(r_avg + g_avg + b_avg, 1)
    freshness_score = min(1.0, green_ratio * 2 + color_uniformity * 0.5 + (brightness / 255) * 0.3)

    defects = []
    if color_uniformity < 0.4:
        defects.append("Uneven coloring detected")
    if brightness < 60:
        defects.append("Dark spots / possible bruising")
    if brightness > 220:
        defects.append("Over-exposure / possible wilting")
    if green_ratio < 0.2 and r_avg > 180:
        defects.append("Excessive redness / ripeness beyond optimal")

    if freshness_score > 0.7 and len(defects) == 0:
        grade, multiplier = "Grade A", 1.15
        freshness_label = "High"
    elif freshness_score > 0.45 and len(defects) <= 1:
        grade, multiplier = "Grade B", 1.05
        freshness_label = "Medium"
    else:
        grade, multiplier = "Grade C", 0.90
        freshness_label = "Low"

    confidence = round(0.75 + color_uniformity * 0.2 + random.random() * 0.05, 2)

    return {
        "quality_grade": grade,
        "confidence_score": min(confidence, 0.99),
        "freshness": freshness_label,
        "detected_defects": defects,
        "suggested_price_multiplier": multiplier,
    }


@router.post("/predict-price")
def predict_price(req: PricePredictionRequest):
    price = price_predictor.predict(req.quantity, req.category_encoded, req.season)
    return {"predicted_price": price, "unit": "INR/kg"}


@router.post("/recommend-crop")
def recommend_crop(req: CropRecommendationRequest):
    crop = crop_recommender.recommend(req.soil_ph, req.rainfall, req.humidity, req.temperature)
    return {"recommended_crop": crop}


@router.post("/assess-quality", response_model=QualityAssessmentResponse)
async def assess_quality(file: UploadFile = File(...)):
    """Analyze uploaded crop image for quality grading using PIL vision pipeline."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG)")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

    result = analyze_crop_image(contents)
    return QualityAssessmentResponse(**result)
