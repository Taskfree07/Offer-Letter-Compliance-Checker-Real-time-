# ✅ DEPLOYMENT READINESS CHECKLIST

## Current Deployment Status: **READY FOR AZURE** 🚀

### Azure Deployment Information
```
Resource Group:    Techgene_group
Container Registry: emailautomation22833
Location:          centralus

Container Names:
- frontend   (React app on port 3000)
- backend    (Flask API on port 5000)  
- onlyoffice (Document server on port 80)

Live URLs:
- Frontend:   https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io
- Backend:    https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io
- OnlyOffice: https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io
```

---

## ✅ Configuration Completed

### 1. **Frontend Configuration** (`src/config/constants.js`)
- ✅ Auto-detects Azure Container Apps URLs (`*.azurecontainerapps.io`)
- ✅ Replaces `frontend` with `backend` in hostname
- ✅ Falls back to `localhost:5000` for local development
- ✅ Supports `REACT_APP_API_URL` environment variable

**Works in:**
- ✅ Local development (`http://localhost:3000` → `http://127.0.0.1:5000`)
- ✅ Azure deployment (auto-detects backend URL)

---

### 2. **Backend Configuration** (`python-nlp/app.py`)

#### CORS Configuration
- ✅ Auto-includes Azure frontend URL based on `BACKEND_BASE_URL`
- ✅ Always includes localhost for development
- ✅ Supports `ALLOWED_ORIGINS` environment variable

#### OnlyOffice Server URL
- ✅ Auto-detects Azure OnlyOffice URL from backend URL
- ✅ Falls back to `localhost:8080` for local
- ✅ Supports `ONLYOFFICE_SERVER_URL` environment variable

#### Backend Base URL
- ✅ Dynamic detection from request headers
- ✅ Supports `BACKEND_BASE_URL` environment variable
- ✅ Works with Azure reverse proxy headers

**Works in:**
- ✅ Local development
- ✅ Azure Container Apps
- ✅ Docker containers

---

### 3. **Docker Configuration**

#### Backend Dockerfile
- ✅ Python 3.11 slim image
- ✅ Gunicorn with 2 workers
- ✅ SpaCy model pre-downloaded
- ✅ GLiNER downloads on first use (avoids timeout)
- ✅ Health check endpoint
- ✅ 300s timeout for long operations

#### Frontend Dockerfile
- ✅ Node 18 alpine image
- ✅ Multi-stage build
- ✅ Accepts `REACT_APP_API_URL` build argument
- ✅ Production-optimized build
- ✅ Served with `serve` package

#### OnlyOffice
- ✅ Uses official `onlyoffice/documentserver:latest`
- ✅ JWT disabled for simplicity
- ✅ Configured via environment variables

---

### 4. **Environment Variables (Azure Container Apps)**

#### Frontend Container
```bash
REACT_APP_API_URL=https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io
```

#### Backend Container
```bash
HOST=0.0.0.0
DEBUG=False
ONLYOFFICE_SERVER_URL=https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io
UPLOAD_FOLDER=/app/uploads
BACKEND_BASE_URL=https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io
ALLOWED_ORIGINS=https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io
```

#### OnlyOffice Container
```bash
JWT_ENABLED=false
WOPI_ENABLED=false
USE_UNAUTHORIZED_STORAGE=true
ALLOW_PRIVATE_IP_ADDRESS=true
ALLOW_META_IP_ADDRESS=true
```

---

### 5. **Features Verified**

#### ✅ Core Features
- Variable extraction and editing
- Compliance checking with California law rules
- GLiNER AI entity extraction
- OnlyOffice document editing
- Variable highlighting (click to locate)
- Real-time preview updates
- Document upload/download

#### ✅ Compliance Features
- Auto-extracts document text for analysis
- Works with pre-uploaded documents
- Works with manually imported documents
- Splits text into sentences
- Checks against state-specific rules
- Shows flagged issues with severity
- Provides compliant alternatives

#### ✅ Azure-Specific Features
- Auto-scaling (0-3 replicas)
- Scale to zero after 5 minutes idle
- Cost optimization (~$10-20/month with auto-scaling)
- Persistent storage ready (Azure Files)
- Health check endpoints

---

## 🚀 Deployment Commands

### Quick Update (Use Existing Resources)
```powershell
# Run this to update your existing deployment
.\update-azure.ps1
```

### Full Deployment (From Scratch)
```powershell
# Only if you need to create everything new
.\deploy-azure-clean.ps1
```

### Manual Docker Build & Push
```powershell
# Login to ACR
az acr login --name emailautomation22833

# Build and push backend
docker build -f Dockerfile.backend -t emailautomation22833.azurecr.io/backend:latest .
docker push emailautomation22833.azurecr.io/backend:latest

# Build and push frontend
docker build -f Dockerfile.frontend -t emailautomation22833.azurecr.io/frontend:latest --build-arg REACT_APP_API_URL=https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io .
docker push emailautomation22833.azurecr.io/frontend:latest

# Update containers
az containerapp update --name backend --resource-group Techgene_group --image emailautomation22833.azurecr.io/backend:latest
az containerapp update --name frontend --resource-group Techgene_group --image emailautomation22833.azurecr.io/frontend:latest
```

---

## 🧪 Testing Endpoints

### Health Checks
```bash
# Backend health
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/health

# GLiNER health
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/gliner-health

# DOCX service health
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/docx-health
```

### Frontend
```bash
# Open in browser
https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io
```

---

## 🔧 Local Development (Still Works!)

### Start Local Development
```bash
# Terminal 1 - Backend
cd python-nlp
python app.py

# Terminal 2 - OnlyOffice (Docker)
docker-compose up -d

# Terminal 3 - Frontend
npm start
```

### Local URLs
- Frontend: http://localhost:3000
- Backend: http://127.0.0.1:5000
- OnlyOffice: http://localhost:8080

---

## 💰 Cost Management

### Current Configuration
- **Min replicas:** 0 (scales to zero when idle)
- **Max replicas:** 3 (scales up under load)
- **Idle timeout:** 5 minutes

### Expected Costs
- **Idle (no usage):** ~$0-5/month (just storage)
- **Light testing:** ~$10-20/month
- **Active usage:** ~$30-50/month

### Scale Down Manually
```bash
az containerapp update --name frontend --resource-group Techgene_group --min-replicas 0
az containerapp update --name backend --resource-group Techgene_group --min-replicas 0
az containerapp update --name onlyoffice --resource-group Techgene_group --min-replicas 0
```

---

## 🐛 Troubleshooting

### Issue: Frontend can't reach backend
**Solution:** Check browser console for API URL
```javascript
// Should show in console:
🌐 Azure deployment detected, using backend: https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io
```

### Issue: Compliance not working
**Check:**
1. Document text is extracted (check browser console for "Document text extracted for compliance")
2. Sentences are populated (check console for "Compliance analysis running")
3. Rules are loaded for selected state

### Issue: OnlyOffice not loading
**Check:**
1. OnlyOffice container is running
2. Backend can reach OnlyOffice URL
3. Check backend logs for download errors

### Issue: CORS errors
**Check:**
1. Frontend URL is in `ALLOWED_ORIGINS`
2. Backend logs show "CORS Allowed Origins"
3. Browser shows proper origin in request

---

## ✅ FINAL STATUS

### Everything is configured for:
- ✅ **Azure Container Apps deployment**
- ✅ **Local development**
- ✅ **Cost optimization (auto-scaling)**
- ✅ **All features working**
- ✅ **Compliance checking**
- ✅ **Variable management**
- ✅ **Document editing**

### Ready to deploy! 🚀

Run: `.\update-azure.ps1` to update your Azure deployment with all the latest changes.
