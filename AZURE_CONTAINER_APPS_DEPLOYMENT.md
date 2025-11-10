# Azure Container Apps Deployment Guide
**Email Automation MVP - Cost-Optimized Testing Deployment**

## 🎯 Overview

This guide deploys your Email Automation MVP to Azure Container Apps with minimal cost for testing purposes.

### Architecture
```
Azure Container Apps Environment
├── Frontend (React App) - Port 3000
├── Backend (Flask API) - Port 5000
├── ONLYOFFICE Server - Port 8080
└── Azure Files (Persistent Storage)
```

### Estimated Monthly Cost (Testing)
- **Container Apps**: ~$15-30/month (consumption-based)
- **Azure Files**: ~$2-5/month (10GB)
- **Total**: **~$20-35/month**

---

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **Azure CLI** installed ([Download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
3. **Docker** installed locally ([Download](https://www.docker.com/products/docker-desktop))
4. **Git Bash** or PowerShell

---

## 🔧 Step 1: Prepare Application

### 1.1 Create Dockerfiles

**Frontend Dockerfile** (`Dockerfile.frontend`)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY public/ ./public/
COPY src/ ./src/

# Build the React app
RUN npm run build

# Serve with static server
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
```

**Backend Dockerfile** (`Dockerfile.backend`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY python-nlp/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY python-nlp/ ./

# Create uploads directory
RUN mkdir -p /app/uploads/sessions

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]
```

**ONLYOFFICE** - Use official image: `onlyoffice/documentserver:latest`

---

## 🚀 Step 2: Deploy to Azure

### 2.1 Login to Azure
```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 2.2 Create Resource Group
```bash
# Set variables
RESOURCE_GROUP="email-automation-rg"
LOCATION="eastus"
ENVIRONMENT_NAME="email-automation-env"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### 2.3 Create Container Apps Environment
```bash
az containerapp env create \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 2.4 Create Azure File Share for Persistent Storage
```bash
# Create storage account
STORAGE_ACCOUNT="emailautomation$RANDOM"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Create file share
az storage share create \
  --name uploads \
  --account-name $STORAGE_ACCOUNT

# Get storage key
STORAGE_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP \
  --account-name $STORAGE_ACCOUNT \
  --query "[0].value" -o tsv)

# Create storage mount
az containerapp env storage set \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --storage-name uploads \
  --azure-file-account-name $STORAGE_ACCOUNT \
  --azure-file-account-key $STORAGE_KEY \
  --azure-file-share-name uploads \
  --access-mode ReadWrite
```

---

## 📦 Step 3: Build and Push Docker Images

### 3.1 Create Azure Container Registry (ACR)
```bash
ACR_NAME="emailautomation$RANDOM"
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name $ACR_NAME
```

### 3.2 Build and Push Images
```bash
# Build frontend
docker build -f Dockerfile.frontend -t $ACR_NAME.azurecr.io/frontend:latest .
docker push $ACR_NAME.azurecr.io/frontend:latest

# Build backend
docker build -f Dockerfile.backend -t $ACR_NAME.azurecr.io/backend:latest .
docker push $ACR_NAME.azurecr.io/backend:latest

# Tag ONLYOFFICE (use official image)
docker pull onlyoffice/documentserver:latest
docker tag onlyoffice/documentserver:latest $ACR_NAME.azurecr.io/onlyoffice:latest
docker push $ACR_NAME.azurecr.io/onlyoffice:latest
```

### 3.3 Get ACR Credentials
```bash
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
```

---

## 🌐 Step 4: Deploy Container Apps

### 4.1 Deploy ONLYOFFICE
```bash
az containerapp create \
  --name onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $ACR_NAME.azurecr.io/onlyoffice:latest \
  --target-port 80 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 1.0 --memory 2.0Gi \
  --min-replicas 1 --max-replicas 1 \
  --env-vars \
    JWT_ENABLED=false \
    WOPI_ENABLED=false \
    USE_UNAUTHORIZED_STORAGE=true \
    ALLOW_PRIVATE_IP_ADDRESS=true

# Get ONLYOFFICE URL
ONLYOFFICE_URL=$(az containerapp show \
  --name onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "ONLYOFFICE URL: https://$ONLYOFFICE_URL"
```

### 4.2 Deploy Backend (Flask)
```bash
az containerapp create \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $ACR_NAME.azurecr.io/backend:latest \
  --target-port 5000 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 1 --max-replicas 2 \
  --env-vars \
    HOST=0.0.0.0 \
    DEBUG=False \
    ONLYOFFICE_SERVER_URL=https://$ONLYOFFICE_URL \
    UPLOAD_FOLDER=/app/uploads

# Mount Azure Files
az containerapp update \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars UPLOAD_FOLDER=/mnt/uploads

# Get backend URL
BACKEND_URL=$(az containerapp show \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Backend URL: https://$BACKEND_URL"
```

### 4.3 Deploy Frontend (React)
```bash
az containerapp create \
  --name frontend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $ACR_NAME.azurecr.io/frontend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.25 --memory 0.5Gi \
  --min-replicas 1 --max-replicas 1 \
  --env-vars \
    REACT_APP_API_URL=https://$BACKEND_URL

# Get frontend URL
FRONTEND_URL=$(az containerapp show \
  --name frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Frontend URL: https://$FRONTEND_URL"
```

---

## 🔐 Step 5: Configure CORS

Update backend CORS settings to allow the Azure frontend URL:

```bash
# Update backend environment variables
az containerapp update \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    ALLOWED_ORIGINS=https://$FRONTEND_URL
```

**Manual Update Required**: Edit `python-nlp/app.py` line 186-194 to add:
```python
ALLOWED_ORIGINS = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    f"https://{os.environ.get('FRONTEND_URL', '')}",  # Azure Container App URL
}
```

Rebuild and redeploy backend container.

---

## 🧪 Step 6: Test Deployment

### 6.1 Access Application
```bash
echo "🎉 Application Deployed Successfully!"
echo "Frontend: https://$FRONTEND_URL"
echo "Backend:  https://$BACKEND_URL"
echo "ONLYOFFICE: https://$ONLYOFFICE_URL"
```

### 6.2 Health Checks
```bash
# Test backend
curl https://$BACKEND_URL/health

# Test ONLYOFFICE
curl https://$ONLYOFFICE_URL/healthcheck

# Test GLiNER
curl https://$BACKEND_URL/api/gliner-health

# Test DOCX service
curl https://$BACKEND_URL/api/docx-health
```

---

## 💰 Cost Optimization Tips

### 1. **Use Consumption Plan** (Default)
Container Apps scales to zero when not in use.

### 2. **Reduce Resource Allocation**
```bash
# Scale down containers
az containerapp update --name frontend --cpu 0.25 --memory 0.5Gi
az containerapp update --name backend --cpu 0.5 --memory 1.0Gi
az containerapp update --name onlyoffice --cpu 0.5 --memory 1.5Gi
```

### 3. **Set Scale Rules**
```bash
# Scale based on HTTP requests
az containerapp update \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --min-replicas 0 \
  --max-replicas 2 \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50
```

### 4. **Stop Containers When Not Testing**
```bash
# Stop all containers
az containerapp update --name frontend --min-replicas 0 --max-replicas 0
az containerapp update --name backend --min-replicas 0 --max-replicas 0
az containerapp update --name onlyoffice --min-replicas 0 --max-replicas 0

# Start containers
az containerapp update --name frontend --min-replicas 1 --max-replicas 1
az containerapp update --name backend --min-replicas 1 --max-replicas 2
az containerapp update --name onlyoffice --min-replicas 1 --max-replicas 1
```

### 5. **Use Azure Files Standard (Not Premium)**
Already configured in the script above.

---

## 🐛 Troubleshooting

### View Container Logs
```bash
# Frontend logs
az containerapp logs show \
  --name frontend \
  --resource-group $RESOURCE_GROUP \
  --follow

# Backend logs
az containerapp logs show \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --follow

# ONLYOFFICE logs
az containerapp logs show \
  --name onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --follow
```

### Check Container Status
```bash
az containerapp show \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.runningStatus
```

### Restart Container
```bash
az containerapp revision restart \
  --name backend \
  --resource-group $RESOURCE_GROUP
```

---

## 🧹 Cleanup (Delete Everything)

```bash
# Delete resource group (removes everything)
az group delete --name $RESOURCE_GROUP --yes --no-wait

# Delete container registry
az acr delete --name $ACR_NAME --yes
```

---

## 📝 Environment Variables Summary

### Backend Container
| Variable | Value | Description |
|----------|-------|-------------|
| `HOST` | `0.0.0.0` | Listen on all interfaces |
| `DEBUG` | `False` | Production mode |
| `ONLYOFFICE_SERVER_URL` | `https://[onlyoffice-fqdn]` | ONLYOFFICE URL |
| `UPLOAD_FOLDER` | `/mnt/uploads` | Persistent storage mount |
| `ALLOWED_ORIGINS` | `https://[frontend-fqdn]` | CORS origins |

### Frontend Container
| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://[backend-fqdn]` | Backend API URL |

### ONLYOFFICE Container
| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_ENABLED` | `false` | Disable JWT (testing) |
| `WOPI_ENABLED` | `false` | Disable WOPI |
| `USE_UNAUTHORIZED_STORAGE` | `true` | Allow external storage |

---

## 🎯 Next Steps

1. **Set up CI/CD** with GitHub Actions for automatic deployments
2. **Enable Application Insights** for monitoring
3. **Configure Custom Domain** for professional URLs
4. **Add Azure Key Vault** for secrets management
5. **Enable Auto-scaling** based on load

---

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [ONLYOFFICE Docker](https://github.com/ONLYOFFICE/Docker-DocumentServer)
- [Container Apps Pricing](https://azure.microsoft.com/en-us/pricing/details/container-apps/)

---

**Deployed Successfully! 🚀**
