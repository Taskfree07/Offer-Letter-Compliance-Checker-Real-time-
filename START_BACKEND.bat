@echo off
echo ========================================
echo Starting Flask Backend Server
echo ========================================
echo.

cd python-nlp

echo Checking if server is already running...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo Server is already running on port 5000!
    echo.
    pause
    exit /b
)

echo Starting Flask server...
echo Backend will be available at: http://127.0.0.1:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python app.py

pause
