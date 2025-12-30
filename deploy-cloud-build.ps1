# Azure Deployment Script - Cloud Build Version
# Builds images in Azure to avoid local memory issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment - Cloud Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"
$LOCATION = "centralus"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  ACR Name: $ACR_NAME"
Write-Host "  Location: $LOCATION"
Write-Host ""

# Verify Azure login
Write-Host "Verifying Azure credentials..." -ForegroundColor Green
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "ERROR: Not logged into Azure. Run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Host "  Logged in as: $($account.user.name)" -ForegroundColor White
Write-Host "  Subscription: $($account.name)" -ForegroundColor White
Write-Host ""

# Get existing URLs
Write-Host "Getting existing service URLs..." -ForegroundColor Green
$BACKEND_FQDN = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$ONLYOFFICE_FQDN = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$FRONTEND_FQDN = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv

$BACKEND_URL = "https://$BACKEND_FQDN"
$ONLYOFFICE_URL = "https://$ONLYOFFICE_FQDN"
$FRONTEND_URL = "https://$FRONTEND_FQDN"

Write-Host "  Backend:    $BACKEND_URL" -ForegroundColor White
Write-Host "  ONLYOFFICE: $ONLYOFFICE_URL" -ForegroundColor White
Write-Host "  Frontend:   $FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Step 1: Build Backend Image in Azure (Cloud Build)
Write-Host "Step 1: Building backend image in Azure Cloud..." -ForegroundColor Green
Write-Host "  > This avoids local memory issues and uses Azure's powerful build servers" -ForegroundColor Cyan
Write-Host "  > Building with GLiNER AI model (may take 5-10 minutes)..." -ForegroundColor Cyan
az acr build --registry $ACR_NAME --resource-group $RESOURCE_GROUP --image backend:latest --file Dockerfile.backend .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend image built in Azure" -ForegroundColor Green
Write-Host ""

# Step 2: Build Frontend Image in Azure (Cloud Build)
Write-Host "Step 2: Building frontend image in Azure Cloud..." -ForegroundColor Green
Write-Host "  > Using backend URL: $BACKEND_URL" -ForegroundColor Cyan
az acr build --registry $ACR_NAME --resource-group $RESOURCE_GROUP --image frontend:latest --file Dockerfile.frontend --build-arg REACT_APP_API_URL=$BACKEND_URL .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend image built in Azure" -ForegroundColor Green
Write-Host ""

# Step 3: Update Backend Container App
Write-Host "Step 3: Updating backend container app..." -ForegroundColor Green
Write-Host "  > This may take 2-3 minutes..." -ForegroundColor Cyan
az containerapp update --name backend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/backend:latest" --set-env-vars HOST=0.0.0.0 DEBUG=False ONLYOFFICE_SERVER_URL=$ONLYOFFICE_URL UPLOAD_FOLDER=/mnt/uploads BACKEND_BASE_URL=$BACKEND_URL ALLOWED_ORIGINS=$FRONTEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend updated and running" -ForegroundColor Green
Write-Host ""

# Step 4: Update Frontend Container App
Write-Host "Step 4: Updating frontend container app..." -ForegroundColor Green
Write-Host "  > This may take 1-2 minutes..." -ForegroundColor Cyan
az containerapp update --name frontend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/frontend:latest" --set-env-vars REACT_APP_API_URL=$BACKEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend updated and running" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for services to stabilize
Write-Host "Step 5: Waiting for services to stabilize..." -ForegroundColor Green
Start-Sleep -Seconds 30
Write-Host "  DONE" -ForegroundColor Green
Write-Host ""

# Final Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "*** DEPLOYMENT SUCCESSFUL! ***" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your updated application is live at:" -ForegroundColor Yellow
Write-Host "  Frontend:   $FRONTEND_URL" -ForegroundColor White
Write-Host "  Backend:    $BACKEND_URL" -ForegroundColor White
Write-Host "  ONLYOFFICE: $ONLYOFFICE_URL" -ForegroundColor White
Write-Host ""

Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Health:      $BACKEND_URL/health"
Write-Host "  GLiNER:      $BACKEND_URL/api/gliner-health"
Write-Host "  DOCX:        $BACKEND_URL/api/docx-health"
Write-Host ""

Write-Host "What's New:" -ForegroundColor Yellow
Write-Host "  - Built images in Azure Cloud (faster, no local memory issues)"
Write-Host "  - GLiNER AI model will download on first use in Azure"
Write-Host "  - PyTorch CPU-only version (lightweight)"
Write-Host "  - All dependencies pre-installed"
Write-Host "  - Latest code updates deployed"
Write-Host ""

Write-Host "Note: First GLiNER API call may take 1-2 minutes to download the model" -ForegroundColor Yellow
Write-Host "After that, all requests will be fast!" -ForegroundColor Yellow
Write-Host ""

Write-Host "Open $FRONTEND_URL in your browser!" -ForegroundColor Cyan
Write-Host ""

# Save deployment info
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$deploymentInfo = @"
========================================
AZURE DEPLOYMENT INFORMATION
========================================

Deployment Time: $timestamp
Resource Group: $RESOURCE_GROUP
Build Method: Azure Container Registry Cloud Build

APPLICATION URLS:
  Frontend:   $FRONTEND_URL
  Backend:    $BACKEND_URL
  ONLYOFFICE: $ONLYOFFICE_URL

HEALTH CHECK ENDPOINTS:
  $BACKEND_URL/health
  $BACKEND_URL/api/gliner-health
  $BACKEND_URL/api/docx-health

NOTES:
  - Images built in Azure Cloud (no local Docker required)
  - GLiNER model downloads on first API call
  - PyTorch CPU-only for lightweight deployment
  - All latest updates deployed

========================================
"@

$deploymentInfo | Out-File -FilePath "deployment-info.txt" -Encoding UTF8
Write-Host "Deployment info saved to: deployment-info.txt" -ForegroundColor Green
Write-Host ""
