@echo off
title Email Automation - First Time Setup
color 0A

echo.
echo ===============================================================
echo            EMAIL AUTOMATION - ONE-CLICK SETUP
echo ===============================================================
echo.
echo This will install everything you need to run the application.
echo This may take 5-10 minutes depending on your internet speed.
echo.
echo Press any key to start setup...
pause >nul

echo.
echo ===============================================================
echo   Step 1/5: Checking Prerequisites
echo ===============================================================
echo.

REM Check Node.js
echo [Checking] Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    echo After installing, run this setup again.
    pause
    exit /b 1
)
echo [OK] Node.js is installed
node --version
echo.

REM Check Python
echo [Checking] Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is NOT installed!
    echo.
    echo Please download and install Python from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation!
    echo After installing, run this setup again.
    pause
    exit /b 1
)
echo [OK] Python is installed
python --version
echo.

REM Check Docker
echo [Checking] Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is NOT installed!
    echo.
    echo Please download and install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo After installing, run this setup again.
    pause
    exit /b 1
)
echo [OK] Docker is installed
docker --version
echo.

echo ===============================================================
echo   Step 2/5: Installing Frontend Dependencies
echo ===============================================================
echo.
echo This will install React and other frontend libraries...
echo Please wait, this may take 2-3 minutes...
echo.

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b 1
)

echo.
echo [OK] Frontend dependencies installed successfully!
echo.

echo ===============================================================
echo   Step 3/5: Installing Backend Dependencies
echo ===============================================================
echo.
echo This will install Python Flask and AI libraries...
echo Please wait, this may take 2-3 minutes...
echo.

cd python-nlp

REM Create virtual environment if it doesn't exist
if not exist "myenv\" (
    echo Creating Python virtual environment...
    python -m venv myenv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
)

REM Activate virtual environment and install dependencies
echo Installing Python packages in virtual environment...
call myenv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Backend installation failed!
    pause
    exit /b 1
)

REM Download spacy model
echo.
echo Downloading spaCy language model...
python -m spacy download en_core_web_sm
if %errorlevel% neq 0 (
    echo [WARNING] spaCy model download failed, but continuing...
)

deactivate
cd ..

echo.
echo [OK] Backend dependencies installed successfully!
echo.

echo ===============================================================
echo   Step 4/5: Starting ONLYOFFICE Document Server
echo ===============================================================
echo.
echo This will download and start the document editor...
echo First time download is ~500MB, may take 5-10 minutes...
echo.

docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start ONLYOFFICE!
    echo.
    echo Make sure Docker Desktop is running and try again.
    pause
    exit /b 1
)

echo.
echo [OK] ONLYOFFICE container started!
echo.
echo Waiting for ONLYOFFICE to initialize (this takes ~60 seconds)...
timeout /t 60 /nobreak >nul

echo ===============================================================
echo   Step 5/5: Verifying Installation
echo ===============================================================
echo.

REM Check Docker container
docker ps | findstr onlyoffice >nul
if %errorlevel% neq 0 (
    echo [WARNING] ONLYOFFICE container may still be starting...
    echo This is normal. Wait 1-2 minutes and run START.bat
) else (
    echo [OK] ONLYOFFICE container is running
)
echo.

echo ===============================================================
echo                    SETUP COMPLETE!
echo ===============================================================
echo.
echo Everything is installed and ready to go!
echo.
echo NEXT STEPS:
echo   1. Close this window
echo   2. Double-click START.bat to launch the application
echo   3. Open your browser to http://localhost:3000
echo.
echo ===============================================================
echo.
pause
