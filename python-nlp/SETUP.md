# Backend Setup Guide

This guide will help you set up and run the Python Flask backend for the Email Automation MVP.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Quick Start

### 1. Create Virtual Environment

```powershell
# Navigate to python-nlp directory
cd python-nlp

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Or for Command Prompt
.\.venv\Scripts\activate.bat
```

### 2. Install Dependencies

```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

### 3. Verify Installation

```powershell
# Check which dependencies are installed
python check_dependencies.py
```

Expected output:
```
✅ Flask: installed
✅ Flask-CORS: installed
✅ spaCy: installed
✅ spaCy model 'en_core_web_sm': installed
✅ PyMuPDF: installed
✅ pdfplumber: installed
✅ beautifulsoup4: installed
✅ weasyprint: installed
```

### 4. Start the Server

```powershell
# Start Flask development server
python app.py
```

The server will start on `http://127.0.0.1:5000`

You should see:
```
Starting NLP API server on 127.0.0.1:5000
NLP service initialized successfully
Enhanced PDF service loaded successfully
```

### 5. Verify Backend is Running

Open a new terminal and run:

```powershell
# From project root
python verify_backend.py
```

Or visit in your browser:
- Health check: http://127.0.0.1:5000/health
- Enhanced PDF health: http://127.0.0.1:5000/api/enhanced-pdf-health
- All routes: http://127.0.0.1:5000/api/debug/routes

## Troubleshooting

### Issue: 404 on /api/pdf-to-html

**Cause**: Enhanced PDF service failed to load due to missing dependencies.

**Solution**:
1. Run `python check_dependencies.py` to see what's missing
2. Install missing packages:
   ```powershell
   pip install PyMuPDF pdfplumber beautifulsoup4 weasyprint
   ```
3. Restart the Flask server

### Issue: WeasyPrint fails to install on Windows

**Cause**: WeasyPrint requires GTK3 runtime on Windows.

**Solution**:
1. Download GTK3 runtime: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases
2. Install GTK3
3. Retry: `pip install weasyprint`

**Alternative**: Use the simpler PDF generation (without HTML-to-PDF conversion):
- The app will still work for basic PDF generation
- HTML editing mode will be limited

### Issue: GLiNER not available

**Note**: GLiNER is optional. The service will work without it, but with reduced entity suggestions.

**To install GLiNER** (optional):
```powershell
pip install gliner
```

First run will download the model (~500MB), which may take a few minutes.

### Issue: spaCy model not found

**Error**: `Can't find model 'en_core_web_sm'`

**Solution**:
```powershell
python -m spacy download en_core_web_sm
```

### Issue: Port 5000 already in use

**Solution**: Change the port in `app.py`:
```python
port = 5001  # Or any available port
```

Then update `REACT_APP_API_URL` in your React app:
```
REACT_APP_API_URL=http://127.0.0.1:5001
```

## API Endpoints

### Core Endpoints

- `GET /health` - Health check
- `GET /api/debug/routes` - List all routes
- `GET /api/model-info` - NLP model information

### NLP Endpoints

- `POST /api/extract-entities` - Extract entities from text
- `POST /api/suggest-variables` - Suggest template variables
- `POST /api/replace-entities` - Replace entities with variables
- `POST /api/process-document` - Comprehensive document processing

### Enhanced PDF Endpoints

- `GET /api/enhanced-pdf-health` - Check PDF service availability
- `POST /api/pdf-to-html` - Convert PDF to editable HTML (main endpoint)
- `POST /api/html-to-pdf` - Convert HTML back to PDF
- `POST /api/extract-pdf-variables` - Extract bracketed variables from PDF
- `POST /api/debug-pdf-text` - Debug PDF text extraction

### GLiNER Endpoints (optional)

- `GET /api/gliner-health` - Check GLiNER availability
- `POST /api/extract-entities-gliner` - Extract entities using GLiNER
- `POST /api/extract-pdf-entities-gliner` - Extract entities from PDF using GLiNER

## Dependencies Explained

### Required (Core NLP)
- **flask**: Web framework
- **flask-cors**: CORS support for frontend
- **spacy**: NLP library for entity extraction
- **en_core_web_sm**: spaCy English language model

### Required (Enhanced PDF)
- **PyMuPDF (fitz)**: PDF reading and manipulation
- **pdfplumber**: PDF text extraction with positioning
- **beautifulsoup4**: HTML parsing
- **weasyprint**: HTML to PDF conversion

### Optional
- **gliner**: Advanced entity recognition (improves variable suggestions)
- **PyPDF2**: Alternative PDF library (fallback)

## Development

### Running in Debug Mode

```powershell
# Set environment variable
$env:DEBUG="True"

# Start server
python app.py
```

### Testing Endpoints

Use the provided test script:

```powershell
# Test PDF to HTML conversion
python ../test_endpoint.py
```

Or use curl/Postman to test individual endpoints.

## Production Deployment

For production, use a WSGI server like Gunicorn:

```powershell
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Support

If you encounter issues:
1. Run `python check_dependencies.py` to verify installation
2. Run `python ../verify_backend.py` to test endpoints
3. Check Flask logs for error messages
4. Ensure all dependencies are installed correctly
