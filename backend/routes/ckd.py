
from pathlib import Path
from functools import lru_cache
import logging

import joblib
import numpy as np
import pandas as pd

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy.orm import Session
from backend.database import get_db
from database.models import User
from backend.routes.prediction_history import get_current_patient, save_prediction

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/predictions",
    tags=["CKD Prediction"],
)

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = (
    ROOT
    / "backend"
    / "ml_models"
    / "ckd"
    / "ckd_pipeline.joblib"
)


class CKDInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Numerical measurements
    age: float | None = Field(default=None, ge=0, le=120)
    bp: float | None = Field(default=None, ge=0, le=300)
    sg: float | None = Field(default=None, ge=0, le=2)
    al: float | None = Field(default=None, ge=0, le=10)
    su: float | None = Field(default=None, ge=0, le=10)
    bgr: float | None = Field(default=None, ge=0, le=2000)
    bu: float | None = Field(default=None, ge=0, le=1000)
    sc: float | None = Field(default=None, ge=0, le=100)
    sod: float | None = Field(default=None, ge=0, le=250)
    pot: float | None = Field(default=None, ge=0, le=30)
    hemo: float | None = Field(default=None, ge=0, le=30)
    pcv: float | None = Field(default=None, ge=0, le=100)
    wbcc: float | None = Field(default=None, ge=0, le=200000)
    rbcc: float | None = Field(default=None, ge=0, le=20)

    # Categorical measurements
    rbc: str | None = None
    pc: str | None = None
    pcc: str | None = None
    ba: str | None = None
    htn: str | None = None
    dm: str | None = None
    cad: str | None = None
    appet: str | None = None
    pe: str | None = None
    ane: str | None = None

    @model_validator(mode="after")
    def validate_at_least_one_value(self):
        if all(value is None for value in self.model_dump().values()):
            raise ValueError("Provide at least one CKD feature.")
        return self


@lru_cache(maxsize=1)
def load_artifact():
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"CKD model not found at {MODEL_PATH}. "
            "Run ml/ckd/train_ckd.py first."
        )

    artifact = joblib.load(MODEL_PATH)

    required_keys = {"pipeline", "features", "model_name"}
    if not required_keys.issubset(artifact):
        raise RuntimeError("CKD model artifact has an invalid structure.")

    return artifact


@router.post("/ckd")
def predict_ckd(
    data: CKDInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
):
    try:
        artifact = load_artifact()
        pipeline = artifact["pipeline"]
        features = artifact["features"]

        values = data.model_dump()

        missing = [
            name for name in features
            if name not in values
        ]

        if missing:
            raise HTTPException(
                status_code=500,
                detail=f"API is missing model inputs: {missing}",
            )

        # Normalize categorical values to match training preprocessing.
        categorical_features = artifact.get(
            "categorical_features", []
        )

        for name in categorical_features:
            value = values[name]
            if isinstance(value, str):
                values[name] = value.strip().lower() or np.nan

        input_df = pd.DataFrame(
            [[values[name] for name in features]],
            columns=features,
        )

        probability = float(
            pipeline.predict_proba(input_df)[0][1]
        )

        # Illustrative prototype bands, not clinical thresholds.
        if probability < 0.30:
            risk_band = "Low"
        elif probability < 0.70:
            risk_band = "Moderate"
        else:
            risk_band = "High"

        save_prediction(
            db=db,
            user=user,
            disease="CKD",
            prediction=int(probability >= 0.5),
            probability=probability,
            risk_level=risk_band,
        )

        return {
            "condition": "CKD risk estimation",
            "model": artifact["model_name"],
            "risk_score": round(probability, 4),
            "risk_percentage": round(probability * 100, 2),
            "risk_band": risk_band,
            "disclaimer": (
                "Research prototype only. This result is not a "
                "diagnosis and must not guide treatment. The model "
                "has not been clinically validated. Consult a "
                "qualified healthcare professional."
            ),
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("CKD prediction failed")
        raise HTTPException(
            status_code=500,
            detail=(
                "CKD prediction failed. Check the model artifact "
                "and server logs."
            ),
        )
