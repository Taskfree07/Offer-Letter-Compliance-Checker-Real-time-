# Rebuild and Deploy Backend with API Keys Support
# This ensures the latest code with API keys blueprint is deployed

$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rebuild & Deploy Backend with API Keys" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Build the new backend image
Write-Host "[1/4] Building backend Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Image built successfully`n" -ForegroundColor Green

# Step 2: Login to ACR
Write-Host "[2/4] Logging into Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $ACR_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ACR login failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Logged in successfully`n" -ForegroundColor Green

# Step 3: Push to ACR
Write-Host "[3/4] Pushing backend image to ACR..." -ForegroundColor Yellow
docker push "$ACR_NAME.azurecr.io/backend:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Image push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Image pushed successfully`n" -ForegroundColor Green

# Step 4: Get service URLs
Write-Host "[4/4] Getting service URLs and updating backend..." -ForegroundColor Yellow
$BACKEND_FQDN = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$ONLYOFFICE_FQDN = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$FRONTEND_FQDN = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv

$BACKEND_URL = "https://$BACKEND_FQDN"
$ONLYOFFICE_URL = "https://$ONLYOFFICE_FQDN"
$FRONTEND_URL = "https://$FRONTEND_FQDN"

# Update backend container app
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
    ALLOWED_ORIGINS=$FRONTEND_URL `
    JWT_SECRET_KEY=email-automation-jwt-secret-2025 `
    JWT_ACCESS_TOKEN_EXPIRES=3600 `
    JWT_REFRESH_TOKEN_EXPIRES=2592000 `
    DATABASE_URL=sqlite:///email_automation.db `
    MICROSOFT_CLIENT_ID=2b74ef92-7feb-45c7-94c2-62978353fc66 `
    MICROSOFT_CLIENT_SECRET=YOUR_MICROSOFT_CLIENT_SECRET `
    MICROSOFT_TENANT_ID=b3235290-db90-4365-b033-ae68284de5bd

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Container app update failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Backend Deployed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing API keys endpoint..." -ForegroundColor Yellow

# Wait a moment for deployment to settle
Start-Sleep -Seconds 10

# Test the endpoint
try {
    Invoke-WebRequest -Uri "$BACKEND_URL/api/keys" -Method GET -ErrorAction Stop | Out-Null
    Write-Host "Endpoint exists but should not respond to GET without auth" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 405) {
        Write-Host "API keys endpoint is now available!" -ForegroundColor Green
    } else {
        Write-Host "Endpoint may not be deployed yet (give it 30 seconds)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "You can now run the API key generation command!" -ForegroundColor Cyan
Write-Host ""
