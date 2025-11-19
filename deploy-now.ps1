# Simplified deployment script
$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"
$BACKEND_URL = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"

Write-Host "`nStarting Deployment..." -ForegroundColor Cyan

# Get password and login
Write-Host "Step 1: Logging into ACR..." -ForegroundColor Green
$password = & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv
docker login "$ACR_NAME.azurecr.io" --username $ACR_NAME --password $password
if ($LASTEXITCODE -ne 0) { Write-Host "Login failed" -ForegroundColor Red; exit 1 }
Write-Host "DONE`n" -ForegroundColor Green

# Build Backend
Write-Host "Step 2: Building backend image..." -ForegroundColor Green
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" .
if ($LASTEXITCODE -ne 0) { Write-Host "Backend build failed" -ForegroundColor Red; exit 1 }
Write-Host "DONE`n" -ForegroundColor Green

# Push Backend
Write-Host "Step 3: Pushing backend image..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/backend:latest"
if ($LASTEXITCODE -ne 0) { Write-Host "Backend push failed" -ForegroundColor Red; exit 1 }
Write-Host "DONE`n" -ForegroundColor Green

# Build Frontend
Write-Host "Step 4: Building frontend image..." -ForegroundColor Green
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" --build-arg REACT_APP_API_URL=$BACKEND_URL .
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build failed" -ForegroundColor Red; exit 1 }
Write-Host "DONE`n" -ForegroundColor Green

# Push Frontend
Write-Host "Step 5: Pushing frontend image..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/frontend:latest"
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend push failed" -ForegroundColor Red; exit 1 }
Write-Host "DONE`n" -ForegroundColor Green

# Update Backend
Write-Host "Step 6: Updating backend container..." -ForegroundColor Green
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' containerapp update --name backend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/backend:latest"
Write-Host "DONE`n" -ForegroundColor Green

# Update Frontend
Write-Host "Step 7: Updating frontend container..." -ForegroundColor Green
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' containerapp update --name frontend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/frontend:latest"
Write-Host "DONE`n" -ForegroundColor Green

Write-Host "`n===================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "`nFrontend: https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io"
Write-Host "Backend:  https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io`n"
