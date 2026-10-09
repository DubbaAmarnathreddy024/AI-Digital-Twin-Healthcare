from digital_twin.patient_twin import PatientDigitalTwin
from digital_twin.twin_prediction import update_heart_disease_prediction


# --------------------------------
# Create Digital Twin
# --------------------------------

patient = PatientDigitalTwin(
    patient_id="P001",
    name="Demo Patient",
    age=45,
    sex=1,
    height=172,
    weight=78
)


# --------------------------------
# Add clinical data
# --------------------------------

patient.update_clinical_data(
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


# --------------------------------
# Add wearable data
# --------------------------------

patient.update_wearable_data(
    heart_rate=82,
    spo2=98,
    steps=6500,
    sleep_hours=7,
    calories=2100
)


# --------------------------------
# Generate REAL AI prediction
# --------------------------------

result = update_heart_disease_prediction(patient)


# --------------------------------
# Display result
# --------------------------------

print("\n========== DIGITAL TWIN AI RESULT ==========")

print("Patient ID :", patient.patient_id)
print("Prediction :", result["prediction"])
print("Probability:", result["probability"])
print("Risk Level :", result["risk_level"])


# --------------------------------
# Store health snapshot
# --------------------------------

patient.add_health_snapshot()


# --------------------------------
# Display Digital Twin
# --------------------------------

print("\n========== DIGITAL TWIN STATE ==========")

print(patient.to_dict())