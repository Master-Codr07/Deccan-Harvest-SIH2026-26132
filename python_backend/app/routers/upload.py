import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from ..auth import get_current_user
from ..models.models import User
from ..config import UPLOAD_DIR

router = APIRouter(prefix="/api/upload", tags=["upload"])

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP allowed")

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"url": f"/uploads/{filename}", "filename": filename}
