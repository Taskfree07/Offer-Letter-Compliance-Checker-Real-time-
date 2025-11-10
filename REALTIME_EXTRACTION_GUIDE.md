# Real-Time Field Extraction with GLiNER - Implementation Guide

## Overview

Your Email Automation MVP now has **real-time field extraction** powered by GLiNER (Generalist and Lightweight Named Entity Recognition). When you import a PDF or DOCX offer letter, variables are **automatically extracted and displayed immediately** - no refresh or buffer needed!

---

## What You're Using

### Current Technologies

#### 1. **GLiNER** (`python-nlp/gliner_service.py`)
- **Model**: `urchade/gliner_small-v2.1` from HuggingFace
- **What it does**: Advanced NER that extracts offer letter fields like:
  - Candidate Name
  - Job Title
  - Company Name
  - Salary/Amount
  - Start Date
  - Department
  - Address
  - And many more...

- **Returns**: Structured entities with confidence scores
- **Endpoint**: `POST /api/extract-entities-gliner`

#### 2. **Field Extractor Service** (`src/services/fieldExtractor.js`)
- **Methods**:
  - GLiNER extraction (primary)
  - Regex-based extraction (fallback)
- **Hybrid Approach**: Uses both methods and merges results for maximum accuracy
- **Confidence Threshold**: 0.3 (adjustable)

#### 3. **Real-Time Extraction Service** (`src/services/realtimeExtractionService.js`) - **NEW!**
- **Purpose**: Pub/Sub pattern for variable updates
- **Features**:
  - Subscribe to variable changes
  - Automatic debouncing (500ms)
  - Instant notifications to UI
  - No manual refresh needed

#### 4. **Backend Endpoint** (`python-nlp/app.py:1422`)
```python
POST /api/onlyoffice/extract-realtime/<doc_id>
```
- **What it does**: Extracts variables from uploaded document using GLiNER
- **Response**: JSON with extracted variables + metadata
- **Called automatically**: When document loads in OnlyOffice

---

## How It Works (Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Imports PDF/DOCX Offer Letter                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Upload to Backend (POST /api/onlyoffice/upload)          │
│    - Stores document                                         │
│    - Generates unique doc_id                                 │
│    - Initial extraction (stored in session)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. OnlyOffice Loads Document                                │
│    - Fetches config from backend                            │
│    - Renders document in editor                              │
│    - onDocumentReady event fires                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. fetchVariables() Called Automatically                     │
│    - POST /api/onlyoffice/extract-realtime/<doc_id>         │
│    - Backend extracts text from DOCX                         │
│    - GLiNER analyzes text (+ regex fallback)                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Variables Displayed in UI Instantly                      │
│    - onVariablesUpdate() callback fires                      │
│    - Variable panel updates WITHOUT refresh                  │
│    - User can edit values in real-time                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files Modified

### Frontend

1. **`src/services/realtimeExtractionService.js`** - NEW!
   - Manages real-time extraction lifecycle
   - Pub/Sub pattern for UI updates
   - Debouncing and error handling

2. **`src/components/OnlyOfficeViewer.js`** (Modified)
   - **Line 250-278**: Updated `fetchVariables()` to call real-time endpoint
   - Now calls `POST /api/onlyoffice/extract-realtime/<doc_id>` instead of GET
   - Logs extraction method (GLiNER vs Regex)

### Backend

3. **`python-nlp/app.py`** (Modified)
   - **Line 1422-1472**: New endpoint `/api/onlyoffice/extract-realtime/<doc_id>`
   - Calls `extract_docx_variables()` with GLiNER enrichment
   - Returns: variables + metadata (method, confidence, count)

---

## What Plugins/Libraries Are Used

### Python Backend

```bash
# Already Installed
pip install gliner                 # NER model
pip install spacy                  # NLP toolkit
pip install python-docx            # Word document processing
pip install flask                  # Web framework
pip install flask-cors             # CORS support

# Newly Added
pip install flask-socketio         # WebSocket support (optional, for future)
pip install python-socketio        # Socket.IO client
```

### Frontend

```bash
# Already Installed
npm install react
npm install @onlyoffice/documentserver  # OnlyOffice SDK

# Newly Added
npm install socket.io-client       # WebSocket client (optional, for future)
```

---

## Current Implementation Status

### ✅ Working Features

1. **Automatic Extraction on Load**
   - Variables extract when document opens in OnlyOffice
   - No manual "Extract" button needed

2. **GLiNER Integration**
   - Uses advanced NER model
   - Fallback to regex if GLiNER unavailable

3. **Real-Time Display**
   - Variables appear in UI immediately
   - No page refresh required
   - Console logs show extraction progress

4. **Hybrid Extraction**
   - GLiNER (primary): High accuracy, context-aware
   - Regex (fallback): Reliable for bracketed variables like `[Candidate Name]`

### 🚧 What's NOT Yet Implemented

1. **Real-Time Content Changes**
   - Variables extract on load and on save callback
   - NOT yet implemented: Extract as user types in OnlyOffice
   - **Why**: OnlyOffice doesn't expose real-time content change events easily

2. **WebSocket for Live Updates**
   - Currently using HTTP POST (works fine!)
   - WebSockets installed but not active yet
   - **Future**: Could push updates from backend to all connected clients

3. **Variable Validation**
   - No validation rules yet (e.g., email format, date format)
   - **Future**: Add validation + warnings in UI

---

## How to Use

### For PDF Offer Letters

```javascript
// In your component
import realtimeExtractionService from './services/realtimeExtractionService';

// Subscribe to variable updates
useEffect(() => {
  const unsubscribe = realtimeExtractionService.subscribe((variables) => {
    console.log('Variables updated:', variables);
    setMyVariables(variables);
  });

  return () => unsubscribe(); // Cleanup
}, []);

// Extract from PDF file
const handlePDFUpload = async (file) => {
  const result = await realtimeExtractionService.extractVariables(file, {
    immediate: true,      // Skip debouncing
    useGLiNER: true,      // Use GLiNER
    useRegex: true,       // Also use regex
    confidenceThreshold: 0.3
  });

  console.log('Extracted:', result.variables);
};
```

### For OnlyOffice Documents

```javascript
// Already integrated in OnlyOfficeViewer.js
// Just pass onVariablesUpdate callback:

<OnlyOfficeViewer
  documentId={docId}
  onVariablesUpdate={(vars) => {
    console.log('Variables extracted:', vars);
    // Update your UI state
  }}
/>

// Variables are extracted automatically:
// 1. When document loads (onDocumentReady)
// 2. When document changes (onDocumentStateChange)
```

---

## Testing the Implementation

### Step 1: Start Backend
```bash
cd python-nlp
python app.py
```

Expected output:
```
✅ GLiNER service loaded successfully
✅ NLP service initialized successfully
✅ Loaded 0 existing document sessions from disk
Starting NLP API server on 0.0.0.0:5000
```

### Step 2: Import Document
1. Go to your app (http://localhost:3000)
2. Click "Import Offer Letter"
3. Select a DOCX file with variables like `[Candidate Name]`, `[Job Title]`, etc.

### Step 3: Check Console
You should see:
```
📄 Loading ONLYOFFICE config for document: abc123...
✅ ONLYOFFICE Document Ready
🔍 Fetching variables for document: abc123...
✅ Variables extracted in real-time: {
  count: 8,
  method: "GLiNER + Regex",
  glinerEnabled: true
}
```

### Step 4: Check Variable Panel
- Variables should appear immediately
- No "Loading..." state
- Editable fields for each variable

---

## Troubleshooting

### Variables Not Appearing?

**Check 1: Backend Running?**
```bash
curl http://127.0.0.1:5000/api/gliner-health
```
Expected: `{"success": true, "available": true}`

**Check 2: GLiNER Loaded?**
- Look for: `✅ GLiNER service loaded successfully` in backend logs
- If not, run: `pip install gliner`

**Check 3: Document Format**
- Must be `.docx` (not `.doc`)
- Variables should be in format: `[Variable Name]`

### Extraction Takes Too Long?

- GLiNER first load: ~30 seconds (downloads model)
- Subsequent loads: ~2-3 seconds
- Check: `python-nlp/.cache` folder (HuggingFace cache)

### Variables Wrong or Missing?

**Adjust confidence threshold:**
```javascript
// In src/services/fieldExtractor.js line 177
confidenceThreshold: 0.2  // Lower = more results, less accuracy
```

**Add custom entity labels:**
```python
# In python-nlp/gliner_service.py line 54
entity_labels = [
    "candidate_name", "job_title",
    # Add your custom labels here:
    "employee_id", "office_location"
]
```

---

## API Reference

### POST /api/onlyoffice/extract-realtime/<doc_id>

**Description**: Extract variables from uploaded document in real-time

**Request**:
```http
POST /api/onlyoffice/extract-realtime/abc123def456
Content-Type: application/json
```

**Response**:
```json
{
  "success": true,
  "variables": {
    "Candidate Name": "John Smith",
    "Job Title": "Senior Software Engineer",
    "Company Name": "TechCorp Inc.",
    "Amount": "$120,000",
    "Start Date": "January 15, 2024"
  },
  "gliner_enabled": true,
  "extraction_method": "GLiNER + Regex",
  "total_variables": 5,
  "message": "Extracted 5 variables in real-time"
}
```

### Frontend Service Methods

```javascript
import realtimeExtractionService from './services/realtimeExtractionService';

// Subscribe to updates
const unsubscribe = realtimeExtractionService.subscribe((vars) => {
  console.log('New variables:', vars);
});

// Extract from file/text
const result = await realtimeExtractionService.extractVariables(input, {
  immediate: false,           // Debounce?
  useGLiNER: true,            // Use GLiNER?
  useRegex: true,             // Use regex fallback?
  confidenceThreshold: 0.3    // Minimum confidence
});

// Extract from OnlyOffice document
const result = await realtimeExtractionService.extractFromOnlyOfficeDocument(docId);

// Update single variable
realtimeExtractionService.updateVariable('Candidate Name', 'Jane Doe');

// Clear all
realtimeExtractionService.clearVariables();
```

---

## Next Steps & Enhancements

### Short Term (Easy Wins)

1. **Add Loading Indicator**
   - Show spinner while extracting
   - Display confidence scores in UI

2. **Variable Suggestions**
   - Suggest field names for unmapped entities
   - Allow user to create custom mappings

3. **Export Extracted Data**
   - Save variables to JSON
   - Import from previous extractions

### Medium Term

1. **Real-Time Typing Extraction** (Complex)
   - Monitor OnlyOffice content changes
   - Extract as user types
   - Requires OnlyOffice plugin/connector

2. **Validation Rules**
   - Email format validation
   - Date parsing and formatting
   - Currency normalization

3. **Multi-Document Support**
   - Extract from multiple documents
   - Merge variables from different sources

### Long Term

1. **WebSocket Integration**
   - Push updates to all clients
   - Collaborative variable editing
   - Real-time sync across devices

2. **Machine Learning Improvements**
   - Fine-tune GLiNER on your specific offer letters
   - Custom NER model training
   - Active learning from user corrections

3. **AI-Powered Suggestions**
   - Use GPT to suggest missing fields
   - Auto-complete based on context
   - Smart field mapping

---

## Summary

### What Works Now

✅ **Automatic extraction** when document loads in OnlyOffice
✅ **GLiNER + Regex hybrid** extraction for maximum accuracy
✅ **Real-time display** in variable panel without refresh
✅ **Pub/Sub architecture** for scalable updates
✅ **Console logging** for debugging and transparency

### What You Need

**Libraries**:
- GLiNER (Python): Advanced NER
- spaCy (Python): NLP toolkit
- python-docx (Python): Word processing
- flask-socketio (Python): WebSocket support (installed, not active)
- socket.io-client (JS): Frontend WebSocket (installed, not active)

**For Real-Time Typing** (Future):
- OnlyOffice Document Builder API
- Custom OnlyOffice plugin
- Or: Poll document content every N seconds (not recommended)

---

## Questions?

Check the implementation files:
- Frontend: `src/services/realtimeExtractionService.js`
- Backend: `python-nlp/app.py` (line 1422)
- GLiNER: `python-nlp/gliner_service.py`
- OnlyOffice: `src/components/OnlyOfficeViewer.js` (line 250)

---

**Generated**: 2025-10-27
**Author**: Claude Code Assistant
**Version**: 1.0
