from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Text,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from database.connection import Base



# ============================================================
# PATIENT
# ============================================================

class Patient(Base):
    __tablename__ = "patients"
    user = relationship(
    "User",
    back_populates="patient",
    uselist=False,
    cascade="all, delete-orphan"
    )

    id = Column(Integer, primary_key=True)
    patient_id = Column(String(50), unique=True, nullable=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    sex = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    digital_twin = relationship(
        "DigitalTwin",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan"
    )

    clinical_data = relationship(
        "ClinicalData",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    wearable_readings = relationship(
        "WearableReading",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    lab_results = relationship(
        "LabResult",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    medical_history = relationship(
        "MedicalHistory",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    predictions = relationship(
        "Prediction",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    explanations = relationship(
        "Explanation",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    alerts = relationship(
        "Alert",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    health_snapshots = relationship(
        "HealthSnapshot",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    username = Column(
        String(100),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(30),
        default="patient",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="user"
    )
# ============================================================
# DIGITAL TWIN
# ============================================================

class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    twin_status = Column(String(30), default="active")
    last_updated = Column(DateTime, default=datetime.utcnow)

    patient = relationship(
        "Patient",
        back_populates="digital_twin"
    )


# ============================================================
# CLINICAL DATA
# ============================================================

class ClinicalData(Base):
    __tablename__ = "clinical_data"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    cp = Column(Integer)
    trestbps = Column(Integer)
    chol = Column(Integer)
    fbs = Column(Integer)
    restecg = Column(Integer)
    thalach = Column(Integer)
    exang = Column(Integer)
    oldpeak = Column(Numeric(5, 2))
    slope = Column(Integer)
    ca = Column(Integer)
    thal = Column(Integer)

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="clinical_data"
    )


# ============================================================
# WEARABLE READINGS
# ============================================================

class WearableReading(Base):
    __tablename__ = "wearable_readings"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    heart_rate = Column(Integer)
    spo2 = Column(Numeric(5, 2))
    steps = Column(Integer)
    sleep_hours = Column(Numeric(4, 2))
    calories = Column(Integer)

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="wearable_readings"
    )


# ============================================================
# LAB RESULTS
# ============================================================

class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    test_name = Column(String(100), nullable=False)
    test_value = Column(String(100))
    unit = Column(String(30))
    reference_range = Column(String(100))

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="lab_results"
    )


# ============================================================
# MEDICAL HISTORY
# ============================================================

class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    condition = Column(String(200), nullable=False)
    diagnosed_date = Column(Date)
    notes = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="medical_history"
    )


# ============================================================
# PREDICTIONS
# ============================================================

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    disease = Column(String(100), nullable=False)
    prediction = Column(Integer, nullable=False)
    probability = Column(Numeric(6, 4))
    risk_level = Column(String(20))

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="predictions"
    )


# ============================================================
# SHAP EXPLANATIONS
# ============================================================

class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    feature = Column(String(100), nullable=False)
    importance = Column(Numeric(10, 6))
    explanation_text = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="explanations"
    )


# ============================================================
# ALERTS
# ============================================================

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    alert_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    value = Column(Numeric(10, 2))
    severity = Column(
        String(20),
        default="warning"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="alerts"
    )


# ============================================================
# HEALTH SNAPSHOTS
# ============================================================

class HealthSnapshot(Base):
    __tablename__ = "health_snapshots"

    id = Column(Integer, primary_key=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    clinical_data = Column(JSONB)
    wearable_data = Column(JSONB)
    lab_results = Column(JSONB)
    ai_predictions = Column(JSONB)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="health_snapshots"
    )