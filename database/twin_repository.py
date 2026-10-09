from database.connection import SessionLocal

from database.models import (
    Patient,
    DigitalTwin,
    ClinicalData,
    WearableReading,
    Prediction,
    Explanation,
    Alert,
    HealthSnapshot,
)


class TwinRepository:

    def __init__(self):
        self.db = SessionLocal()

    # =========================================================
    # FIND PATIENT
    # =========================================================

    def get_patient_by_id(self, patient_id):
        return (
            self.db.query(Patient)
            .filter(Patient.patient_id == patient_id)
            .first()
        )

    # =========================================================
    # CREATE PATIENT + DIGITAL TWIN
    # =========================================================

    def create_patient(self, twin):

        patient = Patient(
            patient_id=twin.patient_id,
            name=twin.name,
            age=twin.demographics.get("age"),
            sex=twin.demographics.get("sex"),
        )

        self.db.add(patient)
        self.db.flush()

        digital_twin = DigitalTwin(
            patient_id=patient.id,
            twin_id=twin.patient_id,
        )

        self.db.add(digital_twin)
        self.db.flush()

        return patient

    # =========================================================
    # SAVE CLINICAL DATA
    # =========================================================

    def save_clinical_data(self, patient_id, clinical_data):

        data = ClinicalData(
            patient_id=patient_id,
            cp=clinical_data.get("cp"),
            trestbps=clinical_data.get("trestbps"),
            chol=clinical_data.get("chol"),
            fbs=clinical_data.get("fbs"),
            restecg=clinical_data.get("restecg"),
            thalach=clinical_data.get("thalach"),
            exang=clinical_data.get("exang"),
            oldpeak=clinical_data.get("oldpeak"),
            slope=clinical_data.get("slope"),
            ca=clinical_data.get("ca"),
            thal=clinical_data.get("thal"),
        )

        self.db.add(data)
        self.db.flush()

        return data

    # =========================================================
    # SAVE WEARABLE DATA
    # =========================================================

    def save_wearable_data(self, patient_id, wearable_data):
        patient = self.get_patient_by_id(patient_id)

        if not patient:
            raise ValueError(
            f"Patient not found: {patient_id}"
        )

        wearable = WearableReading(
        patient_id=patient.id,
        heart_rate=wearable_data.get("heart_rate"),
        spo2=wearable_data.get("spo2"),
        steps=wearable_data.get("steps"),
        sleep_hours=wearable_data.get("sleep_hours"),
        calories=wearable_data.get("calories"),
    )

        self.db.add(wearable)
        self.db.flush()

        return wearable

    # =========================================================
    # SAVE AI PREDICTION
    # =========================================================

    def save_prediction(self, patient_id, disease, prediction):

        record = Prediction(
            patient_id=patient_id,
            disease=disease,
            prediction=prediction.get("prediction"),
            probability=prediction.get("probability"),
            risk_level=prediction.get("risk_level"),
        )

        self.db.add(record)
        self.db.flush()

        return record

    # =========================================================
    # SAVE SHAP EXPLANATION
    # =========================================================

    def save_explanation(
        self,
        patient_id,
        feature,
        importance,
        explanation_text=None,
    ):

        record = Explanation(
            patient_id=patient_id,
            feature=feature,
            importance=importance,
            explanation=explanation_text,
        )

        self.db.add(record)
        self.db.flush()

        return record

    # =========================================================
    # SAVE ALERT
    # =========================================================

    def save_alert(
        self,
        patient_id,
        alert_type,
        message,
        value=None,
        severity="warning",
    ):

        record = Alert(
            patient_id=patient_id,
            alert_type=alert_type,
            message=message,
            value=value,
            severity=severity,
        )

        self.db.add(record)
        self.db.flush()

        return record

    # =========================================================
    # SAVE HEALTH SNAPSHOT
    # =========================================================

    def save_snapshot(
    self,
    patient_id,
    clinical_data=None,
    wearable_data=None,
    lab_results=None,
    ai_predictions=None
):
        patient = self.get_patient_by_id(patient_id)

        if not patient:
            raise ValueError(
            f"Patient not found: {patient_id}"
        )

        snapshot = HealthSnapshot(
        patient_id=patient.id,
        clinical_data=clinical_data,
        wearable_data=wearable_data,
        lab_results=lab_results,
        ai_predictions=ai_predictions
    )

        self.db.add(snapshot)
        self.db.flush()

        return snapshot

    # =========================================================
    # COMMIT
    # =========================================================

    def commit(self):
        self.db.commit()

    # =========================================================
    # ROLLBACK
    # =========================================================

    def rollback(self):
        self.db.rollback()

    # =========================================================
    # CLOSE
    # =========================================================

    def close(self):
        self.db.close()