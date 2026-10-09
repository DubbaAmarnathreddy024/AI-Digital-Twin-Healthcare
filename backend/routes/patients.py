from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from database.models import Patient


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


# =========================================================
# GET ALL PATIENTS
# =========================================================

@router.get("/")
def get_patients(
    db: Session = Depends(get_db)
):

    patients = db.query(Patient).all()

    return {
        "count": len(patients),
        "patients": [
            {
                "id": patient.id,
                "patient_id": patient.patient_id,
                "name": patient.name,
                "age": patient.age,
                "sex": patient.sex
            }
            for patient in patients
        ]
    }


# =========================================================
# GET PATIENT BY ID
# =========================================================

@router.get("/{patient_id}")
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db)
):

    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return {
        "id": patient.id,
        "patient_id": patient.patient_id,
        "name": patient.name,
        "age": patient.age,
        "sex": patient.sex
    }