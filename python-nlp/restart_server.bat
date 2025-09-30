@echo off
echo Stopping existing Flask server on port 5000...

REM Kill process on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Stopping process %%a
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo.
echo Starting Flask server...
echo Press Ctrl+C to stop the server
echo.

python app.py
