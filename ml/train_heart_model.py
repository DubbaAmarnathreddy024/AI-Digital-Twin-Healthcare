import pandas as pd
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix
)

# -----------------------------
# 1. Paths
# -----------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent

train_file = PROJECT_ROOT / "data" / "processed" / "heart_train.csv"
test_file = PROJECT_ROOT / "data" / "processed" / "heart_test.csv"

model_dir = PROJECT_ROOT / "ml" / "models"
model_dir.mkdir(parents=True, exist_ok=True)

# -----------------------------
# 2. Load processed data
# -----------------------------
train_data = pd.read_csv(train_file)
test_data = pd.read_csv(test_file)

X_train = train_data.drop("num", axis=1)
y_train = train_data["num"]

X_test = test_data.drop("num", axis=1)
y_test = test_data["num"]

print("Training data:", X_train.shape)
print("Testing data:", X_test.shape)

# -----------------------------
# 3. Create Random Forest
# -----------------------------
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    random_state=42,
    class_weight="balanced"
)

# -----------------------------
# 4. Train
# -----------------------------
print("\nTraining Random Forest...")

model.fit(X_train, y_train)

print("Training completed!")

# -----------------------------
# 5. Predictions
# -----------------------------
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# -----------------------------
# 6. Evaluation
# -----------------------------
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print("\n========== MODEL PERFORMANCE ==========")

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1-Score  : {f1:.4f}")
print(f"ROC-AUC   : {roc_auc:.4f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# -----------------------------
# 7. Save model
# -----------------------------
model_file = model_dir / "heart_disease_random_forest.pkl"

joblib.dump(model, model_file)

print("\nModel saved successfully!")
print("Saved to:", model_file)