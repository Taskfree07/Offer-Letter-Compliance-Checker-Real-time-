# Quick Start - ONLYOFFICE Document Editor

## 🚀 Get Started in 3 Minutes

### 1. Start Services

```bash
# Terminal 1: Start ONLYOFFICE (Docker)
docker-compose up -d

# Terminal 2: Start Backend
cd python-nlp
python app.py

# Terminal 3: Start Frontend
npm start
```

### 2. Open Application

Open http://localhost:3000 in your browser

### 3. Edit a Document

1. Click **"Offer Letter Template"**
2. Click **"Import & Edit"** tab
3. Upload a Word document (.docx)
4. ✅ Document opens in ONLYOFFICE editor
5. ✅ Variables extracted automatically
6. Edit variables in left panel → Document updates automatically
7. Edit document directly in ONLYOFFICE → Auto-saves
8. Click **"Download Word"** to get final document

## ✨ What You Get

- **Word-style editor** in browser (ONLYOFFICE)
- **Automatic variable detection** using AI (GLiNER)
- **Format preservation** - exact Word layout maintained
- **Real-time editing** with auto-save
- **Variable management** panel for easy editing

## 🛠 Verify Setup

### Check ONLYOFFICE is Running
```bash
curl http://localhost:8080
# Should return HTML page
```

### Check Backend is Running
```bash
curl http://localhost:5000/health
# Should return: {"status":"healthy"}
```

### Check Frontend is Running
```
http://localhost:3000
# Should show application homepage
```

## 📋 Requirements

- **Docker** (for ONLYOFFICE)
- **Python 3.8+** (for backend)
- **Node.js 14+** (for frontend)

## 💡 Example Use Case

**Offer Letter Template:**

1. Upload: `offer_letter_template.docx` with placeholders:
   - `[CANDIDATE_NAME]`
   - `[JOB_TITLE]`
   - `[START_DATE]`
   - `[SALARY]`

2. AI detects all variables automatically

3. Fill in values:
   - CANDIDATE_NAME: "John Doe"
   - JOB_TITLE: "Senior Developer"
   - START_DATE: "March 1, 2025"
   - SALARY: "$120,000"

4. Click to update → Variables replaced in document

5. Edit formatting/content in ONLYOFFICE editor

6. Download final personalized offer letter

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| ONLYOFFICE not loading | Run `docker-compose up -d` and wait 30 seconds |
| Variables not detected | Ensure variables use `[BRACKET]` format |
| Document not saving | Check backend logs for errors |
| Port 8080 in use | Change port in `docker-compose.yml` |

## 📚 Full Documentation

See [ONLYOFFICE_SETUP.md](./ONLYOFFICE_SETUP.md) for complete documentation.

## 🎯 Next Steps

- Configure compliance rules
- Set up email automation
- Add custom variable types
- Deploy to production

---

**Need Help?** Check the logs:
- Backend: Terminal running `python app.py`
- ONLYOFFICE: `docker logs onlyoffice-docs`
- Frontend: Browser console (F12)
