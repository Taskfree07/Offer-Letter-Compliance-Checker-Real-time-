# Quick Azure Deployment Script
# Simplified version with better error handling

Write-Host "Quick Azure Deployment" -ForegroundColor Cyan
Write-Host "=====================`n" -ForegroundColor Cyan

$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"
$BACKEND_URL = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"

# Step 1: Login to ACR
Write-Host "Step 1: Logging into ACR..." -ForegroundColor Green
docker login "$ACR_NAME.azurecr.io" --username $ACR_NAME --password (az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to login to ACR" -ForegroundColor Red
    exit 1
}
Write-Host "DONE`n" -ForegroundColor Green

# Step 2: Build Backend
Write-Host "Step 2: Building backend..." -ForegroundColor Green
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build backend" -ForegroundColor Red
    exit 1
}
Write-Host "DONE`n" -ForegroundColor Green

# Step 3: Push Backend
Write-Host "Step 3: Pushing backend..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push backend" -ForegroundColor Red
    exit 1
}
Write-Host "DONE`n" -ForegroundColor Green

# Step 4: Build Frontend
Write-Host "Step 4: Building frontend..." -ForegroundColor Green
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" --build-arg REACT_APP_API_URL=$BACKEND_URL .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build frontend" -ForegroundColor Red
    exit 1
}
Write-Host "DONE`n" -ForegroundColor Green

# Step 5: Push Frontend
Write-Host "Step 5: Pushing frontend..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push frontend" -ForegroundColor Red
    exit 1
}
Write-Host "DONE`n" -ForegroundColor Green

# Step 6: Update Backend Container
Write-Host "Step 6: Updating backend container..." -ForegroundColor Green
az containerapp update --name backend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/backend:latest"
Write-Host "DONE`n" -ForegroundColor Green

# Step 7: Update Frontend Container
Write-Host "Step 7: Updating frontend container..." -ForegroundColor Green
az containerapp update --name frontend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/frontend:latest"
Write-Host "DONE`n" -ForegroundColor Green

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "`nFrontend: https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io"
Write-Host "Backend:  https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io`n"
