@echo off
echo ====================================
echo Restarting Flask Server with Fix
echo ====================================
echo.

echo Step 1: Killing all Python processes...
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Step 2: Starting Flask server with enhanced PDF support...
echo.
cd python-nlp
echo Starting server from: %cd%
echo.
echo Look for this line in the output:
echo "Enhanced PDF service loaded successfully"
echo.
echo If you DON'T see that line, the PDF-to-HTML won't work!
echo ====================================
echo.
python app.py
