# Azure Setup Checklist - What Needs to Be Created

## 🎯 Overview

This document lists **every Azure resource** you need to create for your Email Automation MVP deployment.

---

## ✅ Azure Resources Needed (7 Total)

### **1. Resource Group**
Container for all your resources.

**What it is:** A folder that holds all your Azure stuff together.

**Name:** `email-automation-rg` (or whatever IT approves)

**Location:** `eastus` (or your preferred region)

**Created by:**
```bash
az group create \
  --name email-automation-rg \
  --location eastus
```

**Cost:** FREE (it's just a container)

---

### **2. Container Apps Environment**
Shared infrastructure for your containers.

**What it is:** The "hosting environment" where your 3 containers will run.

**Name:** `email-automation-env`

**Created by:**
```bash
az containerapp env create \
  --name email-automation-env \
  --resource-group email-automation-rg \
  --location eastus
```

**Cost:** ~$0 (you only pay for containers that run in it)

**What it includes:**
- Networking (virtual network)
- Logging infrastructure
- Load balancer
- Ingress controller

---

### **3. Azure Container Registry (ACR)**
Private storage for your Docker images.

**What it is:** Your private Docker Hub - stores frontend, backend, ONLYOFFICE images.

**Name:** `emailautomation12345` (must be globally unique, lowercase, no dashes)

**SKU:** Basic ($5/month)

**Created by:**
```bash
az acr create \
  --resource-group email-automation-rg \
  --name emailautomation12345 \
  --sku Basic \
  --admin-enabled true
```

**Cost:** ~$5/month (Basic tier)

**Storage:**
- Frontend image: 350MB
- Backend image: 700MB
- ONLYOFFICE image: 1.5GB
- **Total:** ~2.5GB

---

### **4. Storage Account**
Persistent file storage for uploaded documents.

**What it is:** Cloud storage for your uploads/ folder.

**Name:** `emailstorage54321` (must be globally unique, lowercase, no dashes)

**SKU:** Standard_LRS (cheapest option)

**Created by:**
```bash
az storage account create \
  --name emailstorage54321 \
  --resource-group email-automation-rg \
  --location eastus \
  --sku Standard_LRS
```

**Cost:** ~$2-5/month for 10GB

---

### **5. Azure File Share**
Actual file storage mounted to backend container.

**What it is:** A network drive that your backend container can read/write.

**Name:** `uploads`

**Created inside:** `emailstorage54321` storage account

**Created by:**
```bash
az storage share create \
  --name uploads \
  --account-name emailstorage54321
```

**Then mount it to Container Apps Environment:**
```bash
# Get storage key
STORAGE_KEY=$(az storage account keys list \
  --resource-group email-automation-rg \
  --account-name emailstorage54321 \
  --query "[0].value" -o tsv)

# Create storage mount
az containerapp env storage set \
  --name email-automation-env \
  --resource-group email-automation-rg \
  --storage-name uploads \
  --azure-file-account-name emailstorage54321 \
  --azure-file-account-key $STORAGE_KEY \
  --azure-file-share-name uploads \
  --access-mode ReadWrite
```

**Cost:** Included in Storage Account pricing

**What gets stored:**
```
uploads/
├── sessions/
│   ├── abc123.json        ← Document metadata
│   └── def456.json
├── abc123.docx            ← Uploaded Word documents
├── abc123_template.docx   ← Template copies
└── def456.docx
```

---

### **6. Container App: Frontend**
React application container.

**What it is:** Your running React app (the website users see).

**Name:** `frontend`

**Image:** `emailautomation12345.azurecr.io/frontend:latest`

**Resources:**
- CPU: 0.25 vCPU
- Memory: 0.5GB RAM
- Port: 3000

**Scaling:**
- Min replicas: 1
- Max replicas: 1 (testing doesn't need more)

**Created by:**
```bash
az containerapp create \
  --name frontend \
  --resource-group email-automation-rg \
  --environment email-automation-env \
  --image emailautomation12345.azurecr.io/frontend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server emailautomation12345.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.25 --memory 0.5Gi \
  --min-replicas 1 --max-replicas 1 \
  --env-vars \
    REACT_APP_API_URL=https://backend.XXX.azurecontainerapps.io
```

**Cost:** ~$8/month (0.25 vCPU × 730 hours)

**Public URL:** `https://frontend.proudhill-abc123.eastus.azurecontainerapps.io`

**Environment Variables Needed:**
```bash
REACT_APP_API_URL=https://backend.YOUR-URL.azurecontainerapps.io
```

---

### **7. Container App: Backend**
Flask API container.

**What it is:** Your Python backend (handles DOCX processing, GLiNER AI).

**Name:** `backend`

**Image:** `emailautomation12345.azurecr.io/backend:latest`

**Resources:**
- CPU: 0.5 vCPU
- Memory: 1GB RAM
- Port: 5000

**Scaling:**
- Min replicas: 1
- Max replicas: 2 (auto-scales under load)

**Storage Mount:** Azure Files → `/mnt/uploads`

**Created by:**
```bash
az containerapp create \
  --name backend \
  --resource-group email-automation-rg \
  --environment email-automation-env \
  --image emailautomation12345.azurecr.io/backend:latest \
  --target-port 5000 \
  --ingress external \
  --registry-server emailautomation12345.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 1 --max-replicas 2 \
  --env-vars \
    HOST=0.0.0.0 \
    DEBUG=False \
    ONLYOFFICE_SERVER_URL=https://onlyoffice.XXX.azurecontainerapps.io \
    UPLOAD_FOLDER=/mnt/uploads \
    ALLOWED_ORIGINS=https://frontend.XXX.azurecontainerapps.io
```

**Cost:** ~$15/month (0.5 vCPU × 730 hours)

**Public URL:** `https://backend.proudhill-abc123.eastus.azurecontainerapps.io`

**Environment Variables Needed:**
```bash
HOST=0.0.0.0                                                    # Listen on all IPs
DEBUG=False                                                     # Production mode
ONLYOFFICE_SERVER_URL=https://onlyoffice.YOUR-URL.azurecontainerapps.io
UPLOAD_FOLDER=/mnt/uploads                                      # Mounted Azure Files
ALLOWED_ORIGINS=https://frontend.YOUR-URL.azurecontainerapps.io # CORS
```

---

### **8. Container App: ONLYOFFICE**
Document editor server.

**What it is:** The document editor (like Google Docs).

**Name:** `onlyoffice`

**Image:** `emailautomation12345.azurecr.io/onlyoffice:latest`

**Resources:**
- CPU: 1.0 vCPU
- Memory: 2GB RAM
- Port: 80

**Scaling:**
- Min replicas: 1
- Max replicas: 1 (ONLYOFFICE doesn't need scaling for testing)

**Created by:**
```bash
az containerapp create \
  --name onlyoffice \
  --resource-group email-automation-rg \
  --environment email-automation-env \
  --image emailautomation12345.azurecr.io/onlyoffice:latest \
  --target-port 80 \
  --ingress external \
  --registry-server emailautomation12345.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 1.0 --memory 2.0Gi \
  --min-replicas 1 --max-replicas 1 \
  --env-vars \
    JWT_ENABLED=false \
    WOPI_ENABLED=false \
    USE_UNAUTHORIZED_STORAGE=true \
    ALLOW_PRIVATE_IP_ADDRESS=true
```

**Cost:** ~$12/month (1.0 vCPU × 730 hours)

**Public URL:** `https://onlyoffice.proudhill-abc123.eastus.azurecontainerapps.io`

**Environment Variables Needed:**
```bash
JWT_ENABLED=false                    # Disable JWT for testing
WOPI_ENABLED=false                   # Disable WOPI protocol
USE_UNAUTHORIZED_STORAGE=true        # Allow external storage
ALLOW_PRIVATE_IP_ADDRESS=true        # Allow backend to connect
```

---

## 📊 Complete Resource Summary

| # | Resource Type | Name | Cost/Month | Required? |
|---|---------------|------|------------|-----------|
| 1 | Resource Group | `email-automation-rg` | FREE | ✅ Yes |
| 2 | Container Apps Environment | `email-automation-env` | FREE | ✅ Yes |
| 3 | Container Registry | `emailautomation12345` | $5 | ✅ Yes |
| 4 | Storage Account | `emailstorage54321` | $3 | ✅ Yes |
| 5 | File Share | `uploads` | (included) | ✅ Yes |
| 6 | Container App (Frontend) | `frontend` | $8 | ✅ Yes |
| 7 | Container App (Backend) | `backend` | $15 | ✅ Yes |
| 8 | Container App (ONLYOFFICE) | `onlyoffice` | $12 | ✅ Yes |
| **TOTAL** | | | **$43/month** | |

**Optimized for testing:** Can reduce to ~$30/month by:
- Using 0.5 vCPU for ONLYOFFICE (instead of 1.0)
- Scaling to zero when not testing
- Using consumption plan (pay only when running)

---

## 🔗 Resource Dependencies

```
Resource Group (email-automation-rg)
│
├── Container Apps Environment (email-automation-env)
│   │
│   ├── Container App: Frontend
│   │   └── Needs: ACR for image
│   │
│   ├── Container App: Backend
│   │   ├── Needs: ACR for image
│   │   ├── Needs: File Share mount
│   │   └── Needs: ONLYOFFICE URL
│   │
│   ├── Container App: ONLYOFFICE
│   │   └── Needs: ACR for image
│   │
│   └── Storage Mount (uploads)
│       └── Needs: Storage Account + File Share
│
├── Container Registry (ACR)
│   ├── Stores: frontend:latest
│   ├── Stores: backend:latest
│   └── Stores: onlyoffice:latest
│
└── Storage Account (emailstorage54321)
    └── File Share (uploads)
        └── Mounted to: Backend container
```

---

## 🎯 Azure Portal View (What You'll See)

After deployment, Azure Portal will show:

### **Resource Group: email-automation-rg**
```
Overview (8 resources)
├── 📦 Container Apps Environment   email-automation-env
├── 🐳 Container App                frontend
├── 🐳 Container App                backend
├── 🐳 Container App                onlyoffice
├── 📁 Container Registry           emailautomation12345
├── 💾 Storage Account              emailstorage54321
├── 📂 File Share                   uploads
└── 🌐 Networking                   (auto-created)
```

---

## 📋 Configuration Checklist

### **Before Deployment**
- [ ] Azure subscription access confirmed
- [ ] Subscription ID obtained
- [ ] Permissions verified (Contributor role)
- [ ] Region selected (e.g., eastus)
- [ ] Naming conventions confirmed with IT
- [ ] Budget approved (~$40/month)

### **During Deployment (Automated)**
- [ ] Resource group created
- [ ] Container Apps Environment created
- [ ] Container Registry created
- [ ] Storage Account created
- [ ] File Share created
- [ ] Storage mounted to environment
- [ ] Frontend container deployed
- [ ] Backend container deployed
- [ ] ONLYOFFICE container deployed

### **After Deployment**
- [ ] Frontend URL working
- [ ] Backend URL working
- [ ] ONLYOFFICE URL working
- [ ] Health endpoints responding
- [ ] CORS configured for frontend
- [ ] File uploads working
- [ ] Documents persisting in Azure Files

---

## 🔐 Security Configuration

### **Container Registry (ACR)**
**Admin credentials:** Enabled (for deployment)

**Authentication:**
```bash
# Get credentials
az acr credential show --name emailautomation12345

# Output:
{
  "username": "emailautomation12345",
  "passwords": [
    { "value": "ABC123...XYZ" }
  ]
}
```

**Used by:** All 3 container apps to pull images

---

### **Storage Account**
**Access Keys:** 2 keys (rotating recommended)

**Authentication:**
```bash
# Get keys
az storage account keys list \
  --resource-group email-automation-rg \
  --account-name emailstorage54321

# Output:
[
  { "keyName": "key1", "value": "ABC123...XYZ" },
  { "keyName": "key2", "value": "DEF456...UVW" }
]
```

**Used by:** Backend container to access uploads/ file share

---

### **Public Endpoints**
All 3 containers have **public HTTPS URLs** (required for testing).

**Security:**
- ✅ HTTPS enforced (Azure provides SSL certificates)
- ✅ No authentication (for testing - add later for production)
- ⚠️ CORS configured to only allow your frontend URL

**If IT requires private endpoints:**
- Need Virtual Network integration
- Need Azure Front Door or Application Gateway
- **Cost increase:** +$30-50/month

---

## 🌐 Networking Configuration

### **Ingress Settings**
All containers use **external ingress** (public internet access).

| Container | Ingress Type | Port | Traffic |
|-----------|--------------|------|---------|
| Frontend | External | 3000 | HTTPS (443) |
| Backend | External | 5000 | HTTPS (443) |
| ONLYOFFICE | External | 80 | HTTPS (443) |

**Azure automatically:**
- ✅ Provides SSL certificates
- ✅ Routes HTTPS (443) → Container Port
- ✅ Handles load balancing
- ✅ Provides DDoS protection

---

### **Container Communication**
Containers communicate over public URLs:

```
Frontend → Backend
  HTTPS GET https://backend.XXX.azurecontainerapps.io/api/...

Backend → ONLYOFFICE
  HTTP GET http://onlyoffice.XXX.azurecontainerapps.io/healthcheck

Backend → Azure Files
  SMB mount /mnt/uploads
```

**Alternative (more secure, but complex):**
Use Container Apps Environment internal networking (containers talk privately).

---

## 💰 Cost Breakdown Details

### **Compute Costs (Container Apps)**
Based on vCPU-hours and memory-hours:

**Pricing:**
- vCPU: $0.000024 per vCPU-second
- Memory: $0.0000025 per GB-second

**Monthly calculation (730 hours = 2,628,000 seconds):**

| Container | vCPU | RAM | vCPU Cost | RAM Cost | Total |
|-----------|------|-----|-----------|----------|-------|
| Frontend | 0.25 | 0.5GB | $15.77 | $3.29 | $19.06 |
| Backend | 0.5 | 1GB | $31.54 | $6.57 | $38.11 |
| ONLYOFFICE | 1.0 | 2GB | $63.07 | $13.14 | $76.21 |
| **Subtotal** | | | | | **$133.38** |

**But with consumption plan (scales to zero):**
- Assumes 20% usage (5.8 hours/day for testing)
- **Actual cost:** ~$26/month

---

### **Storage Costs**
**Azure Files (Standard LRS):**
- First 50GB: $0.06 per GB/month
- Expected usage: 10GB
- **Cost:** $0.60/month

**Transaction costs:**
- 10,000 operations/month = ~$0.10
- **Total storage:** ~$3/month

---

### **Registry Costs**
**Azure Container Registry (Basic):**
- Storage: 10GB included
- Bandwidth: 100GB included
- **Fixed cost:** $5/month

---

### **Total Monthly Cost**
```
Compute (20% usage):  $26
Storage:              $3
Registry:             $5
─────────────────────────
TOTAL:                $34/month
```

**If running 24/7:**
```
Compute (100% usage): $133
Storage:              $3
Registry:             $5
─────────────────────────
TOTAL:                $141/month
```

**💡 Tip:** Scale to zero when not testing to save $100+/month!

---

## 🔧 Management Operations

### **View All Resources**
```bash
az resource list \
  --resource-group email-automation-rg \
  --output table
```

### **Check Container Status**
```bash
az containerapp list \
  --resource-group email-automation-rg \
  --output table
```

### **View Environment**
```bash
az containerapp env show \
  --name email-automation-env \
  --resource-group email-automation-rg
```

### **Get URLs**
```bash
# Frontend URL
az containerapp show \
  --name frontend \
  --resource-group email-automation-rg \
  --query properties.configuration.ingress.fqdn -o tsv

# Backend URL
az containerapp show \
  --name backend \
  --resource-group email-automation-rg \
  --query properties.configuration.ingress.fqdn -o tsv

# ONLYOFFICE URL
az containerapp show \
  --name onlyoffice \
  --resource-group email-automation-rg \
  --query properties.configuration.ingress.fqdn -o tsv
```

---

## ✅ Success Criteria

After deployment, you should have:

- [ ] 8 resources in `email-automation-rg`
- [ ] 3 public HTTPS URLs working
- [ ] Backend `/health` endpoint returns JSON
- [ ] Frontend loads in browser
- [ ] File uploads persist in Azure Files
- [ ] Total cost < $50/month

---

## 📞 What to Tell IT

**Simple version:**
```
I need to create 8 Azure resources for testing:
1. Resource Group
2. Container Apps Environment
3. Container Registry (Basic tier)
4. Storage Account (Standard LRS)
5-8. 3 Container Apps (Frontend, Backend, ONLYOFFICE)

Expected cost: $30-40/month
All resources in: eastus region
Public HTTPS endpoints required (for testing)
```

**Detailed version:**
Send them this document! 📄

---

**Ready to deploy? Run:** `./deploy-azure.sh` 🚀
