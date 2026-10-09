from digital_twin.patient_twin import PatientDigitalTwin
from ml.predict_heart_disease import predict_heart_disease


def update_heart_disease_prediction(twin: PatientDigitalTwin):

    # Extract the 13 clinical features
    # required by our trained model.
    clinical_data = {
        "age": twin.demographics["age"],
        "sex": twin.demographics["sex"],

        "cp": twin.clinical_data["cp"],
        "trestbps": twin.clinical_data["trestbps"],
        "chol": twin.clinical_data["chol"],
        "fbs": twin.clinical_data["fbs"],
        "restecg": twin.clinical_data["restecg"],
        "thalach": twin.clinical_data["thalach"],
        "exang": twin.clinical_data["exang"],
        "oldpeak": twin.clinical_data["oldpeak"],
        "slope": twin.clinical_data["slope"],
        "ca": twin.clinical_data["ca"],
        "thal": twin.clinical_data["thal"]
    }

    # Get actual prediction from Random Forest
    result = predict_heart_disease(clinical_data)

    # Store prediction inside Digital Twin
    twin.update_prediction(
        disease="heart_disease",
        probability=result["probability"],
        risk_level=result["risk_level"]
    )

    return result