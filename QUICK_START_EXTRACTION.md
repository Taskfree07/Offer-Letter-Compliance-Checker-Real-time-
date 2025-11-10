# Quick Start: Real-Time Field Extraction

## TL;DR

Your app now **automatically extracts variables** from imported documents using **GLiNER (AI-powered NER)** + **regex fallback**. No refresh needed!

---

## What You're Using

| Technology | Purpose | Location |
|------------|---------|----------|
| **GLiNER** | AI-powered Named Entity Recognition | `python-nlp/gliner_service.py` |
| **spaCy** | NLP preprocessing | `python-nlp/nlp_service.py` |
| **python-docx** | Word document parsing | Backend dependencies |
| **Regex** | Fallback for bracketed variables | `src/services/fieldExtractor.js` |

---

## Current Implementation

### What Works ✅

1. **Auto-extraction on document load** (OnlyOffice)
2. **GLiNER + Regex hybrid** extraction
3. **Real-time display** in variable panel
4. **No refresh/buffer** - instant results

### What Doesn't Work ❌

1. **Typing in real-time** - Only extracts on load/save
   - OnlyOffice doesn't expose live content changes easily
   - Would need custom plugin or polling (not recommended)

2. **WebSocket live updates** - HTTP POST only
   - WebSocket libraries installed but not active
   - Works fine with current approach

---

## How to Test

### 1. Start Backend
```bash
cd python-nlp
python app.py
```

Look for:
```
✅ GLiNER service loaded successfully
```

### 2. Import Document
- Go to http://localhost:3000
- Click "Import Offer Letter"
- Choose a `.docx` file with variables like `[Candidate Name]`

### 3. Check Console
You should see:
```
🔍 Fetching variables for document: abc123...
✅ Variables extracted in real-time: {
  count: 8,
  method: "GLiNER + Regex",
  glinerEnabled: true
}
```

### 4. See Results
Variables appear in the right panel immediately - no waiting!

---

## What Libraries You Need

### Python Backend
```bash
pip install gliner              # AI NER model
pip install spacy               # NLP toolkit
pip install python-docx         # Word processing
pip install flask-socketio      # WebSocket (optional, installed)
pip install python-socketio     # Socket.IO (optional, installed)
```

### Frontend
```bash
npm install socket.io-client    # WebSocket (optional, installed)
```

---

## For Real-Time Typing (Future)

**Not implemented yet** - would require:

### Option 1: OnlyOffice Plugin (Recommended)
- Write custom OnlyOffice plugin
- Hook into `onContentChange` event
- Send updates to backend

### Option 2: Polling (Not Recommended)
- Poll document content every 2-3 seconds
- High server load
- Laggy UX

### Option 3: WebSocket + Manual Trigger
- Add "Extract Now" button
- User clicks when ready
- Fast but manual

---

## API Endpoint

```http
POST /api/onlyoffice/extract-realtime/<doc_id>
```

**Called automatically** by `OnlyOfficeViewer.js:255`

**Response:**
```json
{
  "success": true,
  "variables": {
    "Candidate Name": "John Smith",
    "Job Title": "Software Engineer"
  },
  "gliner_enabled": true,
  "extraction_method": "GLiNER + Regex",
  "total_variables": 2
}
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/services/realtimeExtractionService.js` | **NEW** - Pub/Sub service |
| `src/components/OnlyOfficeViewer.js` | Line 250-278 - Call realtime endpoint |
| `python-nlp/app.py` | Line 1422-1472 - New endpoint |

---

## Troubleshooting

### No Variables Showing?

1. Check backend logs for `✅ GLiNER service loaded`
2. Test endpoint: `curl http://127.0.0.1:5000/api/gliner-health`
3. Ensure document has bracketed variables like `[Name]`

### GLiNER Slow?

- First load: ~30 seconds (downloads model from HuggingFace)
- After: ~2-3 seconds per extraction
- Model cached in `python-nlp/.cache/`

### Wrong Variables?

Lower confidence threshold in `src/services/fieldExtractor.js:177`:
```javascript
confidenceThreshold: 0.2  // Was 0.3
```

---

## Summary

**Current State:**
- ✅ Automatic extraction on document load
- ✅ GLiNER (AI) + Regex (reliable)
- ✅ Real-time display without refresh
- ❌ No extraction while typing (needs OnlyOffice plugin)
- ❌ No WebSocket (using HTTP POST, works fine)

**What You Need:**
- GLiNER, spaCy, python-docx (Python)
- socket.io-client (JS, installed but not active)

**For Typing Real-Time:**
- OnlyOffice custom plugin (complex)
- Or: Poll content every N seconds (not recommended)

---

Read full guide: `REALTIME_EXTRACTION_GUIDE.md`
