@echo off
title AI Digital Twin Healthcare - Launcher

echo.
echo ================================================
echo     AI DIGITAL TWIN HEALTHCARE SYSTEM
echo ================================================
echo.
echo Starting all services...
echo.

cd /d D:\AI-Digital-Twin-Healthcare

echo [1/3] Starting FastAPI Backend...
start "HealthTwin - FastAPI" cmd /k "cd /d D:\AI-Digital-Twin-Healthcare && call .venv\Scripts\activate.bat && python -m uvicorn backend.main:app --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Continuous Monitoring...
start "HealthTwin - Monitoring" cmd /k "cd /d D:\AI-Digital-Twin-Healthcare && call .venv\Scripts\activate.bat && python -m monitoring.run_continuous"

echo [3/3] Starting React Frontend...
start "HealthTwin - Frontend" cmd /k "cd /d D:\AI-Digital-Twin-Healthcare\frontend && npm run dev"

echo.
echo ================================================
echo     ALL SERVICES STARTED
echo ================================================
echo.
echo Backend  : http://127.0.0.1:8000
echo Frontend : http://localhost:5173
echo Swagger  : http://127.0.0.1:8000/docs
echo.
echo You can close this launcher window.
echo The three services are running in their own windows.
echo ================================================
echo.

timeout /t 1 >nul