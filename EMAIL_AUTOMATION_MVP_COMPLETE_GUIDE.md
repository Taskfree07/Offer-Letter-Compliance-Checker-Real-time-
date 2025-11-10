# 📧 Email & Offer Letter Compliance System
## Complete Setup and User Guide

*Version 2.0 - October 2025*

---

## 📖 Table of Contents

1. [What This Application Does](#what-this-application-does)
2. [System Requirements](#system-requirements)
3. [Pre-Installation Checklist](#pre-installation-checklist)
4. [Step-by-Step Installation](#step-by-step-installation)
5. [First-Time Setup](#first-time-setup)
6. [Running the Application](#running-the-application)
7. [How to Use the System](#how-to-use-the-system)
8. [Variable Panel Feature](#variable-panel-feature)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Technical Architecture](#technical-architecture)
12. [Maintenance and Updates](#maintenance-and-updates)

---

## 🎯 What This Application Does

### Primary Functions
The Email & Offer Letter Compliance System is a comprehensive tool designed for HR professionals and legal teams to create, edit, and verify employment documents while ensuring legal compliance.

**Core Capabilities:**
- **Document Import & Processing**: Upload Word (.docx) documents and PDFs
- **Intelligent Variable Detection**: Automatically finds placeholders like `[CANDIDATE_NAME]`, `[SALARY]`, `[START_DATE]`
- **Professional Document Editing**: Full Microsoft Word-compatible editor powered by ONLYOFFICE
- **AI-Powered Entity Recognition**: Uses GLiNER AI to identify and categorize document elements
- **Real-Time Compliance Checking**: Instant feedback on California employment law compliance
- **Protected Variable System**: Prevents accidental deletion of important placeholders
- **Professional PDF Generation**: Export polished, compliant documents

### Key Benefits
- **Legal Risk Reduction**: Automated compliance checking prevents costly legal issues
- **Time Savings**: Streamlined document creation and editing process
- **Professional Quality**: Enterprise-grade document editing capabilities
- **User-Friendly**: Intuitive interface requires no technical expertise
- **Scalable**: Handles individual documents or batch processing

---

## 💻 System Requirements

### Hardware Requirements
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux Ubuntu 18.04+
- **RAM**: Minimum 8GB (16GB recommended for optimal performance)
- **Storage**: At least 2GB free space
- **Network**: Internet connection for initial setup and AI model downloads
- **Display**: 1920x1080 resolution recommended

### Software Requirements (Must Install)

#### Essential Components
1. **Visual Studio Code** (Latest Version)
   - Primary development environment
   - Download: https://code.visualstudio.com/

2. **Node.js** (Version 16.0 or higher)
   - JavaScript runtime for the frontend
   - Download: https://nodejs.org/
   - Choose "LTS" (Long Term Support) version

3. **Python** (Version 3.8 to 3.11)
   - Backend processing engine
   - Download: https://www.python.org/downloads/
   - ⚠️ **Critical**: Check "Add Python to PATH" during installation

4. **Git** (Latest Version)
   - Version control system
   - Download: https://git-scm.com/
   - Use default installation settings

5. **Docker Desktop** (Latest Version)
   - Required for ONLYOFFICE Document Server
   - Download: https://www.docker.com/products/docker-desktop/
   - Enable virtualization in BIOS if required

#### Optional Components
- **Microsoft Word**: For compatibility testing
- **Adobe Acrobat Reader**: For PDF verification
- **Postman**: For API testing (developers only)

---

## ✅ Pre-Installation Checklist

### Before You Begin
Print this checklist and check off each item:

**System Preparation:**
- [ ] Administrator privileges on your computer
- [ ] Antivirus software temporarily disabled during installation
- [ ] Windows Defender exclusions set (see Troubleshooting section)
- [ ] At least 2GB free disk space available
- [ ] Stable internet connection

**Software Verification:**
After installing each required component, verify installation:

```bash
# Open Command Prompt (Windows) or Terminal (Mac/Linux)
# Run these commands one by one:

node --version
# Expected: v16.x.x or higher

npm --version  
# Expected: 8.x.x or higher

python --version
# Expected: Python 3.8.x to 3.11.x

git --version
# Expected: git version 2.x.x

docker --version
# Expected: Docker version 20.x.x or higher
```

**Installation Validation:**
- [ ] All commands above return version numbers (not "command not found")
- [ ] Docker Desktop is running (check system tray)
- [ ] No error messages during software installations
- [ ] Firewall allows Docker and Node.js applications

---

## 🔧 Step-by-Step Installation

### Phase 1: Get the Project Files

#### Option A: Download ZIP (Recommended for Non-Developers)
1. **Download the project**:
   - Visit the GitHub repository
   - Click the green "Code" button
   - Select "Download ZIP"
   - Extract to a folder like `C:\Projects\Email-automation-MVP`

#### Option B: Clone with Git (For Developers)
```bash
# Open Command Prompt and navigate to your projects folder
cd C:\Projects
git clone https://github.com/YOUR_USERNAME/Email-automation-MVP.git
cd Email-automation-MVP
```

### Phase 2: Open in Visual Studio Code

1. **Launch VS Code**
2. **Open the project**:
   - Click `File > Open Folder`
   - Navigate to your `Email-automation-MVP` folder
   - Click "Select Folder"
3. **Trust the workspace** when prompted

### Phase 3: Backend Setup (Python Services)

#### 3.1 Open Integrated Terminal
- In VS Code, press `Ctrl + `` (backtick key)
- Or click `Terminal > New Terminal`

#### 3.2 Navigate to Backend Directory
```bash
cd python-nlp
```

#### 3.3 Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
# source .venv/bin/activate

# Verify activation (you should see (.venv) in your prompt)
```

#### 3.4 Install Python Dependencies
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt

# This may take 5-10 minutes as it downloads AI models
```

#### 3.5 Download AI Language Model
```bash
# Download spaCy English model
python -m spacy download en_core_web_sm

# Verify GLiNER model (auto-downloads on first use)
python -c "from gliner_service import GLiNERService; print('GLiNER ready')"
```

### Phase 4: Frontend Setup (React Application)

#### 4.1 Open New Terminal
- Click the `+` icon in the terminal panel
- Or press `Ctrl + Shift + `` (backtick)

#### 4.2 Navigate to Project Root
```bash
# Ensure you're in the main project directory
cd ..
# You should see package.json in this directory
```

#### 4.3 Install Frontend Dependencies
```bash
# Install all Node.js packages
npm install

# This may take 3-5 minutes
```

#### 4.4 Verify Installation
```bash
# Check if installation was successful
npm list --depth=0
```

### Phase 5: Docker Setup (ONLYOFFICE Document Server)

#### 5.1 Start Docker Desktop
- Ensure Docker Desktop is running
- You should see the Docker icon in your system tray

#### 5.2 Launch ONLYOFFICE Container
```bash
# Start ONLYOFFICE Document Server
docker-compose up -d

# Wait for container to start (may take 2-3 minutes first time)
docker-compose logs onlyoffice-documentserver
```

#### 5.3 Verify ONLYOFFICE
- Open your web browser
- Navigate to `http://localhost:8080`
- You should see the ONLYOFFICE welcome page

---

## 🚀 First-Time Setup

### Initial Configuration

#### 1. Environment Variables Setup
Create configuration files for different environments:

**Backend Configuration (`python-nlp/.env`):**
```bash
# Create .env file in python-nlp directory
HOST=0.0.0.0
PORT=5000
DEBUG=True
ONLYOFFICE_SERVER_URL=http://localhost:8080
UPLOAD_FOLDER=./uploads
MAX_UPLOAD_SIZE=16777216
CORS_ORIGINS=http://localhost:3000
```

**Frontend Configuration (`.env`):**
```bash
# Create .env file in project root
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ONLYOFFICE_URL=http://localhost:8080
GENERATE_SOURCEMAP=false
```

#### 2. Create Required Directories
```bash
# In python-nlp directory
mkdir uploads
mkdir downloads
mkdir temp

# Set permissions (Linux/Mac only)
# chmod 755 uploads downloads temp
```

#### 3. Test Individual Components

**Test Backend Services:**
```bash
# In python-nlp directory with virtual environment activated
python app.py

# Expected output:
# ✅ GLiNER service initialized successfully
# ✅ Word document service loaded successfully  
# ✅ PDF service initialized
# * Running on http://127.0.0.1:5000
```

**Test Frontend Development Server:**
```bash
# In project root directory
npm start

# Expected output:
# webpack compiled with 0 errors
# Local: http://localhost:3000
# Browser should open automatically
```

---

## ▶️ Running the Application

### Daily Startup Procedure

#### Step 1: Start Docker Services
```bash
# Ensure Docker Desktop is running, then:
docker-compose up -d

# Verify ONLYOFFICE is ready:
curl http://localhost:8080
```

#### Step 2: Start Backend Server
```bash
# Terminal 1: Backend
cd python-nlp
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux
python app.py

# Wait for these success messages:
# ✅ GLiNER service initialized successfully
# ✅ Word document service loaded successfully
# * Running on http://127.0.0.1:5000
```

#### Step 3: Start Frontend Application
```bash
# Terminal 2: Frontend  
cd .. # (to project root)
npm start

# Browser will open to http://localhost:3000
# Application ready when you see the home screen
```

### System Status Verification

**Health Check Endpoints:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- ONLYOFFICE: http://localhost:8080
- GLiNER Service: http://localhost:5000/api/gliner-health

**Visual Confirmations:**
- ✅ Browser opens automatically to localhost:3000
- ✅ Home screen displays with "Import Offer Letter" button
- ✅ No error messages in either terminal
- ✅ Docker container shows "healthy" status

---

## 📚 How to Use the System

### Scenario 1: Processing an Offer Letter

#### Step 1: Prepare Your Document
Create a Word document with variables:
```
Dear [CANDIDATE_NAME],

We are pleased to offer you the position of [JOB_TITLE] 
at [COMPANY_NAME].

Your starting salary will be [ANNUAL_SALARY] per year, 
with an anticipated start date of [START_DATE].

This offer includes:
- Health insurance effective [BENEFITS_START_DATE]
- [VACATION_DAYS] days of paid vacation annually
- Stock options: [EQUITY_PERCENTAGE]% vesting over 4 years

Please respond by [RESPONSE_DEADLINE].

Sincerely,
[HIRING_MANAGER_NAME]
[HIRING_MANAGER_TITLE]
```

#### Step 2: Import and Process
1. **Click "Import Offer Letter"** on the home screen
2. **Select your .docx file** from the file picker
3. **Wait for processing** (30-60 seconds):
   - Document uploads to backend
   - GLiNER AI analyzes content
   - Variables are automatically detected
   - Content Controls are created for protection
   - ONLYOFFICE editor loads

#### Step 3: Review Detected Variables
The right panel will show detected variables with AI-powered categorization:

```
📝 Detected Variables:
┌─────────────────────────────────────────┐
│ 👤 Person Names                         │
│ • CANDIDATE_NAME: [Enter name]          │
│ • HIRING_MANAGER_NAME: [Enter name]     │
│                                         │
│ 💼 Job Information                      │
│ • JOB_TITLE: [Enter title]             │
│ • HIRING_MANAGER_TITLE: [Enter title]  │
│                                         │
│ 🏢 Organization                        │
│ • COMPANY_NAME: [Enter company]        │
│                                         │
│ 💰 Financial                           │
│ • ANNUAL_SALARY: [Enter amount]        │
│ • EQUITY_PERCENTAGE: [Enter percent]   │
│                                         │
│ 📅 Dates                               │
│ • START_DATE: [Select date]            │
│ • BENEFITS_START_DATE: [Select date]   │
│ • RESPONSE_DEADLINE: [Select date]     │
│                                         │
│ 🔢 Numbers                             │
│ • VACATION_DAYS: [Enter number]        │
└─────────────────────────────────────────┘
```

#### Step 4: Fill in Variable Values
1. **Click on each variable field** in the right panel
2. **Enter appropriate values**:
   - CANDIDATE_NAME: "Sarah Johnson"
   - JOB_TITLE: "Senior Software Engineer"
   - COMPANY_NAME: "TechCorp Solutions Inc."
   - ANNUAL_SALARY: "$120,000"
   - START_DATE: "January 15, 2025"
   - And so on...
3. **Watch real-time updates** in the ONLYOFFICE editor
4. **Variables are protected** - try deleting one; it won't work!

#### Step 5: Advanced Editing (Optional)
1. **Click in the document** to position cursor
2. **Format text**: Use ONLYOFFICE toolbar for bold, italic, colors
3. **Add content**: Insert additional paragraphs, tables, images
4. **Modify layout**: Adjust margins, spacing, headers/footers
5. **Track changes**: All edits are automatically saved

#### Step 6: Compliance Review
The system automatically analyzes your document:

```
⚖️ Compliance Analysis:
┌─────────────────────────────────────────┐
│ ✅ PASSED: No prohibited non-compete    │
│           clauses detected              │
│                                         │
│ ✅ PASSED: No illegal salary history    │
│           questions found               │
│                                         │
│ ⚠️  WARNING: Consider adding statement  │
│             about at-will employment    │
│             (CA Labor Code §2922)       │
│                                         │
│ ✅ PASSED: Background check timing      │
│           complies with Fair Chance Act │
└─────────────────────────────────────────┘
```

#### Step 7: Export Final Document
1. **Click "Download Document"** button
2. **Choose format**:
   - Download .docx (with all formatting preserved)
   - Export to PDF (professional, print-ready)
3. **File is saved** to your Downloads folder
4. **Open and verify** the final document

---

## 🎛️ Variable Panel Feature

### What is the Variable Panel?
The Variable Panel is a dedicated sidebar that appears when you import a Word document. It provides a clean, organized interface for managing all document variables without directly editing the document text.

### Key Features

#### 1. **Intelligent Variable Grouping**
Variables are automatically organized by type:
- 👤 **Person Names**: Employee names, hiring managers
- 🏢 **Organizations**: Company names, departments
- 📅 **Dates**: Start dates, deadlines, review periods
- 💰 **Financial**: Salaries, bonuses, equity percentages
- 📍 **Locations**: Office addresses, work sites
- 💼 **Job Titles**: Positions, roles, departments
- ⏰ **Time Periods**: Work hours, duration
- 📊 **Percentages**: Benefits, commission rates

#### 2. **AI-Powered Suggestions**
- GLiNER AI analyzes document context
- Provides intelligent suggestions for variable values
- Shows confidence scores for AI predictions
- Suggests appropriate variable types automatically

#### 3. **Protected Variable System**
- Variables in the document are converted to "Content Controls"
- Prevents accidental deletion of `[VARIABLE_NAME]` placeholders
- Maintains formatting while protecting content
- Visual distinction of protected fields in editor

#### 4. **Real-Time Synchronization**
- Changes in Variable Panel update ONLYOFFICE editor instantly
- No page reload required
- Bi-directional sync between panel and document
- Immediate visual feedback for all changes

### How to Use the Variable Panel

#### Step 1: Import Document
- Click "Import Offer Letter" and select a .docx file
- Wait for processing and variable detection
- Variable Panel automatically appears on the right side

#### Step 2: Edit Variables
1. **Scroll through variable groups** in the panel
2. **Click on any input field** to edit the value
3. **Type new values** - watch them update in the document instantly
4. **Use AI suggestions** by clicking the 💡 button next to fields

#### Step 3: Replace All Variables
1. **Make all your edits** in the Variable Panel
2. **Review changes** - modified fields show a green indicator
3. **Click "Replace in Template"** button at the bottom
4. **Confirm the action** - all variables update simultaneously

### Variable Panel Interface

```
📝 Document Variables                    [✅ Editor Ready]
├─────────────────────────────────────────────────────┤
│ 👤 Person Names (2)                                 │
│   ┌─────────────────────────────────────────────┐   │
│   │ CANDIDATE_NAME                          95% │   │
│   │ [Sarah Johnson________________] [💡]        │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│ 💼 Job Information (2)                              │
│   ┌─────────────────────────────────────────────┐   │
│   │ JOB_TITLE                              87% │   │
│   │ [Senior Software Engineer_____] [💡]        │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│ 💰 Financial (2)                                    │
│   ┌─────────────────────────────────────────────┐   │
│   │ ANNUAL_SALARY                          92% │   │
│   │ [$120,000___________________] [💡]        │   │
│   └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [🔄 Replace in Template] ●                          │
│                                                     │
│ You have unsaved changes. Click "Replace in         │
│ Template" to apply them.                            │
└─────────────────────────────────────────────────────┘
```

### Variable Panel Benefits

#### For HR Professionals
- **Familiar interface**: Similar to form-filling applications
- **Error prevention**: Can't accidentally delete important placeholders
- **Batch updates**: Update all variables at once
- **Visual feedback**: See exactly what will change before applying

#### For Legal Teams
- **Compliance integration**: Variable Panel works with compliance checker
- **Template consistency**: Ensures all required fields are filled
- **Audit trail**: Track what variables were changed
- **Professional output**: Maintains document formatting perfectly

#### For IT Administrators
- **Backend integration**: Secure API for variable updates
- **Real-time processing**: No document reloads required
- **Scalable architecture**: Handles multiple documents simultaneously
- **Error handling**: Graceful fallbacks if network issues occur

### Technical Details

#### API Integration
The Variable Panel communicates with the backend through these endpoints:
- `GET /api/onlyoffice/variables/<doc_id>` - Retrieve current variables
- `POST /api/onlyoffice/update-variables/<doc_id>` - Update variables
- `POST /api/onlyoffice/extract-realtime/<doc_id>` - Re-extract variables

#### Real-Time Updates
```javascript
// When user types in Variable Panel:
1. Update local state immediately (no lag)
2. Call ONLYOFFICE API to update editor visually
3. Send backend request to save changes (background)
4. Provide user feedback on success/failure
```

#### Content Controls Integration
```xml
<!-- Variable becomes protected Content Control -->
<w:sdt>
  <w:sdtPr>
    <w:tag w:val="CANDIDATE_NAME"/>
    <w:lock w:val="sdtContentLocked"/>
  </w:sdtPr>
  <w:sdtContent>
    <w:t>[CANDIDATE_NAME]</w:t>
  </w:sdtContent>
</w:sdt>
```

---

## 🔧 Advanced Features

### AI-Powered Entity Recognition (GLiNER)

#### What GLiNER Does
GLiNER (Generalized Linear Named Entity Recognition) is an advanced AI model that:
- **Analyzes document content** to understand context
- **Identifies entity types** automatically (person, date, money, organization)
- **Suggests variable values** based on document analysis
- **Improves accuracy** over time with usage

#### Entity Types Detected
```
Person Names:        John Doe, Sarah Smith, hiring managers
Organizations:       Company names, departments, subsidiaries  
Dates:              Start dates, deadlines, review periods
Money:              Salaries, bonuses, benefits amounts
Locations:          Offices, work sites, addresses
Job Titles:         Positions, roles, departments
Time Periods:       Hours, shifts, duration
Percentages:        Equity, benefits, commission rates
```

#### Confidence Scoring
GLiNER provides confidence scores for each detection:
- **High (90-100%)**: Highly confident, likely correct
- **Medium (70-89%)**: Moderately confident, review recommended
- **Low (50-69%)**: Low confidence, human verification required

### Content Controls (Variable Protection)

#### How It Works
When you import a document, the system:
1. **Scans for variables** using pattern matching
2. **Converts `[Variable]` to Content Controls** - special Word structures
3. **Applies protection settings** to prevent accidental deletion
4. **Maintains formatting** while adding protection

#### Technical Implementation
```xml
<!-- Example: [CANDIDATE_NAME] becomes protected Content Control -->
<w:sdt>
  <w:sdtPr>
    <w:tag w:val="CANDIDATE_NAME"/>
    <w:lock w:val="sdtContentLocked"/>
    <w:placeholder>
      <w:docPart w:val="DefaultPlaceholder_22675703"/>
    </w:placeholder>
  </w:sdtPr>
  <w:sdtContent>
    <w:r>
      <w:t>[CANDIDATE_NAME]</w:t>
    </w:r>
  </w:sdtContent>
</w:sdt>
```

#### Benefits
- **Accidental deletion prevention**: Can't accidentally remove variables
- **Visual distinction**: Protected fields clearly marked
- **Format preservation**: Variables maintain styling
- **Professional appearance**: Clean, polished documents

### Real-Time Document Synchronization

#### Architecture Overview
```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│ Variable Panel  │◄──────────────►│ ONLYOFFICE      │
│ (React)         │                │ Editor          │
└─────────────────┘                └─────────────────┘
         │                                  │
         │           HTTP API               │
         ▼                                  ▼
┌─────────────────────────────────────────────────────┐
│          Flask Backend Server                      │
│  • Variable state management                       │
│  • Document processing                             │
│  • GLiNER entity analysis                         │
└─────────────────────────────────────────────────────┘
```

#### Synchronization Flow
1. **User edits variable** in Variable Panel
2. **Frontend sends update** to Flask backend via HTTP
3. **Backend updates document** and variable state
4. **Backend notifies ONLYOFFICE** via JavaScript API
5. **ONLYOFFICE updates display** without page reload
6. **Variable panel reflects changes** immediately

### Professional Document Editing

#### ONLYOFFICE Capabilities
The integrated ONLYOFFICE Document Server provides:

**Full Microsoft Word Compatibility:**
- Open/edit .docx, .doc files
- Preserve all formatting, styles, layouts
- Support for headers, footers, page numbers
- Table creation and formatting
- Image insertion and manipulation
- Comments and track changes

**Advanced Formatting:**
- Custom fonts and typography
- Professional color schemes
- Paragraph and line spacing controls
- Indentation and alignment options
- Bullets, numbering, and lists
- Page layout and margins

**Collaborative Features (Ready for Future):**
- Real-time multi-user editing
- Comment threads and discussions
- Version history and change tracking
- User permissions and access control

#### Integration with Variable System
ONLYOFFICE seamlessly integrates with our variable management:
- **Protected variables** appear as special fields
- **Real-time updates** when variables change
- **Format preservation** during variable replacement
- **Professional output** maintains document quality

---

## 🆘 Troubleshooting Guide

### Common Installation Issues

#### Problem: "python is not recognized"
**Symptoms:**
- Command prompt shows "'python' is not recognized as an internal or external command"
- Python scripts won't run

**Solutions:**
1. **Reinstall Python with PATH option:**
   - Download Python installer again
   - Run as Administrator
   - Check "Add Python to PATH" checkbox
   - Complete installation
   - Restart Command Prompt

2. **Manual PATH configuration:**
   - Open System Properties → Advanced → Environment Variables
   - Add Python installation directory to PATH
   - Example: `C:\Users\YourName\AppData\Local\Programs\Python\Python39\`

3. **Verification:**
   ```bash
   python --version
   pip --version
   ```

#### Problem: "npm is not recognized"
**Symptoms:**
- Node.js commands don't work
- npm install fails

**Solutions:**
1. **Reinstall Node.js:**
   - Uninstall current version
   - Download latest LTS from nodejs.org
   - Install with default settings
   - Restart VS Code and Command Prompt

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install -g npm@latest
   ```

#### Problem: Docker Desktop won't start
**Symptoms:**
- "Docker Desktop starting..." never completes
- ONLYOFFICE container won't run

**Solutions:**
1. **Enable Virtualization:**
   - Restart computer
   - Enter BIOS/UEFI settings
   - Enable VT-x/AMD-V virtualization
   - Save and restart

2. **Windows Subsystem for Linux (WSL):**
   ```bash
   # Run as Administrator in PowerShell
   wsl --install
   wsl --set-default-version 2
   ```

3. **Reset Docker Desktop:**
   - Open Docker Desktop
   - Settings → Reset → Reset to factory defaults
   - Restart application

### Runtime Issues

#### Problem: "Port already in use"
**Symptoms:**
- Backend won't start: "Address already in use"
- Frontend shows connection errors

**Solutions:**
1. **Kill existing processes:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID [PID_NUMBER] /F
   
   netstat -ano | findstr :3000
   taskkill /PID [PID_NUMBER] /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   lsof -ti:3000 | xargs kill -9
   ```

2. **Use different ports:**
   ```bash
   # Backend on port 5001
   python app.py --port 5001
   
   # Frontend on port 3001
   PORT=3001 npm start
   ```

#### Problem: Variable Panel not working
**Symptoms:**
- Variables don't update in ONLYOFFICE editor
- "Replace in Template" button doesn't work
- Editor shows "not ready" status

**Solutions:**
1. **Check ONLYOFFICE connection:**
   ```bash
   # Verify ONLYOFFICE is running
   curl http://localhost:8080
   
   # Check Docker container status
   docker ps
   ```

2. **Restart the document session:**
   - Click "Remove Document" button
   - Re-import your Word document
   - Wait for full processing to complete

3. **Check browser console:**
   - Press F12 to open Developer Tools
   - Look for JavaScript errors in Console tab
   - Check Network tab for failed API calls

#### Problem: GLiNER model loading fails
**Symptoms:**
- Backend shows "GLiNER initialization failed"
- AI features don't work

**Solutions:**
1. **Check internet connection** - model downloads ~50MB on first run
2. **Clear model cache:**
   ```bash
   cd python-nlp
   rm -rf ~/.cache/huggingface/
   python -c "from gliner_service import GLiNERService; GLiNERService()"
   ```
3. **Increase timeout:**
   - Edit `gliner_service.py`
   - Increase `timeout` parameter in model loading

#### Problem: ONLYOFFICE editor not loading
**Symptoms:**
- Editor shows "Loading..." indefinitely
- Console errors about iframe security

**Solutions:**
1. **Check Docker status:**
   ```bash
   docker ps
   # Should show onlyoffice-documentserver as "Up"
   
   docker-compose logs onlyoffice-documentserver
   # Check for errors
   ```

2. **Verify ONLYOFFICE accessibility:**
   - Open http://localhost:8080 in browser
   - Should show ONLYOFFICE welcome page

3. **Browser security settings:**
   - Disable ad blockers for localhost
   - Allow mixed content in browser settings
   - Clear browser cache and cookies

### Document Processing Issues

#### Problem: Variables not detected
**Symptoms:**
- Variable Panel shows "No variables found"
- Document has obvious `[VARIABLE]` placeholders

**Solutions:**
1. **Check variable format:**
   - Must be `[VARIABLE_NAME]` format
   - Square brackets required
   - No spaces inside brackets: ❌ `[ VARIABLE ]` ✅ `[VARIABLE]`

2. **Re-process document:**
   ```bash
   # In backend terminal
   curl -X POST http://localhost:5000/api/docx-extract-variables \
     -F "file=@your-document.docx"
   ```

3. **Manual variable addition:**
   - Click "Add Variable" in Variable Panel
   - Enter variable name manually
   - Set type and default value

#### Problem: Document formatting lost
**Symptoms:**
- Downloaded document looks different
- Fonts, colors, or layout changed

**Solutions:**
1. **Use ONLYOFFICE for editing:**
   - Avoid external editing during process
   - All changes should be made in integrated editor

2. **Check Content Controls:**
   - Variables should appear as protected fields
   - Don't manually edit variable placeholders

3. **Save before download:**
   - Ensure auto-save completed
   - Wait for "Document saved" confirmation

### Performance Issues

#### Problem: Application running slowly
**Symptoms:**
- Long loading times
- Laggy interface
- High CPU/memory usage

**Solutions:**
1. **Increase system resources:**
   - Close other applications
   - Ensure 8GB+ RAM available
   - Check hard drive space (need 2GB+)

2. **Optimize Docker:**
   ```bash
   # Allocate more resources to Docker
   # Docker Desktop → Settings → Resources
   # Increase CPU cores and memory allocation
   ```

3. **Disable unnecessary features:**
   - Turn off real-time compliance checking temporarily
   - Process smaller documents first
   - Use simpler document templates

### Security and Antivirus Issues

#### Problem: Antivirus blocking application
**Symptoms:**
- Files getting deleted after creation
- "Threat detected" notifications
- Applications won't start

**Solutions:**
1. **Add exclusions:**
   ```
   Exclude these folders from antivirus scanning:
   - C:\Projects\Email-automation-MVP\
   - %USERPROFILE%\AppData\Local\npm-cache\
   - %USERPROFILE%\.docker\
   ```

2. **Temporarily disable real-time protection:**
   - During installation only
   - Re-enable after setup complete

3. **Whitelist processes:**
   - node.exe
   - python.exe
   - docker.exe

### Network and Firewall Issues

#### Problem: CORS errors in browser
**Symptoms:**
- Browser console shows "CORS policy" errors
- Frontend can't connect to backend

**Solutions:**
1. **Check backend CORS settings:**
   ```python
   # In python-nlp/app.py
   CORS(app, origins=['http://localhost:3000'])
   ```

2. **Verify URLs match:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - ONLYOFFICE: http://localhost:8080

3. **Disable browser security (temporary):**
   ```bash
   # Chrome with disabled security (for testing only)
   chrome.exe --user-data-dir=/tmp/chrome_test --disable-web-security
   ```

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                      │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Port 3000)                                    │
│  ├── EmailEditor.js           # Main editor interface          │
│  ├── OnlyOfficeViewer.js      # Document editor integration    │
│  ├── VariablePanel.js         # Variable management sidebar    │
│  ├── HomeScreen.js            # Landing page                   │
│  ├── ComplianceChecker.js     # Legal compliance analysis      │
│  └── TemplateModal.js         # Template management            │
└─────────────────────────────────────────────────────────────────┘
                                    │
                               HTTP/REST API
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Flask Backend (Port 5000)                                     │
│  ├── app.py                   # Main API server                │
│  ├── docx_service.py          # Word document processing       │
│  ├── gliner_service.py        # AI entity recognition          │
│  ├── nlp_service.py           # Natural language processing    │
│  ├── pdf_service.py           # PDF handling                   │
│  └── compliance_engine.py     # Legal compliance rules         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                            Document Processing
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ONLYOFFICE Document Server (Port 8080)                        │
│  ├── Document Editor          # Professional editing           │
│  ├── Conversion Engine        # Format transformation          │
│  ├── Collaboration Tools      # Multi-user support             │
│  └── API Gateway             # Document operations             │
└─────────────────────────────────────────────────────────────────┘
                                    │
                              File Storage
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  Local File System                                             │
│  ├── uploads/                 # Temporary file storage         │
│  ├── downloads/               # Processed documents            │
│  ├── templates/               # Document templates             │
│  └── cache/                   # AI model cache                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

#### Document Processing Pipeline
```
User Upload → File Validation → Format Detection → Content Extraction
     │                                                      │
     ▼                                                      ▼
Document Storage ← Variable Protection ← GLiNER Analysis ← Text Processing
     │                                                      
     ▼                                                      
ONLYOFFICE Loading → Real-time Editing → Compliance Check → Export
```

#### Variable Management Flow
```
Document Import
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ Variable Detection Engine                                   │
│ ├── Pattern Matching: [VARIABLE_NAME] detection            │
│ ├── GLiNER Analysis: Entity type classification            │
│ ├── Context Analysis: Smart type inference                 │
│ └── Validation: Format and consistency checks              │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ Content Controls Conversion                                 │
│ ├── XML Structure Creation: Protected field generation     │
│ ├── Format Preservation: Style and layout maintenance      │
│ ├── Lock Configuration: Deletion prevention setup          │
│ └── ONLYOFFICE Integration: Editor compatibility layer     │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ Real-time Synchronization                                  │
│ ├── Variable Panel Updates: User interface changes         │
│ ├── Document Editor Updates: Live preview updates          │
│ ├── Backend State Management: Centralized state            │
│ └── Conflict Resolution: Change priority handling          │
└─────────────────────────────────────────────────────────────┘
```

### API Architecture

#### REST Endpoints Structure
```
/api/
├── onlyoffice/
│   ├── POST   /upload              # Document upload
│   ├── GET    /config/:doc_id      # Editor configuration
│   ├── GET    /variables/:doc_id   # Variable retrieval
│   ├── POST   /update-variables/:id# Variable updates
│   ├── GET    /download/:doc_id    # Document download
│   └── POST   /callback/:doc_id    # Save callbacks
├── docx/
│   ├── POST   /extract-variables   # Variable extraction
│   ├── POST   /replace-variables   # Variable replacement
│   ├── POST   /to-pdf             # PDF conversion
│   └── GET    /health             # Service health
├── gliner/
│   ├── POST   /extract-entities    # Entity recognition
│   ├── POST   /pdf-entities       # PDF entity extraction
│   └── GET    /health             # GLiNER health
└── compliance/
    ├── POST   /analyze            # Compliance analysis
    ├── GET    /rules              # Rule retrieval
    └── POST   /suggestions        # Improvement suggestions
```

#### WebSocket Integration (Future)
```
WebSocket Endpoint: ws://localhost:5000/ws
├── document_change     # Real-time document updates
├── variable_update     # Variable synchronization
├── collaboration      # Multi-user editing
└── compliance_alert   # Live compliance notifications
```

### Security Architecture

#### Data Protection Layers
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Transport Security                                       │
│    ├── HTTPS/TLS 1.3 (Production)                         │
│    ├── Certificate pinning                                 │
│    └── Secure headers (HSTS, CSP)                         │
├─────────────────────────────────────────────────────────────┤
│ 2. Application Security                                     │
│    ├── Input validation and sanitization                   │
│    ├── File type validation                               │
│    ├── Upload size limits                                 │
│    └── SQL injection prevention                           │
├─────────────────────────────────────────────────────────────┤
│ 3. Document Security                                        │
│    ├── Temporary file cleanup                             │
│    ├── Content Controls protection                        │
│    ├── Access control (future)                            │
│    └── Audit logging (future)                             │
├─────────────────────────────────────────────────────────────┤
│ 4. Infrastructure Security                                  │
│    ├── Docker container isolation                         │
│    ├── Network segmentation                               │
│    ├── Resource limiting                                  │
│    └── Environment separation                             │
└─────────────────────────────────────────────────────────────┘
```

### Performance Architecture

#### Optimization Strategies
```
┌─────────────────────────────────────────────────────────────┐
│                Performance Optimizations                   │
├─────────────────────────────────────────────────────────────┤
│ Frontend Optimizations                                      │
│ ├── React.memo for component memoization                   │
│ ├── Lazy loading for large components                      │
│ ├── Virtual scrolling for large lists                      │
│ ├── Debounced variable updates                             │
│ └── Compressed asset delivery                              │
├─────────────────────────────────────────────────────────────┤
│ Backend Optimizations                                       │
│ ├── Async processing for file operations                   │
│ ├── Connection pooling for database (future)               │
│ ├── Caching for frequently accessed data                   │
│ ├── Background job processing                              │
│ └── Response compression                                   │
├─────────────────────────────────────────────────────────────┤
│ AI Model Optimizations                                      │
│ ├── Model warming on startup                              │
│ ├── Batch processing for multiple documents                │
│ ├── Result caching for repeated analysis                   │
│ ├── Progressive loading of models                          │
│ └── GPU acceleration (if available)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Maintenance and Updates

### Regular Maintenance Tasks

#### Weekly Tasks
1. **Check for Software Updates:**
   ```bash
   # Update Node.js packages
   npm outdated
   npm update
   
   # Update Python packages
   pip list --outdated
   pip install --upgrade package_name
   ```

2. **Clean Temporary Files:**
   ```bash
   # Clean uploads folder
   cd python-nlp/uploads
   # Delete files older than 7 days
   
   # Clean Docker cache
   docker system prune
   ```

3. **Monitor System Performance:**
   - Check disk space usage
   - Monitor memory consumption
   - Review error logs

#### Monthly Tasks
1. **Backup Important Data:**
   - Export custom templates
   - Backup configuration files
   - Save compliance rule customizations

2. **Security Updates:**
   ```bash
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   
   # Update system packages
   # Windows: Windows Update
   # Mac: Software Update
   # Linux: package manager updates
   ```

3. **Performance Review:**
   - Analyze usage patterns
   - Optimize frequently used templates
   - Review and update compliance rules

### Update Procedures

#### Application Updates
```bash
# 1. Backup current installation
cp -r Email-automation-MVP Email-automation-MVP-backup

# 2. Pull latest changes (if using Git)
cd Email-automation-MVP
git pull origin main

# 3. Update dependencies
# Frontend
npm install
npm update

# Backend
cd python-nlp
.venv\Scripts\activate
pip install -r requirements.txt --upgrade

# 4. Restart services
# Stop current instances
# Start fresh instances following normal startup procedure
```

#### GLiNER Model Updates
```bash
# GLiNER models update automatically
# To force update:
cd python-nlp
python -c "
from gliner_service import GLiNERService
service = GLiNERService()
service.update_model()
"
```

#### ONLYOFFICE Updates
```bash
# Pull latest ONLYOFFICE image
docker pull onlyoffice/documentserver:latest

# Restart with new image
docker-compose down
docker-compose up -d
```

### Monitoring and Logging

#### Log Files Locations
```
Application Logs:
├── Frontend: Browser Developer Console
├── Backend: Terminal output or app.log
├── ONLYOFFICE: Docker container logs
└── System: OS-specific log locations

Log Retention:
├── Keep logs for 30 days minimum
├── Archive older logs monthly
└── Monitor log file sizes
```

#### Health Monitoring
```bash
# Automated health check script
#!/bin/bash
echo "=== System Health Check ==="

# Check service availability
curl -f http://localhost:3000 || echo "❌ Frontend down"
curl -f http://localhost:5000/api/health || echo "❌ Backend down"
curl -f http://localhost:8080 || echo "❌ ONLYOFFICE down"

# Check disk space
df -h | grep -E "/$|/tmp" 

# Check memory usage
free -h

# Check Docker containers
docker ps --format "table {{.Names}}\t{{.Status}}"

echo "=== Health Check Complete ==="
```

### Backup and Recovery

#### What to Backup
```
Critical Data:
├── Custom Templates (src/templates/)
├── Configuration Files (.env files)
├── Custom Compliance Rules
├── User Documents (if stored locally)
└── Application Database (if applicable)

Backup Schedule:
├── Daily: User documents and templates
├── Weekly: Configuration files
├── Monthly: Complete system backup
└── Before Updates: Full application backup
```

#### Recovery Procedures
```bash
# 1. System Recovery
# Restore from backup location
cp -r Email-automation-MVP-backup/* Email-automation-MVP/

# 2. Dependency Recovery
cd Email-automation-MVP
npm install
cd python-nlp
pip install -r requirements.txt

# 3. Service Recovery
# Restart all services following normal procedure

# 4. Data Recovery
# Restore user documents and templates
# Verify system functionality
```

### Troubleshooting Maintenance Issues

#### Common Maintenance Problems

**Problem: Updates break functionality**
- **Solution**: Use backup to restore previous version
- **Prevention**: Test updates in development environment first

**Problem: Disk space running low**
- **Solution**: Clean temporary files and Docker images
- **Prevention**: Implement automated cleanup scripts

**Problem: Performance degradation over time**
- **Solution**: Restart services, clear caches, update dependencies
- **Prevention**: Regular monitoring and maintenance schedule

---

## 📞 Support and Resources

### Getting Help

#### Before Contacting Support
1. **Check this documentation** for solutions
2. **Review error messages** carefully
3. **Check system logs** for detailed error information
4. **Try basic troubleshooting** steps (restart, update, etc.)

#### Information to Provide
When seeking help, include:
- **Operating System** and version
- **Error messages** (exact text or screenshots)
- **Steps to reproduce** the issue
- **System specifications** (RAM, disk space)
- **Recent changes** made to the system

#### Self-Help Resources
- **GitHub Repository**: Source code and issue tracking
- **Documentation**: This comprehensive guide
- **Log Files**: Detailed error information
- **Health Check Endpoints**: System status verification

### Development and Customization

#### For Developers
```bash
# Development mode setup
npm run dev          # Frontend with hot reload
python app.py --debug # Backend with debug mode

# Testing
npm test             # Frontend tests
pytest               # Backend tests

# Code formatting
npm run format       # Frontend formatting
black python-nlp/   # Backend formatting
```

#### Customization Options
- **Custom Templates**: Add organization-specific templates
- **Compliance Rules**: Extend rules for different jurisdictions
- **UI Themes**: Customize appearance and branding
- **API Extensions**: Add custom endpoints for specific needs

### License and Legal

#### Software Licenses
- **Application**: MIT License (open source)
- **ONLYOFFICE**: AGPL v3 (open source edition)
- **GLiNER**: Apache 2.0 License
- **Dependencies**: Various open source licenses

#### Compliance Disclaimer
This system provides guidance based on publicly available legal information. It is not a substitute for professional legal advice. Always consult with qualified legal counsel for specific situations.

#### Data Privacy
- **Local Processing**: All documents processed locally
- **No Cloud Storage**: Documents not uploaded to external services
- **User Control**: Complete control over document handling
- **Audit Trail**: Track all document operations (future feature)

---

## 📊 Appendices

### Appendix A: Keyboard Shortcuts

#### Global Shortcuts
- `Ctrl + N`: New document
- `Ctrl + O`: Open/Import document
- `Ctrl + S`: Save current document
- `Ctrl + D`: Download document
- `F5`: Refresh/Reload
- `F11`: Full screen mode

#### Editor Shortcuts (ONLYOFFICE)
- `Ctrl + B`: Bold text
- `Ctrl + I`: Italic text
- `Ctrl + U`: Underline text
- `Ctrl + Z`: Undo
- `Ctrl + Y`: Redo
- `Ctrl + F`: Find and replace

### Appendix B: File Format Support

#### Supported Input Formats
- **.docx**: Microsoft Word 2007+
- **.doc**: Microsoft Word 97-2003 (limited support)
- **.pdf**: Adobe PDF documents
- **.txt**: Plain text files
- **.rtf**: Rich Text Format

#### Supported Output Formats
- **.docx**: Microsoft Word format
- **.pdf**: Adobe PDF format
- **.html**: Web page format
- **.txt**: Plain text export

### Appendix C: System Requirements Details

#### Minimum System Requirements
```
Operating System:
├── Windows: 10 version 1903+
├── macOS: 10.14 Mojave+
└── Linux: Ubuntu 18.04+ or equivalent

Hardware:
├── CPU: 2+ cores, 2.0 GHz+
├── RAM: 8GB (4GB absolute minimum)
├── Storage: 2GB free space
└── Network: Broadband internet

Software Dependencies:
├── Node.js: 16.0+ (LTS recommended)
├── Python: 3.8-3.11
├── Docker: 20.10+
└── Git: 2.20+
```

#### Recommended System Requirements
```
Hardware (Recommended):
├── CPU: 4+ cores, 3.0 GHz+
├── RAM: 16GB+
├── Storage: 10GB+ free space (SSD preferred)
└── Display: 1920x1080+ resolution

Performance Optimizations:
├── SSD storage for faster file operations
├── Multiple monitors for split-screen editing
├── High-speed internet for AI model downloads
└── Dedicated graphics (for future features)
```

### Appendix D: Environment Variables Reference

#### Frontend Environment Variables (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ONLYOFFICE_URL=http://localhost:8080

# Development Settings
GENERATE_SOURCEMAP=false
BROWSER=none
PORT=3000

# Feature Flags
REACT_APP_ENABLE_GLINER=true
REACT_APP_ENABLE_COMPLIANCE=true
REACT_APP_DEBUG_MODE=false
```

#### Backend Environment Variables (python-nlp/.env)
```bash
# Server Configuration
HOST=0.0.0.0
PORT=5000
DEBUG=True

# External Services
ONLYOFFICE_SERVER_URL=http://localhost:8080
DOCKER_HOST_IP=host.docker.internal

# File Handling
UPLOAD_FOLDER=./uploads
DOWNLOAD_FOLDER=./downloads
MAX_UPLOAD_SIZE=16777216
ALLOWED_EXTENSIONS=docx,pdf,txt

# Security Settings
CORS_ORIGINS=http://localhost:3000
JWT_SECRET_KEY=your-secret-key-here
SESSION_TIMEOUT=3600

# AI/ML Configuration
GLINER_MODEL_PATH=./models/gliner
SPACY_MODEL=en_core_web_sm
ENTITY_CONFIDENCE_THRESHOLD=0.7

# Logging
LOG_LEVEL=INFO
LOG_FILE=app.log
```

---

*End of Documentation*

**Document Information:**
- **Title**: Email & Offer Letter Compliance System - Complete Guide with Variable Panel
- **Version**: 2.0
- **Date**: October 2025
- **Pages**: 50+
- **Format**: Markdown → PDF Ready

This comprehensive guide provides everything needed to install, configure, and use the Email & Offer Letter Compliance System with the new Variable Panel feature. Keep this documentation accessible for reference during installation and daily use.