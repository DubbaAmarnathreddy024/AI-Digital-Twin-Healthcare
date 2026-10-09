from digital_twin.patient_twin import PatientDigitalTwin
from database.twin_repository import TwinRepository


def test_repository():

    print("\n========== REPOSITORY TEST ==========")

    # ---------------------------------------------------------
    # 1. Create Digital Twin
    # ---------------------------------------------------------

    twin = PatientDigitalTwin(
        patient_id="P-DB-001",
        name="Database Test Patient",
        age=45,
        sex=1
    )

    print("✓ Digital Twin created")

    # ---------------------------------------------------------
    # 2. Add Clinical Data
    # ---------------------------------------------------------

    twin.update_clinical_data(
        cp=3,
        trestbps=130,
        chol=220,
        fbs=0,
        restecg=0,
        thalach=160,
        exang=0,
        oldpeak=1.0,
        slope=2,
        ca=0,
        thal=3
    )

    print("✓ Clinical data added")

    # ---------------------------------------------------------
    # 3. Add Wearable Data
    # ---------------------------------------------------------

    twin.update_wearable_data(
        heart_rate=83,
        spo2=97,
        steps=5271,
        sleep_hours=8.2,
        calories=1723
    )

    print("✓ Wearable data added")

    # ---------------------------------------------------------
    # 4. Create Repository
    # ---------------------------------------------------------

    repository = TwinRepository()

    try:

        # -----------------------------------------------------
        # 5. Save Patient + Digital Twin
        # -----------------------------------------------------

        patient = repository.create_patient(twin)

        print("✓ Patient saved to PostgreSQL")
        print(f"  Patient ID : {patient.patient_id}")
        print(f"  Database ID: {patient.id}")

        # -----------------------------------------------------
        # 6. Save Clinical Data
        # -----------------------------------------------------

        repository.save_clinical_data(
            patient.id,
            twin.clinical_data
        )

        print("✓ Clinical data saved")

        # -----------------------------------------------------
        # 7. Save Wearable Data
        # -----------------------------------------------------

        repository.save_wearable_data(
            patient.id,
            twin.wearable_data
        )

        print("✓ Wearable data saved")

        # -----------------------------------------------------
        # 8. Save AI Prediction
        # -----------------------------------------------------

        prediction = {
            "prediction": 0,
            "probability": 0.0962,
            "risk_level": "Low"
        }

        repository.save_prediction(
            patient.id,
            "Heart Disease",
            prediction
        )

        print("✓ AI prediction saved")

        # -----------------------------------------------------
        # 9. Save Health Snapshot
        # -----------------------------------------------------

        repository.save_snapshot(
            patient.id,
            clinical_data=twin.clinical_data,
            wearable_data=twin.wearable_data,
            ai_predictions=prediction
        )

        print("✓ Health snapshot saved")

        # -----------------------------------------------------
        # 10. Commit
        # -----------------------------------------------------

        repository.commit()

        print("\n====================================")
        print("DATABASE REPOSITORY TEST: SUCCESS")
        print("====================================")

    except Exception as e:

        repository.rollback()

        print("\n====================================")
        print("DATABASE REPOSITORY TEST: FAILED")
        print("====================================")
        print(f"Error: {e}")

    finally:

        repository.close()


if __name__ == "__main__":
    test_repository()