from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import auth

from backend.routes.patients import router as patient_router
from backend.routes.predictions import router as prediction_router
from backend.routes.digital_twin import router as digital_twin_router
from backend.routes.monitoring import router as monitoring_router
from backend.routes.explanations import router as explanation_router


app = FastAPI(
    title="AI-Driven Digital Twin Healthcare API",
    description=(
        "Backend API for personalized healthcare monitoring "
        "using AI and Digital Twin technology."
    ),
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "project": "AI-Driven Digital Twin for Personalized Healthcare Monitoring",
        "status": "running",
        "message": "Healthcare Digital Twin API is working"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# =========================================================
# ROUTES
# =========================================================

app.include_router(patient_router)
app.include_router(prediction_router)
app.include_router(digital_twin_router)
app.include_router(monitoring_router)
app.include_router(explanation_router)
app.include_router(auth.router)