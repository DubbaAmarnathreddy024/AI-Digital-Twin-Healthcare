from database.connection import engine
from database.models import (
    Patient,
    DigitalTwin,
    ClinicalData,
    WearableReading,
    LabResult,
    MedicalHistory,
    Prediction,
    Explanation,
    Alert,
    HealthSnapshot,
)


def test_models():
    models = [
        Patient,
        DigitalTwin,
        ClinicalData,
        WearableReading,
        LabResult,
        MedicalHistory,
        Prediction,
        Explanation,
        Alert,
        HealthSnapshot,
    ]

    print("\n========== SQLALCHEMY MODEL TEST ==========")

    for model in models:
        print(f"✓ {model.__tablename__}")

    print("============================================")
    print(f"Total models: {len(models)}")
    print("Status: SUCCESS")
    print("============================================")


if __name__ == "__main__":
    test_models()