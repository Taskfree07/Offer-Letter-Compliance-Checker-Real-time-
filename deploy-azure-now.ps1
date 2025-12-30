# Azure Deployment Script - Update Existing Infrastructure
# Email Automation MVP - Deploy Latest Updates

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment - Latest Updates" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration - Using existing infrastructure
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

# Step 1: Login to ACR
Write-Host "Step 1: Logging into Azure Container Registry..." -ForegroundColor Green
az acr login --name $ACR_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to login to ACR" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Logged into ACR" -ForegroundColor Green
Write-Host ""

# Step 2: Build Backend Image
Write-Host "Step 2: Building backend Docker image..." -ForegroundColor Green
Write-Host "  > This includes GLiNER AI model installation..." -ForegroundColor Cyan
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend image built" -ForegroundColor Green
Write-Host ""

# Step 3: Push Backend Image
Write-Host "Step 3: Pushing backend image to ACR..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend image pushed" -ForegroundColor Green
Write-Host ""

# Step 4: Build Frontend Image
Write-Host "Step 4: Building frontend Docker image..." -ForegroundColor Green
Write-Host "  > Using backend URL: $BACKEND_URL" -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" --build-arg REACT_APP_API_URL=$BACKEND_URL .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend image built" -ForegroundColor Green
Write-Host ""

# Step 5: Push Frontend Image
Write-Host "Step 5: Pushing frontend image to ACR..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend image pushed" -ForegroundColor Green
Write-Host ""

# Step 6: Update Backend Container App
Write-Host "Step 6: Updating backend container app..." -ForegroundColor Green
Write-Host "  > This may take 2-3 minutes..." -ForegroundColor Cyan
az containerapp update --name backend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/backend:latest" --set-env-vars HOST=0.0.0.0 DEBUG=False ONLYOFFICE_SERVER_URL=$ONLYOFFICE_URL UPLOAD_FOLDER=/mnt/uploads BACKEND_BASE_URL=$BACKEND_URL ALLOWED_ORIGINS=$FRONTEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend updated and running" -ForegroundColor Green
Write-Host ""

# Step 7: Update Frontend Container App
Write-Host "Step 7: Updating frontend container app..." -ForegroundColor Green
Write-Host "  > This may take 1-2 minutes..." -ForegroundColor Cyan
az containerapp update --name frontend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/frontend:latest" --set-env-vars REACT_APP_API_URL=$BACKEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend updated and running" -ForegroundColor Green
Write-Host ""

# Step 8: Wait for services to stabilize
Write-Host "Step 8: Waiting for services to stabilize..." -ForegroundColor Green
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
Write-Host "  - GLiNER AI model installed directly in container"
Write-Host "  - All dependencies pre-loaded (no runtime downloads)"
Write-Host "  - Optimized Docker images"
Write-Host "  - Latest code updates deployed"
Write-Host ""

Write-Host "Open $FRONTEND_URL in your browser!" -ForegroundColor Cyan
Write-Host ""
