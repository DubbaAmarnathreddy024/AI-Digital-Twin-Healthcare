import os
from database.connection import SessionLocal
from database.models import Patient, User
import bcrypt

PATIENT_USERNAME = "patient001"
DOCTOR_USERNAME = "doctor001"

PATIENT_PASSWORD = os.getenv("DEMO_PATIENT_PASSWORD")
DOCTOR_PASSWORD = os.getenv("DEMO_DOCTOR_PASSWORD")


def create_user(db, username, password, role, patient=None):
    existing_user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_user:
        print(f"{role.title()} account already exists.")
        print("Username :", existing_user.username)
        print("Role     :", existing_user.role)
        print()
        return existing_user

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user = User(
        patient_id=patient.id if patient else None,
        username=username,
        password_hash=password_hash,
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print(f"{role.title()} account created.")
    print("Username :", username)

    if patient:
        print("Patient  :", patient.patient_id)
    else:
        print("Patient  : All patients")

    print("Role     :", user.role)
    print("User ID  :", user.id)
    print()

    return user


def main():
    if not PATIENT_PASSWORD or not DOCTOR_PASSWORD:
        raise RuntimeError(
            "Set DEMO_PATIENT_PASSWORD and DEMO_DOCTOR_PASSWORD "
            "in your local environment before running this script."
        )

    db = SessionLocal()

    try:
        patient = (
            db.query(Patient)
            .filter(Patient.patient_id == "P-FULL-001")
            .first()
        )

        if not patient:
            print("ERROR: Patient P-FULL-001 not found.")
            return

        print("\n========================================")
        print("       HEALTH TWIN DEMO ACCOUNTS")
        print("========================================\n")

        create_user(
            db=db,
            username=PATIENT_USERNAME,
            password=PATIENT_PASSWORD,
            role="patient",
            patient=patient,
        )

        create_user(
            db=db,
            username=DOCTOR_USERNAME,
            password=DOCTOR_PASSWORD,
            role="doctor",
            patient=None,
        )

        print("Demo account setup completed.")

    except Exception as e:
        db.rollback()
        print("ERROR:", e)

    finally:
        db.close()


if __name__ == "__main__":
    main()