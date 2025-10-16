@echo off
echo.
echo ========================================
echo   Checking Email Automation Services
echo ========================================
echo.

echo [1/4] Checking Docker Container...
docker ps | findstr onlyoffice
if %errorlevel% neq 0 (
    echo [ERROR] ONLYOFFICE container is not running!
    echo Run: docker-compose up -d
    goto :end
) else (
    echo [OK] ONLYOFFICE container is running
)
echo.

echo [2/4] Checking ONLYOFFICE Web Server...
curl -s -o nul -w "HTTP Status: %%{http_code}" http://localhost:8080
echo.
if %errorlevel% neq 0 (
    echo [ERROR] ONLYOFFICE web server is not responding!
    echo Wait 2 minutes for ONLYOFFICE to fully start
    goto :end
) else (
    echo [OK] ONLYOFFICE web server is responding
)
echo.

echo [3/4] Checking ONLYOFFICE API...
curl -s http://localhost:8080/web-apps/apps/api/documents/api.js | findstr /C:"Copyright"
if %errorlevel% neq 0 (
    echo [ERROR] ONLYOFFICE API is not ready!
    echo Wait 2 minutes for ONLYOFFICE to fully initialize
    goto :end
) else (
    echo [OK] ONLYOFFICE API is accessible
)
echo.

echo [4/4] Checking Backend Health...
curl -s http://localhost:5000/health | findstr /C:"healthy"
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running!
    echo Run: cd python-nlp ^&^& python app.py
    goto :end
) else (
    echo [OK] Backend is healthy
)
echo.

echo ========================================
echo   All Services Running! You're ready!
echo ========================================
echo.
echo Open: http://localhost:3000
echo.
goto :end

:end
pause
