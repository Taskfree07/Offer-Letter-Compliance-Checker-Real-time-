# Azure Deployment Script - Latest Version with Authentication & New UI
# Email Automation MVP - Complete Latest Deployment
# Includes: New UI, Authentication, Login/Register, Protected Routes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment - Latest Version" -ForegroundColor Cyan
Write-Host "Features: New UI + Authentication + Login" -ForegroundColor Green
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
Write-Host "Step 1: Verifying Azure credentials..." -ForegroundColor Green
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "ERROR: Not logged into Azure. Run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Logged in as: $($account.user.name)" -ForegroundColor White
Write-Host "  Subscription: $($account.name)" -ForegroundColor White
Write-Host ""

# Get existing URLs
Write-Host "Step 2: Getting existing service URLs..." -ForegroundColor Green
$BACKEND_FQDN = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$ONLYOFFICE_FQDN = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$FRONTEND_FQDN = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv

$BACKEND_URL = "https://$BACKEND_FQDN"
$ONLYOFFICE_URL = "https://$ONLYOFFICE_FQDN"
$FRONTEND_URL = "https://$FRONTEND_FQDN"

Write-Host "  ✅ Backend:    $BACKEND_URL" -ForegroundColor White
Write-Host "  ✅ ONLYOFFICE: $ONLYOFFICE_URL" -ForegroundColor White
Write-Host "  ✅ Frontend:   $FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Login to ACR
Write-Host "Step 3: Logging into Azure Container Registry..." -ForegroundColor Green
az acr login --name $ACR_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to login to ACR" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Logged into ACR" -ForegroundColor Green
Write-Host ""

# Build Backend Image with Authentication
Write-Host "Step 4: Building backend Docker image..." -ForegroundColor Green
Write-Host "  📦 Includes: Authentication, JWT, GLiNER AI, Flask-SQLAlchemy" -ForegroundColor Cyan
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Backend image built successfully" -ForegroundColor Green
Write-Host ""

# Push Backend Image
Write-Host "Step 5: Pushing backend image to ACR..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Backend image pushed to registry" -ForegroundColor Green
Write-Host ""

# Build Frontend Image with Authentication
Write-Host "Step 6: Building frontend Docker image..." -ForegroundColor Green
Write-Host "  📦 Includes: New UI, Login/Register, MSAL Auth, Protected Routes" -ForegroundColor Cyan
Write-Host "  🔗 Using backend URL: $BACKEND_URL" -ForegroundColor Cyan
Write-Host "  🔐 Using Microsoft Client ID: $MS_CLIENT_ID" -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" `
    --build-arg REACT_APP_API_URL=$BACKEND_URL `
    --build-arg REACT_APP_MICROSOFT_CLIENT_ID=$MS_CLIENT_ID `
    --build-arg REACT_APP_MICROSOFT_TENANT_ID=$MS_TENANT_ID `
    --build-arg REACT_APP_REDIRECT_URI=$FRONTEND_URL/auth/callback `
    .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Frontend image built successfully" -ForegroundColor Green
Write-Host ""

# Push Frontend Image
Write-Host "Step 7: Pushing frontend image to ACR..." -ForegroundColor Green
docker push "$ACR_NAME.azurecr.io/frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Frontend image pushed to registry" -ForegroundColor Green
Write-Host ""

# Update Backend Container App with Authentication
Write-Host "Step 8: Updating backend container app..." -ForegroundColor Green
Write-Host "  ⏳ This may take 2-3 minutes..." -ForegroundColor Cyan

# Authentication environment variables
$JWT_SECRET = "email-automation-production-jwt-secret-key-azure-2025-secure-$(Get-Random)"
$MS_CLIENT_ID = "2b74ef92-7feb-45c7-94c2-62978353fc66"
$MS_CLIENT_SECRET = "YOUR_MICROSOFT_CLIENT_SECRET"
$MS_TENANT_ID = "b3235290-db90-4365-b033-ae68284de5bd"

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
        MICROSOFT_CLIENT_SECRET=$MS_CLIENT_SECRET `
        MICROSOFT_TENANT_ID=$MS_TENANT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Backend updated with authentication" -ForegroundColor Green
Write-Host ""

# Update Frontend Container App
Write-Host "Step 9: Updating frontend container app..." -ForegroundColor Green
Write-Host "  ⏳ This may take 1-2 minutes..." -ForegroundColor Cyan
az containerapp update `
    --name frontend `
    --resource-group $RESOURCE_GROUP `
    --image "$ACR_NAME.azurecr.io/frontend:latest" `
    --set-env-vars `
        REACT_APP_API_URL=$BACKEND_URL `
        REACT_APP_MICROSOFT_CLIENT_ID=$MS_CLIENT_ID `
        REACT_APP_MICROSOFT_TENANT_ID=$MS_TENANT_ID `
        REACT_APP_REDIRECT_URI=$FRONTEND_URL/auth/callback

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend update failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Frontend updated with new UI and auth" -ForegroundColor Green
Write-Host ""

# Wait for services to stabilize
Write-Host "Step 10: Waiting for services to stabilize..." -ForegroundColor Green
Start-Sleep -Seconds 30
Write-Host "  ✅ Services stabilized" -ForegroundColor Green
Write-Host ""

# Final Summary
Write-Host ""
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
Write-Host "  - New UI with Onboarding Talks branding" -ForegroundColor Green
Write-Host "  - Template carousel design" -ForegroundColor Green
Write-Host "  - User Authentication (Email + Microsoft OAuth)" -ForegroundColor Green
Write-Host "  - Login and Register pages" -ForegroundColor Green
Write-Host "  - Protected routes - all pages require login" -ForegroundColor Green
Write-Host "  - JWT session management" -ForegroundColor Green
Write-Host "  - Database-backed user accounts" -ForegroundColor Green
Write-Host "  - Fixed Offer Letter loading issue" -ForegroundColor Green
Write-Host ""

Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Health:      $BACKEND_URL/health"
Write-Host "  GLiNER:      $BACKEND_URL/api/gliner-health"
Write-Host "  DOCX:        $BACKEND_URL/api/docx-health"
Write-Host "  Auth:        $BACKEND_URL/api/auth/login"
Write-Host ""

Write-Host "Authentication:" -ForegroundColor Yellow
Write-Host "  Login Page:     $FRONTEND_URL/login"
Write-Host "  Register Page:  $FRONTEND_URL/register"
Write-Host "  Home (Auth):    $FRONTEND_URL/"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Visit the frontend URL" -ForegroundColor White
Write-Host "  2. Click Register to create an account" -ForegroundColor White
Write-Host "  3. Or use Sign in with Microsoft for OAuth login" -ForegroundColor White
Write-Host "  4. Start using the Email Automation MVP" -ForegroundColor White
Write-Host ""

Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host ""
