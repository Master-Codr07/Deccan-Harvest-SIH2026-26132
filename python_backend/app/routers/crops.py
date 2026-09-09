from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.models import CropListing, CropStatus, User
from ..schemas.schemas import CropListingCreate, CropListingResponse
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/crops", tags=["crops"])


@router.get("/", response_model=List[CropListingResponse])
def list_crops(
    status: Optional[str] = None,
    crop_name: Optional[str] = None,
    farmer_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(CropListing)
    if status:
        query = query.filter(CropListing.status == status)
    if crop_name:
        query = query.filter(CropListing.crop_name.ilike(f"%{crop_name}%"))
    if farmer_id:
        query = query.filter(CropListing.farmer_id == farmer_id)
    return query.order_by(CropListing.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{crop_id}", response_model=CropListingResponse)
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.post("/", response_model=CropListingResponse)
def create_crop(
    crop: CropListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("farmer")),
):
    db_crop = CropListing(**crop.model_dump(), farmer_id=current_user.id)
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop


@router.post("/{crop_id}/verify")
def verify_crop(
    crop_id: int,
    status: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("apmc_officer")),
):
    crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    crop.status = CropStatus(status)
    crop.verification_notes = notes
    crop.verified_by = current_user.id
    db.commit()
    db.refresh(crop)
    return {"message": f"Crop {status}", "crop_id": crop.id, "status": crop.status.value}


@router.delete("/{crop_id}")
def delete_crop(
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("farmer")),
):
    crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if crop.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your crop")
    db.delete(crop)
    db.commit()
    return {"message": "Crop deleted"}
