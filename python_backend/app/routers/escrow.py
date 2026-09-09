from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from ..database import get_db
from ..models.models import EscrowPayment, EscrowStatus, Auction, AuctionStatus, CropListing, User
from ..schemas.schemas import EscrowResponse
from ..auth import get_current_user, require_role, require_roles

router = APIRouter(prefix="/api/escrow", tags=["escrow"])

PLATFORM_FEE_RATE = 0.15


@router.get("/", response_model=List[EscrowResponse])
def list_escrow_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.value in ("admin", "apmc_officer"):
        return db.query(EscrowPayment).all()
    elif current_user.role.value == "farmer":
        return db.query(EscrowPayment).filter(EscrowPayment.farmer_id == current_user.id).all()
    else:
        return db.query(EscrowPayment).filter(EscrowPayment.buyer_id == current_user.id).all()


@router.post("/hold/{auction_id}", response_model=EscrowResponse)
def hold_payment(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("buyer", "dealer")),
):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.status != AuctionStatus.ENDED:
        raise HTTPException(status_code=400, detail="Auction not ended yet")
    if auction.highest_bidder_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not the winner")

    existing = db.query(EscrowPayment).filter(
        EscrowPayment.crop_id == auction.crop_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Escrow already exists")

    winning_bid = auction.highest_bid
    platform_fee = round(winning_bid * PLATFORM_FEE_RATE, 2)
    total_payable = round(winning_bid + platform_fee, 2)

    buyer = db.query(User).filter(User.id == current_user.id).first()
    if buyer.wallet_balance < total_payable:
        raise HTTPException(status_code=400, detail=f"Insufficient wallet balance. Need ₹{total_payable}, have ₹{buyer.wallet_balance}")

    buyer.wallet_balance -= total_payable

    crop = db.query(CropListing).filter(CropListing.id == auction.crop_id).first()
    escrow = EscrowPayment(
        amount=winning_bid,
        crop_id=auction.crop_id,
        buyer_id=current_user.id,
        farmer_id=crop.farmer_id,
    )
    db.add(escrow)
    db.commit()
    db.refresh(escrow)
    return escrow


@router.post("/{escrow_id}/release", response_model=EscrowResponse)
def release_payment(
    escrow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("apmc_officer")),
):
    escrow = db.query(EscrowPayment).filter(EscrowPayment.id == escrow_id).first()
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    if escrow.status != EscrowStatus.HELD:
        raise HTTPException(status_code=400, detail="Escrow not in held status")

    farmer = db.query(User).filter(User.id == escrow.farmer_id).first()
    if farmer:
        farmer.wallet_balance += escrow.amount

    escrow.status = EscrowStatus.RELEASED
    escrow.released_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(escrow)
    return escrow


@router.post("/{escrow_id}/refund", response_model=EscrowResponse)
def refund_payment(
    escrow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    escrow = db.query(EscrowPayment).filter(EscrowPayment.id == escrow_id).first()
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    buyer = db.query(User).filter(User.id == escrow.buyer_id).first()
    if buyer:
        platform_fee = round(escrow.amount * PLATFORM_FEE_RATE, 2)
        buyer.wallet_balance += escrow.amount + platform_fee

    escrow.status = EscrowStatus.REFUNDED
    db.commit()
    db.refresh(escrow)
    return escrow
