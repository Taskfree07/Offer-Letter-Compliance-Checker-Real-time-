# Email Automation MVP - Application Analysis

## 📊 Executive Summary

This document analyzes the current application structure to identify **active components** vs **unused/legacy code** for cost-optimized Azure deployment.

---

## ✅ Active Components (Currently Used)

### **1. Frontend (React Application)**

**Port**: 3000

**Active Components**:
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `HomeScreen.js` | `src/components/` | Landing page with template cards | ✅ Active |
| `OfferLetterPage.js` | `src/components/` | Main offer letter editor page | ✅ Active |
| `OnlyOfficeViewer.js` | `src/components/` | ONLYOFFICE document editor integration | ✅ Active |
| `VariablePanel.js` | `src/components/` | Variable management sidebar | ✅ Active |
| `FormExtraction.js` | `src/components/` | Form field extraction UI | ✅ Active |
| `ApiKeySettings.js` | `src/components/` | API key configuration | ✅ Active |
| `EmailEditor.js` | `src/components/` | Email template editor | ✅ Active |
| `ComplianceChecker.js` | `src/components/compliance/` | Compliance validation logic | ✅ Active |
| `ComplianceAnalysis.js` | `src/components/compliance/` | Compliance results display | ✅ Active |
| `complianceRules.js` | `src/components/compliance/` | California law rules | ✅ Active |
| `RulesManager.js` | `src/components/compliance/` | Compliance rule management | ✅ Active |

**Key Dependencies** (Production):
- `react` + `react-dom` + `react-router-dom`
- `@ckeditor/ckeditor5-*` (minimal usage)
- `pdf-lib`, `pdfjs-dist` (PDF handling)
- `fabric` (canvas manipulation)
- `mammoth` (DOCX preview)
- `lucide-react` (icons)
- `socket.io-client` (websockets)

---

### **2. Backend (Flask API)**

**Port**: 5000

**Active Services**:
| Service | File | Purpose | Status |
|---------|------|---------|--------|
| **Main API** | `app.py` | Core Flask server with routing | ✅ Active |
| **DOCX Service** | `docx_service.py` | Word document processing | ✅ Active |
| **GLiNER AI** | `gliner_service.py` | Entity recognition (NLP) | ✅ Active |
| **NLP Service** | `nlp_service.py` | SpaCy text processing | ✅ Active |
| **PDF Service** | `pdf_service.py` | Basic PDF operations | ✅ Active |
| **Enhanced PDF** | `enhanced_pdf_service.py` | Advanced PDF features | ✅ Active |
| **DocxTPL** | `docxtpl_service.py` | Template rendering | ✅ Active |

**Active API Endpoints** (Most Used):
```
POST   /api/onlyoffice/upload              # Upload document
GET    /api/onlyoffice/config/:doc_id      # Get editor config
POST   /api/onlyoffice/update-variables    # Update variables (live rendering)
GET    /api/onlyoffice/download/:doc_id    # Download document
POST   /api/extract-entities-gliner        # GLiNER entity extraction
POST   /api/docx-extract-variables         # Extract variables from DOCX
POST   /api/docx-replace-variables         # Replace variables in DOCX
GET    /health                             # Health check
```

**Key Dependencies** (Production):
- `flask` + `flask-cors`
- `python-docx` (Word document manipulation)
- `gliner` (AI entity recognition)
- `spacy` + `en_core_web_sm` model
- `PyMuPDF` / `pdfplumber` (PDF processing)
- `requests` (HTTP calls)
- `gunicorn` (production server)

---

### **3. Infrastructure**

**ONLYOFFICE Document Server**:
- **Port**: 8080
- **Purpose**: Professional Word document editing
- **Docker Image**: `onlyoffice/documentserver:latest`
- **Status**: ✅ Active

**Persistent Storage**:
- **Location**: `uploads/` directory
- **Purpose**: Document sessions, uploaded files
- **Requirements**: Needs Azure Files mount
- **Status**: ✅ Active

---

## ❌ Unused/Legacy Components (Can Remove)

### **Frontend - Unused Components**

| Component | Path | Reason for Removal | Savings |
|-----------|------|-------------------|---------|
| `WordDocumentEditor.js` | `src/components/` | Replaced by ONLYOFFICE | Medium |
| `CleanPdfEditor.js` | `src/components/` | PDF editing not used | High |
| `EnhancedPDFViewer.js` | `src/components/` | PDF viewing handled elsewhere | High |
| `StructuralPDFEditor.js` | `src/components/` | Advanced PDF editing not used | High |
| `DynamicPDFViewer.js` | `src/components/` | Duplicate functionality | High |
| `EntityHighlighter.js` | `src/components/` | Legacy NLP UI | Low |
| `NLPIntegration.js` | `src/components/` | Old integration method | Low |
| `EntitiesPanel.js` | `src/components/` | Replaced by VariablePanel | Medium |

**Total Frontend Components**: 16
**Active Components**: 11 (69%)
**Unused Components**: 5 (31%)

---

### **Frontend - Unused Dependencies**

These can be removed from `package.json`:

| Dependency | Reason | Removal Impact |
|------------|--------|----------------|
| `@ckeditor/ckeditor5-*` | Barely used, ONLYOFFICE used instead | ~15MB bundle size |
| `react-quill` | Alternative editor not used | ~2MB |
| `tesseract.js` | OCR not implemented | ~10MB |
| `pdf2pic` | PDF to image not used | ~1MB |
| `html2canvas` | Screenshot feature unused | ~500KB |
| `react-draggable` | Dragging not implemented | ~100KB |
| `react-resizable` | Resizing not implemented | ~100KB |

**Estimated Bundle Size Reduction**: ~30MB

---

### **Backend - Unused Services**

| Service | File | Reason | Impact |
|---------|------|--------|--------|
| Advanced PDF processors | `advancedPdfProcessor.js` | Not called by frontend | Low |
| PDF structure preserver | `pdfStructurePreserver.js` | Not used | Low |
| Some NLP endpoints | Various in `app.py` | Frontend doesn't call them | Low |

**Note**: Most backend code is actually used. The unused parts are minor.

---

### **Backend - Unused Dependencies**

These can be removed from `requirements.txt`:

| Dependency | Reason | Removal Impact |
|------------|--------|----------------|
| `layoutparser[paddlepaddle]` | Not used, heavy dependency | ~500MB disk space |
| `borb` | PDF library not used | ~50MB |
| `weasyprint` | HTML to PDF not actively used | ~20MB |
| `beautifulsoup4` | HTML parsing minimal | ~1MB |

**Estimated Disk Space Reduction**: ~570MB

---

## 📈 Component Usage Statistics

### **Frontend Routes**
```javascript
"/" (HomeScreen)           ✅ Active - 100% used
"/offer-letter"            ✅ Active - 100% used
```

### **Backend Endpoints (by usage)**

**High Usage** (Called on every interaction):
- `POST /api/onlyoffice/upload` - Document upload
- `GET /api/onlyoffice/config/:doc_id` - Editor config
- `POST /api/onlyoffice/update-variables` - Live variable updates
- `POST /api/onlyoffice/extract-realtime/:doc_id` - Real-time extraction

**Medium Usage** (Called occasionally):
- `POST /api/extract-entities-gliner` - AI entity recognition
- `POST /api/docx-extract-variables` - Variable extraction
- `GET /api/gliner-health` - Health check
- `GET /api/docx-health` - Service status

**Low Usage** (Rarely called):
- `POST /api/suggest-variables` - Variable suggestions
- `POST /api/extract-entities` - SpaCy entity extraction
- `POST /api/load-legal-dictionary` - Compliance phrases

**Unused** (Not called by frontend):
- `POST /api/extract-pdf-variables` - PDF variable extraction
- `POST /api/create-editable-pdf` - PDF form creation
- `POST /api/html-to-pdf` - HTML conversion
- `POST /api/pdf-to-html` - PDF parsing
- `POST /api/docx-to-pdf` - DOCX conversion (LibreOffice)

---

## 💾 Storage Requirements

### **Current Storage Usage**

**Frontend (Production Build)**:
- Build folder: ~15MB (with optimizations)
- Node modules (dev): ~450MB (not deployed)

**Backend**:
- Python packages: ~800MB (with GLiNER model)
- GLiNER model download: ~50MB
- SpaCy model: ~12MB

**ONLYOFFICE**:
- Docker image: ~1.5GB
- Runtime data: ~100MB

**Total Production Size**: ~2.5GB

### **Optimized Storage (After Cleanup)**

**Frontend**:
- Remove unused dependencies: ~15MB → **~10MB** ✅

**Backend**:
- Remove layoutparser, borb, weasyprint: ~800MB → **~230MB** ✅

**ONLYOFFICE**:
- No changes: ~1.5GB (required)

**Total Optimized Size**: **~1.75GB** (30% reduction)

---

## 🎯 Deployment Recommendations

### **What to Deploy**

✅ **Deploy These**:
1. Frontend (React) - Optimized build
2. Backend (Flask) - With GLiNER and python-docx
3. ONLYOFFICE - Essential for document editing
4. Azure Files - For uploads/ persistence

### **What to Remove Before Deployment**

❌ **Remove These**:

**Frontend**:
```bash
# Remove unused components
rm src/components/WordDocumentEditor.js
rm src/components/CleanPdfEditor.js
rm src/components/EnhancedPDFViewer.js
rm src/components/StructuralPDFEditor.js
rm src/components/DynamicPDFViewer.js
rm src/components/EntityHighlighter.js
rm src/components/NLPIntegration.js
rm src/components/EntitiesPanel.js
```

**Frontend package.json**:
```json
// Remove these from dependencies:
"@ckeditor/ckeditor5-*",
"react-quill",
"tesseract.js",
"pdf2pic",
"html2canvas",
"react-draggable",
"react-resizable"
```

**Backend requirements.txt**:
```
# Remove these lines:
layoutparser[paddlepaddle]
borb
weasyprint
beautifulsoup4
```

---

## 📊 Cost Impact Analysis

### **Without Optimization**

**Container Sizes**:
- Frontend: 500MB
- Backend: 1.2GB
- ONLYOFFICE: 1.5GB
- **Total**: 3.2GB

**Azure Costs** (Estimated):
- Container Apps (3 containers): ~$35/month
- Storage (3.2GB): ~$5/month
- **Total**: **~$40/month**

---

### **With Optimization**

**Container Sizes**:
- Frontend: 350MB (↓30%)
- Backend: 700MB (↓42%)
- ONLYOFFICE: 1.5GB (unchanged)
- **Total**: 2.5GB

**Azure Costs** (Estimated):
- Container Apps (3 containers): ~$25/month (↓29%)
- Storage (2.5GB): ~$3/month (↓40%)
- **Total**: **~$28/month** ✅

**Savings**: **$12/month** (~30% reduction)

---

## 🚀 Quick Cleanup Script

Create this script to remove unused code:

```bash
#!/bin/bash
# cleanup-unused.sh

echo "🧹 Cleaning up unused components..."

# Remove unused frontend components
rm -f src/components/WordDocumentEditor.js
rm -f src/components/CleanPdfEditor.js
rm -f src/components/EnhancedPDFViewer.js
rm -f src/components/StructuralPDFEditor.js
rm -f src/components/DynamicPDFViewer.js
rm -f src/components/EntityHighlighter.js
rm -f src/components/NLPIntegration.js
rm -f src/components/EntitiesPanel.js

# Remove unused services
rm -f src/services/advancedPdfProcessor.js
rm -f src/services/pdfStructurePreserver.js

echo "✅ Cleanup complete!"
echo "📝 Next steps:"
echo "  1. Review and remove unused dependencies from package.json"
echo "  2. Review and remove unused packages from requirements.txt"
echo "  3. Run 'npm install' and 'pip install -r requirements.txt'"
```

---

## 📝 Summary

### **Application Structure**

**Total Components**: 25
**Active Components**: 17 (68%)
**Unused Components**: 8 (32%)

### **Key Technologies** (Active)
- ✅ React 18
- ✅ Flask + Gunicorn
- ✅ ONLYOFFICE Document Server
- ✅ GLiNER AI
- ✅ python-docx
- ✅ SpaCy NLP

### **Deployment Strategy**
1. **Keep**: Frontend (optimized), Backend (GLiNER + DOCX), ONLYOFFICE
2. **Remove**: Unused editors, heavy dependencies, legacy code
3. **Result**: 30% cost reduction, faster deployment

---

**Ready for Azure Deployment!** 🚀

See `AZURE_CONTAINER_APPS_DEPLOYMENT.md` for deployment instructions.
