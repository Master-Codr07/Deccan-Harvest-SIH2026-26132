from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import Bid, BidStatus, Product, User
from ..schemas.schemas import BidCreate, BidResponse
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/bids", tags=["bids"])


@router.get("/product/{product_id}", response_model=List[BidResponse])
def get_bids_for_product(product_id: int, db: Session = Depends(get_db)):
    return db.query(Bid).filter(
        Bid.product_id == product_id
    ).order_by(Bid.amount.desc()).all()


@router.post("/", response_model=BidResponse)
def place_bid(
    bid: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("buyer")),
):
    highest = db.query(Bid).filter(
        Bid.product_id == bid.product_id,
        Bid.status == BidStatus.ACTIVE,
    ).order_by(Bid.amount.desc()).first()

    if highest and bid.amount <= highest.amount:
        raise HTTPException(status_code=400, detail="Bid must be higher than current highest bid")

    db_bid = Bid(amount=bid.amount, product_id=bid.product_id, buyer_id=current_user.id)
    db.add(db_bid)
    db.commit()
    db.refresh(db_bid)
    return db_bid


@router.post("/{bid_id}/accept", response_model=BidResponse)
def accept_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("farmer")),
):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    product = db.query(Product).filter(Product.id == bid.product_id).first()
    if product.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your product")

    bid.status = BidStatus.WON
    db.query(Bid).filter(
        Bid.product_id == bid.product_id,
        Bid.id != bid_id,
        Bid.status == BidStatus.ACTIVE,
    ).update({"status": BidStatus.LOST})
    db.commit()
    db.refresh(bid)
    return bid
