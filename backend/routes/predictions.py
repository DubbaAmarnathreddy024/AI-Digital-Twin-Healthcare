from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
    patient: HeartDiseaseInput
):

    try:

        patient_data = patient.model_dump()

        result = predict_heart_disease(
            patient_data
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