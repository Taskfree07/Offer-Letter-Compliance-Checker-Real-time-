# Fix Summary: PDF-to-HTML 404 Error

## What Was Wrong

1. **Frontend was calling wrong port (5001 instead of 5000)** ✅ FIXED
   - Updated `src/services/pdfContentExtractor.js` to use `REACT_APP_API_URL` (default: `http://127.0.0.1:5000`)
   - Updated `test_endpoint.py` to use port 5000

2. **Backend route `/api/pdf-to-html` not registered (404)** ⚠️ NEEDS RESTART
   - Cause: `enhanced_pdf_service.py` failed to import because it had a hard dependency on `gliner_service`
   - Fix applied: Made GLiNER import optional so the service loads even without GLiNER
   - **Action required**: Restart the Flask server to apply the fix

## Files Changed

### Frontend
- ✅ `src/services/pdfContentExtractor.js` - Fixed port to 5000
- ✅ `test_endpoint.py` - Fixed port to 5000

### Backend
- ✅ `python-nlp/enhanced_pdf_service.py` - Made GLiNER import optional

### New Helper Scripts
- ✅ `python-nlp/check_dependencies.py` - Check which packages are installed
- ✅ `python-nlp/SETUP.md` - Complete setup guide
- ✅ `verify_backend.py` - Test backend endpoints
- ✅ `python-nlp/restart_server.ps1` - Helper to restart Flask server

## Current Status

✅ All Python dependencies are installed:
- Flask, Flask-CORS, spaCy ✅
- PyMuPDF, pdfplumber, beautifulsoup4 ✅
- WeasyPrint ⚠️ (installed but has GTK warning on Windows - this is normal)
- GLiNER ✅ (optional, but available)

✅ Flask server is running on port 5000

❌ `/api/pdf-to-html` route not available (404)
- Reason: Server started before the fix was applied
- Solution: Restart the server

## How to Fix (Next Steps)

### Option 1: PowerShell Script (Easiest)

```powershell
cd python-nlp
.\restart_server.ps1
```

### Option 2: Manual Restart

```powershell
# 1. Stop the current Flask server
#    Press Ctrl+C in the terminal where it's running
#    OR find and kill the process:
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# 2. Start the server again
cd python-nlp
python app.py
```

### Option 3: Task Manager

1. Open Task Manager (Ctrl+Shift+Esc)
2. Find Python process (PID 9304 or search for "python")
3. End the process
4. Open terminal in `python-nlp/` and run: `python app.py`

## Verification Steps

After restarting the server:

### 1. Check server logs

You should see:
```
Starting NLP API server on 127.0.0.1:5000
NLP service initialized successfully
Enhanced PDF service loaded successfully  <-- This is key!
```

If you see:
```
Enhanced PDF service not available: ...
```
Then there's still an import error. Check the error message.

### 2. Verify endpoints

```powershell
python verify_backend.py
```

Expected output:
```
✅ /health: OK (200)
✅ /api/enhanced-pdf-health: OK (200)
✅ /api/pdf-to-html: ROUTE EXISTS (400 - no file provided)
```

### 3. Test in browser

Visit: http://127.0.0.1:5000/api/enhanced-pdf-health

Should return:
```json
{
  "available": true,
  "services": {
    "pymupdf": true,
    "pdfplumber": true,
    "gliner_integration": true,
    "html_conversion": true,
    "weasyprint": true
  }
}
```

### 4. Try PDF import in UI

1. Start your React app (if not running): `npm start`
2. Open the email editor
3. Click "Import PDF" or "Upload Offer Letter"
4. Select a PDF file
5. Should see: "PDF converted to editable HTML! Found X variables..."

## Troubleshooting

### Still getting 404 after restart?

Check Flask startup logs for:
```
Enhanced PDF service not available: <error message>
```

Common causes:
- Import error in `enhanced_pdf_service.py`
- Import error in `gliner_service.py` (should be optional now)

### Getting 503 instead of 404?

This means the route is registered but the service is unavailable.

Check:
```powershell
python check_dependencies.py
```

Make sure PyMuPDF and pdfplumber show ✅

### WeasyPrint errors?

WeasyPrint warnings about GTK on Windows are normal. The service will still work for PDF-to-HTML conversion.

If HTML-to-PDF preview fails, it's likely a WeasyPrint issue. You can:
1. Install GTK3 runtime: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases
2. Or use the original PDF preview mode instead of HTML edit mode

### GLiNER errors?

GLiNER is now optional. The service will work without it, just with fewer entity suggestions.

To install GLiNER (optional):
```powershell
pip install gliner
```

## Summary

**Root cause**: The Flask server started before the fix was applied, so `enhanced_pdf_service` failed to import and the routes weren't registered.

**Solution**: Restart the Flask server.

**Expected result**: `/api/pdf-to-html` will be available and PDF imports will work in the UI.

---

**Last updated**: 2025-09-30 17:42 IST
