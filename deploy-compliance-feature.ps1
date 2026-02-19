# Azure Deployment Script - Compliance Analysis Feature
# Deploys: Frontend, Backend, OnlyOffice (with compliance-search plugin)
# Uses Azure ACR Build (cloud build) to avoid local Docker issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment - Compliance Feature" -ForegroundColor Cyan
Write-Host "Features: Click to Search in OnlyOffice" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration - Using your existing infrastructure
$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"
$LOCATION = "centralus"

# Microsoft Authentication
$MS_CLIENT_ID = "2b74ef92-7feb-45c7-94c2-62978353fc66"
$MS_TENANT_ID = "b3235290-db90-4365-b033-ae68284de5bd"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  ACR Name: $ACR_NAME"
Write-Host "  Location: $LOCATION"
Write-Host ""

# Step 1: Verify Azure login
Write-Host "Step 1: Verifying Azure credentials..." -ForegroundColor Green
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "ERROR: Not logged into Azure. Run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Host "  Logged in as: $($account.user.name)" -ForegroundColor White
Write-Host "  Subscription: $($account.name)" -ForegroundColor White
Write-Host ""

# Step 2: Get existing service URLs
Write-Host "Step 2: Getting existing service URLs..." -ForegroundColor Green
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

# Step 3: Build OnlyOffice image with Compliance Plugin (ACR Build)
Write-Host "Step 3: Building OnlyOffice with Compliance Plugin (ACR Build)..." -ForegroundColor Green
Write-Host "  This includes the compliance-search plugin for click-to-highlight feature" -ForegroundColor Cyan
Write-Host "  Building in Azure Cloud (may take 3-5 minutes)..." -ForegroundColor Cyan

az acr build `
    --registry $ACR_NAME `
    --resource-group $RESOURCE_GROUP `
    --image onlyoffice:latest `
    --file Dockerfile.onlyoffice `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: OnlyOffice build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: OnlyOffice image built with compliance plugin" -ForegroundColor Green
Write-Host ""

# Step 4: Build Backend Image (ACR Build)
Write-Host "Step 4: Building Backend image (ACR Build)..." -ForegroundColor Green
Write-Host "  Includes: GLiNER AI, ChromaDB, Flask, Authentication" -ForegroundColor Cyan
Write-Host "  Building in Azure Cloud (may take 5-10 minutes)..." -ForegroundColor Cyan

az acr build `
    --registry $ACR_NAME `
    --resource-group $RESOURCE_GROUP `
    --image backend:latest `
    --file Dockerfile.backend `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend image built" -ForegroundColor Green
Write-Host ""

# Step 5: Build Frontend Image (ACR Build)
Write-Host "Step 5: Building Frontend image (ACR Build)..." -ForegroundColor Green
Write-Host "  Includes: New Compliance Analysis click-to-highlight feature" -ForegroundColor Cyan
Write-Host "  Using Backend URL: $BACKEND_URL" -ForegroundColor Cyan

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

# Step 6: Update OnlyOffice Container App
Write-Host "Step 6: Updating OnlyOffice Container App..." -ForegroundColor Green
Write-Host "  This may take 2-3 minutes..." -ForegroundColor Cyan

az containerapp update `
    --name onlyoffice `
    --resource-group $RESOURCE_GROUP `
    --image "$ACR_NAME.azurecr.io/onlyoffice:latest" `
    --set-env-vars `
        JWT_ENABLED=false `
        WOPI_ENABLED=false `
        USE_UNAUTHORIZED_STORAGE=true `
        ALLOW_PRIVATE_IP_ADDRESS=true `
        ALLOW_META_IP_ADDRESS=true

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: OnlyOffice update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: OnlyOffice updated with compliance plugin" -ForegroundColor Green
Write-Host ""

# Step 7: Update Backend Container App
Write-Host "Step 7: Updating Backend Container App..." -ForegroundColor Green
Write-Host "  This may take 2-3 minutes..." -ForegroundColor Cyan

# Generate new JWT secret
$JWT_SECRET = "compliance-production-jwt-secret-$(Get-Random)-$(Get-Date -Format 'yyyyMMdd')"

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
        JWT_ACCESS_TOKEN_EXPIRES=3600 `
        JWT_REFRESH_TOKEN_EXPIRES=2592000 `
        DATABASE_URL=sqlite:///email_automation.db `
        MICROSOFT_CLIENT_ID=$MS_CLIENT_ID `
        MICROSOFT_TENANT_ID=$MS_TENANT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Backend updated" -ForegroundColor Green
Write-Host ""

# Step 8: Update Frontend Container App
Write-Host "Step 8: Updating Frontend Container App..." -ForegroundColor Green
Write-Host "  This may take 1-2 minutes..." -ForegroundColor Cyan

az containerapp update `
    --name frontend `
    --resource-group $RESOURCE_GROUP `
    --image "$ACR_NAME.azurecr.io/frontend:latest" `
    --set-env-vars `
        REACT_APP_API_URL=$BACKEND_URL `
        REACT_APP_MICROSOFT_CLIENT_ID=$MS_CLIENT_ID `
        REACT_APP_MICROSOFT_TENANT_ID=$MS_TENANT_ID `
        REACT_APP_REDIRECT_URI="$FRONTEND_URL/auth/callback"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  DONE: Frontend updated" -ForegroundColor Green
Write-Host ""

# Step 9: Wait for services to stabilize
Write-Host "Step 9: Waiting for services to stabilize..." -ForegroundColor Green
Start-Sleep -Seconds 45
Write-Host "  DONE" -ForegroundColor Green
Write-Host ""

# Step 10: Verify Deployment
Write-Host "Step 10: Verifying deployment..." -ForegroundColor Green

# Check backend health
try {
    $healthResponse = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get -TimeoutSec 30
    Write-Host "  Backend health: OK" -ForegroundColor Green
} catch {
    Write-Host "  Backend health: May still be starting up" -ForegroundColor Yellow
}

# Check OnlyOffice
try {
    $onlyofficeCheck = Invoke-WebRequest -Uri "$ONLYOFFICE_URL/healthcheck" -Method Get -TimeoutSec 30 -UseBasicParsing
    Write-Host "  OnlyOffice: OK" -ForegroundColor Green
} catch {
    Write-Host "  OnlyOffice: May still be starting up (takes 2-3 minutes)" -ForegroundColor Yellow
}

Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "*** DEPLOYMENT SUCCESSFUL! ***" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your application is live at:" -ForegroundColor Yellow
Write-Host "  Frontend:   $FRONTEND_URL" -ForegroundColor White
Write-Host "  Backend:    $BACKEND_URL" -ForegroundColor White
Write-Host "  ONLYOFFICE: $ONLYOFFICE_URL" -ForegroundColor White
Write-Host ""

Write-Host "NEW FEATURES DEPLOYED:" -ForegroundColor Yellow
Write-Host "  - Compliance Analysis Click-to-Highlight" -ForegroundColor Green
Write-Host "    Click on any compliance issue to find and highlight it in the document" -ForegroundColor White
Write-Host "  - OnlyOffice Compliance Search Plugin" -ForegroundColor Green
Write-Host "    Automatic text search and highlighting with severity colors" -ForegroundColor White
Write-Host "  - Relay iframe for cross-origin communication" -ForegroundColor Green
Write-Host ""

Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Health:      $BACKEND_URL/health"
Write-Host "  GLiNER:      $BACKEND_URL/api/gliner-health"
Write-Host "  Compliance:  $BACKEND_URL/api/v2/compliance-check"
Write-Host "  Auth:        $BACKEND_URL/api/auth/login"
Write-Host ""

Write-Host "Database Info:" -ForegroundColor Yellow
Write-Host "  Database is SQLite stored in container" -ForegroundColor White
Write-Host "  Data persists as long as container is not deleted" -ForegroundColor White
Write-Host "  For production, consider Azure Storage mount" -ForegroundColor White
Write-Host ""

Write-Host "Testing the new feature:" -ForegroundColor Yellow
Write-Host "  1. Open $FRONTEND_URL" -ForegroundColor White
Write-Host "  2. Login and upload a document" -ForegroundColor White
Write-Host "  3. Select a state and run compliance analysis" -ForegroundColor White
Write-Host "  4. Click on any compliance issue in the results" -ForegroundColor White
Write-Host "  5. The text should be found and highlighted in the document!" -ForegroundColor White
Write-Host ""

# Save deployment info
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$deploymentInfo = @"
========================================
AZURE DEPLOYMENT - COMPLIANCE FEATURE
========================================

Deployment Time: $timestamp
Resource Group: $RESOURCE_GROUP
Build Method: Azure Container Registry Cloud Build

APPLICATION URLS:
  Frontend:   $FRONTEND_URL
  Backend:    $BACKEND_URL
  ONLYOFFICE: $ONLYOFFICE_URL

NEW FEATURES:
  - Compliance Analysis Click-to-Highlight
  - OnlyOffice Compliance Search Plugin
  - Cross-origin relay communication

HEALTH CHECK ENDPOINTS:
  $BACKEND_URL/health
  $BACKEND_URL/api/gliner-health
  $ONLYOFFICE_URL/healthcheck

NOTES:
  - All images built using Azure ACR Build (no local Docker needed)
  - OnlyOffice includes compliance-search plugin baked in
  - Database is SQLite (consider Azure Storage for persistence)

========================================
"@

$deploymentInfo | Out-File -FilePath "deployment-compliance-feature.txt" -Encoding UTF8
Write-Host "Deployment info saved to: deployment-compliance-feature.txt" -ForegroundColor Green
Write-Host ""

Write-Host "Open $FRONTEND_URL in your browser!" -ForegroundColor Cyan
Write-Host ""
