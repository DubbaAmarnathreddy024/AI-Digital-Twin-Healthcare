
from pathlib import Path
from functools import lru_cache

import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.database import get_db
from database.models import User
from backend.routes.prediction_history import get_current_patient, save_prediction

router = APIRouter(
    prefix="/predictions",
    tags=["Diabetes Prediction"],
)

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = (
    ROOT
    / "backend"
    / "ml_models"
    / "diabetes"
    / "diabetes_pipeline.joblib"
)


class DiabetesInput(BaseModel):
    pregnancies: int = Field(ge=0, le=30)
    glucose: float = Field(gt=0, le=500)
    bloodpressure: float = Field(gt=0, le=300)
    skinthickness: float = Field(ge=0, le=150)
    insulin: float = Field(ge=0, le=3000)
    bmi: float = Field(gt=0, le=150)
    diabetespedigreefunction: float = Field(ge=0, le=10)
    age: int = Field(ge=18, le=120)


@lru_cache(maxsize=1)
def load_artifact():
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Diabetes model not found at {MODEL_PATH}. "
            "Run ml/diabetes/train_diabetes.py first."
        )

    return joblib.load(MODEL_PATH)


@router.post("/diabetes")
def predict_diabetes(
    data: DiabetesInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
):
    try:
        artifact = load_artifact()
        pipeline = artifact["pipeline"]
        features = artifact["features"]

        values = data.model_dump()
        missing = [name for name in features if name not in values]

        if missing:
            raise HTTPException(
                status_code=500,
                detail=f"API is missing model inputs: {missing}",
            )

        input_df = pd.DataFrame(
            [[values[name] for name in features]],
            columns=features,
        )

        probability = float(
            pipeline.predict_proba(input_df)[0][1]
        )

        # These bands are prototype conventions, not validated
        # medical thresholds.
        if probability < 0.30:
            risk_band = "Low"
        elif probability < 0.70:
            risk_band = "Moderate"
        else:
            risk_band = "High"

        save_prediction(
            db=db,
            user=user,
            disease="Diabetes",
            prediction=int(probability >= 0.5),
            probability=probability,
            risk_level=risk_band,
        )

        return {
            "condition": "Diabetes risk estimation",
            "model": artifact["model_name"],
            "risk_score": round(probability, 4),
            "risk_percentage": round(probability * 100, 2),
            "risk_band": risk_band,
            "disclaimer": (
                "Research prototype only. This score is not a "
                "diagnosis and must not guide treatment. "
                "Consult a qualified healthcare professional."
            ),
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Diabetes prediction failed. Check the model artifact and server logs.",
        )
