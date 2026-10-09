import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# -----------------------------
# 1. Paths
# -----------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent

input_file = PROJECT_ROOT / "data" / "raw" / "heart_disease.csv"
output_dir = PROJECT_ROOT / "data" / "processed"
output_dir.mkdir(parents=True, exist_ok=True)

# -----------------------------
# 2. Load dataset
# -----------------------------
df = pd.read_csv(input_file)

print("Original dataset shape:", df.shape)

# -----------------------------
# 3. Convert target to binary
# -----------------------------
df["num"] = (df["num"] > 0).astype(int)

print("\nBinary target distribution:")
print(df["num"].value_counts())

# -----------------------------
# 4. Separate features and target
# -----------------------------
X = df.drop("num", axis=1)
y = df["num"]

# -----------------------------
# 5. Train-test split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", X_train.shape[0])
print("Testing samples:", X_test.shape[0])

# -----------------------------
# 6. Identify numerical columns
# -----------------------------
numerical_features = X.columns.tolist()

# -----------------------------
# 7. Preprocessing pipeline
# -----------------------------
preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler())
            ]),
            numerical_features
        )
    ]
)

# Fit ONLY on training data
X_train_processed = preprocessor.fit_transform(X_train)

# Transform test data using the fitted preprocessor
X_test_processed = preprocessor.transform(X_test)

# -----------------------------
# 8. Save processed datasets
# -----------------------------
train_data = pd.DataFrame(
    X_train_processed,
    columns=numerical_features
)
train_data["num"] = y_train.reset_index(drop=True)

test_data = pd.DataFrame(
    X_test_processed,
    columns=numerical_features
)
test_data["num"] = y_test.reset_index(drop=True)

train_data.to_csv(
    output_dir / "heart_train.csv",
    index=False
)

test_data.to_csv(
    output_dir / "heart_test.csv",
    index=False
)

# Save preprocessing pipeline
joblib.dump(
    preprocessor,
    output_dir / "heart_preprocessor.pkl"
)

print("\nPreprocessing completed successfully!")
print("Saved:")
print("- heart_train.csv")
print("- heart_test.csv")
print("- heart_preprocessor.pkl")
