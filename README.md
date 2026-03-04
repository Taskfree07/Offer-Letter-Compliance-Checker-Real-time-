# Onboarding Talks — Offer Letter Compliance Checker

A full-stack web app that checks offer letters for legal compliance across all 50 U.S. states using multi-layer AI analysis. Built with React (frontend) + Flask (backend) + OnlyOffice document editor.

---

## Quick Start (First Time Setup — Read This Fully)

### 1. Clone the repo

```bash
git clone https://github.com/Taskfree07/Offer-Letter-Compliance-Checker-Real-time-.git
cd Offer-Letter-Compliance-Checker-Real-time-
```

---

### 2. Prerequisites — Install these first

| Tool | Version | Download |
|------|---------|----------|
| Python | **3.10.x** | https://www.python.org/downloads/release/python-31010/ |
| Node.js | 22.x | https://nodejs.org/en/download |
| npm | 10.x | comes with Node.js |
| Git | any | https://git-scm.com/downloads |

> **Important:** Use **Python 3.10** specifically. Some dependencies (GLiNER, torch, sentence-transformers) are built for 3.10 and will fail on 3.11/3.12.

---

### 3. Backend Setup (Flask API — Port 5000)

```bash
# Step into the backend folder
cd python-nlp

# Create a virtual environment using Python 3.10
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install all backend dependencies
pip install -r requirements.txt

# Download the spaCy English language model
python -m spacy download en_core_web_sm
```

#### Create the backend `.env` file

Inside `python-nlp/`, create a file named `.env` with this exact content:

```env
# Microsoft Authentication
REACT_APP_MICROSOFT_CLIENT_ID=2b74ef92-7feb-45c7-94c2-62978353fc66
REACT_APP_MICROSOFT_TENANT_ID=b3235290-db90-4365-b033-ae68284de5bd
REACT_APP_REDIRECT_URI=http://localhost:3000

# API Config
REACT_APP_API_URL=http://localhost:5000

# Adobe PDF Embed API
REACT_APP_PDF_EMBED_CLIENT_ID=7c151fb5b27e4214a5ffa12cd8c4159e

# Groq AI API (LLM compliance analysis)
# Get your key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

#### Start the backend

```bash
# Make sure you're inside python-nlp/ with venv activated
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
* Running on http://0.0.0.0:5000
```

---

### 4. Frontend Setup (React App — Port 3000)

Open a **new terminal**, go to the project root (not python-nlp/):

```bash
# From the project root
npm install

# Start the React app
npm start
```

Opens automatically at: `http://localhost:3000`

---

### 5. OnlyOffice Document Server (IMPORTANT — read carefully)

OnlyOffice is the Word-compatible editor embedded inside the app. The compliance click-to-highlight feature **requires a custom OnlyOffice image** with the compliance plugin baked in. Do NOT use the plain `onlyoffice/documentserver` image — the plugin will not work.

**Option A — Build custom image (REQUIRED for compliance click feature to work):**
```bash
# Run this from the project root (where Dockerfile.onlyoffice is)
docker build -f Dockerfile.onlyoffice -t onlyoffice-compliance .

# Then run it (takes ~2-3 minutes to start up fully)
docker run -d -p 80:80 onlyoffice-compliance
```
Runs at `http://localhost`

> The build downloads the base OnlyOffice image and injects the compliance search plugin into it. This is a one-time step.

**Option B — Use the already-deployed Azure instance (no Docker needed):**
`https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io`

The app is already configured to use this Azure URL by default in the backend. If the backend is running with its `.env` file, it will automatically point OnlyOffice to Azure.

> **Why plain `docker run onlyoffice/documentserver` does NOT work for the compliance feature:**
> The compliance click-to-highlight works via a plugin (`onlyoffice-plugin/compliance-search/code.js`) that must live inside the OnlyOffice container. Plain OnlyOffice has no plugin → `relay.html` returns 404 → clicking compliance cards in the panel does nothing.

---

## Running Everything (Summary)

Open **2 terminals** (OnlyOffice is already live on Azure):

| Terminal | Directory | Command |
|----------|-----------|---------|
| 1 — OnlyOffice | project root | `docker build -f Dockerfile.onlyoffice -t onlyoffice-compliance . && docker run -d -p 80:80 onlyoffice-compliance` |
| 2 — Backend | `python-nlp/` | `.venv\Scripts\activate` then `python app.py` |
| 3 — Frontend | project root | `npm start` |

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- OnlyOffice (local): http://localhost (after Docker build)
- OnlyOffice (Azure, already live): https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io

> If you skip building the custom OnlyOffice image and use the Azure URL instead, the compliance click-to-highlight feature will still work (Azure OnlyOffice already has the plugin).

---

## Project Structure

```
Offer-Letter-Compliance-Checker-Real-time-/
│
├── src/                            # React frontend source
│   ├── components/
│   │   ├── EmailEditor.js          # Main editor + compliance panel UI
│   │   ├── OnlyOfficeViewer.js     # Embeds OnlyOffice + click-to-highlight
│   │   ├── UserMenu.js             # Top-right user avatar + name
│   │   ├── SearchableStateDropdown.js
│   │   └── compliance/
│   │       └── complianceRules.js  # 50-state frontend rules (Layer 1)
│   ├── services/
│   │   └── complianceService.js    # Calls backend AI compliance API
│   └── config/
│       └── constants.js            # API_BASE_URL etc.
│
├── python-nlp/                     # Flask backend
│   ├── app.py                      # Main Flask app (port 5000)
│   ├── compliance_v2/
│   │   ├── compliance_analyzer.py
│   │   ├── llm_service.py          # Groq LLM (Layer 3)
│   │   ├── rag_service.py          # ChromaDB vector search (Layer 2)
│   │   └── prompts.py
│   ├── vector_store/               # ChromaDB database — 469 state laws
│   ├── data/
│   │   └── state_laws_50/          # JSON for all 50 states
│   ├── requirements.txt            # All Python dependencies
│   └── .env                        # ← YOU MUST CREATE THIS (see above)
│
├── onlyoffice-plugin/
│   └── compliance-search/
│       ├── code.js                 # Plugin: highlights text in doc
│       ├── relay.html              # Cross-origin bridge React ↔ OnlyOffice
│       ├── config.json             # Plugin registration
│       └── index.html
│
├── public/
│   └── Main Offer Letter.docx      # Default document loaded on startup
│
├── Dockerfile.backend              # Docker build for backend
├── Dockerfile.frontend             # Docker build for frontend
└── deploy-update.ps1               # Azure redeployment script
```

---

## Features

### Compliance Analysis (Right Panel)
- Select a U.S. state from the dropdown
- App analyzes the open document against that state's employment laws
- Results grouped into **Critical Issues** (red), **Warnings** (amber), **Notices** (blue)
- **Click any card** → highlights the relevant text in the OnlyOffice document
- **Expand a card (▼)** → shows law reference, explanation, and suggested fix
- **Copy icon on suggestions** → copies the suggested action text to clipboard

### Document Editor
- Upload any `.docx` offer letter or use the default `Main Offer Letter.docx`
- Full Word-compatible editing via OnlyOffice

### Microsoft Login
- Login with Microsoft/Azure AD account via MSAL
- User's first name shows in the top-right navbar next to their avatar

### Multi-Layer AI Compliance Engine
| Layer | What it does |
|-------|-------------|
| Layer 1 | Instant frontend pattern matching (400+ rules across 50 states) |
| Layer 2 | RAG semantic search using ChromaDB (469 state employment laws) |
| Layer 3 | Groq LLM `llama-3.3-70b` for detailed natural language analysis |

---

## Environment Variables

### Backend — `python-nlp/.env`

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | Get from https://console.groq.com/keys — ask Sahithi for the team key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `REACT_APP_MICROSOFT_CLIENT_ID` | `2b74ef92-7feb-45c7-94c2-62978353fc66` |
| `REACT_APP_MICROSOFT_TENANT_ID` | `b3235290-db90-4365-b033-ae68284de5bd` |
| `REACT_APP_API_URL` | `http://localhost:5000` |

---

## Troubleshooting

**Backend won't start**
- Make sure you're using Python 3.10 (run `python --version`)
- Run `pip install -r requirements.txt` again with venv activated
- Make sure `.env` file exists inside `python-nlp/`

**Frontend shows blank page or login error**
- Backend must be running on port 5000
- Run `npm install` again if modules are missing

**Document editor not loading**
- OnlyOffice must be running (Docker locally or use Azure URL)
- Check browser console for errors

**Compliance click-to-highlight NOT working (cards don't highlight text in doc)**
- This is the most common issue on a new machine
- You must use the **custom OnlyOffice image**, not the plain `onlyoffice/documentserver`
- Run: `docker build -f Dockerfile.onlyoffice -t onlyoffice-compliance . && docker run -d -p 80:80 onlyoffice-compliance`
- OR use the Azure OnlyOffice URL (already has the plugin, no Docker needed)
- Root cause: The feature needs a plugin (`code.js`) inside OnlyOffice. Plain OnlyOffice doesn't have it.

**Compliance analysis returns nothing**
- Check `GROQ_API_KEY` is correct in `python-nlp/.env`
- Make sure `vector_store/` folder exists in `python-nlp/` (has ChromaDB data)

---

## Azure Deployment (Team use)

Already deployed at:
- **Frontend:** https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io
- **Backend:** https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io
- **OnlyOffice:** https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io

To redeploy after code changes (must be logged in via `az login`):
```powershell
.\deploy-update.ps1
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Microsoft MSAL auth |
| Document Editor | OnlyOffice Document Server |
| Backend | Python 3.10, Flask, Flask-SocketIO, SQLAlchemy |
| AI / LLM | Groq Cloud (llama-3.3-70b-versatile) |
| Vector DB | ChromaDB (469 state laws) |
| NLP | spaCy, GLiNER, sentence-transformers |
| Auth | Microsoft Azure AD (MSAL) |
| Deployment | Azure Container Apps + ACR |
