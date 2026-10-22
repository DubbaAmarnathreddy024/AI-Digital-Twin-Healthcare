import uuid
from io import BytesIO
from pathlib import Path
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Response,
    UploadFile,
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth import decode_access_token
from backend.services.chest_xray_ai import analyze_chest_xray

from database.models import (
    MedicalImage,
    MedicalImageAnalysis,
    Patient,
    User,
)


router = APIRouter(
    prefix="/medical-images",
    tags=["Medical Images"],
)

security = HTTPBearer()

IMAGE_DIR = Path("data/medical_images").resolve()
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_FORMATS = {"JPEG", "PNG"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}

IMAGE_DIR.mkdir(parents=True, exist_ok=True)


def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials,
    db: Session,
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


# --------------------------------------------------
# 1. Upload a medical image
# --------------------------------------------------

@router.post("/upload/{patient_id}", status_code=201)
async def upload_medical_image(
    patient_id: str,
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user = get_authenticated_user(credentials, db)

    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    if user.role == "patient":
        if not user.patient or user.patient.id != patient.id:
            raise HTTPException(
                status_code=403,
                detail="You can only upload images to your own record",
            )
    elif user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Only JPEG and PNG images are supported",
        )

    contents = await file.read(MAX_FILE_SIZE + 1)

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty",
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image must not exceed 10 MB",
        )

    try:
        with Image.open(BytesIO(contents)) as image:
            if image.format not in ALLOWED_FORMATS:
                raise HTTPException(
                    status_code=415,
                    detail="Unsupported image format",
                )
            image.verify()

    except UnidentifiedImageError:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image",
        )
    except OSError:
        raise HTTPException(
            status_code=400,
            detail="The image file is corrupted or invalid",
        )
    finally:
        await file.close()

    extension = ".jpg" if file.content_type == "image/jpeg" else ".png"
    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = IMAGE_DIR / stored_name

    try:
        with destination.open("xb") as image_file:
            image_file.write(contents)
    except OSError:
        raise HTTPException(
            status_code=500,
            detail="Could not save the uploaded image",
        )

    record = MedicalImage(
        patient_id=patient.id,
        stored_filename=stored_name,
        original_filename=Path(file.filename or "upload").name[:255],
        content_type=file.content_type,
        file_size=len(contents),
        analysis_status="not_started",
        uploaded_at=datetime.utcnow(),
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)

    except Exception:
        db.rollback()

        try:
            destination.unlink(missing_ok=True)
        except OSError:
            pass

        raise HTTPException(
            status_code=500,
            detail="Could not save image metadata",
        )

    return {
        "message": "Image uploaded successfully",
        "image_id": record.id,
        "patient_id": patient.patient_id,
        "filename": record.stored_filename,
        "content_type": record.content_type,
        "size_bytes": record.file_size,
        "uploaded_at": record.uploaded_at.isoformat(),
        "analysis_status": record.analysis_status,
        "note": "AI analysis has not been performed",
    }


# --------------------------------------------------
# 2. Get a patient's image history
# --------------------------------------------------

@router.get("/{patient_id}/history")
def get_medical_image_history(
    patient_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user = get_authenticated_user(credentials, db)

    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    if user.role == "patient":
        if not user.patient or user.patient.id != patient.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own image history",
            )
    elif user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    records = (
        db.query(MedicalImage)
        .filter(MedicalImage.patient_id == patient.id)
        .order_by(MedicalImage.uploaded_at.desc())
        .all()
    )

    return {
        "patient_id": patient.patient_id,
        "count": len(records),
        "images": [
            {
                "image_id": record.id,
                "filename": record.stored_filename,
                "content_type": record.content_type,
                "size_bytes": record.file_size,
                "uploaded_at": record.uploaded_at.isoformat(),
                "analysis_status": record.analysis_status,
            }
            for record in records
        ],
    }


# --------------------------------------------------
# 3. View a securely stored medical image
# --------------------------------------------------

@router.get("/{patient_id}/{image_id}/content")
def get_medical_image_content(
    patient_id: str,
    image_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user = get_authenticated_user(credentials, db)

    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    if user.role == "patient":
        if not user.patient or user.patient.id != patient.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own images",
            )
    elif user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    record = (
        db.query(MedicalImage)
        .filter(
            MedicalImage.id == image_id,
            MedicalImage.patient_id == patient.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    filename = record.stored_filename

    if not filename or Path(filename).name != filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid stored filename",
        )

    image_path = (IMAGE_DIR / filename).resolve()

    if image_path.parent != IMAGE_DIR or not image_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Image file not found",
        )

    if record.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported image type",
        )

    return Response(
        content=image_path.read_bytes(),
        media_type=record.content_type,
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


# --------------------------------------------------
# 4. Analyze an image and save results to PostgreSQL
# --------------------------------------------------

@router.post("/{patient_id}/{image_id}/analyze")
def analyze_medical_image(
    patient_id: str,
    image_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    # Authenticate the caller.
    user = get_authenticated_user(credentials, db)

    # Find the patient.
    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # Enforce patient/doctor permissions.
    if user.role == "patient":
        if not user.patient or user.patient.id != patient.id:
            raise HTTPException(
                status_code=403,
                detail="You can only analyze your own images",
            )
    elif user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    # Find the image belonging to this patient.
    record = (
        db.query(MedicalImage)
        .filter(
            MedicalImage.id == image_id,
            MedicalImage.patient_id == patient.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    if record.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Only JPEG and PNG images are supported",
        )

    # Resolve the stored image safely.
    filename = record.stored_filename

    if not filename or Path(filename).name != filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid stored filename",
        )

    image_path = (IMAGE_DIR / filename).resolve()

    if image_path.parent != IMAGE_DIR or not image_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Image file not found",
        )

    # Run the experimental chest X-ray model.
    try:
        result = analyze_chest_xray(image_path.read_bytes())

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="AI analysis is temporarily unavailable",
        )

    # Save the analysis result to PostgreSQL.
    analysis_record = MedicalImageAnalysis(
        medical_image_id=record.id,
        patient_id=patient.id,
        model_name=result["model"],
        analysis_status="completed",
        predictions=result["predictions"],
        clinical_warning=result["clinical_warning"],
    )

    try:
        db.add(analysis_record)

        record.analysis_status = "completed"

        db.commit()
        db.refresh(analysis_record)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not save AI analysis results",
        )

    # Return the saved analysis.
    return {
        "analysis_id": analysis_record.id,
        "patient_id": patient.patient_id,
        "image_id": record.id,
        "analysis_status": analysis_record.analysis_status,
        "model": analysis_record.model_name,
        "status": "experimental",
        "predictions": analysis_record.predictions,
        "clinical_warning": analysis_record.clinical_warning,
        "created_at": analysis_record.created_at.isoformat(),
    }


# --------------------------------------------------
# 5. Get saved AI analysis history for an image
# --------------------------------------------------

@router.get("/{patient_id}/{image_id}/analyses")
def get_medical_image_analyses(
    patient_id: str,
    image_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    # 1. Authenticate the caller.
    user = get_authenticated_user(credentials, db)

    # 2. Find the patient.
    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # 3. Enforce patient/doctor permissions.
    if user.role == "patient":
        if not user.patient or user.patient.id != patient.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own analysis history",
            )
    elif user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    # 4. Confirm the image belongs to this patient.
    medical_image = (
        db.query(MedicalImage)
        .filter(
            MedicalImage.id == image_id,
            MedicalImage.patient_id == patient.id,
        )
        .first()
    )

    if not medical_image:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    # 5. Retrieve saved analyses without running the model.
    analyses = (
        db.query(MedicalImageAnalysis)
        .filter(
            MedicalImageAnalysis.medical_image_id == medical_image.id,
            MedicalImageAnalysis.patient_id == patient.id,
        )
        .order_by(MedicalImageAnalysis.created_at.desc())
        .all()
    )

    # 6. Return the saved results.
    return {
        "patient_id": patient.patient_id,
        "image_id": medical_image.id,
        "count": len(analyses),
        "analyses": [
            {
                "analysis_id": analysis.id,
                "model": analysis.model_name,
                "analysis_status": analysis.analysis_status,
                "predictions": analysis.predictions,
                "clinical_warning": analysis.clinical_warning,
                "created_at": analysis.created_at.isoformat(),
            }
            for analysis in analyses
        ],
    }
