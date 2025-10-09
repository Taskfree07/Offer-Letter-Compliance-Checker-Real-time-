# Email & Offer Letter Compliance System

A modern React application for ensuring legal compliance in offer letters and email templates, with a specific focus on California employment law. The system provides real-time compliance checking, advanced document editing with ONLYOFFICE, AI-powered entity extraction with GLiNER, and protected variable fields.

## Features

### 📝 Core Features
- **Template Management**: Create, view, and manage email and offer letter templates
- **Word Document Processing**: Upload, edit, and manage .docx offer letters
- **PDF Processing**: Upload, preview, and generate compliant PDF documents
- **ONLYOFFICE Integration**: Professional document editing with full formatting preservation
- **Protected Variable Fields**: Content Controls prevent accidental deletion of `[Variable_Name]` placeholders
- **Real-time Variable Updates**: Instant synchronization between variable panel and document preview
- **Split-Screen Editor**: Edit templates with live preview and compliance feedback
- **Modern UI**: Clean, responsive design with intuitive user experience

### 🤖 AI-Powered Features
- **GLiNER Entity Recognition**: Advanced NLP for intelligent entity detection
- **Smart Variable Detection**: Automatically identifies and categorizes document variables:
  - Person names (candidates, employees)
  - Dates (start dates, deadlines)
  - Monetary values (salary, compensation)
  - Organizations (company names, departments)
  - Locations (addresses, work sites)
  - Job titles and positions
- **Entity Type Inference**: Automatically determines variable types from naming patterns
- **Context-Aware Suggestions**: Smart recommendations based on document analysis

### ⚖️ Compliance Features
- **Real-time Analysis**: Instant feedback on compliance issues
- **California Employment Law**: Focused on CA state requirements
- **Key Compliance Areas**:
  - Non-compete clauses (prohibited in CA)
  - Salary history questions (illegal)
  - Background check requirements
  - Drug testing regulations
  - Arbitration clauses
  - Employment agreement terms

### 🚨 Compliance Analysis
- **Visual Indicators**:
  - ✅ Green: Compliant documents
  - ❌ Red: Critical issues
  - ⚠️ Yellow: Warnings
- **Detailed Feedback**:
  - Specific law references
  - Violation details
  - Suggested corrections
  - Alternative compliant language

## Getting Started

### Prerequisites

- **Node.js** (version 14 or higher)
- **Python** (version 3.8 or higher)
- **Docker** (for ONLYOFFICE Document Server)
- npm or yarn

### Installation

#### 1. Clone the Repository
```bash
cd Email-automation-MVP
```

#### 2. Frontend Setup
```bash
npm install
```

#### 3. Backend Setup
```bash
cd python-nlp
python -m venv .venv
.venv\Scripts\activate  # On Windows
# source .venv/bin/activate  # On Linux/Mac

pip install -r requirements.txt
```

#### 4. ONLYOFFICE Document Server Setup
```bash
# Start ONLYOFFICE in Docker
docker-compose up -d

# Verify ONLYOFFICE is running
# Open http://localhost:8080 in your browser
```

#### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd python-nlp
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Technical Architecture

### System Overview
```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│   React Frontend│◄────►│  Flask Backend  │◄────►│  ONLYOFFICE      │
│   (Port 3000)   │      │  (Port 5000)    │      │  (Port 8080)     │
└─────────────────┘      └─────────────────┘      └──────────────────┘
         │                        │
         │                        ▼
         │               ┌─────────────────┐
         │               │  GLiNER NLP     │
         │               │  Entity Extract │
         │               └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────┐
│        Document Processing               │
│  - Content Controls Conversion          │
│  - Variable Protection                  │
│  - Real-time Synchronization            │
└─────────────────────────────────────────┘
```

### Frontend Components
```
src/
├── components/
│   ├── EmailEditor.js              # Main editor with variable management
│   ├── OnlyOfficeViewer.js         # ONLYOFFICE integration component
│   ├── WordDocumentEditor.js       # Word document editor (legacy)
│   ├── HomeScreen.js               # Landing page and template selection
│   ├── PDFGenerator.js             # PDF preview and generation
│   ├── TemplateModal.js            # Template management
│   └── compliance/
│       ├── ComplianceChecker.js    # Compliance checking logic
│       ├── ComplianceAnalysis.js   # Results display
│       ├── complianceRules.js      # Rule definitions
│       └── RulesManager.js         # Rule management
├── services/
│   ├── pdfTemplateService.js       # PDF handling
│   └── pdfContentExtractor.js      # Text extraction
```

### Backend Services
```
python-nlp/
├── app.py                          # Flask API server
├── docx_service.py                 # Word document processing
│   ├── Variable extraction
│   ├── Content Controls conversion
│   └── GLiNER integration
├── gliner_service.py               # GLiNER NLP engine
├── nlp_service.py                  # SpaCy NLP processing
├── pdf_service.py                  # PDF processing
└── enhanced_pdf_service.py         # Advanced PDF features
```

### Key Technologies

#### Frontend
- **React.js**: Frontend framework
- **ONLYOFFICE Document Server**: Professional document editing
- **pdf-lib**: PDF manipulation
- **PDF.js**: PDF rendering and text extraction

#### Backend
- **Flask**: Python web framework
- **GLiNER**: Generalized Linear Named Entity Recognition (AI model)
- **SpaCy**: Advanced NLP library
- **python-docx**: Word document manipulation
- **PyMuPDF**: PDF processing

#### Infrastructure
- **Docker**: ONLYOFFICE containerization
- **CORS**: Cross-origin resource sharing for API communication

## New Features (Latest Update)

### 1. ONLYOFFICE Integration
- **Professional Editing**: Full Microsoft Word compatibility
- **Real-time Collaboration**: Multi-user editing support (ready for future)
- **Format Preservation**: Maintains all document formatting, styles, and layout
- **Zero Learning Curve**: Familiar Word-like interface

### 2. Content Controls (Variable Protection)
- **Automatic Conversion**: `[Variable_Name]` placeholders are converted to Content Controls
- **Deletion Prevention**: Users cannot accidentally delete variable fields
- **Visual Distinction**: Protected fields are clearly marked in the editor
- **Format Preservation**: Variables maintain their formatting

### 3. GLiNER AI Integration
- **Smart Entity Detection**: Automatically identifies important entities in documents
- **Variable Enrichment**: Adds entity type metadata to detected variables:
  ```javascript
  {
    "Candidate_Name": {
      "name": "Candidate_Name",
      "value": "",
      "entity_type": "person",        // ← Detected by GLiNER
      "suggested_value": "John Doe",  // ← Smart suggestion
      "confidence": 0.95
    }
  }
  ```
- **Context-Aware**: Understands document structure and relationships

### 4. Real-time Variable Updates
- **Instant Synchronization**: Changes in variable panel update ONLYOFFICE editor immediately
- **No Page Reload**: Smooth, seamless user experience
- **Bi-directional Sync**: Changes in document update variable panel
- **JavaScript API Bridge**: Direct communication with ONLYOFFICE editor

### 5. Enhanced Variable Management
- **Variable Panel**: Clean, organized sidebar for managing all document variables
- **Type-Based Grouping**: Variables grouped by entity type (person, date, money, etc.)
- **Smart Defaults**: Pre-filled suggestions based on GLiNER analysis
- **Inline Editing**: Edit variables without leaving the document view

## Usage

### Importing and Editing Offer Letters

#### Step 1: Import Document
1. Click **"Import Offer Letter"** button on the home screen
2. Select a `.docx` Word document from your computer
3. Wait for the document to process:
   - Variables are automatically extracted
   - GLiNER analyzes entities and assigns types
   - `[Variable_Name]` placeholders converted to Content Controls
   - Document loads in ONLYOFFICE editor

#### Step 2: Edit Variables
1. **View Variables**: Check the right panel for all detected variables
2. **Edit Values**: Click on any variable to edit its value
3. **Real-time Updates**: Watch changes appear instantly in the document
4. **Protected Fields**: Try to delete a `[Variable]` - it's protected!

#### Step 3: Deep Editing (Optional)
1. **Use ONLYOFFICE**: Click inside the document to edit formatting
2. **Add Content**: Insert new paragraphs, tables, images
3. **Format Text**: Apply bold, italic, colors, fonts
4. **Track Changes**: All edits are automatically saved

#### Step 4: Save & Export
1. **Auto-Save**: Document saves automatically as you edit
2. **Download**: Click "Download" to get the edited .docx file
3. **Export PDF**: Convert to PDF while preserving all formatting

### Creating New Documents
1. **Home Screen**
   - View all available templates in a card-based layout
   - Click "Add New Template" to create a custom template
   - Click "Edit Template" on any existing template to start editing

2. **Template Editor**
   - **Left Panel**: ONLYOFFICE document editor with live preview
   - **Right Panel**: Variable management and compliance feedback
   - **Compliance Status**: Visual indicators for document compliance

### Checking Existing Documents
1. **Upload Document**
   - Click "Upload Document" button
   - Select your PDF or Word document
   - System automatically extracts and analyzes content

2. **Compliance Review**
   - Review automatic compliance analysis
   - See highlighted issues with severity indicators
   - Get specific law references and suggestions
   - Access alternative compliant language

3. **Document Generation**
   - Make suggested corrections
   - Preview updated content in real-time
   - Generate new compliant document

## API Endpoints

### ONLYOFFICE Integration
```
POST   /api/onlyoffice/upload                # Upload document
GET    /api/onlyoffice/config/:doc_id        # Get editor config
GET    /api/onlyoffice/variables/:doc_id     # Get document variables
POST   /api/onlyoffice/update-variables/:id  # Update variables
GET    /api/onlyoffice/download/:doc_id      # Download document
POST   /api/onlyoffice/callback/:doc_id      # ONLYOFFICE save callback
```

### Word Document Processing
```
POST   /api/docx-extract-variables           # Extract variables from .docx
POST   /api/docx-replace-variables           # Replace variables in .docx
POST   /api/docx-to-pdf                      # Convert .docx to PDF
GET    /api/docx-health                      # Check service health
```

### GLiNER AI Services
```
POST   /api/extract-entities-gliner          # Extract entities with GLiNER
POST   /api/extract-pdf-entities-gliner      # Extract from PDF using GLiNER
GET    /api/gliner-health                    # Check GLiNER service health
```

### NLP Services
```
POST   /api/extract-entities                 # Extract entities (SpaCy)
POST   /api/suggest-variables                # Suggest template variables
POST   /api/process-document                 # Comprehensive document analysis
```

## Configuration

### Environment Variables

**Backend (`python-nlp/.env`):**
```bash
HOST=0.0.0.0
DEBUG=False
ONLYOFFICE_SERVER_URL=http://localhost:8080
UPLOAD_FOLDER=./uploads
```

**ONLYOFFICE (`docker-compose.yml`):**
```yaml
services:
  onlyoffice-documentserver:
    image: onlyoffice/documentserver:latest
    ports:
      - "8080:80"
    environment:
      - JWT_ENABLED=false
      - WOPI_ENABLED=false
      - USE_UNAUTHORIZED_STORAGE=true
```

## Troubleshooting

### ONLYOFFICE Not Loading
1. **Check Docker**: `docker ps` - ensure container is running
2. **Check Port**: Visit http://localhost:8080 to verify ONLYOFFICE is accessible
3. **Restart Docker**: `docker-compose restart`
4. **Check Logs**: `docker-compose logs onlyoffice-documentserver`

### Variables Not Updating
1. **Refresh Page**: Browser cache may need clearing
2. **Check Backend**: Ensure Flask server is running on port 5000
3. **Check Console**: Open browser DevTools for JavaScript errors
4. **Verify Format**: Variables should be detected as objects `{}`, not arrays `[]`

### GLiNER Model Loading
1. **First Run Delay**: GLiNER downloads ~50MB model on first run (takes 2-5 minutes)
2. **Memory Requirements**: Ensure at least 2GB RAM available
3. **Check Logs**: Backend console shows "GLiNER service initialized successfully"
4. **Fallback Mode**: System works without GLiNER, but without AI entity detection

### Backend Connection Issues
1. **CORS Errors**: Ensure Flask backend allows `http://localhost:3000`
2. **Port Conflicts**: Check nothing else is using ports 3000, 5000, or 8080
3. **Network IP**: Backend auto-detects IP for Docker communication
4. **Firewall**: Ensure firewall allows localhost connections

## Compliance Rules

### California Employment Law Focus
Current implementation focuses on California employment law requirements:

1. **Non-compete Clauses**
   - Automatically detects prohibited non-compete language
   - Provides compliant alternatives
   - References CA Business & Professions Code Section 16600

2. **Salary History**
   - Identifies prohibited salary history questions
   - Suggests compliant alternatives
   - Based on California Labor Code Section 432.3

3. **Background Checks**
   - Ensures proper timing of checks
   - Validates Fair Chance Act compliance
   - References CA Labor Code Section 432.9

4. **Drug Testing**
   - Checks for compliant language
   - Validates against recent cannabis laws
   - Based on CA Government Code Section 12954

## Development

### Adding New Features

#### Custom Variable Types
Edit `python-nlp/docx_service.py`:
```python
def _infer_entity_type_from_name(self, var_name: str) -> str:
    var_lower = var_name.lower()
    if 'custom_keyword' in var_lower:
        return 'custom_type'
    # ... more patterns
```

#### New Compliance Rules
Edit `src/components/compliance/complianceRules.js`:
```javascript
export const complianceRules = {
  newRule: {
    severity: 'error',
    message: 'Rule description',
    lawReference: 'Legal citation',
    flaggedPhrases: ['prohibited terms'],
    suggestion: 'Compliant alternative'
  }
}
```

### Running Tests
```bash
# Backend tests
cd python-nlp
python -m pytest

# Frontend tests
npm test
```

## Future Enhancements

### Planned Features
- **Multi-user Collaboration**: Real-time collaborative editing
- **Version History**: Track document changes over time
- **Template Library**: Shared template marketplace
- **Multi-state Compliance**: Support for all 50 US states
- **Custom Rule Builder**: Visual interface for compliance rules
- **Batch Processing**: Process multiple documents at once
- **HR System Integration**: Connect with ATS/HRIS platforms
- **E-signature Integration**: DocuSign, Adobe Sign support

### Expansion Areas
- **AI Improvements**:
  - GPT-4 integration for intelligent suggestions
  - Custom entity recognition training
  - Automated compliance fixing
- **Additional Formats**:
  - Google Docs integration
  - LibreOffice compatibility
  - HTML/Markdown export
- **Industry-Specific Rules**:
  - Healthcare (HIPAA)
  - Finance (FINRA)
  - Technology (IP protection)

## Technical Details

### Content Controls Implementation
Content Controls are XML structures in .docx files that protect text:
```xml
<w:sdt>
  <w:sdtPr>
    <w:tag w:val="Variable_Name"/>
    <w:lock w:val="sdtContentLocked"/>
  </w:sdtPr>
  <w:sdtContent>
    <w:t>[Variable_Name]</w:t>
  </w:sdtContent>
</w:sdt>
```

### GLiNER Entity Types
```python
ENTITY_LABELS = {
    "offer_letter": [
        "person",           # Names, candidates
        "organization",     # Company names
        "date",            # Start dates, deadlines
        "money",           # Salary, compensation
        "location",        # Addresses, offices
        "job_title",       # Position names
        "time",            # Work hours
        "percentage",      # Benefits, equity
    ]
}
```

### Real-time Sync Architecture
```javascript
// Frontend triggers update
handleVariableChange(varName, newValue) {
  // 1. Update backend document
  await fetch('/api/onlyoffice/update-variables', {
    body: JSON.stringify({ variables: {...} })
  });

  // 2. Update ONLYOFFICE editor directly (no reload!)
  onlyofficeViewerRef.current.updateVariable(varName, newValue);
}

// ONLYOFFICE API receives update
updateVariable(varName, newValue) {
  docEditorRef.current.serviceCommand('setMailMergeRecipients', {
    [varName]: newValue
  });
}
```

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API documentation](#api-endpoints)
3. Check Docker logs: `docker-compose logs`
4. Check backend logs in the Python console
5. Check browser console for frontend errors

## Changelog

### Latest Update (2025)
- ✅ ONLYOFFICE Document Server integration
- ✅ GLiNER AI-powered entity recognition
- ✅ Content Controls for variable protection
- ✅ Real-time variable synchronization
- ✅ Enhanced Word document processing
- ✅ Smart entity type inference
- ✅ Docker containerization for ONLYOFFICE
- ✅ Bi-directional document-variable sync

### Previous Versions
- v1.0: Initial release with PDF processing
- v1.1: Added compliance checking
- v1.2: California employment law rules
- v1.3: Template management system
