
from pathlib import Path

import joblib
import pandas as pd

from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# --------------------------------------------------
# 1. Project paths
# --------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]

CSV_PATH = ROOT / "data" / "diabetes" / "diabetes.csv"
MODEL_DIR = ROOT / "backend" / "ml_models" / "diabetes"
MODEL_PATH = MODEL_DIR / "diabetes_pipeline.joblib"

# --------------------------------------------------
# 2. Load dataset
# --------------------------------------------------
if not CSV_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found: {CSV_PATH}\n"
        "Download diabetes.csv into data/diabetes/ first."
    )

df = pd.read_csv(CSV_PATH)

# Normalize column names.
df.columns = [
    str(column).strip().lower().replace(" ", "_")
    for column in df.columns
]

print("Dataset loaded successfully.")
print("Shape:", df.shape)
print("Columns:", list(df.columns))

# --------------------------------------------------
# 3. Validate target and features
# --------------------------------------------------
if "outcome" not in df.columns:
    raise ValueError(
        "Expected an 'Outcome' target column. "
        f"Found: {list(df.columns)}"
    )

X = df.drop(columns=["outcome"]).copy()
y = pd.to_numeric(df["outcome"], errors="raise").astype(int)

if set(y.unique()) != {0, 1}:
    raise ValueError(
        f"Expected binary Outcome values 0 and 1; found {sorted(y.unique())}"
    )

# Ensure all input columns are numeric.
X = X.apply(pd.to_numeric, errors="raise")

if X.empty or len(X) < 20:
    raise ValueError("Dataset is empty or too small to train reliably.")

if X.isin([float("inf"), float("-inf")]).any().any():
    raise ValueError("Dataset contains infinite feature values.")

# In the commonly used Pima dataset, zero often represents
# missing measurements for these five clinical features.
zero_as_missing = [
    "glucose",
    "bloodpressure",
    "skinthickness",
    "insulin",
    "bmi",
]

for column in zero_as_missing:
    if column in X.columns:
        X.loc[X[column] == 0, column] = float("nan")

feature_names = list(X.columns)

print("Records:", len(X))
print("Features:", feature_names)
print("Class distribution:")
print(y.value_counts().sort_index())

# --------------------------------------------------
# 4. Split data before fitting preprocessing
# --------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

# Imputation and scaling are fitted only on training data.
pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=1000)),
    ]
)

# --------------------------------------------------
# 5. Train
# --------------------------------------------------
print("\nTraining diabetes risk model...")
pipeline.fit(X_train, y_train)

# --------------------------------------------------
# 6. Evaluate on held-out test set
# --------------------------------------------------
predictions = pipeline.predict(X_test)
probabilities = pipeline.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, predictions)
auc = roc_auc_score(y_test, probabilities)

print("\n========== MODEL EVALUATION ==========")
print(f"Accuracy: {accuracy:.4f}")
print(f"ROC-AUC:  {auc:.4f}")
print("\nClassification report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0,
    )
)

# --------------------------------------------------
# 7. Save complete pipeline and metadata
# --------------------------------------------------
MODEL_DIR.mkdir(parents=True, exist_ok=True)

artifact = {
    "pipeline": pipeline,
    "features": feature_names,
    "model_name": "Logistic Regression",
    "dataset_name": "Pima Indians Diabetes dataset mirror",
    "version": 1,
}

joblib.dump(artifact, MODEL_PATH)

print("\nModel saved successfully:")
print(MODEL_PATH)
print("\nTraining completed.")
