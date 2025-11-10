# Azure Deployment - Step-by-Step Walkthrough

## 🎯 Complete Process from Local Files to Running Azure App

This guide shows you **exactly** what to do, where files go, and how they run.

---

## 📍 Phase 1: Prepare Your Local Environment

### **Step 1: Verify Files Exist**

Open PowerShell or Git Bash and navigate to your project:

```bash
cd E:\Email-automation-MVP
```

Check that these files exist:
```bash
ls Dockerfile.frontend
ls Dockerfile.backend
ls deploy-azure.sh
ls package.json
ls python-nlp/requirements.txt
```

**Expected output:**
```
✅ Dockerfile.frontend
✅ Dockerfile.backend
✅ deploy-azure.sh
✅ package.json
✅ python-nlp/requirements.txt
```

---

### **Step 2: Install Required Tools**

#### **2.1 Install Azure CLI**

**Windows:**
```bash
# Download and run installer
https://aka.ms/installazurecliwindows

# Or use winget
winget install -e --id Microsoft.AzureCLI
```

**Verify installation:**
```bash
az --version
# Should show: azure-cli 2.x.x
```

---

#### **2.2 Install Docker Desktop**

**Download:** https://www.docker.com/products/docker-desktop/

**Install and start Docker Desktop**

**Verify Docker is running:**
```bash
docker --version
# Should show: Docker version 24.x.x

docker ps
# Should show: (empty table - no containers running yet)
```

---

### **Step 3: Login to Azure**

```bash
az login
```

**What happens:**
1. Opens browser
2. Login with your company Azure account
3. Browser shows: "You have logged into Microsoft Azure!"
4. Close browser, return to terminal

**Verify login:**
```bash
az account show
```

**Output should show:**
```json
{
  "name": "Your Subscription Name",
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "state": "Enabled"
}
```

**✅ If IT gave you a specific subscription, select it:**
```bash
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

---

## 📦 Phase 2: Build Docker Images Locally

### **Step 4: Build Frontend Image**

```bash
# Make sure you're in the project root
cd E:\Email-automation-MVP

# Build frontend
docker build -f Dockerfile.frontend -t frontend:latest .
```

**What happens (takes ~3-5 minutes):**
```
Step 1/8 : FROM node:18-alpine
 ---> Pulling node:18-alpine image
Step 2/8 : WORKDIR /app
 ---> Running in...
Step 3/8 : COPY package*.json ./
 ---> Copying files...
Step 4/8 : RUN npm ci --only=production
 ---> Downloading 1,234 packages... (this takes a while)
Step 5/8 : COPY src/ public/ ./
 ---> Copying source code...
Step 6/8 : RUN npm run build
 ---> Building production bundle... (this takes a while)
Step 7/8 : RUN npm install -g serve
 ---> Installing serve...
Step 8/8 : CMD ["serve", "-s", "build", "-l", "3000"]
 ---> Done!
Successfully built frontend:latest
```

**Verify:**
```bash
docker images | grep frontend
# Should show: frontend  latest  ...  350MB
```

---

### **Step 5: Build Backend Image**

```bash
docker build -f Dockerfile.backend -t backend:latest .
```

**What happens (takes ~5-7 minutes):**
```
Step 1/9 : FROM python:3.11-slim
 ---> Pulling python:3.11-slim image
Step 2/9 : WORKDIR /app
 ---> Running in...
Step 3/9 : RUN apt-get update && apt-get install -y gcc g++
 ---> Installing build tools...
Step 4/9 : COPY python-nlp/requirements.txt ./
 ---> Copying requirements...
Step 5/9 : RUN pip install -r requirements.txt
 ---> Downloading Flask, GLiNER, python-docx... (this takes a while)
Step 6/9 : RUN python -m spacy download en_core_web_sm
 ---> Downloading SpaCy model (12MB)...
Step 7/9 : COPY python-nlp/ ./
 ---> Copying Python code...
Step 8/9 : RUN mkdir -p /app/uploads/sessions
 ---> Creating directories...
Step 9/9 : CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
 ---> Done!
Successfully built backend:latest
```

**Verify:**
```bash
docker images | grep backend
# Should show: backend  latest  ...  700MB
```

---

### **Step 6: Pull ONLYOFFICE Image**

```bash
docker pull onlyoffice/documentserver:latest
```

**What happens (takes ~10-15 minutes - it's big!):**
```
latest: Pulling from onlyoffice/documentserver
Pulling fs layer...
Downloading [========>              ] 234MB/1.5GB
Downloading [=================>     ] 768MB/1.5GB
Download complete
Extracting...
Status: Downloaded newer image for onlyoffice/documentserver:latest
```

**Verify:**
```bash
docker images | grep onlyoffice
# Should show: onlyoffice/documentserver  latest  ...  1.5GB
```

---

### **✅ Checkpoint: Verify All 3 Images**

```bash
docker images
```

**Expected output:**
```
REPOSITORY                    TAG       SIZE
frontend                      latest    350MB
backend                       latest    700MB
onlyoffice/documentserver     latest    1.5GB
```

**✅ All 3 images built successfully!**

---

## ☁️ Phase 3: Deploy to Azure

### **Option A: Automated Script (Recommended)**

```bash
# Make script executable
chmod +x deploy-azure.sh

# Run deployment script
./deploy-azure.sh
```

**What the script does automatically:**
1. ✅ Creates resource group
2. ✅ Creates Container Apps environment
3. ✅ Creates Azure Container Registry
4. ✅ Tags and pushes all 3 images
5. ✅ Creates Azure Files storage
6. ✅ Deploys all 3 containers
7. ✅ Prints URLs at the end

**Expected runtime:** 15-20 minutes

**Output will look like:**
```
🚀 Starting Azure Container Apps Deployment...
================================================

📝 Step 1: Azure Login
✅ Already logged in

📦 Step 2: Creating Resource Group
✅ Resource group created

🌐 Step 3: Creating Container Apps Environment
[##########] 100% - Environment created
✅ Environment created

📦 Step 4: Creating Container Registry
✅ Registry created: emailautomation12345

🔐 Step 5: Logging into Container Registry
✅ Logged in to ACR

🏗️  Step 6: Building and Pushing Docker Images
  Pushing frontend...
  The push refers to repository [emailautomation12345.azurecr.io/frontend]
  [##########] 100% - 350MB uploaded
  ✅ Frontend image pushed

  Pushing backend...
  The push refers to repository [emailautomation12345.azurecr.io/backend]
  [##########] 100% - 700MB uploaded
  ✅ Backend image pushed

  Pushing ONLYOFFICE...
  [##########] 100% - 1.5GB uploaded
  ✅ ONLYOFFICE image pushed

💾 Step 7: Creating Persistent Storage
✅ Storage created: emailstorage54321

🚀 Step 8: Deploying ONLYOFFICE Container
[##########] 100% - Container created
✅ ONLYOFFICE deployed: https://onlyoffice.proudhill-abc123.eastus.azurecontainerapps.io

🚀 Step 9: Deploying Backend Container
[##########] 100% - Container created
✅ Backend deployed: https://backend.proudhill-abc123.eastus.azurecontainerapps.io

🚀 Step 10: Deploying Frontend Container
[##########] 100% - Container created
✅ Frontend deployed: https://frontend.proudhill-abc123.eastus.azurecontainerapps.io

================================================
🎉 Deployment Complete!
================================================

Application URLs:
  Frontend:   https://frontend.proudhill-abc123.eastus.azurecontainerapps.io
  Backend:    https://backend.proudhill-abc123.eastus.azurecontainerapps.io
  ONLYOFFICE: https://onlyoffice.proudhill-abc123.eastus.azurecontainerapps.io

⚠️  Important Next Steps:
  1. Update backend CORS settings to allow frontend URL
  2. Test health endpoints
  3. Monitor costs in Azure Portal
```

**✅ Copy these URLs and save them!**

---

### **Option B: Manual Deployment (If script fails)**

If the script doesn't work, follow `AZURE_CONTAINER_APPS_DEPLOYMENT.md` step-by-step.

---

## 🧪 Phase 4: Test Deployment

### **Step 7: Test Health Endpoints**

```bash
# Test backend
curl https://backend.YOUR-URL.eastus.azurecontainerapps.io/health

# Expected response:
{
  "status": "healthy",
  "service": "NLP Entity Extraction API",
  "nlp_service_available": true
}
```

```bash
# Test GLiNER AI
curl https://backend.YOUR-URL.eastus.azurecontainerapps.io/api/gliner-health

# Expected response:
{
  "success": true,
  "available": true,
  "model_name": "urchade/gliner_small-v2.1",
  "model_loaded": true
}
```

```bash
# Test DOCX service
curl https://backend.YOUR-URL.eastus.azurecontainerapps.io/api/docx-health

# Expected response:
{
  "available": true,
  "message": "Word document service ready"
}
```

**✅ All 3 endpoints return JSON = Backend is working!**

---

### **Step 8: Test Frontend**

Open in browser:
```
https://frontend.YOUR-URL.eastus.azurecontainerapps.io
```

**Expected result:**
- ✅ Page loads (shows HomeScreen with template cards)
- ✅ "TECHGENE HR Document Management" header visible
- ✅ Template cards showing "Offer Letter Template", "Welcome Email"

**❌ If you see CORS errors in console:**
You need to update backend CORS settings (see Phase 5).

---

## 🔧 Phase 5: Configure CORS

### **Step 9: Update Backend CORS Settings**

**Problem:** Backend blocks requests from Azure frontend URL.

**Solution:** Update CORS configuration.

#### **Method 1: Update Code and Redeploy**

Edit `python-nlp/app.py` line 186:

```python
# Add this line:
ALLOWED_ORIGINS = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://frontend.YOUR-URL.eastus.azurecontainerapps.io",  # ← ADD THIS
}
```

Rebuild and redeploy backend:
```bash
# Rebuild
docker build -f Dockerfile.backend -t backend:latest .

# Tag
docker tag backend:latest emailautomation12345.azurecr.io/backend:latest

# Push
docker push emailautomation12345.azurecr.io/backend:latest

# Restart container (pulls new image)
az containerapp update \
  --name backend \
  --resource-group email-automation-rg \
  --image emailautomation12345.azurecr.io/backend:latest
```

#### **Method 2: Environment Variable (Faster)**

```bash
az containerapp update \
  --name backend \
  --resource-group email-automation-rg \
  --set-env-vars \
    ALLOWED_ORIGINS=https://frontend.YOUR-URL.eastus.azurecontainerapps.io
```

Then update `app.py` to read from environment:
```python
import os

ALLOWED_ORIGINS = {
    "http://localhost:3000",
    os.environ.get('ALLOWED_ORIGINS', ''),
}
```

---

### **Step 10: Test Full Workflow**

1. **Open frontend:** `https://frontend.YOUR-URL.azurecontainerapps.io`
2. **Click:** "Offer Letter Template" → "Edit Template"
3. **Click:** "Import Offer Letter" (top right)
4. **Upload:** A sample `.docx` file
5. **Wait:** Document should load in ONLYOFFICE editor
6. **Check:** Variables appear in right panel
7. **Edit:** Change a variable value
8. **Click:** "Replace in Template"
9. **Verify:** Document updates in real-time

**✅ If all steps work = Deployment successful!**

---

## 📊 Phase 6: Monitor & Manage

### **Step 11: View Container Logs**

```bash
# View backend logs
az containerapp logs show \
  --name backend \
  --resource-group email-automation-rg \
  --follow

# View frontend logs
az containerapp logs show \
  --name frontend \
  --resource-group email-automation-rg \
  --follow
```

---

### **Step 12: Check Costs**

```bash
# View resource group costs
az consumption usage list \
  --start-date 2025-01-01 \
  --end-date 2025-01-31 \
  --query "[?resourceGroup=='email-automation-rg']"
```

**Or use Azure Portal:**
1. Go to: https://portal.azure.com
2. Navigate to: Cost Management + Billing
3. Filter by: Resource Group = email-automation-rg
4. View: Daily/monthly costs

---

### **Step 13: Stop Containers (Save Money)**

When not testing:
```bash
# Scale to zero (stops charging for compute)
az containerapp update --name frontend --min-replicas 0 --max-replicas 0
az containerapp update --name backend --min-replicas 0 --max-replicas 0
az containerapp update --name onlyoffice --min-replicas 0 --max-replicas 0
```

To restart:
```bash
az containerapp update --name frontend --min-replicas 1 --max-replicas 1
az containerapp update --name backend --min-replicas 1 --max-replicas 2
az containerapp update --name onlyoffice --min-replicas 1 --max-replicas 1
```

---

## 🧹 Phase 7: Cleanup (When Done Testing)

### **Step 14: Delete All Resources**

```bash
# Delete resource group (removes EVERYTHING)
az group delete --name email-automation-rg --yes --no-wait

# This deletes:
# ✅ All 3 containers
# ✅ Container registry
# ✅ Storage account
# ✅ All uploaded files
# ✅ Container Apps environment
```

**⚠️ Warning:** This is permanent! Make sure to download any important files first.

---

## 📝 File Locations Summary

### **Your Local Machine**
```
E:\Email-automation-MVP\
├── src/                    ← Source code (stays local)
├── python-nlp/             ← Python code (stays local)
├── Dockerfile.frontend     ← Build instructions (stays local)
└── Dockerfile.backend      ← Build instructions (stays local)
```

### **Azure Container Registry** (Cloud storage for images)
```
emailautomation12345.azurecr.io/
├── frontend:latest         ← Compiled React app (350MB)
├── backend:latest          ← Python app + dependencies (700MB)
└── onlyoffice:latest       ← Document server (1.5GB)
```

### **Azure Container Apps** (Running servers)
```
Container: frontend
├── /app/build/             ← Your React app (running)
└── URL: https://frontend.xxx.azurecontainerapps.io

Container: backend
├── /app/                   ← Your Flask API (running)
├── /mnt/uploads/           ← Mounted Azure Files
└── URL: https://backend.xxx.azurecontainerapps.io

Container: onlyoffice
├── /var/www/onlyoffice/    ← Document server (running)
└── URL: https://onlyoffice.xxx.azurecontainerapps.io
```

### **Azure Files** (Persistent storage)
```
emailstorage54321 (Storage Account)
└── uploads/ (File Share)
    ├── sessions/
    │   ├── abc123.json     ← Document metadata
    │   └── def456.json
    ├── abc123.docx         ← Uploaded documents
    └── def456.docx
```

---

## 🎯 Quick Reference Commands

### **Build Images**
```bash
docker build -f Dockerfile.frontend -t frontend:latest .
docker build -f Dockerfile.backend -t backend:latest .
docker pull onlyoffice/documentserver:latest
```

### **Deploy to Azure**
```bash
./deploy-azure.sh
```

### **Test Deployment**
```bash
curl https://backend.YOUR-URL/health
curl https://backend.YOUR-URL/api/gliner-health
```

### **View Logs**
```bash
az containerapp logs show --name backend --resource-group email-automation-rg --follow
```

### **Stop Containers**
```bash
az containerapp update --name frontend --min-replicas 0 --max-replicas 0
az containerapp update --name backend --min-replicas 0 --max-replicas 0
az containerapp update --name onlyoffice --min-replicas 0 --max-replicas 0
```

### **Delete Everything**
```bash
az group delete --name email-automation-rg --yes --no-wait
```

---

## 🐛 Troubleshooting

### **Problem: Docker build fails**
```bash
# Check Docker is running
docker ps

# If not running, start Docker Desktop
```

### **Problem: Azure login fails**
```bash
# Clear cached credentials
az account clear

# Try again
az login
```

### **Problem: Push to ACR fails**
```bash
# Login again
az acr login --name emailautomation12345

# Verify credentials
az acr credential show --name emailautomation12345
```

### **Problem: Container won't start**
```bash
# Check container status
az containerapp show --name backend --resource-group email-automation-rg

# View logs for errors
az containerapp logs show --name backend --resource-group email-automation-rg
```

### **Problem: CORS errors in browser**
```bash
# Update backend CORS (see Step 9)
# Then verify backend allows your frontend URL
```

---

**🎉 You're all set! Follow these steps and you'll have a working deployment.**

**Questions? Check the main deployment guide: AZURE_CONTAINER_APPS_DEPLOYMENT.md**
