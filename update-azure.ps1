# ================================================================
# Azure Container Apps UPDATE Script
# Updates existing email automation deployment
# ================================================================

Write-Host "Starting Azure Container Apps Update..." -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Use existing resources
$RESOURCE_GROUP = "Techgene_group"
$ENVIRONMENT_NAME = "email-automation-env"
$ACR_NAME = "emailautomation22833"
$STORAGE_ACCOUNT = "emailstorage14206"

Write-Host "Using existing resources:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  Environment: $ENVIRONMENT_NAME"
Write-Host "  ACR: $ACR_NAME"
Write-Host "  Storage: $STORAGE_ACCOUNT`n"

# Get ACR credentials
Write-Host "Step 1: Getting ACR credentials..." -ForegroundColor Green
az acr login --name $ACR_NAME
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username -o tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv
Write-Host "DONE: ACR credentials retrieved`n" -ForegroundColor Green

# Get current URLs to avoid breaking existing connections
Write-Host "Step 2: Getting current deployment URLs..." -ForegroundColor Green
$ONLYOFFICE_URL = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv
$BACKEND_URL = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv
$FRONTEND_URL = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  Frontend:   https://$FRONTEND_URL"
Write-Host "  Backend:    https://$BACKEND_URL"
Write-Host "  ONLYOFFICE: https://$ONLYOFFICE_URL`n"

# Step 3: Build and Push Backend
Write-Host "Step 3: Building and pushing Backend image..." -ForegroundColor Green
Write-Host "  (This takes 3-5 minutes - downloading GLiNER model)" -ForegroundColor Cyan
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" ./
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build backend image" -ForegroundColor Red
    exit 1
}
docker push "$ACR_NAME.azurecr.io/backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push backend image" -ForegroundColor Red
    exit 1
}
Write-Host "DONE: Backend image updated`n" -ForegroundColor Green

# Step 4: Build and Push Frontend
Write-Host "Step 4: Building and pushing Frontend image..." -ForegroundColor Green
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" --build-arg REACT_APP_API_URL=https://$BACKEND_URL ./
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build frontend image" -ForegroundColor Red
    exit 1
}
docker push "$ACR_NAME.azurecr.io/frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push frontend image" -ForegroundColor Red
    exit 1
}
Write-Host "DONE: Frontend image updated`n" -ForegroundColor Green

# Step 5: Update ONLYOFFICE (optional - only if needed)
Write-Host "Step 5: Updating ONLYOFFICE configuration..." -ForegroundColor Green
az containerapp update `
  --name onlyoffice `
  --resource-group $RESOURCE_GROUP `
  --set-env-vars `
    JWT_ENABLED=false `
    WOPI_ENABLED=false `
    USE_UNAUTHORIZED_STORAGE=true `
    ALLOW_PRIVATE_IP_ADDRESS=true `
    ALLOW_META_IP_ADDRESS=true
Write-Host "DONE: ONLYOFFICE configuration updated`n" -ForegroundColor Green

# Step 6: Update Backend Container
Write-Host "Step 6: Updating Backend container..." -ForegroundColor Green
az containerapp update `
  --name backend `
  --resource-group $RESOURCE_GROUP `
  --image "$ACR_NAME.azurecr.io/backend:latest" `
  --set-env-vars `
    HOST=0.0.0.0 `
    DEBUG=False `
    ONLYOFFICE_SERVER_URL=https://$ONLYOFFICE_URL `
    UPLOAD_FOLDER=/mnt/uploads `
    BACKEND_BASE_URL=https://$BACKEND_URL `
    ALLOWED_ORIGINS=https://$FRONTEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to update backend container" -ForegroundColor Red
    exit 1
}
Write-Host "DONE: Backend container updated`n" -ForegroundColor Green

# Step 7: Update Frontend Container
Write-Host "Step 7: Updating Frontend container..." -ForegroundColor Green
az containerapp update `
  --name frontend `
  --resource-group $RESOURCE_GROUP `
  --image "$ACR_NAME.azurecr.io/frontend:latest" `
  --set-env-vars `
    REACT_APP_API_URL=https://$BACKEND_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to update frontend container" -ForegroundColor Red
    exit 1
}
Write-Host "DONE: Frontend container updated`n" -ForegroundColor Green

# Step 8: Restart containers to ensure changes take effect
Write-Host "Step 8: Restarting containers..." -ForegroundColor Green
az containerapp revision restart --name backend --resource-group $RESOURCE_GROUP
az containerapp revision restart --name frontend --resource-group $RESOURCE_GROUP
Write-Host "DONE: Containers restarted`n" -ForegroundColor Green

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "*** UPDATE SUCCESSFUL! ***" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "  Frontend:   https://$FRONTEND_URL" -ForegroundColor White
Write-Host "  Backend:    https://$BACKEND_URL" -ForegroundColor White
Write-Host "  ONLYOFFICE: https://$ONLYOFFICE_URL`n" -ForegroundColor White

Write-Host "Health Check Endpoints:" -ForegroundColor Yellow
Write-Host "  Backend Health:  https://$BACKEND_URL/health"
Write-Host "  GLiNER Health:   https://$BACKEND_URL/api/gliner-health"
Write-Host "  DOCX Health:     https://$BACKEND_URL/api/docx-health`n"

Write-Host "Testing the deployment:" -ForegroundColor Cyan
Write-Host "  curl https://$BACKEND_URL/health`n"

# Save URLs to file
$DeploymentInfo = @"
================================================
AZURE DEPLOYMENT UPDATE
================================================

Update Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Resource Group: $RESOURCE_GROUP

APPLICATION URLS:
- Frontend:   https://$FRONTEND_URL
- Backend:    https://$BACKEND_URL  
- ONLYOFFICE: https://$ONLYOFFICE_URL

HEALTH CHECKS:
- Backend:  https://$BACKEND_URL/health
- GLiNER:   https://$BACKEND_URL/api/gliner-health
- DOCX:     https://$BACKEND_URL/api/docx-health

FEATURES INCLUDED:
- Variable extraction and editing
- Compliance checking
- GLiNER AI entity extraction
- OnlyOffice document editing
- Variable highlighting (click to locate)
- Real-time preview updates

================================================
"@

$DeploymentInfo | Out-File -FilePath "deployment-update.txt" -Encoding UTF8
Write-Host "Deployment info saved to: deployment-update.txt`n" -ForegroundColor Green

Write-Host "All services updated and running on Azure!" -ForegroundColor Green
Write-Host "Open https://$FRONTEND_URL in your browser`n" -ForegroundColor Cyan
