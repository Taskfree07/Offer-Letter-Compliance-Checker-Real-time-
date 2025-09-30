# 📧 Email Automation MVP - Complete Setup Guide

## 🎯 Overview

This application allows you to:
- ✅ Import Word documents (.docx)
- ✅ Auto-detect variables and sections
- ✅ Edit content with live preview
- ✅ Download edited documents with formatting preserved

---

## 📋 Prerequisites

Before starting, ensure you have installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

---

## 🚀 First Time Setup (After Cloning)

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Email-automation-MVP.git
cd Email-automation-MVP
```

### Step 2: Open in VS Code

```bash
code .
```

Or: `File > Open Folder` → Select `Email-automation-MVP`

---

## 🔧 Backend Setup (Python Flask)

### 1. Open Terminal in VS Code

Press `` Ctrl + ` `` or `Terminal > New Terminal`

### 2. Navigate to Backend Folder

```bash
cd python-nlp
```

### 3. Create Virtual Environment

```bash
python -m venv .venv
```

### 4. Activate Virtual Environment

**Windows PowerShell:**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**
```cmd
.venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source .venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 6. Download spaCy Model

```bash
python -m spacy download en_core_web_sm
```

✅ **Backend setup complete!**

---

## 🎨 Frontend Setup (React)

### 1. Open New Terminal

Click the `+` icon in VS Code terminal panel

### 2. Navigate to Project Root

```bash
cd ..
```
(If still in `python-nlp` folder)

### 3. Install Node Dependencies

```bash
npm install
```

✅ **Frontend setup complete!**

---

## ▶️ Running the Application

### You Need 2 Terminals Running:

#### Terminal 1: Backend Server

```bash
cd python-nlp
python app.py
```

**Wait for:**
```
INFO:__main__:Word document service loaded successfully
 * Running on http://127.0.0.1:5000
```

✅ **Backend ready on port 5000**

---

#### Terminal 2: Frontend Server

```bash
npm start
```

Browser will automatically open at `http://localhost:3000`

✅ **Frontend ready on port 3000**

---

## 🎯 Using the Application

### 1. Create Test Document

Create a Word document (`.docx`) with:

```
OFFER LETTER

Dear [CANDIDATE_NAME],

We are pleased to offer you the position of [JOB_TITLE] at [COMPANY_NAME].

Compensation:
- Salary: [SALARY]
- Start Date: [START_DATE]

Employment Agreement

This is an at-will employment agreement. Either party may terminate 
employment at any time with or without cause.

Confidentiality and Intellectual Property

The employee agrees to maintain confidentiality of all proprietary 
information, trade secrets, and intellectual property of the company.

Pre-Employment Conditions

Employment is contingent upon:
- Successful background check
- Reference verification
- Drug screening (if applicable)

Compliance with Policies

Employee must comply with all company policies, procedures, and 
employee handbook guidelines.

Governing Law and Dispute Resolution

This agreement shall be governed by the laws of [STATE]. Any disputes 
shall be resolved through binding arbitration.

Sincerely,
[MANAGER_NAME]
[MANAGER_TITLE]
```

### 2. Import Document

1. Click **"Import Offer Letter"** button in the app
2. Select your `.docx` file
3. Wait for success message

### 3. Edit Variables

**In the Variables Panel (right side):**

**Regular Variables** (single-line inputs):
- CANDIDATE_NAME
- JOB_TITLE
- COMPANY_NAME
- SALARY
- START_DATE
- STATE
- MANAGER_NAME
- MANAGER_TITLE

**Section Fields** (blue headers + textareas):
- Employment Agreement
- Confidentiality and Intellectual Property
- Pre-Employment Conditions
- Compliance with Policies
- Governing Law and Dispute Resolution

### 4. Live Preview

- **Type in any field** → Preview updates instantly
- **Regular variables** → Yellow highlight
- **Section content** → Golden boxes with borders
- **Empty fields** → Red highlight

### 5. Download

Click **"Download Document"** button to get your edited `.docx` file with:
- ✅ All variables replaced
- ✅ Section content updated
- ✅ Original formatting preserved
- ✅ Tables, fonts, colors intact

---

## 🎨 Features

### ✨ Variable Detection
- Automatically finds `[VARIABLE_NAME]`, `{VARIABLE_NAME}`, `<<VARIABLE_NAME>>`
- Detects specific section headings
- Extracts content under each section

### 🔵 Section Editing
The app auto-detects these 5 sections:
1. **Confidentiality and Intellectual Property**
2. **Pre-Employment Conditions**
3. **Employment Agreement**
4. **Compliance with Policies**
5. **Governing Law and Dispute Resolution**

Each section gets:
- Blue gradient header with icon
- Large textarea (150px min, resizable)
- Full-width layout
- Multi-line content editing

### ⚡ Live Preview
- Real-time updates as you type
- Beautiful highlighting
- Document-style layout (8.5" x 11")
- Professional appearance

### 💾 Download
- Preserves all Word formatting
- Replaces variables and sections
- Maintains tables, fonts, colors
- Ready to use immediately

---

## 📁 Project Structure

```
Email-automation-MVP/
├── python-nlp/                 # Backend (Flask)
│   ├── app.py                 # Main Flask server
│   ├── docx_service.py        # Word document processing
│   ├── nlp_service.py         # NLP processing
│   ├── requirements.txt       # Python dependencies
│   └── .venv/                 # Virtual environment
├── src/                       # Frontend (React)
│   ├── components/            # React components
│   │   └── EmailEditor.js    # Main editor component
│   ├── services/             # API services
│   └── utils/                # Utility functions
├── public/                    # Static files
├── package.json              # Node dependencies
├── START_BACKEND.bat         # Quick start script (Windows)
└── SETUP_GUIDE.md           # This file
```

---

## 🔍 Troubleshooting

### Backend Issues

**Problem: Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID_NUMBER>

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Problem: Module not found**
```bash
cd python-nlp
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

**Problem: python-docx not working**
```bash
pip uninstall python-docx
pip install python-docx
```

### Frontend Issues

**Problem: Port 3000 already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
```

**Problem: npm install fails**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem: "Failed to fetch" when importing**
- Ensure backend is running: http://127.0.0.1:5000/api/docx-health
- Should return: `{"available": true, "message": "Word document service ready"}`
- If not, restart backend

### Section Fields Not Showing

**Problem: Section fields appear as regular inputs**
1. Stop backend (Ctrl+C in terminal)
2. Restart: `python app.py`
3. Refresh browser (F5)
4. Re-import document

**Problem: Live preview not updating**
1. Check browser console (F12) for errors
2. Refresh page (F5)
3. Re-import document

---

## 🧪 Testing

### Test Backend Health

```bash
# In browser or curl
http://127.0.0.1:5000/api/docx-health
```

**Expected response:**
```json
{
  "available": true,
  "message": "Word document service ready"
}
```

### Test File Upload

Open `test_docx_upload.html` in browser:
1. Click "Check Backend" → Should show ✅
2. Upload `.docx` file → Should extract variables
3. Check console for any errors

---

## 📝 Quick Commands

### Backend
```bash
cd python-nlp
.\.venv\Scripts\Activate.ps1  # Windows
python app.py                  # Start server
```

### Frontend
```bash
npm start                      # Start dev server
npm run build                 # Build for production
```

### Both (Quick Start)
```bash
# Terminal 1
cd python-nlp && python app.py

# Terminal 2 (new terminal)
npm start
```

---

## 🎓 How It Works

### Architecture

```
User uploads .docx
       ↓
Frontend (React) → Backend (Flask) → python-docx
       ↓                                    ↓
   Mammoth.js                        Extract variables
       ↓                             Extract sections
   HTML Preview ←─────────────────────────┘
       ↓
   Live editing (React state)
       ↓
   Download → Backend replaces → Returns .docx
```

### Variable Detection

**Backend (`docx_service.py`):**
- Scans document paragraphs
- Finds bracketed patterns: `[VAR]`, `{VAR}`, `<<VAR>>`
- Detects section headings by name matching
- Extracts content under each section
- Returns JSON with variables and metadata

**Frontend (`EmailEditor.js`):**
- Receives variables from backend
- Identifies sections by name
- Renders textareas for sections
- Renders inputs for regular variables
- Updates preview on every change

### Live Preview

**Process:**
1. Mammoth.js converts .docx to HTML
2. React stores HTML in state
3. On variable change → Regex replacement
4. Section content → Formatted with highlighting
5. Re-render with `dangerouslySetInnerHTML`
6. Instant visual update

### Download

**Process:**
1. User clicks "Download Document"
2. Frontend sends original file + variables to backend
3. Backend (`docx_service.py`):
   - Loads original .docx
   - Finds section headings
   - Replaces section content
   - Replaces bracketed variables
   - Preserves all formatting
4. Returns modified .docx file
5. Browser downloads file

---

## 🚀 Production Deployment

### Backend (Flask)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (React)

```bash
npm run build
# Deploy 'build' folder to hosting service
```

### Environment Variables

Create `.env` file:
```
FLASK_ENV=production
DEBUG=False
HOST=0.0.0.0
PORT=5000
```

---

## 📦 Dependencies

### Backend (Python)
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin support
- **python-docx** - Word document processing
- **spaCy** - NLP processing
- **PyMuPDF** - PDF processing
- **pdfplumber** - PDF text extraction
- **beautifulsoup4** - HTML parsing
- **weasyprint** - HTML to PDF
- **gliner** - Entity recognition

### Frontend (React)
- **React** - UI framework
- **mammoth** - Word to HTML conversion
- **lucide-react** - Icons
- **pdfjs-dist** - PDF rendering

---

## 🎉 Success Checklist

✅ Python virtual environment created and activated  
✅ All Python dependencies installed  
✅ spaCy model downloaded  
✅ Node dependencies installed  
✅ Backend running on port 5000  
✅ Frontend running on port 3000  
✅ Browser opens automatically  
✅ Can import Word documents  
✅ Variables appear in panel  
✅ Section fields have blue headers  
✅ Live preview updates  
✅ Can download edited documents  

---

## 💡 Tips

- **Keep both terminals running** while using the app
- **Refresh browser** if preview doesn't update
- **Restart backend** after code changes
- **Use Ctrl+C** to stop servers
- **Check browser console** (F12) for errors
- **Check terminal logs** for backend errors

---

## 🆘 Need Help?

1. **Check logs** in both terminals
2. **Open browser DevTools** (F12) → Console tab
3. **Verify backend health**: http://127.0.0.1:5000/api/docx-health
4. **Check this guide** for troubleshooting steps
5. **Restart both servers** if issues persist

---

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Name/Team]

---

**🎉 Congratulations! Your Email Automation MVP is ready to use!**

**Happy Editing! ✨**
