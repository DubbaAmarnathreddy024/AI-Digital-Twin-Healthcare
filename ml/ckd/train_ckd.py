
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from ucimlrepo import fetch_ucirepo

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "backend" / "ml_models" / "ckd"
MODEL_PATH = MODEL_DIR / "ckd_pipeline.joblib"

NUMERIC_CANDIDATES = [
    "age", "bp", "sg", "al", "su", "bgr", "bu",
    "sc", "sod", "pot", "hemo", "pcv", "wbcc", "rbcc",
]


def main():
    print("Downloading/loading UCI CKD dataset...")
    dataset = fetch_ucirepo(id=336)

    X = dataset.data.features.copy()
    y = dataset.data.targets.iloc[:, 0].copy()

    X.columns = [str(col).strip().lower() for col in X.columns]

    # Clean categorical values and standardize missing values.
    for col in X.columns:
        if (
            pd.api.types.is_object_dtype(X[col])
            or isinstance(X[col].dtype, pd.StringDtype)
        ):
            values = (
                X[col]
                .astype("string")
                .str.strip()
                .str.lower()
                .replace({
                    "?": np.nan,
                    "": np.nan,
                    "\t": np.nan,
                    "nan": np.nan,
                })
            )

            # Convert pandas nullable values to ordinary Python objects.
            X[col] = values.astype(object)
            X[col] = X[col].where(pd.notna(X[col]), np.nan)

    # Convert known numeric fields explicitly.
    for col in NUMERIC_CANDIDATES:
        if col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")

    # Normalize target labels.
    y = (
        y.astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "", regex=False)
    )

    y = y.map({"ckd": 1, "notckd": 0})

    if y.isna().any():
        raise ValueError("Unexpected target labels found in dataset.")

    y = y.astype(int)

    # Drop only genuinely empty columns.
    empty_columns = [
        col for col in X.columns
        if X[col].notna().sum() == 0
    ]

    if empty_columns:
        print("Dropping completely empty columns:", empty_columns)
        X = X.drop(columns=empty_columns)

    numeric_features = X.select_dtypes(
        include=["number"]
    ).columns.tolist()

    categorical_features = [
        col for col in X.columns
        if col not in numeric_features
    ]

    print("\nRecords:", len(X))
    print("Numeric features:", numeric_features)
    print("Categorical features:", categorical_features)

    if categorical_features:
        print("\nCategorical non-null counts:")
        print(X[categorical_features].notna().sum())

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    transformers = []

    if numeric_features:
        numeric_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ])

        transformers.append(
            ("numeric", numeric_pipeline, numeric_features)
        )

    if categorical_features:
        categorical_pipeline = Pipeline([
            (
                "imputer",
                SimpleImputer(
                    strategy="most_frequent",
                    missing_values=np.nan,
                ),
            ),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore"),
            ),
        ])

        transformers.append(
            ("categorical", categorical_pipeline, categorical_features)
        )

    preprocessor = ColumnTransformer(
        transformers=transformers
    )

    model = Pipeline([
        ("preprocessor", preprocessor),
        (
            "classifier",
            RandomForestClassifier(
                n_estimators=300,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ])

    print("\nTraining CKD classifier...")
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    print("\n========== CKD MODEL EVALUATION ==========")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, probabilities):.4f}")

    print(
        classification_report(
            y_test,
            predictions,
            labels=[0, 1],
            target_names=["Not CKD", "CKD"],
            zero_division=0,
        )
    )

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    artifact = {
        "pipeline": model,
        "features": list(X.columns),
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "model_name": "Random Forest",
        "dataset_name": "UCI Chronic Kidney Disease",
        "positive_class": "CKD",
        "version": 2,
    }

    joblib.dump(artifact, MODEL_PATH)

    print("\nModel saved successfully:")
    print(MODEL_PATH)
    print("\nCKD training completed.")


if __name__ == "__main__":
    main()
