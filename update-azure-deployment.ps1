# Azure Container Apps Update Script
# Updates existing deployment with new code (50 states, 469 laws)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UPDATING AZURE CONTAINER APPS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration - Using your existing setup
$RESOURCE_GROUP = "TECHGENE_group"
$FRONTEND_APP = "frontend"
$BACKEND_APP = "backend"

Write-Host "Configuration:" -ForegroundColor Blue
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  Frontend App: $FRONTEND_APP"
Write-Host "  Backend App: $BACKEND_APP"
Write-Host ""

# Check if logged in to Azure
Write-Host "Step 1: Checking Azure login..." -ForegroundColor Blue
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    az login
}
Write-Host "Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host ""

# Get the existing ACR name
Write-Host "Step 2: Finding existing Container Registry..." -ForegroundColor Blue
$acrs = az acr list --resource-group $RESOURCE_GROUP | ConvertFrom-Json
if ($acrs.Count -eq 0) {
    Write-Host "ERROR: No Container Registry found in $RESOURCE_GROUP" -ForegroundColor Red
    exit 1
}
$ACR_NAME = $acrs[0].name
$ACR_SERVER = "$ACR_NAME.azurecr.io"
Write-Host "Found ACR: $ACR_NAME" -ForegroundColor Green
Write-Host ""

# Login to ACR
Write-Host "Step 3: Logging into Container Registry..." -ForegroundColor Blue
az acr login --name $ACR_NAME
Write-Host "Logged in to ACR" -ForegroundColor Green
Write-Host ""

# Get Backend URL for frontend build
Write-Host "Step 4: Getting Backend URL..." -ForegroundColor Blue
$BACKEND_URL = az containerapp show --name $BACKEND_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host "Backend URL: https://$BACKEND_URL" -ForegroundColor Green
Write-Host ""

# Build Frontend with environment variables
Write-Host "Step 5: Building Frontend..." -ForegroundColor Blue
Write-Host "  Building Docker image with build args..."

# Get existing env vars from frontend app
$MICROSOFT_CLIENT_ID = "2b74ef92-7feb-45c7-94c2-62978353fc66"
$MICROSOFT_TENANT_ID = "b3235290-db90-4365-b033-ae68284de5bd"
$REDIRECT_URI = "https://$BACKEND_URL"

docker build -f Dockerfile.frontend `
    --build-arg REACT_APP_API_URL="https://$BACKEND_URL" `
    --build-arg REACT_APP_MICROSOFT_CLIENT_ID="$MICROSOFT_CLIENT_ID" `
    --build-arg REACT_APP_MICROSOFT_TENANT_ID="$MICROSOFT_TENANT_ID" `
    --build-arg REACT_APP_REDIRECT_URI="$REDIRECT_URI" `
    -t "${ACR_SERVER}/frontend:latest" `
    -t "${ACR_SERVER}/frontend:v2-50states" .

Write-Host "  Pushing to ACR..."
docker push "${ACR_SERVER}/frontend:latest"
docker push "${ACR_SERVER}/frontend:v2-50states"
Write-Host "Frontend built and pushed" -ForegroundColor Green
Write-Host ""

# Build Backend (includes vector_store with 469 laws)
Write-Host "Step 6: Building Backend (with 469 laws, 50 states)..." -ForegroundColor Blue
Write-Host "  Building Docker image..."
docker build -f Dockerfile.backend -t "${ACR_SERVER}/backend:latest" -t "${ACR_SERVER}/backend:v2-50states" .
Write-Host "  Pushing to ACR..."
docker push "${ACR_SERVER}/backend:latest"
docker push "${ACR_SERVER}/backend:v2-50states"
Write-Host "Backend built and pushed" -ForegroundColor Green
Write-Host ""

# Update Frontend Container App
Write-Host "Step 7: Updating Frontend Container App..." -ForegroundColor Blue
az containerapp update `
    --name $FRONTEND_APP `
    --resource-group $RESOURCE_GROUP `
    --image "${ACR_SERVER}/frontend:latest"
Write-Host "Frontend updated" -ForegroundColor Green
Write-Host ""

# Update Backend Container App
Write-Host "Step 8: Updating Backend Container App..." -ForegroundColor Blue
az containerapp update `
    --name $BACKEND_APP `
    --resource-group $RESOURCE_GROUP `
    --image "${ACR_SERVER}/backend:latest"
Write-Host "Backend updated" -ForegroundColor Green
Write-Host ""

# Get URLs
Write-Host "Step 9: Getting Application URLs..." -ForegroundColor Blue
$FRONTEND_URL = az containerapp show --name $FRONTEND_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$BACKEND_URL = az containerapp show --name $BACKEND_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT UPDATE COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Blue
Write-Host "  Frontend: https://$FRONTEND_URL"
Write-Host "  Backend:  https://$BACKEND_URL"
Write-Host ""
Write-Host "What's Updated:" -ForegroundColor Blue
Write-Host "  - 50 states compliance laws (was 6 states)"
Write-Host "  - 469 total laws in vector database"
Write-Host "  - Specific actionable suggestions for all states"
Write-Host "  - LLM-powered compliance analysis"
Write-Host ""
Write-Host "Test the deployment:" -ForegroundColor Yellow
Write-Host "  1. Health check: curl https://$BACKEND_URL/health"
Write-Host "  2. States API:   curl https://$BACKEND_URL/api/v2/states"
Write-Host "  3. Open frontend: https://$FRONTEND_URL"
Write-Host ""
