from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth import decode_access_token
from database.models import User, Prediction

router = APIRouter(prefix="/predictions", tags=["Prediction History"])
security = HTTPBearer(auto_error=False)


def get_current_patient(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the patient from a verified JWT and the live database row."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")
        user_id = int(subject)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Account not found")
    if user.role != "patient" or user.patient is None:
        raise HTTPException(
            status_code=403,
            detail="Prediction history is available to patient accounts only",
        )
    return user


def serialize_prediction(item: Prediction) -> dict:
    probability = item.probability
    if isinstance(probability, Decimal):
        probability = float(probability)
    return {
        "id": item.id,
        "disease": item.disease,
        "prediction": item.prediction,
        "probability": probability,
        "risk_level": item.risk_level,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


@router.get("/history")
def prediction_history(
    disease: Optional[str] = Query(default=None, max_length=100),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    query = db.query(Prediction).filter(
        Prediction.patient_id == user.patient_id
    )
    if disease:
        query = query.filter(Prediction.disease.ilike(disease.strip()))
    total = query.count()
    rows = (
        query.order_by(Prediction.created_at.desc(), Prediction.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "items": [serialize_prediction(row) for row in rows],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/compare")
def compare_predictions(
    user: User = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    """Summarize each condition separately; scores across diseases aren't comparable."""
    rows = (
        db.query(Prediction)
        .filter(Prediction.patient_id == user.patient_id)
        .order_by(Prediction.created_at.asc(), Prediction.id.asc())
        .all()
    )
    groups = {}
    for row in rows:
        group = groups.setdefault(row.disease, [])
        group.append(serialize_prediction(row))

    summary = []
    for disease, entries in groups.items():
        scored = [e for e in entries if e["probability"] is not None]
        latest = scored[-1] if scored else (entries[-1] if entries else None)
        previous = scored[-2] if len(scored) > 1 else None
        delta = None
        if latest and previous:
            delta = round(latest["probability"] - previous["probability"], 4)
        summary.append({
            "disease": disease,
            "count": len(entries),
            "latest": latest,
            "previous": previous,
            "change_since_previous": delta,
            "history": entries[-20:],
        })
    summary.sort(key=lambda item: item["disease"].lower())
    return {
        "conditions": summary,
        "disclaimer": (
            "Research prototype only. Predictions are not diagnoses. "
            "Compare only repeated results for the same condition; changes "
            "may reflect model limitations or input differences and do not "
            "establish clinical improvement or deterioration."
        ),
    }


def save_prediction(
    db: Session,
    user: User,
    disease: str,
    prediction: int,
    probability: float,
    risk_level: str,
) -> None:
    """Persist a result to the authenticated user's linked patient record."""
    if user.role != "patient" or user.patient is None:
        raise HTTPException(status_code=403, detail="Patient account required")
    try:
        row = Prediction(
            patient_id=user.patient_id,
            disease=disease,
            prediction=int(prediction),
            probability=max(0.0, min(1.0, float(probability))),
            risk_level=str(risk_level)[:20],
        )
        db.add(row)
        db.commit()
    except Exception:
        db.rollback()
        raise
