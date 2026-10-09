from ucimlrepo import fetch_ucirepo
import pandas as pd
from pathlib import Path

# Download UCI Heart Disease dataset
heart_disease = fetch_ucirepo(id=45)

# Get features and target
X = heart_disease.data.features
y = heart_disease.data.targets

# Combine features and target
df = pd.concat([X, y], axis=1)

# Get project root directory
project_root = Path(__file__).resolve().parent.parent

# Create data/raw folder
output_dir = project_root / "data" / "raw"
output_dir.mkdir(parents=True, exist_ok=True)

# Save dataset
output_file = output_dir / "heart_disease.csv"
df.to_csv(output_file, index=False)

print("Dataset downloaded successfully!")
print("Saved to:", output_file)
print("Shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())