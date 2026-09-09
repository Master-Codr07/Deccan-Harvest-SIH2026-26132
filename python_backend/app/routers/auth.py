from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import timedelta, datetime, timezone
import random
import string

from ..database import get_db
from ..models.models import User, UserRole, OTPVerification
from ..schemas.schemas import UserCreate, UserResponse, LoginRequest, Token, OTPRequest, OTPVerify
from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ..services.kyc_service import validate_ration_card

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == user.email) | (User.phone == user.phone)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or phone already registered")

    ration_verified = False
    if user.role == "farmer" and user.ration_card_number:
        kyc_result = validate_ration_card(user.ration_card_number)
        if not kyc_result["valid"]:
            raise HTTPException(status_code=400, detail=kyc_result["error"])
        ration_verified = kyc_result.get("head_of_household") is not None

    db_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        hashed_password=pwd_context.hash(user.password),
        role=UserRole(user.role),
        location=user.location,
        ration_card_number=user.ration_card_number,
        ration_card_verified=ration_verified,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token({"sub": str(db_user.id), "role": db_user.role.value})
    return Token(access_token=token, token_type="bearer", user=db_user)


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return Token(access_token=token, token_type="bearer", user=user)


@router.post("/otp/send")
def send_otp(req: OTPRequest, db: Session = Depends(get_db)):
    otp_code = "".join(random.choices(string.digits, k=6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    otp_record = OTPVerification(
        phone=req.phone,
        otp_code=otp_code,
        expires_at=expires_at,
    )
    db.add(otp_record)
    db.commit()

    return {"message": f"OTP sent to {req.phone}", "otp_debug": otp_code}


@router.post("/otp/verify")
def verify_otp(req: OTPVerify, db: Session = Depends(get_db)):
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.phone == req.phone,
        OTPVerification.otp_code == req.otp,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.now(timezone.utc),
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp_record.is_used = True
    db.commit()

    user = db.query(User).filter(User.phone == req.phone).first()
    if user:
        user.is_verified = True
        db.commit()

    return {"message": "OTP verified successfully", "verified": True}


@router.post("/verify-ration-card")
def verify_ration_card_endpoint(card_number: str):
    """Verify a Maharashtra ration card against PDS/NFSA standards."""
    result = validate_ration_card(card_number)
    if not result["valid"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
