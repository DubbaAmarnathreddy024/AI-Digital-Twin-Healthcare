from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db

from database.models import (
    Patient,
    WearableReading,
    Alert,
)


router = APIRouter(
    prefix="/monitoring",
    tags=["Health Monitoring"]
)


# =========================================================
# GET MONITORING DATA
# =========================================================

@router.get("/{patient_id}")
def get_monitoring_data(
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
    # Get latest wearable readings
    # -----------------------------------------------------

    wearable_records = (
        db.query(WearableReading)
        .filter(
            WearableReading.patient_id == patient.id
        )
        .order_by(
            WearableReading.id.desc()
        )
        .limit(20)
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
    # Get latest alerts
    # -----------------------------------------------------

    alert_records = (
        db.query(Alert)
        .filter(
            Alert.patient_id == patient.id
        )
        .order_by(
            Alert.id.desc()
        )
        .limit(20)
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
    # Latest wearable reading
    # -----------------------------------------------------

    latest_reading = None

    if wearable_records:

        latest = wearable_records[0]

        latest_reading = {
            "heart_rate": latest.heart_rate,
            "spo2": latest.spo2,
            "steps": latest.steps,
            "sleep_hours": latest.sleep_hours,
            "calories": latest.calories
        }

    # -----------------------------------------------------
    # Final response
    # -----------------------------------------------------

    return {
        "status": "success",

        "patient": {
            "patient_id": patient.patient_id,
            "name": patient.name
        },

        "latest_reading": latest_reading,

        "wearable_history": wearable_data,

        "alerts": alerts,

        "alert_count": len(alerts),

        "monitoring_status": (
            "alerts_present"
            if alerts
            else "normal"
        )
    }