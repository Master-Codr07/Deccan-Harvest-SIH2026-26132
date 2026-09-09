from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.models import TransportBooking, TransportStatus, User
from ..schemas.schemas import TransportCreate, TransportResponse
from ..auth import get_current_user, require_role, require_roles

router = APIRouter(prefix="/api/transport", tags=["transport"])


@router.get("/", response_model=List[TransportResponse])
def list_transport_bookings(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(TransportBooking)
    if status:
        query = query.filter(TransportBooking.status == status)
    if current_user.role.value == "buyer":
        query = query.filter(TransportBooking.buyer_id == current_user.id)
    return query.order_by(TransportBooking.created_at.desc()).all()


@router.post("/", response_model=TransportResponse)
def book_transport(
    booking: TransportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("buyer", "dealer")),
):
    db_booking = TransportBooking(**booking.model_dump(), buyer_id=current_user.id)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.put("/{booking_id}/accept", response_model=TransportResponse)
def accept_transport(
    booking_id: int,
    transporter_name: str,
    transporter_phone: str,
    estimated_cost: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(TransportBooking).filter(TransportBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != TransportStatus.REQUESTED:
        raise HTTPException(status_code=400, detail="Booking already accepted")

    booking.status = TransportStatus.ACCEPTED
    booking.transporter_name = transporter_name
    booking.transporter_phone = transporter_phone
    booking.estimated_cost = estimated_cost
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/status", response_model=TransportResponse)
def update_transport_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(TransportBooking).filter(TransportBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = TransportStatus(status)
    db.commit()
    db.refresh(booking)
    return booking
