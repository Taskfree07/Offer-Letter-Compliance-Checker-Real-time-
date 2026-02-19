# Azure Deployment Script - Update Frontend & Backend
# Uses Azure ACR Build (cloud build) to avoid local Docker issues
# OnlyOffice plugin will be injected separately

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment - Update Code" -ForegroundColor Cyan
Write-Host "Frontend + Backend Update" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"
$LOCATION = "centralus"

# Microsoft Authentication
$MS_CLIENT_ID = "2b74ef92-7feb-45c7-94c2-62978353fc66"
$MS_TENANT_ID = "b3235290-db90-4365-b033-ae68284de5bd"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  ACR Name: $ACR_NAME"
Write-Host ""

# Step 1: Verify Azure login
Write-Host "Step 1: Verifying Azure credentials..." -ForegroundColor Green
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "ERROR: Not logged into Azure. Run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Host "  Logged in as: $($account.user.name)" -ForegroundColor White
Write-Host ""

# Step 2: Get existing URLs
Write-Host "Step 2: Getting existing service URLs..." -ForegroundColor Green
$BACKEND_FQDN = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv 2>&1
$ONLYOFFICE_FQDN = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv 2>&1
$FRONTEND_FQDN = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv 2>&1

if (-not $BACKEND_FQDN -or $BACKEND_FQDN -like "*ERROR*") {
    Write-Host "WARNING: Could not get backend FQDN, using existing" -ForegroundColor Yellow
    $BACKEND_URL = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"
} else {
    $BACKEND_URL = "https://$BACKEND_FQDN"
}

if (-not $ONLYOFFICE_FQDN -or $ONLYOFFICE_FQDN -like "*ERROR*") {
    Write-Host "WARNING: Could not get ONLYOFFICE FQDN, using existing" -ForegroundColor Yellow
    $ONLYOFFICE_URL = "https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io"
} else {
    $ONLYOFFICE_URL = "https://$ONLYOFFICE_FQDN"
}

if (-not $FRONTEND_FQDN -or $FRONTEND_FQDN -like "*ERROR*") {
    Write-Host "WARNING: Could not get frontend FQDN, using existing" -ForegroundColor Yellow
    $FRONTEND_URL = "https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io"
} else {
    $FRONTEND_URL = "https://$FRONTEND_FQDN"
}

Write-Host "  Backend:    $BACKEND_URL" -ForegroundColor White
Write-Host "  ONLYOFFICE: $ONLYOFFICE_URL" -ForegroundColor White
Write-Host "  Frontend:   $FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Step 3: Build Backend (ACR Build)
Write-Host "Step 3: Building Backend (ACR Build)..." -ForegroundColor Green
Write-Host "  Preparing build context (excluding .venv - 2.66GB)..." -ForegroundColor Cyan

# Create temporary build context without .venv
$tempDir = ".\temp-backend-build"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy only necessary files (exclude .venv, build folders, etc)
Write-Host "  Copying python-nlp (excluding .venv)..." -ForegroundColor Cyan
robocopy python-nlp "$tempDir\python-nlp" /E /XD .venv __pycache__ /XF *.pyc /NFL /NDL /NJH /NJS | Out-Null
Copy-Item Dockerfile.backend $tempDir\
Copy-Item .dockerignore $tempDir\ -ErrorAction SilentlyContinue

Write-Host "  Uploading to Azure (much smaller without .venv)..." -ForegroundColor Cyan
Push-Location $tempDir
az acr build `
    --registry $ACR_NAME `
    --resource-group $RESOURCE_GROUP `
    --image backend:latest `
    --file Dockerfile.backend `
    .
Pop-Location

# Clean up
Remove-Item -Recurse -Force $tempDir
Write-Host "  Cleaned up temporary build directory" -ForegroundColor Gray

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend image built" -ForegroundColor Green
Write-Host ""

# Step 4: Build Frontend (ACR Build)
Write-Host "Step 4: Building Frontend (ACR Build)..." -ForegroundColor Green
Write-Host "  Building in Azure Cloud..." -ForegroundColor Cyan

az acr build `
    --registry $ACR_NAME `
    --resource-group $RESOURCE_GROUP `
    --image frontend:latest `
    --file Dockerfile.frontend `
    --build-arg REACT_APP_API_URL=$BACKEND_URL `
    --build-arg REACT_APP_MICROSOFT_CLIENT_ID=$MS_CLIENT_ID `
    --build-arg REACT_APP_MICROSOFT_TENANT_ID=$MS_TENANT_ID `
    --build-arg REACT_APP_REDIRECT_URI="$FRONTEND_URL/auth/callback" `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend image built" -ForegroundColor Green
Write-Host ""

# Step 5: Update Backend Container
Write-Host "Step 5: Updating Backend Container..." -ForegroundColor Green
$JWT_SECRET = "compliance-jwt-$(Get-Random)-$(Get-Date -Format 'yyyyMMdd')"

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
        JWT_SECRET_KEY=$JWT_SECRET `
        DATABASE_URL=sqlite:///email_automation.db `
        MICROSOFT_CLIENT_ID=$MS_CLIENT_ID `
        MICROSOFT_TENANT_ID=$MS_TENANT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend updated" -ForegroundColor Green
Write-Host ""

# Step 6: Update Frontend Container
Write-Host "Step 6: Updating Frontend Container..." -ForegroundColor Green

az containerapp update `
    --name frontend `
    --resource-group $RESOURCE_GROUP `
    --image "$ACR_NAME.azurecr.io/frontend:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend updated" -ForegroundColor Green
Write-Host ""

# Step 7: Wait for stabilization
Write-Host "Step 7: Waiting for services..." -ForegroundColor Green
Start-Sleep -Seconds 30
Write-Host "  DONE" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "*** DEPLOYMENT SUCCESSFUL! ***" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "  Backend:  $BACKEND_URL" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run inject-plugin-azure.ps1 to add compliance plugin to OnlyOffice" -ForegroundColor Yellow
Write-Host ""
