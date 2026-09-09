from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from ..database import get_db
from ..models.models import WarehouseBooking, WarehouseStatus, User, CropListing
from ..schemas.schemas import WarehouseCreate, WarehouseResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/warehouse", tags=["warehouse"])


@router.get("/", response_model=List[WarehouseResponse])
def list_warehouse_bookings(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(WarehouseBooking)
    if status:
        query = query.filter(WarehouseBooking.status == status)
    if current_user.role.value in ("buyer", "dealer", "farmer"):
        query = query.filter(WarehouseBooking.user_id == current_user.id)
    return query.order_by(WarehouseBooking.created_at.desc()).all()


@router.post("/", response_model=WarehouseResponse)
def book_warehouse(
    booking: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if booking.crop_id:
        crop = db.query(CropListing).filter(CropListing.id == booking.crop_id).first()
        if not crop:
            raise HTTPException(status_code=400, detail="Crop not found")

    db_booking = WarehouseBooking(
        warehouse_name=booking.warehouse_name,
        location=booking.location,
        capacity_used=booking.capacity_used,
        cost_per_day=booking.cost_per_day,
        crop_id=booking.crop_id,
        user_id=current_user.id,
        start_date=datetime.now(timezone.utc),
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.put("/{booking_id}/confirm", response_model=WarehouseResponse)
def confirm_warehouse(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(WarehouseBooking).filter(WarehouseBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = WarehouseStatus.CONFIRMED
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/store", response_model=WarehouseResponse)
def store_crop(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(WarehouseBooking).filter(WarehouseBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = WarehouseStatus.STORED
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/release", response_model=WarehouseResponse)
def release_from_warehouse(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(WarehouseBooking).filter(WarehouseBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = WarehouseStatus.RELEASED
    booking.end_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)
    return booking
