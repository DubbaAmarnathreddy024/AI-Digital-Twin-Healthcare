import pandas as pd
import joblib
import shap

from pathlib import Path

# --------------------------------
# 1. Project paths
# --------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

test_file = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "heart_test.csv"
)

model_file = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "heart_disease_random_forest.pkl"
)

output_dir = PROJECT_ROOT / "ml" / "explanations"
output_dir.mkdir(parents=True, exist_ok=True)


# --------------------------------
# 2. Load test data
# --------------------------------

test_data = pd.read_csv(test_file)

X_test = test_data.drop("num", axis=1)


# --------------------------------
# 3. Load trained Random Forest
# --------------------------------

model = joblib.load(model_file)

print("Random Forest model loaded successfully.")


# --------------------------------
# 4. Create SHAP explainer
# --------------------------------

explainer = shap.TreeExplainer(model)

shap_values = explainer.shap_values(X_test)

print("SHAP values generated successfully.")


# --------------------------------
# 5. Handle SHAP output
# --------------------------------

if isinstance(shap_values, list):

    # Binary classification:
    # use SHAP values for class 1 (Disease)
    disease_shap_values = shap_values[1]

else:

    # Newer SHAP versions may return
    # a 3D array for classification
    if len(shap_values.shape) == 3:
        disease_shap_values = shap_values[:, :, 1]
    else:
        disease_shap_values = shap_values


# --------------------------------
# 6. Calculate feature importance
# --------------------------------

feature_importance = pd.DataFrame({
    "Feature": X_test.columns,
    "Importance": abs(disease_shap_values).mean(axis=0)
})

feature_importance = feature_importance.sort_values(
    by="Importance",
    ascending=False
)


# --------------------------------
# 7. Display results
# --------------------------------

print("\n========== SHAP FEATURE IMPORTANCE ==========")

print(
    feature_importance.to_string(index=False)
)


# --------------------------------
# 8. Save feature importance
# --------------------------------

output_file = (
    output_dir
    / "heart_shap_feature_importance.csv"
)

feature_importance.to_csv(
    output_file,
    index=False
)

print("\nSHAP analysis completed!")

print(
    "Saved to:",
    output_file
)


# --------------------------------
# 9. Generate SHAP summary plot
# --------------------------------

shap.summary_plot(
    disease_shap_values,
    X_test,
    show=False
)

import matplotlib.pyplot as plt

plot_file = (
    output_dir
    / "heart_shap_summary.png"
)

plt.tight_layout()
plt.savefig(
    plot_file,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    "SHAP plot saved to:",
    plot_file
)