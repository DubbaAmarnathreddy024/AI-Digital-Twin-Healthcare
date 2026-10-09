from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth import (
    verify_password,
    create_access_token,
    decode_access_token,
)
from database.models import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

security = HTTPBearer()


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Authenticate a patient or doctor and return a JWT token.
    """

    user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    # Invalid username
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # Invalid password
    if not verify_password(
        password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # ========================================================
    # PATIENT LOGIN
    # ========================================================

    if user.role == "patient":

        patient = user.patient

        if not patient:
            raise HTTPException(
                status_code=401,
                detail="Patient account is not linked"
            )

        token = create_access_token(
            user_id=user.id,
            username=user.username,
            patient_id=patient.patient_id,
            role=user.role,
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "patient_id": patient.patient_id,
                "role": user.role,
                "name": patient.name,
            }
        }

    # ========================================================
    # DOCTOR LOGIN
    # ========================================================

    if user.role == "doctor":

        token = create_access_token(
            user_id=user.id,
            username=user.username,
            patient_id=None,
            role=user.role,
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "patient_id": None,
                "role": user.role,
                "name": "Doctor",
            }
        }

    # ========================================================
    # UNKNOWN ROLE
    # ========================================================

    raise HTTPException(
        status_code=403,
        detail="Unsupported user role"
    )


# ============================================================
# CURRENT USER
# ============================================================

@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Return the currently authenticated patient or doctor.
    """

    token = credentials.credentials

    try:
        payload = decode_access_token(token)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    # ========================================================
    # PATIENT
    # ========================================================

    if user.role == "patient":

        patient = user.patient

        if not patient:
            raise HTTPException(
                status_code=401,
                detail="Patient not found"
            )

        return {
            "id": user.id,
            "username": user.username,
            "patient_id": patient.patient_id,
            "role": user.role,
            "name": patient.name,
        }

    # ========================================================
    # DOCTOR
    # ========================================================

    if user.role == "doctor":

        return {
            "id": user.id,
            "username": user.username,
            "patient_id": None,
            "role": user.role,
            "name": "Doctor",
        }

    # ========================================================
    # UNKNOWN ROLE
    # ========================================================

    raise HTTPException(
        status_code=403,
        detail="Unsupported user role"
    )