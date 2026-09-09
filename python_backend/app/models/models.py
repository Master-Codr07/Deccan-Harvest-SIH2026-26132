from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..database import Base


class UserRole(str, enum.Enum):
    FARMER = "farmer"
    BUYER = "buyer"
    APMC_OFFICER = "apmc_officer"
    DEALER = "dealer"
    ADMIN = "admin"


class CropStatus(str, enum.Enum):
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"


class AuctionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    ENDED = "ended"
    CANCELLED = "cancelled"


class BidStatus(str, enum.Enum):
    ACTIVE = "active"
    WON = "won"
    LOST = "lost"
    CANCELLED = "cancelled"


class EscrowStatus(str, enum.Enum):
    HELD = "held"
    RELEASED = "released"
    REFUNDED = "refunded"


class TransportStatus(str, enum.Enum):
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class WarehouseStatus(str, enum.Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    STORED = "stored"
    RELEASED = "released"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(15), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.BUYER)
    location = Column(String(200))
    avatar_url = Column(String(500))
    ration_card_number = Column(String(12), nullable=True)
    ration_card_verified = Column(Boolean, default=False)
    wallet_balance = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    products = relationship("CropListing", back_populates="farmer", foreign_keys="[CropListing.farmer_id]")
    bids = relationship("AuctionBid", back_populates="buyer")
    transport_bookings = relationship("TransportBooking", back_populates="buyer", foreign_keys="[TransportBooking.buyer_id]")
    warehouse_bookings = relationship("WarehouseBooking", back_populates="user")


class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    lot_size = Column(String(100))
    base_price = Column(Float, nullable=False)
    field_video_url = Column(String(500))
    image_url = Column(String(500))
    description = Column(Text)
    location = Column(String(200))
    status = Column(SQLEnum(CropStatus), default=CropStatus.PENDING_VERIFICATION)
    verification_notes = Column(Text)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("User", back_populates="products", foreign_keys=[farmer_id])
    auction = relationship("Auction", back_populates="crop", uselist=False)
    escrow = relationship("EscrowPayment", back_populates="crop", uselist=False)


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crop_listings.id"), unique=True)
    scheduled_start = Column(DateTime(timezone=True), nullable=False)
    scheduled_end = Column(DateTime(timezone=True), nullable=False)
    slot_duration_minutes = Column(Integer, default=15)
    status = Column(SQLEnum(AuctionStatus), default=AuctionStatus.SCHEDULED)
    highest_bid = Column(Float, default=0)
    highest_bidder_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    base_price = Column(Float, nullable=False, default=0)
    lower_circuit_price = Column(Float, nullable=False, default=0)
    upper_circuit_price = Column(Float, nullable=False, default=0)
    timer_end = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    crop = relationship("CropListing", back_populates="auction")
    bids = relationship("AuctionBid", back_populates="auction")


class AuctionBid(Base):
    __tablename__ = "auction_bids"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    status = Column(SQLEnum(BidStatus), default=BidStatus.ACTIVE)
    auction_id = Column(Integer, ForeignKey("auctions.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    auction = relationship("Auction", back_populates="bids")
    buyer = relationship("User", back_populates="bids")


class EscrowPayment(Base):
    __tablename__ = "escrow_payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    status = Column(SQLEnum(EscrowStatus), default=EscrowStatus.HELD)
    crop_id = Column(Integer, ForeignKey("crop_listings.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    farmer_id = Column(Integer, ForeignKey("users.id"))
    released_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    crop = relationship("CropListing", back_populates="escrow")


class TransportBooking(Base):
    __tablename__ = "transport_bookings"

    id = Column(Integer, primary_key=True, index=True)
    pickup_location = Column(String(300), nullable=False)
    delivery_location = Column(String(300), nullable=False)
    vehicle_type = Column(String(100))
    estimated_cost = Column(Float)
    status = Column(SQLEnum(TransportStatus), default=TransportStatus.REQUESTED)
    crop_id = Column(Integer, ForeignKey("crop_listings.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    transporter_name = Column(String(200))
    transporter_phone = Column(String(15))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    buyer = relationship("User", back_populates="transport_bookings", foreign_keys=[buyer_id])


class WarehouseBooking(Base):
    __tablename__ = "warehouse_bookings"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_name = Column(String(200))
    location = Column(String(300))
    capacity_used = Column(Float)
    cost_per_day = Column(Float)
    status = Column(SQLEnum(WarehouseStatus), default=WarehouseStatus.REQUESTED)
    crop_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="warehouse_bookings")


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), nullable=False)
    otp_code = Column(String(6), nullable=False)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    commodity = Column(String(200), nullable=False, index=True)
    market = Column(String(200), nullable=False)
    state = Column(String(200), nullable=False, index=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QualityAssessment(Base):
    __tablename__ = "quality_assessments"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=True)
    quality_grade = Column(String(10), nullable=False)
    confidence_score = Column(Float, nullable=False)
    freshness = Column(String(50), nullable=False)
    detected_defects = Column(Text, default="[]")
    suggested_price_multiplier = Column(Float, default=1.0)
    image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
