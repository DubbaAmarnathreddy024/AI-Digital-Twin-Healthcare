from patient_twin import PatientDigitalTwin


# Create patient Digital Twin
patient = PatientDigitalTwin(
    patient_id="P001",
    name="Demo Patient",
    age=45,
    sex=1,
    height=172,
    weight=78
)


# Add medical history
patient.add_medical_history("Hypertension")


# Add laboratory results
patient.update_lab_results({
    "glucose": 115,
    "cholesterol": 220
})


# Add lifestyle information
patient.update_lifestyle(
    smoking=False,
    alcohol=False,
    physical_activity="Moderate",
    diet="Balanced",
    sleep_hours=7
)


# Add wearable data
patient.update_wearable_data(
    heart_rate=82,
    spo2=98,
    steps=6500,
    sleep_hours=7,
    calories=2100
)


# Add AI prediction
patient.update_prediction(
    disease="heart_disease",
    probability=0.82,
    risk_level="High"
)


# Add SHAP explanations
patient.add_explanation("thal", 0.108686)
patient.add_explanation("ca", 0.102546)
patient.add_explanation("cp", 0.083488)


# Save current health state
patient.add_health_snapshot()


# Display Digital Twin
print("\n========== PATIENT DIGITAL TWIN ==========\n")

print(patient.to_dict())