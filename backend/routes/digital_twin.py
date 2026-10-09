from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db

from database.models import (
    Patient,
    DigitalTwin,
    ClinicalData,
    WearableReading,
    Prediction,
    Alert,
    HealthSnapshot,
)


router = APIRouter(
    prefix="/digital-twin",
    tags=["Digital Twin"]
)


# =========================================================
# GET COMPLETE DIGITAL TWIN
# =========================================================

@router.get("/{patient_id}")
def get_digital_twin(
    patient_id: str,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Find patient
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Digital Twin
    # -----------------------------------------------------

    digital_twin = (
        db.query(DigitalTwin)
        .filter(DigitalTwin.patient_id == patient.id)
        .first()
    )

    # -----------------------------------------------------
    # Clinical Data
    # -----------------------------------------------------

    clinical_records = (
        db.query(ClinicalData)
        .filter(ClinicalData.patient_id == patient.id)
        .order_by(ClinicalData.id.desc())
        .all()
    )

    clinical_data = None

    if clinical_records:

        clinical = clinical_records[0]

        clinical_data = {
            "cp": clinical.cp,
            "trestbps": clinical.trestbps,
            "chol": clinical.chol,
            "fbs": clinical.fbs,
            "restecg": clinical.restecg,
            "thalach": clinical.thalach,
            "exang": clinical.exang,
            "oldpeak": clinical.oldpeak,
            "slope": clinical.slope,
            "ca": clinical.ca,
            "thal": clinical.thal
        }

    # -----------------------------------------------------
    # Wearable Data
    # -----------------------------------------------------

    wearable_records = (
        db.query(WearableReading)
        .filter(WearableReading.patient_id == patient.id)
        .order_by(WearableReading.id.desc())
        .limit(10)
        .all()
    )

    wearable_data = []

    for reading in wearable_records:

        wearable_data.append({
            "heart_rate": reading.heart_rate,
            "spo2": reading.spo2,
            "steps": reading.steps,
            "sleep_hours": reading.sleep_hours,
            "calories": reading.calories
        })

    # -----------------------------------------------------
    # AI Predictions
    # -----------------------------------------------------

    prediction_records = (
        db.query(Prediction)
        .filter(Prediction.patient_id == patient.id)
        .order_by(Prediction.id.desc())
        .limit(10)
        .all()
    )

    predictions = []

    for prediction in prediction_records:

        predictions.append({
            "disease": prediction.disease,
            "prediction": prediction.prediction,
            "probability": prediction.probability,
            "risk_level": prediction.risk_level
        })

    # -----------------------------------------------------
    # Alerts
    # -----------------------------------------------------

    alert_records = (
        db.query(Alert)
        .filter(Alert.patient_id == patient.id)
        .order_by(Alert.id.desc())
        .limit(10)
        .all()
    )

    alerts = []

    for alert in alert_records:

        alerts.append({
            "type": alert.alert_type,
            "message": alert.message,
            "value": alert.value,
            "severity": alert.severity
        })

    # -----------------------------------------------------
    # Health Snapshots
    # -----------------------------------------------------

    snapshot_records = (
        db.query(HealthSnapshot)
        .filter(HealthSnapshot.patient_id == patient.id)
        .order_by(HealthSnapshot.id.desc())
        .limit(10)
        .all()
    )

    snapshots = []

    for snapshot in snapshot_records:

        snapshots.append({
            "clinical_data": snapshot.clinical_data,
            "wearable_data": snapshot.wearable_data,
            "lab_results": snapshot.lab_results,
            "ai_predictions": snapshot.ai_predictions
        })

    # -----------------------------------------------------
    # FINAL DIGITAL TWIN RESPONSE
    # -----------------------------------------------------

    return {

        "status": "success",

        "patient": {
            "id": patient.id,
            "patient_id": patient.patient_id,
            "name": patient.name,
            "age": patient.age,
            "sex": patient.sex
        },

        "digital_twin": {
            "database_id": digital_twin.id
            if digital_twin else None
        },

        "clinical_data": clinical_data,

        "wearable_data": wearable_data,

        "predictions": predictions,

        "alerts": alerts,

        "health_snapshots": snapshots
    }