# Quick Backend Deployment Script - Fix Auth Issues
# Deploys only the backend with authentication dependencies

$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Only Deployment - Auth Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get service URLs
Write-Host "Getting service URLs..." -ForegroundColor Yellow
$BACKEND_FQDN = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$ONLYOFFICE_FQDN = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$FRONTEND_FQDN = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv

$BACKEND_URL = "https://$BACKEND_FQDN"
$ONLYOFFICE_URL = "https://$ONLYOFFICE_FQDN"
$FRONTEND_URL = "https://$FRONTEND_FQDN"

Write-Host "Backend:   $BACKEND_URL" -ForegroundColor White
Write-Host "Frontend:  $FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Push backend image
Write-Host "Pushing backend image to ACR..." -ForegroundColor Yellow
docker push "$ACR_NAME.azurecr.io/backend:latest"

# Update backend container
Write-Host "Updating backend container with auth dependencies..." -ForegroundColor Yellow
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

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor White
Write-Host ""
Write-Host "Testing auth endpoints:" -ForegroundColor Yellow
Write-Host "  Health: $BACKEND_URL/health" -ForegroundColor White
Write-Host "  Auth:   $BACKEND_URL/api/auth/register" -ForegroundColor White
Write-Host ""

Write-Host "Waiting 30 seconds for container to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/health" -Method GET
    Write-Host "Health Check: SUCCESS" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
} catch {
    Write-Host "Health Check: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Backend is ready! Refresh your frontend application." -ForegroundColor Cyan
