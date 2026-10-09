from datetime import datetime


class PatientDigitalTwin:

    def __init__(
        self,
        patient_id,
        name,
        age,
        sex,
        height=None,
        weight=None
    ):
        self.patient_id = patient_id
        self.name = name

        # --------------------------------
        # Demographics
        # --------------------------------

        self.demographics = {
            "age": age,
            "sex": sex,
            "height_cm": height,
            "weight_kg": weight
        }

        # --------------------------------
        # Clinical data
        # Features used by Heart Disease ML model
        # --------------------------------

        self.clinical_data = {
            "cp": None,
            "trestbps": None,
            "chol": None,
            "fbs": None,
            "restecg": None,
            "thalach": None,
            "exang": None,
            "oldpeak": None,
            "slope": None,
            "ca": None,
            "thal": None
        }

        # --------------------------------
        # Medical information
        # --------------------------------

        self.medical_history = []
        self.medications = []
        self.allergies = []

        # --------------------------------
        # Laboratory information
        # --------------------------------

        self.lab_results = {}

        # --------------------------------
        # Lifestyle information
        # --------------------------------

        self.lifestyle = {
            "smoking": None,
            "alcohol": None,
            "physical_activity": None,
            "diet": None,
            "sleep_hours": None
        }

        # --------------------------------
        # Latest wearable readings
        # --------------------------------

        self.wearable_data = {
            "heart_rate": None,
            "spo2": None,
            "steps": None,
            "sleep_hours": None,
            "calories": None
        }

        # --------------------------------
        # AI outputs
        # --------------------------------

        self.ai_predictions = {}

        # --------------------------------
        # Explainable AI results
        # --------------------------------

        self.explanations = []

        # Monitoring alerts
        self.alerts = []

        # --------------------------------
        # Health history
        # --------------------------------

        self.health_history = []

        # --------------------------------
        # Last update timestamp
        # --------------------------------

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Update Clinical Data
    # ====================================

    def update_clinical_data(self, **kwargs):

        for key, value in kwargs.items():

            if key in self.clinical_data:
                self.clinical_data[key] = value

            else:
                raise ValueError(
                    f"Unknown clinical feature: {key}"
                )

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Update Wearable Data
    # ====================================

    def update_wearable_data(
        self,
        heart_rate=None,
        spo2=None,
        steps=None,
        sleep_hours=None,
        calories=None
    ):

        if heart_rate is not None:
            self.wearable_data["heart_rate"] = heart_rate

        if spo2 is not None:
            self.wearable_data["spo2"] = spo2

        if steps is not None:
            self.wearable_data["steps"] = steps

        if sleep_hours is not None:
            self.wearable_data["sleep_hours"] = sleep_hours

        if calories is not None:
            self.wearable_data["calories"] = calories

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Update Laboratory Results
    # ====================================

    def update_lab_results(self, results):

        self.lab_results.update(results)

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Add Medical History
    # ====================================

    def add_medical_history(self, condition):

        self.medical_history.append(condition)

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Update Lifestyle
    # ====================================

    def update_lifestyle(self, **kwargs):

        self.lifestyle.update(kwargs)

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Store AI Prediction
    # ====================================

    def update_prediction(
        self,
        disease,
        probability,
        risk_level
    ):

        self.ai_predictions[disease] = {
            "probability": probability,
            "risk_level": risk_level,
            "timestamp": datetime.now().isoformat()
        }

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Store SHAP Explanation
    # ====================================

    def add_explanation(self, feature, importance):

        self.explanations.append({
            "feature": feature,
            "importance": importance
        })

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Store Monitoring Alert
    # ====================================

    def add_alert(self, alert):

        self.alerts.append(alert)

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Store Health Snapshot
    # ====================================

    def add_health_snapshot(self):

        snapshot = {
            "timestamp": datetime.now().isoformat(),

            "clinical_data":
                self.clinical_data.copy(),

            "wearable_data":
                self.wearable_data.copy(),

            "lab_results":
                self.lab_results.copy(),

            "ai_predictions":
                self.ai_predictions.copy()
        }

        self.health_history.append(snapshot)

        self.last_updated = datetime.now().isoformat()

    # ====================================
    # Convert Digital Twin to Dictionary
    # ====================================

    def to_dict(self):
        return {
        "patient_id": self.patient_id,
        "name": self.name,

        "demographics":
            self.demographics,

        "clinical_data":
            self.clinical_data,

        "medical_history":
            self.medical_history,

        "medications":
            self.medications,

        "allergies":
            self.allergies,

        "lab_results":
            self.lab_results,

        "lifestyle":
            self.lifestyle,

        "wearable_data":
            self.wearable_data,

        "ai_predictions":
            self.ai_predictions,

        "explanations":
            self.explanations,

        # Monitoring alerts
        "alerts":
            self.alerts,

        "health_history":
            self.health_history,

        "last_updated":
            self.last_updated
    }