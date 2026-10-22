from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from database.models import User
from backend.routes.prediction_history import get_current_patient, save_prediction

from ml.predict_heart_disease import predict_heart_disease


router = APIRouter(
    prefix="/predict",
    tags=["AI Prediction"]
)


class HeartDiseaseInput(BaseModel):

    age: int
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: float
    thal: float


@router.post("/heart-disease")
def predict_heart_disease_api(
    patient: HeartDiseaseInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
):

    try:

        patient_data = patient.model_dump()

        result = predict_heart_disease(
            patient_data
        )

        save_prediction(
            db=db,
            user=user,
            disease="Heart Disease",
            prediction=int(result["prediction"]),
            probability=float(result["probability"]),
            risk_level=str(result["risk_level"]),
        )

        return {
            "status": "success",
            "prediction": result["prediction"],
            "probability": result["probability"],
            "risk_level": result["risk_level"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )