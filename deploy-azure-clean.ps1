# ================================================================
# Azure Container Apps Deployment Script
# Email Automation MVP - Full Stack Deployment
# ================================================================

Write-Host "Starting Azure Container Apps Deployment..." -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Configuration Variables
$RESOURCE_GROUP = "email-automation-rg"
$LOCATION = "eastus"
$ENVIRONMENT_NAME = "email-automation-env"
$ACR_NAME = "emailautomation$(Get-Random -Minimum 1000 -Maximum 9999)"
$STORAGE_ACCOUNT = "emailstorage$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  Location: $LOCATION"
Write-Host "  Environment: $ENVIRONMENT_NAME"
Write-Host "  ACR Name: $ACR_NAME"
Write-Host "  Storage: $STORAGE_ACCOUNT`n"

# Step 1: Create Resource Group
Write-Host "Step 1: Creating Resource Group..." -ForegroundColor Green
az group create --name $RESOURCE_GROUP --location $LOCATION
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create resource group" -ForegroundColor Red
    exit 1
}
Write-Host "DONE: Resource group created`n" -ForegroundColor Green

# Step 2: Create Container Apps Environment
Write-Host "Step 2: Creating Container Apps Environment..." -ForegroundColor Green
az containerapp env create `
  --name $ENVIRONMENT_NAME `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create environment" -ForegroundColor Red
    exit 1
}
Write-Host "DONE: Environment created`n" -ForegroundColor Green

# Step 3: Create Storage Account and File Share
Write-Host "Step 3: Creating Azure Storage for persistent uploads..." -ForegroundColor Green
az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS

az storage share create `
  --name uploads `
  --account-name $STORAGE_ACCOUNT

$STORAGE_KEY = az storage account keys list `
  --resource-group $RESOURCE_GROUP `
  --account-name $STORAGE_ACCOUNT `
  --query "[0].value" -o tsv

az containerapp env storage set `
  --name $ENVIRONMENT_NAME `
  --resource-group $RESOURCE_GROUP `
  --storage-name uploads `
  --azure-file-account-name $STORAGE_ACCOUNT `
  --azure-file-account-key $STORAGE_KEY `
  --azure-file-share-name uploads `
  --access-mode ReadWrite

Write-Host "DONE: Storage configured`n" -ForegroundColor Green

# Step 4: Create Azure Container Registry
Write-Host "Step 4: Creating Azure Container Registry..." -ForegroundColor Green
az acr create `
  --resource-group $RESOURCE_GROUP `
  --name $ACR_NAME `
  --sku Basic `
  --admin-enabled true

az acr login --name $ACR_NAME

$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username -o tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv

Write-Host "DONE: ACR created and logged in`n" -ForegroundColor Green

# Step 5: Build and Push Docker Images
Write-Host "Step 5: Building and pushing Docker images..." -ForegroundColor Green

# ONLYOFFICE (pull and push official image first)
Write-Host "  > Pulling and pushing ONLYOFFICE..." -ForegroundColor Cyan
docker pull onlyoffice/documentserver:latest
docker tag onlyoffice/documentserver:latest "$ACR_NAME.azurecr.io/onlyoffice:latest"
docker push "$ACR_NAME.azurecr.io/onlyoffice:latest"
Write-Host "  DONE: ONLYOFFICE image pushed" -ForegroundColor Green

# Backend
Write-Host "  > Building backend (this takes a few minutes - downloading GLiNER model)..." -ForegroundColor Cyan
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" ./
docker push "$ACR_NAME.azurecr.io/backend:latest"
Write-Host "  DONE: Backend image pushed" -ForegroundColor Green

# Frontend (temporary build)
Write-Host "  > Building frontend (temporary)..." -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:temp" --build-arg REACT_APP_API_URL=http://placeholder ./
Write-Host "  DONE: Frontend temporary image built`n" -ForegroundColor Green

# Step 6: Deploy ONLYOFFICE Container
Write-Host "Step 6: Deploying ONLYOFFICE Document Server..." -ForegroundColor Green
az containerapp create `
  --name onlyoffice `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT_NAME `
  --image "$ACR_NAME.azurecr.io/onlyoffice:latest" `
  --target-port 80 `
  --ingress external `
  --registry-server "$ACR_NAME.azurecr.io" `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 1.0 --memory 2.0Gi `
  --min-replicas 1 --max-replicas 1 `
  --env-vars `
    JWT_ENABLED=false `
    WOPI_ENABLED=false `
    USE_UNAUTHORIZED_STORAGE=true `
    ALLOW_PRIVATE_IP_ADDRESS=true `
    ALLOW_META_IP_ADDRESS=true

$ONLYOFFICE_URL = az containerapp show `
  --name onlyoffice `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "DONE: ONLYOFFICE deployed at: https://$ONLYOFFICE_URL`n" -ForegroundColor Green

# Step 7: Deploy Backend (Flask)
Write-Host "Step 7: Deploying Flask Backend..." -ForegroundColor Green
az containerapp create `
  --name backend `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT_NAME `
  --image "$ACR_NAME.azurecr.io/backend:latest" `
  --target-port 5000 `
  --ingress external `
  --registry-server "$ACR_NAME.azurecr.io" `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 1.0 --memory 2.0Gi `
  --min-replicas 1 --max-replicas 2 `
  --env-vars `
    HOST=0.0.0.0 `
    DEBUG=False `
    ONLYOFFICE_SERVER_URL=https://$ONLYOFFICE_URL `
    UPLOAD_FOLDER=/mnt/uploads `
    BACKEND_BASE_URL=https://backend.placeholder

$BACKEND_URL = az containerapp show `
  --name backend `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

# Update backend with correct BACKEND_BASE_URL
Write-Host "  > Updating backend with correct URL..." -ForegroundColor Cyan
az containerapp update `
  --name backend `
  --resource-group $RESOURCE_GROUP `
  --set-env-vars `
    HOST=0.0.0.0 `
    DEBUG=False `
    ONLYOFFICE_SERVER_URL=https://$ONLYOFFICE_URL `
    UPLOAD_FOLDER=/mnt/uploads `
    BACKEND_BASE_URL=https://$BACKEND_URL

Write-Host "DONE: Backend deployed at: https://$BACKEND_URL`n" -ForegroundColor Green

# Step 8: Deploy Frontend (React)
Write-Host "Step 8: Deploying React Frontend..." -ForegroundColor Green

# Rebuild frontend with correct backend URL
Write-Host "  > Rebuilding frontend with backend URL..." -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" --build-arg REACT_APP_API_URL=https://$BACKEND_URL ./
docker push "$ACR_NAME.azurecr.io/frontend:latest"

az containerapp create `
  --name frontend `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT_NAME `
  --image "$ACR_NAME.azurecr.io/frontend:latest" `
  --target-port 3000 `
  --ingress external `
  --registry-server "$ACR_NAME.azurecr.io" `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 0.5 --memory 1.0Gi `
  --min-replicas 1 --max-replicas 1 `
  --env-vars `
    REACT_APP_API_URL=https://$BACKEND_URL

$FRONTEND_URL = az containerapp show `
  --name frontend `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "DONE: Frontend deployed at: https://$FRONTEND_URL`n" -ForegroundColor Green

# Step 9: Configure CORS
Write-Host "Step 9: Updating CORS configuration..." -ForegroundColor Green
az containerapp update `
  --name backend `
  --resource-group $RESOURCE_GROUP `
  --set-env-vars `
    HOST=0.0.0.0 `
    DEBUG=False `
    ONLYOFFICE_SERVER_URL=https://$ONLYOFFICE_URL `
    UPLOAD_FOLDER=/mnt/uploads `
    BACKEND_BASE_URL=https://$BACKEND_URL `
    ALLOWED_ORIGINS=https://$FRONTEND_URL

Write-Host "DONE: CORS configured`n" -ForegroundColor Green

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "*** DEPLOYMENT SUCCESSFUL! ***" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "  Frontend:   https://$FRONTEND_URL" -ForegroundColor White
Write-Host "  Backend:    https://$BACKEND_URL" -ForegroundColor White
Write-Host "  ONLYOFFICE: https://$ONLYOFFICE_URL`n" -ForegroundColor White

Write-Host "Health Check Endpoints:" -ForegroundColor Yellow
Write-Host "  Backend Health:  https://$BACKEND_URL/health"
Write-Host "  GLiNER Health:   https://$BACKEND_URL/api/gliner-health"
Write-Host "  DOCX Health:     https://$BACKEND_URL/api/docx-health`n"

Write-Host "Estimated Monthly Cost: ~`$30-50/month" -ForegroundColor Yellow
Write-Host "`nTo scale down (save costs when not testing):" -ForegroundColor Cyan
Write-Host "  az containerapp update --name frontend --resource-group $RESOURCE_GROUP --min-replicas 0 --max-replicas 0"
Write-Host "  az containerapp update --name backend --resource-group $RESOURCE_GROUP --min-replicas 0 --max-replicas 0"
Write-Host "  az containerapp update --name onlyoffice --resource-group $RESOURCE_GROUP --min-replicas 0 --max-replicas 0`n"

Write-Host "To delete everything:" -ForegroundColor Red
Write-Host "  az group delete --name $RESOURCE_GROUP --yes --no-wait`n"

# Save URLs to file
$DeploymentInfo = @"
================================================
AZURE DEPLOYMENT INFORMATION
================================================

Deployment Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Resource Group: $RESOURCE_GROUP
Location: $LOCATION

APPLICATION URLS:
- Frontend:   https://$FRONTEND_URL
- Backend:    https://$BACKEND_URL  
- ONLYOFFICE: https://$ONLYOFFICE_URL

CONTAINER REGISTRY:
- Name: $ACR_NAME
- URL:  $ACR_NAME.azurecr.io

STORAGE ACCOUNT:
- Name: $STORAGE_ACCOUNT
- Share: uploads

HEALTH CHECKS:
- Backend:  https://$BACKEND_URL/health
- GLiNER:   https://$BACKEND_URL/api/gliner-health
- DOCX:     https://$BACKEND_URL/api/docx-health

================================================
"@

$DeploymentInfo | Out-File -FilePath "deployment-urls.txt" -Encoding UTF8
Write-Host "Deployment URLs saved to: deployment-urls.txt`n" -ForegroundColor Green

Write-Host "All services are now running on Azure!" -ForegroundColor Green
Write-Host "Open https://$FRONTEND_URL in your browser`n" -ForegroundColor Cyan
