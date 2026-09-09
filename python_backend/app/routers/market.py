from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.models import MarketPrice
from ..schemas.schemas import MarketPriceResponse
from ..services.agmarknet_service import fetch_agmarknet_data, get_fallback_prices

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/live-prices", response_model=List[MarketPriceResponse])
async def get_live_prices(
    commodity: Optional[str] = Query(None, description="Filter by commodity name"),
    state: Optional[str] = Query(None, description="Filter by state"),
    db: Session = Depends(get_db),
):
    """Get live market prices from Agmarknet API or database cache."""
    db_prices = db.query(MarketPrice)
    if commodity:
        db_prices = db_prices.filter(MarketPrice.commodity.ilike(f"%{commodity}%"))
    if state:
        db_prices = db_prices.filter(MarketPrice.state.ilike(f"%{state}%"))
    db_prices = db_prices.order_by(MarketPrice.updated_at.desc()).limit(50).all()

    if db_prices:
        return db_prices

    records = await fetch_agmarknet_data(commodity=commodity, state=state)
    now = datetime.utcnow()
    results = []
    for rec in records:
        mp = MarketPrice(
            commodity=rec["commodity"],
            market=rec["market"],
            state=rec["state"],
            min_price=rec["min_price"],
            max_price=rec["max_price"],
            modal_price=rec["modal_price"],
            updated_at=now,
        )
        db.add(mp)
        results.append(mp)
    db.commit()
    return results


@router.post("/refresh")
async def refresh_market_data(db: Session = Depends(get_db)):
    """Force refresh market data from Agmarknet API."""
    records = await fetch_agmarknet_data()
    now = datetime.utcnow()
    count = 0
    for rec in records:
        existing = (
            db.query(MarketPrice)
            .filter(MarketPrice.commodity == rec["commodity"], MarketPrice.market == rec["market"])
            .first()
        )
        if existing:
            existing.min_price = rec["min_price"]
            existing.max_price = rec["max_price"]
            existing.modal_price = rec["modal_price"]
            existing.updated_at = now
        else:
            mp = MarketPrice(
                commodity=rec["commodity"],
                market=rec["market"],
                state=rec["state"],
                min_price=rec["min_price"],
                max_price=rec["max_price"],
                modal_price=rec["modal_price"],
                updated_at=now,
            )
            db.add(mp)
        count += 1
    db.commit()
    return {"message": f"Refreshed {count} market prices", "updated_at": now.isoformat()}
