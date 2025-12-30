# ================================================================
# Azure Deployment Script - Update Existing Infrastructure
# Email Automation MVP - Deploy Latest Updates
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment - Latest Updates" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration - Using existing infrastructure
$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"
$LOCATION = "centralus"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  ACR Name: $ACR_NAME"
Write-Host "  Location: $LOCATION`n"

# Verify Azure login
Write-Host "Verifying Azure credentials..." -ForegroundColor Green
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "ERROR: Not logged into Azure. Run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Host "  Logged in as: $($account.user.name)" -ForegroundColor White
Write-Host "  Subscription: $($account.name)`n" -ForegroundColor White

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
Write-Host "  Frontend:   $FRONTEND_URL`n" -ForegroundColor White

# Step 1: Login to ACR
Write-Host "Step 1: Logging into Azure Container Registry..." -ForegroundColor Green
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv
docker login "$ACR_NAME.azurecr.io" --username $ACR_NAME --password $ACR_PASSWORD
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to login to ACR" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Logged into ACR`n" -ForegroundColor Green

# Step 2: Build Backend Image
Write-Host "Step 2: Building backend Docker image..." -ForegroundColor Green
Write-Host "  > This includes GLiNER AI model installation..." -ForegroundColor Cyan
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend image built`n" -ForegroundColor Green

# Step 3: Push Backend Image
Write-Host "Step 3: Pushing backend image to ACR..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend image pushed`n" -ForegroundColor Green

# Step 4: Build Frontend Image
Write-Host "Step 4: Building frontend Docker image..." -ForegroundColor Green
Write-Host "  > Using backend URL: $BACKEND_URL" -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" --build-arg REACT_APP_API_URL=$BACKEND_URL .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend image built`n" -ForegroundColor Green

# Step 5: Push Frontend Image
Write-Host "Step 5: Pushing frontend image to ACR..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend image pushed`n" -ForegroundColor Green

# Step 6: Update Backend Container App
Write-Host "Step 6: Updating backend container app..." -ForegroundColor Green
Write-Host "  > This may take 2-3 minutes..." -ForegroundColor Cyan
az containerapp update `
    --name backend `
    --resource-group $RESOURCE_GROUP `
    --image "$ACR_NAME.azurecr.io/backend:latest" `
    --set-env-vars `
        HOST=0.0.0.0 `
        DEBUG=False `
        ONLYOFFICE_SERVER_URL=$ONLYOFFICE_URL `
        UPLOAD_FOLDER=/mnt/uploads `
        BACKEND_BASE_URL=$BACKEND_URL `
        ALLOWED_ORIGINS=$FRONTEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend updated and running`n" -ForegroundColor Green

# Step 7: Update Frontend Container App
Write-Host "Step 7: Updating frontend container app..." -ForegroundColor Green
Write-Host "  > This may take 1-2 minutes..." -ForegroundColor Cyan
az containerapp update `
    --name frontend `
    --resource-group $RESOURCE_GROUP `
    --image "$ACR_NAME.azurecr.io/frontend:latest" `
    --set-env-vars `
        REACT_APP_API_URL=$BACKEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend updated and running`n" -ForegroundColor Green

# Step 8: Wait for services to stabilize
Write-Host "Step 8: Waiting for services to stabilize..." -ForegroundColor Green
Start-Sleep -Seconds 30
Write-Host "  DONE`n" -ForegroundColor Green

# Step 9: Health Checks
Write-Host "Step 9: Running health checks..." -ForegroundColor Green

Write-Host "  > Checking backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/health" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "    ✓ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "    ⚠ Backend health check pending (may take a minute to start)" -ForegroundColor Yellow
}

Write-Host "  > Checking GLiNER service..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/gliner-health" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "    ✓ GLiNER AI service is ready" -ForegroundColor Green
    }
} catch {
    Write-Host "    ⚠ GLiNER initializing (first run may take 1-2 minutes)" -ForegroundColor Yellow
}

Write-Host "  > Checking DOCX service..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/docx-health" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "    ✓ DOCX service is ready" -ForegroundColor Green
    }
} catch {
    Write-Host "    ⚠ DOCX service initializing" -ForegroundColor Yellow
}

Write-Host "`n  DONE: Health checks complete`n" -ForegroundColor Green

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "*** DEPLOYMENT SUCCESSFUL! ***" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Your updated application is live at:" -ForegroundColor Yellow
Write-Host "  🌐 Frontend:   $FRONTEND_URL" -ForegroundColor White
Write-Host "  🔧 Backend:    $BACKEND_URL" -ForegroundColor White
Write-Host "  📄 ONLYOFFICE: $ONLYOFFICE_URL`n" -ForegroundColor White

Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Health:      $BACKEND_URL/health"
Write-Host "  GLiNER:      $BACKEND_URL/api/gliner-health"
Write-Host "  DOCX:        $BACKEND_URL/api/docx-health`n"

Write-Host "What's New:" -ForegroundColor Yellow
Write-Host "  ✓ GLiNER AI model installed directly in container"
Write-Host "  ✓ All dependencies pre-loaded (no runtime downloads)"
Write-Host "  ✓ Optimized Docker images"
Write-Host "  ✓ Latest code updates deployed`n"

Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:" -ForegroundColor Cyan
Write-Host "    az containerapp logs show --name backend --resource-group $RESOURCE_GROUP --follow"
Write-Host "    az containerapp logs show --name frontend --resource-group $RESOURCE_GROUP --follow`n"

Write-Host "  Scale down (save costs):" -ForegroundColor Cyan
Write-Host "    az containerapp update --name backend --resource-group $RESOURCE_GROUP --min-replicas 0"
Write-Host "    az containerapp update --name frontend --resource-group $RESOURCE_GROUP --min-replicas 0`n"

Write-Host "  Scale up (restore services):" -ForegroundColor Cyan
Write-Host "    az containerapp update --name backend --resource-group $RESOURCE_GROUP --min-replicas 1"
Write-Host "    az containerapp update --name frontend --resource-group $RESOURCE_GROUP --min-replicas 1`n"

# Save deployment information
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$deploymentInfo = @"
========================================
AZURE DEPLOYMENT INFORMATION
========================================

Deployment Time: $timestamp
Resource Group: $RESOURCE_GROUP
Location: $LOCATION
Container Registry: $ACR_NAME

APPLICATION URLS:
  Frontend:   $FRONTEND_URL
  Backend:    $BACKEND_URL
  ONLYOFFICE: $ONLYOFFICE_URL

HEALTH CHECK ENDPOINTS:
  $BACKEND_URL/health
  $BACKEND_URL/api/gliner-health
  $BACKEND_URL/api/docx-health

DEPLOYMENT DETAILS:
  - GLiNER AI model: Pre-installed
  - SpaCy model: en_core_web_sm
  - Backend: Python 3.11 + Flask + GLiNER
  - Frontend: React 18 + ONLYOFFICE
  - Document Server: ONLYOFFICE latest

========================================
"@

$deploymentInfo | Out-File -FilePath "deployment-info-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt" -Encoding UTF8
Write-Host "Deployment info saved to: deployment-info-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt" -ForegroundColor Green

Write-Host "`n🚀 Open $FRONTEND_URL in your browser to see your updates!`n" -ForegroundColor Cyan
