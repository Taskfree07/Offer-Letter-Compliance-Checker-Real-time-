# Azure Cloud Build Deployment - No Local Docker Needed
# Builds images directly in Azure

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Azure Cloud Build Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  ACR: $ACR_NAME"
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host ""

# Get URLs
Write-Host "Getting service URLs..." -ForegroundColor Green
$BACKEND_FQDN = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$ONLYOFFICE_FQDN = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$FRONTEND_FQDN = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv

$BACKEND_URL = "https://$BACKEND_FQDN"
$ONLYOFFICE_URL = "https://$ONLYOFFICE_FQDN"
$FRONTEND_URL = "https://$FRONTEND_FQDN"

Write-Host "  Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "  Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Step 1: Build Backend in Azure (Cloud Build)
Write-Host "Step 1: Building backend in Azure Cloud..." -ForegroundColor Green
Write-Host "  > This takes 5-10 minutes but avoids local Docker issues" -ForegroundColor Cyan
az acr build --registry $ACR_NAME --image backend:latest --file Dockerfile.backend .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend cloud build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend built in cloud" -ForegroundColor Green
Write-Host ""

# Step 2: Build Frontend in Azure (Cloud Build)
Write-Host "Step 2: Building frontend in Azure Cloud..." -ForegroundColor Green
az acr build --registry $ACR_NAME --image frontend:latest --file Dockerfile.frontend --build-arg REACT_APP_API_URL=$BACKEND_URL .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend cloud build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend built in cloud" -ForegroundColor Green
Write-Host ""

# Step 3: Update Backend
Write-Host "Step 3: Updating backend container..." -ForegroundColor Green
az containerapp update --name backend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/backend:latest" --set-env-vars HOST=0.0.0.0 DEBUG=False ONLYOFFICE_SERVER_URL=$ONLYOFFICE_URL UPLOAD_FOLDER=/mnt/uploads BACKEND_BASE_URL=$BACKEND_URL ALLOWED_ORIGINS=$FRONTEND_URL
Write-Host "  DONE" -ForegroundColor Green
Write-Host ""

# Step 4: Update Frontend
Write-Host "Step 4: Updating frontend container..." -ForegroundColor Green
az containerapp update --name frontend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/frontend:latest" --set-env-vars REACT_APP_API_URL=$BACKEND_URL
Write-Host "  DONE" -ForegroundColor Green
Write-Host ""

# Wait for stabilization
Write-Host "Waiting for services to stabilize..." -ForegroundColor Green
Start-Sleep -Seconds 20
Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "  Backend:  $BACKEND_URL" -ForegroundColor White
Write-Host ""
Write-Host "Health Checks:" -ForegroundColor Yellow
Write-Host "  $BACKEND_URL/health"
Write-Host "  $BACKEND_URL/api/gliner-health"
Write-Host "  $BACKEND_URL/api/docx-health"
Write-Host ""
Write-Host "Note: GLiNER AI model will download on first API call (1-2 min)" -ForegroundColor Cyan
Write-Host "Open $FRONTEND_URL in your browser!" -ForegroundColor Green
Write-Host ""
