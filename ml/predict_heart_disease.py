import pandas as pd
import joblib

from pathlib import Path


# --------------------------------
# 1. Project paths
# --------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_FILE = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "heart_disease_random_forest.pkl"
)

PREPROCESSOR_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "heart_preprocessor.pkl"
)


# --------------------------------
# 2. Load model and preprocessor
# --------------------------------

model = joblib.load(MODEL_FILE)
preprocessor = joblib.load(PREPROCESSOR_FILE)


# --------------------------------
# 3. Prediction function
# --------------------------------

def predict_heart_disease(patient_data):

    # Create DataFrame with feature names
    patient_df = pd.DataFrame(
        [patient_data],
        columns=patient_data.keys()
    )

    # Preprocess patient data
    processed_data = preprocessor.transform(patient_df)

    # Convert processed data back to DataFrame
    processed_df = pd.DataFrame(
        processed_data,
        columns=patient_df.columns,
        index=patient_df.index
    )

    # Prediction
    prediction = model.predict(processed_df)[0]

    # Probability
    probability = model.predict_proba(processed_df)[0][1]

    # Risk classification
    if probability < 0.30:
        risk_level = "Low"

    elif probability < 0.70:
        risk_level = "Moderate"

    else:
        risk_level = "High"

    return {
        "prediction": int(prediction),
        "probability": round(float(probability), 4),
        "risk_level": risk_level
    }


# --------------------------------
# 4. Test patient
# --------------------------------

if __name__ == "__main__":

    patient = {
        "age": 45,
        "sex": 1,
        "cp": 3,
        "trestbps": 130,
        "chol": 220,
        "fbs": 0,
        "restecg": 0,
        "thalach": 160,
        "exang": 0,
        "oldpeak": 1.0,
        "slope": 2,
        "ca": 0,
        "thal": 3
    }

    result = predict_heart_disease(patient)

    print("\n========== HEART DISEASE PREDICTION ==========")
    print("Prediction :", result["prediction"])
    print("Probability:", result["probability"])
    print("Risk Level :", result["risk_level"])