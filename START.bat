@echo off
title Email Automation - Application Launcher
color 0B

echo.
echo ===============================================================
echo         EMAIL AUTOMATION - ONE-CLICK LAUNCHER
echo ===============================================================
echo.

REM Check if this is first time running
if not exist "node_modules\" (
    echo [WARNING] Dependencies not installed!
    echo.
    echo Please run SETUP.bat first to install everything.
    echo.
    pause
    exit /b 1
)

echo [Checking] Prerequisites...
echo.

REM Check Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running!
    echo.
    echo Please start Docker Desktop and wait for it to fully load.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Start ONLYOFFICE if not running
echo [Starting] ONLYOFFICE Document Server...
docker ps | findstr onlyoffice >nul
if %errorlevel% neq 0 (
    echo Starting ONLYOFFICE container...
    docker-compose up -d
    echo Waiting for ONLYOFFICE to initialize (60 seconds)...
    timeout /t 60 /nobreak >nul
) else (
    echo [OK] ONLYOFFICE is already running
)
echo.

REM Start Backend in new window
echo [Starting] Backend Server (Python Flask)...
start "Backend Server - Flask" cmd /k "cd python-nlp && call myenv\Scripts\activate.bat && echo. && echo ================================== && echo    Backend Server Running && echo ================================== && echo. && echo Backend URL: http://localhost:5000 && echo. && echo Do NOT close this window! && echo Press Ctrl+C to stop the backend && echo. && python app.py"

REM Wait a bit for backend to start
echo Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul
echo.

REM Start Frontend in new window
echo [Starting] Frontend Application (React)...
start "Frontend App - React" cmd /k "echo. && echo ================================== && echo    Frontend Application Running && echo ================================== && echo. && echo App URL: http://localhost:3000 && echo. && echo Do NOT close this window! && echo Press Ctrl+C to stop the frontend && echo. && npm start"

echo.
echo ===============================================================
echo              ALL SERVICES STARTING...
echo ===============================================================
echo.
echo The application is launching in separate windows.
echo Please wait 10-15 seconds for everything to initialize.
echo.
echo Your browser will automatically open to:
echo http://localhost:3000
echo.
echo If it doesn't open automatically, copy the URL above.
echo.
echo IMPORTANT:
echo - Do NOT close the Backend Server window
echo - Do NOT close the Frontend App window
echo - To stop the app, press Ctrl+C in those windows
echo.
echo ===============================================================
echo.
echo To check if all services are running properly:
echo   Run: check-services.bat
echo.
echo To stop everything:
echo   Close both terminal windows that just opened
echo   Run: docker-compose down
echo.
echo ===============================================================
echo.
pause
