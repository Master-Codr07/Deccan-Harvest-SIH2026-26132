from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import logging
import os

from .database import engine, Base, SessionLocal
from .routers import auth, crops, auctions, escrow, transport, warehouse, dashboard, ml, upload, market
from .config import UPLOAD_DIR
from .services.agmarknet_service import fetch_agmarknet_data
from .models.models import MarketPrice

logger = logging.getLogger(__name__)

os.makedirs(UPLOAD_DIR, exist_ok=True)

Base.metadata.create_all(bind=engine)


async def periodic_market_refresh():
    while True:
        try:
            db = SessionLocal()
            records = await fetch_agmarknet_data()
            from datetime import datetime
            now = datetime.utcnow()
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
            db.commit()
            db.close()
            logger.info(f"Market refresh complete: {len(records)} commodities updated")
        except Exception as e:
            logger.error(f"Market refresh failed: {e}")
        await asyncio.sleep(3600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(periodic_market_refresh())
    yield
    task.cancel()


app = FastAPI(title="Deccan Harvest API", version="4.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(crops.router)
app.include_router(auctions.router)
app.include_router(escrow.router)
app.include_router(transport.router)
app.include_router(warehouse.router)
app.include_router(dashboard.router)
app.include_router(ml.router)
app.include_router(upload.router)
app.include_router(market.router)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"message": "Deccan Harvest API v4 - Digital APMC Ecosystem", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
