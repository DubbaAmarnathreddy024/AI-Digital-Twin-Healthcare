from database.connection import SessionLocal
from database.models import Patient, DigitalTwin


def test_crud():
    db = SessionLocal()

    try:
        print("\n========== DATABASE CRUD TEST ==========")

        # ------------------------------------------------
        # 1. Create a patient
        # ------------------------------------------------
        patient = Patient(
            patient_id="P001",
            name="Test Patient",
            age=45,
            sex=1
        )

        db.add(patient)
        db.commit()
        db.refresh(patient)

        print("\n✓ Patient created")
        print(f"  Database ID : {patient.id}")
        print(f"  Patient ID  : {patient.patient_id}")
        print(f"  Name        : {patient.name}")

        # ------------------------------------------------
        # 2. Create Digital Twin
        # ------------------------------------------------
        twin = DigitalTwin(
            patient_id=patient.id,
            twin_status="active"
        )

        db.add(twin)
        db.commit()
        db.refresh(twin)

        print("\n✓ Digital Twin created")
        print(f"  Twin ID     : {twin.id}")
        print(f"  Status      : {twin.twin_status}")

        # ------------------------------------------------
        # 3. Retrieve patient
        # ------------------------------------------------
        retrieved_patient = (
            db.query(Patient)
            .filter(Patient.patient_id == "P001")
            .first()
        )

        print("\n✓ Patient retrieved from PostgreSQL")
        print(f"  Patient ID  : {retrieved_patient.patient_id}")
        print(f"  Name        : {retrieved_patient.name}")
        print(f"  Age         : {retrieved_patient.age}")

        # ------------------------------------------------
        # 4. Verify Digital Twin relationship
        # ------------------------------------------------
        retrieved_twin = retrieved_patient.digital_twin

        print("\n✓ Digital Twin relationship verified")
        print(f"  Twin Status : {retrieved_twin.twin_status}")

        print("\n========================================")
        print("CRUD TEST STATUS: SUCCESS")
        print("========================================")

    except Exception as e:
        db.rollback()

        print("\n========================================")
        print("CRUD TEST STATUS: FAILED")
        print(f"Error: {e}")
        print("========================================")

    finally:
        db.close()


if __name__ == "__main__":
    test_crud()