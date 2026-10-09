import pandas as pd
from pathlib import Path

from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent

train_file = PROJECT_ROOT / "data" / "processed" / "heart_train.csv"
test_file = PROJECT_ROOT / "data" / "processed" / "heart_test.csv"

# Load data
train_data = pd.read_csv(train_file)
test_data = pd.read_csv(test_file)

X_train = train_data.drop("num", axis=1)
y_train = train_data["num"]

X_test = test_data.drop("num", axis=1)
y_test = test_data["num"]


def evaluate_model(name, model):

    print(f"\nTraining {name}...")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)
    roc_auc = roc_auc_score(y_test, probabilities)

    print(f"{name}")
    print(f"Accuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1-Score  : {f1:.4f}")
    print(f"ROC-AUC   : {roc_auc:.4f}")

    return {
        "Model": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1-Score": f1,
        "ROC-AUC": roc_auc
    }


# -----------------------------
# Logistic Regression
# -----------------------------

logistic_model = LogisticRegression(
    max_iter=1000,
    random_state=42
)

logistic_results = evaluate_model(
    "Logistic Regression",
    logistic_model
)


# -----------------------------
# XGBoost
# -----------------------------

xgb_model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42
)

xgb_results = evaluate_model(
    "XGBoost",
    xgb_model
)


# -----------------------------
# Comparison
# -----------------------------

results = pd.DataFrame([
    logistic_results,
    xgb_results
])

print("\n================ MODEL COMPARISON ================")
print(results.to_string(index=False))