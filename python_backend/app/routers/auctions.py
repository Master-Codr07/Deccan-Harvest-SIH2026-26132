from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta

from ..database import get_db
from ..models.models import Auction, AuctionStatus, AuctionBid, BidStatus, CropListing, CropStatus, User
from ..schemas.schemas import AuctionCreate, AuctionResponse, AuctionBidCreate, AuctionBidResponse, AuctionLiveResponse
from ..auth import get_current_user, require_role, require_roles

router = APIRouter(prefix="/api/auctions", tags=["auctions"])

MAX_BID_MULTIPLIER = 1.20
BID_TIMER_SECONDS = 60


def calculate_floor(base_price: float):
    return round(base_price * 1.15, 2)


def auto_end_expired(db: Session):
    now = datetime.now(timezone.utc)
    expired = (
        db.query(Auction)
        .filter(
            Auction.status == AuctionStatus.LIVE,
            Auction.timer_end.isnot(None),
            Auction.timer_end <= now,
        )
        .all()
    )
    for auction in expired:
        auction.status = AuctionStatus.ENDED
        winning_bid = db.query(AuctionBid).filter(
            AuctionBid.auction_id == auction.id,
            AuctionBid.status == BidStatus.ACTIVE,
        ).order_by(AuctionBid.amount.desc()).first()
        if winning_bid:
            winning_bid.status = BidStatus.WON
            auction.highest_bidder_id = winning_bid.buyer_id
            db.query(AuctionBid).filter(
                AuctionBid.auction_id == auction.id,
                AuctionBid.id != winning_bid.id,
                AuctionBid.status == BidStatus.ACTIVE,
            ).update({"status": BidStatus.LOST})
    if expired:
        db.commit()


@router.get("/", response_model=List[AuctionResponse])
def list_auctions(status: str = None, db: Session = Depends(get_db)):
    auto_end_expired(db)
    query = db.query(Auction)
    if status:
        query = query.filter(Auction.status == status)
    return query.order_by(Auction.scheduled_start.desc()).all()


@router.get("/live", response_model=List[AuctionLiveResponse])
def list_live_auctions(db: Session = Depends(get_db)):
    auto_end_expired(db)
    auctions = (
        db.query(Auction)
        .join(CropListing, Auction.crop_id == CropListing.id)
        .join(User, CropListing.farmer_id == User.id)
        .filter(Auction.status == AuctionStatus.LIVE)
        .order_by(Auction.created_at.desc())
        .all()
    )
    result = []
    for a in auctions:
        crop = a.crop
        farmer = crop.farmer
        result.append(AuctionLiveResponse(
            auction_id=a.id,
            crop_id=crop.id,
            crop_name=crop.crop_name,
            quantity=crop.quantity,
            unit=crop.unit,
            lot_size=crop.lot_size,
            base_price=crop.base_price,
            location=crop.location,
            image_url=crop.image_url,
            farmer_name=farmer.name,
            farmer_id=farmer.id,
            status=a.status.value,
            highest_bid=a.highest_bid,
            lower_circuit_price=a.lower_circuit_price,
            timer_end=a.timer_end,
            scheduled_start=a.scheduled_start,
            scheduled_end=a.scheduled_end,
        ))
    return result


@router.get("/won", response_model=List[AuctionResponse])
def list_won_auctions(db: Session = Depends(get_db)):
    auto_end_expired(db)
    return db.query(Auction).filter(Auction.status == AuctionStatus.ENDED, Auction.highest_bidder_id.isnot(None)).order_by(Auction.created_at.desc()).all()


@router.get("/{auction_id}", response_model=AuctionResponse)
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    auto_end_expired(db)
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction


@router.post("/", response_model=AuctionResponse)
def create_auction(
    auction: AuctionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("apmc_officer")),
):
    crop = db.query(CropListing).filter(CropListing.id == auction.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if crop.status != CropStatus.VERIFIED:
        raise HTTPException(status_code=400, detail="Crop must be verified before auction")

    existing = db.query(Auction).filter(Auction.crop_id == auction.crop_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Auction already exists for this crop")

    base_price = crop.base_price
    lower_circuit = calculate_floor(base_price)
    now = datetime.now(timezone.utc)
    timer_end = now + timedelta(seconds=BID_TIMER_SECONDS)

    db_auction = Auction(
        **auction.model_dump(),
        status=AuctionStatus.LIVE,
        highest_bid=base_price,
        base_price=base_price,
        lower_circuit_price=lower_circuit,
        upper_circuit_price=0,
        timer_end=timer_end,
    )
    db.add(db_auction)
    db.commit()
    db.refresh(db_auction)
    return db_auction


@router.post("/{auction_id}/end")
def end_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("apmc_officer")),
):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    auction.status = AuctionStatus.ENDED
    auction.timer_end = None
    winning_bid = db.query(AuctionBid).filter(
        AuctionBid.auction_id == auction_id,
        AuctionBid.status == BidStatus.ACTIVE,
    ).order_by(AuctionBid.amount.desc()).first()

    if winning_bid:
        winning_bid.status = BidStatus.WON
        auction.highest_bidder_id = winning_bid.buyer_id
        db.query(AuctionBid).filter(
            AuctionBid.auction_id == auction_id,
            AuctionBid.id != winning_bid.id,
            AuctionBid.status == BidStatus.ACTIVE,
        ).update({"status": BidStatus.LOST})

    db.commit()
    return {"message": "Auction ended", "winner_id": auction.highest_bidder_id, "highest_bid": auction.highest_bid}


@router.post("/{auction_id}/bid", response_model=AuctionBidResponse)
def place_bid(
    auction_id: int,
    bid: AuctionBidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("buyer", "dealer")),
):
    auto_end_expired(db)

    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.status != AuctionStatus.LIVE:
        raise HTTPException(status_code=400, detail="Auction has ended")

    if auction.timer_end and auction.timer_end <= datetime.now(timezone.utc):
        auction.status = AuctionStatus.ENDED
        db.commit()
        raise HTTPException(status_code=400, detail="Auction has ended — timer expired")

    floor = calculate_floor(auction.base_price)
    if bid.amount < floor:
        raise HTTPException(
            status_code=400,
            detail=f"Bid ₹{bid.amount} is below floor price ₹{floor}. Minimum is +15% of base.",
        )

    max_allowed = round(auction.highest_bid * MAX_BID_MULTIPLIER, 2)
    if bid.amount > max_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Bid ₹{bid.amount} exceeds max allowed ₹{max_allowed}. Can only bid up to 20% above current ₹{auction.highest_bid}.",
        )

    if bid.amount <= auction.highest_bid:
        raise HTTPException(status_code=400, detail=f"Bid must be higher than current ₹{auction.highest_bid}")

    db_bid = AuctionBid(amount=bid.amount, auction_id=auction_id, buyer_id=current_user.id)
    auction.highest_bid = bid.amount
    auction.timer_end = datetime.now(timezone.utc) + timedelta(seconds=BID_TIMER_SECONDS)
    db.add(db_bid)
    db.commit()
    db.refresh(db_bid)
    return db_bid


@router.get("/{auction_id}/bids", response_model=List[AuctionBidResponse])
def get_auction_bids(auction_id: int, db: Session = Depends(get_db)):
    return db.query(AuctionBid).filter(
        AuctionBid.auction_id == auction_id
    ).order_by(AuctionBid.amount.desc()).all()
