from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.models import User, UserRole, CropListing, CropStatus, Auction, AuctionStatus, EscrowPayment
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("apmc_officer")),
):
    total_farmers = db.query(func.count(User.id)).filter(User.role == UserRole.FARMER).scalar()
    total_dealers = db.query(func.count(User.id)).filter(User.role == UserRole.DEALER).scalar()
    total_crops = db.query(func.count(CropListing.id)).scalar()
    total_auctions = db.query(func.count(Auction.id)).scalar()
    total_value = db.query(func.sum(EscrowPayment.amount)).filter(
        EscrowPayment.status == "released"
    ).scalar() or 0
    crops_pending = db.query(func.count(CropListing.id)).filter(
        CropListing.status == CropStatus.PENDING_VERIFICATION
    ).scalar()
    crops_verified = db.query(func.count(CropListing.id)).filter(
        CropListing.status == CropStatus.VERIFIED
    ).scalar()

    return {
        "total_farmers": total_farmers,
        "total_dealers": total_dealers,
        "total_crops": total_crops,
        "total_auctions": total_auctions,
        "total_value": float(total_value),
        "crops_pending": crops_pending,
        "crops_verified": crops_verified,
    }


@router.get("/supply-forecast")
def supply_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("apmc_officer")),
):
    crop_counts = db.query(
        CropListing.crop_name,
        func.count(CropListing.id).label("count"),
        func.sum(CropListing.quantity).label("total_quantity"),
    ).group_by(CropListing.crop_name).all()

    auction_stats = db.query(
        Auction.status,
        func.count(Auction.id),
    ).group_by(Auction.status).all()

    return {
        "crop_supply": [
            {"crop": c[0], "listings": c[1], "total_quantity": float(c[2] or 0)}
            for c in crop_counts
        ],
        "auction_stats": {a[0]: a[1] for a in auction_stats},
    }


@router.get("/recent-activity")
def recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("apmc_officer")),
):
    recent_crops = db.query(CropListing).order_by(
        CropListing.created_at.desc()
    ).limit(10).all()

    recent_auctions = db.query(Auction).order_by(
        Auction.created_at.desc()
    ).limit(10).all()

    return {
        "recent_crops": [
            {"id": c.id, "crop_name": c.crop_name, "status": c.status.value, "created_at": str(c.created_at)}
            for c in recent_crops
        ],
        "recent_auctions": [
            {"id": a.id, "crop_id": a.crop_id, "status": a.status.value, "highest_bid": a.highest_bid, "created_at": str(a.created_at)}
            for a in recent_auctions
        ],
    }
