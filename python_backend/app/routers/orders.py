from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import Order, OrderItem, OrderStatus, User
from ..schemas.schemas import OrderCreate, OrderResponse
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Order).filter(Order.buyer_id == user_id).order_by(Order.created_at.desc()).all()


@router.post("/", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("buyer")),
):
    total = sum(item["price"] * item["quantity"] for item in order.items)

    db_order = Order(
        total_amount=total,
        delivery_address=order.delivery_address,
        buyer_id=current_user.id,
    )
    db.add(db_order)
    db.flush()

    for item in order.items:
        db_item = OrderItem(
            quantity=item["quantity"],
            price=item["price"],
            order_id=db_order.id,
            product_id=item["product_id"],
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_order)
    return db_order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status: OrderStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role.value != "admin" and current_user.id != order.buyer_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    order.status = status
    db.commit()
    db.refresh(order)
    return order
