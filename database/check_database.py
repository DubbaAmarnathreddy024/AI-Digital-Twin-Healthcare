from database.connection import SessionLocal

from database.models import (
    Patient,
    DigitalTwin,
    ClinicalData,
    WearableReading,
    Prediction,
    Alert,
    HealthSnapshot,
)


def main():

    db = SessionLocal()

    try:

        print("\n")
        print("======================================================")
        print("          AI HEALTHCARE DATABASE VERIFICATION")
        print("======================================================")

        # =====================================================
        # 1. PATIENTS
        # =====================================================

        patients = db.query(Patient).all()

        print("\n[1] PATIENTS")
        print(f"    Total patients: {len(patients)}")

        for patient in patients:

            print(
                f"    ID={patient.id} | "
                f"Patient ID={patient.patient_id} | "
                f"Name={patient.name} | "
                f"Age={patient.age} | "
                f"Sex={patient.sex}"
            )

        # =====================================================
        # 2. DIGITAL TWINS
        # =====================================================

        twins = db.query(DigitalTwin).all()

        print("\n[2] DIGITAL TWINS")
        print(f"    Total digital twins: {len(twins)}")

        for twin in twins:

            print(
                f"    ID={twin.id} | "
                f"Patient ID={twin.patient_id}"
            )

        # =====================================================
        # 3. CLINICAL DATA
        # =====================================================

        clinical = db.query(ClinicalData).all()

        print("\n[3] CLINICAL DATA")
        print(f"    Total records: {len(clinical)}")

        for data in clinical:

            print(
                f"    Patient={data.patient_id} | "
                f"CP={data.cp} | "
                f"BP={data.trestbps} | "
                f"Chol={data.chol} | "
                f"Max HR={data.thalach}"
            )

        # =====================================================
        # 4. WEARABLE DATA
        # =====================================================

        wearable = db.query(WearableReading).all()

        print("\n[4] WEARABLE READINGS")
        print(f"    Total readings: {len(wearable)}")

        for reading in wearable[-10:]:

            print(
                f"    Patient={reading.patient_id} | "
                f"HR={reading.heart_rate} | "
                f"SpO2={reading.spo2} | "
                f"Steps={reading.steps} | "
                f"Sleep={reading.sleep_hours}"
            )

        # =====================================================
        # 5. AI PREDICTIONS
        # =====================================================

        predictions = db.query(Prediction).all()

        print("\n[5] AI PREDICTIONS")
        print(f"    Total predictions: {len(predictions)}")

        for prediction in predictions:

            probability = prediction.probability

            if probability is not None:

                print(
                    f"    Patient={prediction.patient_id} | "
                    f"Disease={prediction.disease} | "
                    f"Prediction={prediction.prediction} | "
                    f"Probability={probability:.4f} | "
                    f"Risk={prediction.risk_level}"
                )

            else:

                print(
                    f"    Patient={prediction.patient_id} | "
                    f"Disease={prediction.disease} | "
                    f"Prediction={prediction.prediction} | "
                    f"Risk={prediction.risk_level}"
                )

        # =====================================================
        # 6. ALERTS
        # =====================================================

        alerts = db.query(Alert).all()

        print("\n[6] ALERTS")
        print(f"    Total alerts: {len(alerts)}")

        for alert in alerts[-10:]:

            print(
                f"    Patient={alert.patient_id} | "
                f"Type={alert.alert_type} | "
                f"Severity={alert.severity} | "
                f"Message={alert.message}"
            )

        # =====================================================
        # 7. HEALTH SNAPSHOTS
        # =====================================================

        snapshots = db.query(HealthSnapshot).all()

        print("\n[7] HEALTH SNAPSHOTS")
        print(f"    Total snapshots: {len(snapshots)}")

        # =====================================================
        # FINAL SUMMARY
        # =====================================================

        print("\n======================================================")
        print("              DATABASE VERIFICATION")
        print("======================================================")

        print(f"Patients          : {len(patients)}")
        print(f"Digital Twins     : {len(twins)}")
        print(f"Clinical Records  : {len(clinical)}")
        print(f"Wearable Readings : {len(wearable)}")
        print(f"AI Predictions    : {len(predictions)}")
        print(f"Alerts            : {len(alerts)}")
        print(f"Health Snapshots  : {len(snapshots)}")

        print("\nDatabase Status: SUCCESS")

        print("======================================================")

    except Exception as e:

        print("\n======================================================")
        print("           DATABASE VERIFICATION FAILED")
        print("======================================================")

        print(f"Error: {e}")

        print("======================================================")

    finally:

        db.close()


if __name__ == "__main__":
    main()