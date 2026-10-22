
from functools import lru_cache
from io import BytesIO

import numpy as np
import torch
import torchxrayvision as xrv
from PIL import Image, ImageOps, UnidentifiedImageError


DEVICE = torch.device("cpu")
MODEL_NAME = "densenet121-res224-all"
MAX_IMAGE_PIXELS = 25_000_000


@lru_cache(maxsize=1)
def load_model():
    """Load the pretrained chest X-ray model once per process."""
    model = xrv.models.DenseNet(weights=MODEL_NAME)
    model = model.to(DEVICE)
    model.eval()
    return model


def analyze_chest_xray(image_bytes: bytes) -> dict:
    """
    Run experimental chest X-ray classification.

    This model produces research scores, not confirmed diagnoses.
    Only use genuine chest radiographs for inference.
    """
    if not image_bytes:
        raise ValueError("Image data is empty")

    try:
        with Image.open(BytesIO(image_bytes)) as image:
            if image.format not in {"JPEG", "PNG"}:
                raise ValueError(
                    "Only JPEG and PNG images are supported"
                )

            if image.width * image.height > MAX_IMAGE_PIXELS:
                raise ValueError("Image dimensions are too large")

            image = ImageOps.exif_transpose(image)
            image.load()
            image = image.convert("L")

            image_array = np.asarray(
                image,
                dtype=np.float32,
            )

    except UnidentifiedImageError as exc:
        raise ValueError("The file is not a valid image") from exc
    except OSError as exc:
        raise ValueError(
            "The image is corrupted or invalid"
        ) from exc

    # Normalize the grayscale image.
    image_array = xrv.datasets.normalize(image_array, 255.0)

    # IMPORTANT: add the channel dimension BEFORE transforms.
    # Shape changes from (H, W) to (1, H, W).
    image_array = image_array[None, ...]

    # Apply TorchXRayVision preprocessing.
    image_array = xrv.datasets.XRayCenterCrop()(image_array)
    image_array = xrv.datasets.XRayResizer(224)(image_array)

    # Expected shape before batching: (1, 224, 224).
    image_array = np.asarray(image_array, dtype=np.float32)

    if image_array.shape != (1, 224, 224):
        raise ValueError(
            f"Unexpected preprocessed image shape: {image_array.shape}"
        )

    # Add batch dimension: (1, 1, 224, 224).
    tensor = torch.from_numpy(image_array).unsqueeze(0).to(DEVICE)

    model = load_model()

    with torch.inference_mode():
        output = model(tensor)

    scores = output[0].detach().cpu().numpy()

    predictions = {
        str(label): round(float(score), 5)
        for label, score in zip(model.pathologies, scores)
    }

    return {
        "model": MODEL_NAME,
        "model_type": "pretrained chest X-ray classifier",
        "status": "experimental",
        "predictions": predictions,
        "clinical_warning": (
            "Research output only. Predictions are not confirmed "
            "diagnoses and must not be used alone for clinical decisions."
        ),
    }
