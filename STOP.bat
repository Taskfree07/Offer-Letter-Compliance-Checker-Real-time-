@echo off
setlocal enabledelayedexpansion
title Email Automation - Stop Services
color 0C

echo.
echo ===============================================================
echo          EMAIL AUTOMATION - STOP ALL SERVICES
echo ===============================================================
echo.
echo This will stop all running services.
echo.

REM Stop Docker container
echo [Stopping] ONLYOFFICE Document Server...
docker-compose down
if %errorlevel% equ 0 (
    echo [OK] ONLYOFFICE stopped successfully
) else (
    echo [WARNING] Could not stop ONLYOFFICE (may not be running)
)
echo.

REM Find and kill processes on port 5000 (Backend)
echo [Stopping] Backend Server (Port 5000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    if not "%%a"=="" (
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo Stopped process %%a on port 5000
        )
    )
)
echo [OK] Backend server stopped
echo.

REM Find and kill processes on port 3000 (Frontend)
echo [Stopping] Frontend Application (Port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    if not "%%a"=="" (
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo Stopped process %%a on port 3000
        )
    )
)
echo [OK] Frontend application stopped
echo.

echo ===============================================================
echo              ALL SERVICES STOPPED
echo ===============================================================
echo.
echo All services have been shut down.
echo.
echo To start the application again, run: START.bat
echo.
pause
