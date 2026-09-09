from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    role: str = "buyer"
    location: Optional[str] = None
    ration_card_number: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    location: Optional[str]
    wallet_balance: float
    is_verified: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str


class CropListingCreate(BaseModel):
    crop_name: str
    quantity: float
    unit: str = "kg"
    lot_size: Optional[str] = None
    base_price: float
    field_video_url: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None


class CropListingResponse(BaseModel):
    id: int
    crop_name: str
    quantity: float
    unit: str
    lot_size: Optional[str]
    base_price: float
    field_video_url: Optional[str]
    image_url: Optional[str]
    description: Optional[str]
    location: Optional[str]
    status: str
    verification_notes: Optional[str]
    farmer_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class AuctionCreate(BaseModel):
    crop_id: int
    scheduled_start: datetime
    scheduled_end: datetime
    slot_duration_minutes: int = 15


class AuctionResponse(BaseModel):
    id: int
    crop_id: int
    scheduled_start: datetime
    scheduled_end: datetime
    slot_duration_minutes: int
    status: str
    highest_bid: float
    highest_bidder_id: Optional[int]
    base_price: float
    lower_circuit_price: float
    upper_circuit_price: float
    timer_end: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AuctionBidCreate(BaseModel):
    amount: float


class AuctionBidResponse(BaseModel):
    id: int
    amount: float
    status: str
    auction_id: int
    buyer_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AuctionLiveResponse(BaseModel):
    auction_id: int
    crop_id: int
    crop_name: str
    quantity: float
    unit: str
    lot_size: Optional[str]
    base_price: float
    location: Optional[str]
    image_url: Optional[str]
    farmer_name: str
    farmer_id: int
    status: str
    highest_bid: float
    lower_circuit_price: float
    timer_end: Optional[datetime]
    scheduled_start: datetime
    scheduled_end: datetime


class TransportCreate(BaseModel):
    pickup_location: str
    delivery_location: str
    vehicle_type: Optional[str] = "truck"
    crop_id: int


class TransportResponse(BaseModel):
    id: int
    pickup_location: str
    delivery_location: str
    vehicle_type: Optional[str]
    estimated_cost: Optional[float]
    status: str
    crop_id: int
    buyer_id: int
    transporter_name: Optional[str]
    transporter_phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class WarehouseCreate(BaseModel):
    warehouse_name: str
    location: str
    capacity_used: float
    cost_per_day: float
    crop_id: Optional[int] = None


class WarehouseResponse(BaseModel):
    id: int
    warehouse_name: str
    location: str
    capacity_used: float
    cost_per_day: float
    status: str
    crop_id: int
    user_id: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class EscrowResponse(BaseModel):
    id: int
    amount: float
    status: str
    crop_id: int
    buyer_id: int
    farmer_id: int
    released_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_farmers: int
    total_dealers: int
    total_crops: int
    total_auctions: int
    total_value: float
    crops_pending: int
    crops_verified: int


class MarketPriceResponse(BaseModel):
    id: int
    commodity: str
    market: str
    state: str
    min_price: float
    max_price: float
    modal_price: float
    updated_at: datetime

    class Config:
        from_attributes = True


class QualityAssessmentResponse(BaseModel):
    quality_grade: str
    confidence_score: float
    freshness: str
    detected_defects: List[str]
    suggested_price_multiplier: float
