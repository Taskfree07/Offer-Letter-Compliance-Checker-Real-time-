# Azure Deployment Status - Email Automation MVP

**Last Updated:** 2025-01-06
**Subscription ID:** `f2ecab04-e566-4faf-9854-f661e981188e`
**Account:** developer.c@techgene.com
**Company:** Techgene Solutions Pvt Ltd

---

## ✅ What's Done

- [x] **Azure CLI Installed** (version 2.79.0)
- [x] **Docker Installed** (version 28.4.0)
- [x] **Logged into Azure** (developer.c@techgene.com)
- [x] **Subscription Access Granted** (Microsoft Partner Network)
- [x] **Project Location:** `E:\Email-automation-MVP`

---

## 🚨 CURRENT BLOCKERS

### **1. Resource Providers Not Registered**

**Status:** ❌ BLOCKED - Need IT Action

**Required Providers:**
- ❌ `Microsoft.App` (for Container Apps) - **NotRegistered**
- ❌ `Microsoft.ContainerRegistry` (for Container Registry) - **NotRegistered**
- ✅ `Microsoft.Storage` (for Storage Account) - **Registered**

**Error Message:**
```
AuthorizationFailed: The client 'developer.c@techgene.com' does not have
authorization to perform action 'Microsoft.App/register/action'
```

**What IT Needs to Do:**
```bash
# IT must run these commands:
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.ContainerRegistry

# Or via Azure Portal:
# 1. Go to Subscriptions → Microsoft Partner Network
# 2. Settings → Resource providers
# 3. Search "Microsoft.App" → Click "Register"
# 4. Search "Microsoft.ContainerRegistry" → Click "Register"
# 5. Wait 5-10 minutes for registration to complete
```

### **2. Resource Group Name Unknown**

**Status:** ⚠️ Need Confirmation

**Question:** Which resource group should be used?
- Use existing company resource group?
- Create new one called `email-automation-rg`?

**Need IT to confirm:**
- Resource group name
- Contributor access on that resource group

---

## 📋 What Will Be Created

Once blockers are resolved, these 8 resources will be created:

| # | Resource Type | Name | Purpose | Cost/Month |
|---|---------------|------|---------|------------|
| 1 | Resource Group | `email-automation-rg` | Container for all resources | FREE |
| 2 | Container Apps Environment | `email-automation-env` | Hosting platform | FREE |
| 3 | Container Registry | `emailautomation[RANDOM]` | Store Docker images | $5 |
| 4 | Storage Account | `emailstorage[RANDOM]` | File storage | $3 |
| 5 | File Share | `uploads` | Persistent document storage | (included) |
| 6 | Container App | `frontend` | React website | $8 |
| 7 | Container App | `backend` | Flask API | $15 |
| 8 | Container App | `onlyoffice` | Document editor | $12 |
| **TOTAL** | | | | **~$43/month** |

---

## 🎯 Next Steps (In Order)

### **Step 1: Email IT** 📧

```
Subject: Azure Resource Providers Registration - URGENT

Hi [IT Person],

I need these resource providers registered on our Azure subscription
to deploy the Email Automation MVP:

SUBSCRIPTION: f2ecab04-e566-4faf-9854-f661e981188e (Microsoft Partner Network)
ACCOUNT: developer.c@techgene.com

REQUIRED ACTIONS:
1. Register resource provider: Microsoft.App
2. Register resource provider: Microsoft.ContainerRegistry
3. Confirm which resource group to use
4. Confirm I have "Contributor" access on the resource group

COMMANDS TO RUN (as subscription admin):
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.ContainerRegistry

VERIFICATION:
az provider show --namespace Microsoft.App --query "registrationState"
az provider show --namespace Microsoft.ContainerRegistry --query "registrationState"
(should return "Registered")

Takes 5-10 minutes to complete registration.
Once done, deployment takes 30-40 minutes.

Thanks!
```

### **Step 2: Wait for IT Confirmation**

IT will reply with:
- ✅ Providers registered
- ✅ Resource group name: `[NAME]`
- ✅ Contributor access granted

### **Step 3: Resume Deployment in Claude Code**

Open Claude Code and say:
> "IT registered the providers. Resource group is: [NAME]. Let's deploy!"

---

## 🔧 Deployment Commands (For Reference)

### **Verify Providers are Registered:**
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" provider show --namespace Microsoft.App --query "registrationState" -o tsv
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" provider show --namespace Microsoft.ContainerRegistry --query "registrationState" -o tsv

# Should both return: "Registered"
```

### **Check Current Login:**
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" account show
```

### **List Resource Groups:**
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" group list --output table
```

### **Full Deployment (When Ready):**
```bash
# Navigate to project
cd E:\Email-automation-MVP

# Option 1: Automated script
./deploy-azure.sh

# Option 2: Tell Claude Code to run deployment interactively
```

---

## 📊 Technical Details

### **Azure CLI Path (Windows):**
```
C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd
```

### **Project Structure:**
```
E:\Email-automation-MVP\
├── src/                     # React frontend
├── python-nlp/              # Flask backend
├── public/                  # Static assets
├── Dockerfile.frontend      # Frontend container
├── Dockerfile.backend       # Backend container
├── deploy-azure.sh          # Automated deployment script
└── docker-compose.yml       # Local ONLYOFFICE setup
```

### **Container Specifications:**

**Frontend:**
- Image: React production build
- CPU: 0.25 vCPU
- Memory: 0.5GB RAM
- Port: 3000
- Replicas: 1

**Backend:**
- Image: Flask + GLiNER + python-docx
- CPU: 0.5 vCPU
- Memory: 1GB RAM
- Port: 5000
- Replicas: 1-2 (auto-scale)
- Storage: Azure Files mounted at `/mnt/uploads`

**ONLYOFFICE:**
- Image: onlyoffice/documentserver
- CPU: 1 vCPU
- Memory: 2GB RAM
- Port: 80
- Replicas: 1

---

## 🐛 Known Issues & Solutions

### **Issue: Azure CLI not found in Git Bash**
**Solution:** Use full path:
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" [command]
```

### **Issue: Subscription not visible after login**
**Solution:** Access can take 5-15 minutes to propagate. Logout and login again:
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" logout
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" login --use-device-code
```

### **Issue: AuthorizationFailed when registering providers**
**Solution:** You don't have permission. IT admin must register providers.

### **Issue: Container names already taken**
**Solution:** Names must be globally unique. Script uses random suffixes:
- `emailautomation[RANDOM]` (e.g., emailautomation12345)
- `emailstorage[RANDOM]` (e.g., emailstorage54321)

---

## 📞 Contacts

**IT Contact:** [Your IT Person Name/Email]
**Subscription Admin:** [Admin Name/Email]
**Your Account:** developer.c@techgene.com

---

## 📚 Reference Documents

- **Full Deployment Guide:** `AZURE_CONTAINER_APPS_DEPLOYMENT.md`
- **Setup Checklist:** `AZURE_SETUP_CHECKLIST.md`
- **Detailed Steps:** `DEPLOYMENT_STEPS.md`
- **Application Analysis:** `APPLICATION_ANALYSIS.md`

---

## ⏱️ Timeline (Estimated)

Once IT resolves blockers:

| Phase | Duration | Description |
|-------|----------|-------------|
| IT registers providers | 5-10 min | Wait for Azure |
| Build Docker images | 15-20 min | Local build |
| Upload images to ACR | 10-15 min | Network upload |
| Create Azure resources | 5-10 min | Azure provisioning |
| Deploy containers | 5-10 min | Container startup |
| Test deployment | 5 min | Verify it works |
| **TOTAL** | **45-70 min** | |

---

## ✅ Success Criteria

Deployment is successful when:

- [ ] All 3 containers are running
- [ ] Frontend URL loads the application
- [ ] Backend `/health` endpoint returns JSON
- [ ] ONLYOFFICE editor loads documents
- [ ] File uploads persist in Azure Files
- [ ] Variables can be edited and replaced
- [ ] Total cost < $50/month

---

## 🚀 Quick Resume Commands

### **When You Return to This Project:**

```bash
# 1. Navigate to project
cd E:\Email-automation-MVP

# 2. Check Azure login status
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" account show

# 3. If not logged in:
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" login --use-device-code

# 4. Set subscription
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" account set --subscription f2ecab04-e566-4faf-9854-f661e981188e

# 5. Check provider status
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" provider show --namespace Microsoft.App --query "registrationState"

# 6. If providers are registered, tell Claude Code:
# "Providers are registered, let's continue deployment"
```

---

## 📝 Notes

- **Subscription Type:** Microsoft Partner Network (MPN)
- **Region:** eastus (preferred)
- **Deployment Method:** Azure Container Apps (serverless containers)
- **No GPU Required:** CPU-only deployment
- **Auto-scaling:** Enabled on backend (1-2 replicas)
- **Public Endpoints:** Yes (HTTPS enabled automatically)

---

## 🔐 Security Considerations

- All containers use public HTTPS endpoints (testing)
- No authentication required for testing phase
- CORS configured to allow frontend → backend communication
- Storage uses Azure Files (SMB mount)
- Credentials stored in Azure Container Registry

**For Production (Future):**
- Add authentication (Azure AD)
- Enable private endpoints (VNet integration)
- Configure custom domains
- Add Application Insights monitoring
- Enable auto-scale rules
- Set up cost alerts

---

## 💰 Cost Management

### **To Stop Containers (Save Money):**
```bash
# Scale to zero (stops charging for compute)
az containerapp update --name frontend --resource-group [RG_NAME] --min-replicas 0 --max-replicas 0
az containerapp update --name backend --resource-group [RG_NAME] --min-replicas 0 --max-replicas 0
az containerapp update --name onlyoffice --resource-group [RG_NAME] --min-replicas 0 --max-replicas 0
```

### **To Restart Containers:**
```bash
az containerapp update --name frontend --resource-group [RG_NAME] --min-replicas 1 --max-replicas 1
az containerapp update --name backend --resource-group [RG_NAME] --min-replicas 1 --max-replicas 2
az containerapp update --name onlyoffice --resource-group [RG_NAME] --min-replicas 1 --max-replicas 1
```

### **To Delete Everything:**
```bash
# WARNING: This deletes ALL resources!
az group delete --name email-automation-rg --yes --no-wait
```

---

## 📈 What Happens After Deployment

You'll receive 3 public URLs:

```
Frontend:   https://frontend.proudhill-abc123.eastus.azurecontainerapps.io
Backend:    https://backend.proudhill-abc123.eastus.azurecontainerapps.io
ONLYOFFICE: https://onlyoffice.proudhill-abc123.eastus.azurecontainerapps.io
```

**Test the application:**
1. Open frontend URL → Should show HomeScreen
2. Click "Offer Letter Template" → Should navigate
3. Click "Import Offer Letter" → Upload .docx file
4. Document loads in ONLYOFFICE editor
5. Variables appear in right panel
6. Edit variable values → Document updates in real-time

---

## 🎯 Current Action Required

**YOU:** Send email to IT (template above)
**IT:** Register providers + confirm resource group
**YOU:** Tell Claude Code when ready
**CLAUDE CODE:** Run deployment automatically

**Status:** ⏸️ **PAUSED - WAITING FOR IT**

---

**Last Session Notes:**
- Azure CLI found at: `C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd`
- Login working via device code authentication
- Subscription visible and accessible
- Permission issue prevents resource provider registration
- Need IT to complete provider registration before proceeding

---

**Next Session:**
When IT confirms providers are registered, open Claude Code and say:
> "IT registered Microsoft.App and Microsoft.ContainerRegistry. Resource group is [NAME]. Ready to deploy!"

Then Claude Code will:
1. ✅ Verify providers are registered
2. ✅ Build Docker images (Frontend, Backend, ONLYOFFICE)
3. ✅ Create Azure resources
4. ✅ Deploy containers
5. ✅ Give you the URLs
6. ✅ Test everything works

**Estimated time:** 40-60 minutes

---

**End of Status Document**
