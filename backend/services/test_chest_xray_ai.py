
from pathlib import Path

from services.chest_xray_ai import analyze_chest_xray


# Put a real, appropriately sourced chest X-ray at this path.
image_path = Path("test_data/chest_xray.png")

if not image_path.is_file():
    raise SystemExit(
        "Add a test chest X-ray at test_data/chest_xray.png first."
    )

result = analyze_chest_xray(image_path.read_bytes())

print("Model:", result["model"])
print("Status:", result["status"])
print("Predictions:")

for finding, score in result["predictions"].items():
    print(f"  {finding}: {score}")

print(result["clinical_warning"])
