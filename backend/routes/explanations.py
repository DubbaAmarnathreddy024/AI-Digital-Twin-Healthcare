from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd


router = APIRouter(
    prefix="/explanations",
    tags=["Explainable AI"]
)


# =========================================================
# SHAP FEATURE IMPORTANCE
# =========================================================

@router.get("/heart-disease")
def get_heart_disease_explanation():

    # Project root
    project_root = Path(__file__).resolve().parents[2]

    shap_file = (
        project_root
        / "ml"
        / "explanations"
        / "heart_shap_feature_importance.csv"
    )

    # -----------------------------------------------------
    # Check file
    # -----------------------------------------------------

    if not shap_file.exists():

        raise HTTPException(
            status_code=404,
            detail="SHAP explanation file not found"
        )

    try:

        df = pd.read_csv(shap_file)

        # -------------------------------------------------
        # Convert dataframe to API response
        # -------------------------------------------------

        features = []

        for _, row in df.iterrows():

            feature_name = row.iloc[0]
            importance = row.iloc[1]

            features.append({
                "feature": str(feature_name),
                "importance": float(importance)
            })

        # Sort by importance
        features.sort(
            key=lambda x: x["importance"],
            reverse=True
        )

        return {
            "status": "success",
            "model": "Random Forest",
            "explanation_method": "SHAP",
            "features": features
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to load SHAP explanation: {str(e)}"
        )