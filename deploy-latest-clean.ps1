# Azure Deployment - Latest Version
Write-Host "========================================"
Write-Host "Azure Deployment - Latest Version"
Write-Host "========================================"
Write-Host ""

$ACR_NAME = "emailautomation22833"
$RESOURCE_GROUP = "TECHGENE_group"

Write-Host "Step 1: Getting service URLs..."
$BACKEND_FQDN = az containerapp show --name backend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$ONLYOFFICE_FQDN = az containerapp show --name onlyoffice --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
$FRONTEND_FQDN = az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv

$BACKEND_URL = "https://$BACKEND_FQDN"
$ONLYOFFICE_URL = "https://$ONLYOFFICE_FQDN"
$FRONTEND_URL = "https://$FRONTEND_FQDN"

Write-Host "Backend: $BACKEND_URL"
Write-Host "Frontend: $FRONTEND_URL"
Write-Host ""

Write-Host "Step 2: Logging into ACR..."
az acr login --name $ACR_NAME

Write-Host "Step 3: Building backend image..."
docker build -f Dockerfile.backend -t "$ACR_NAME.azurecr.io/backend:latest" .

Write-Host "Step 4: Pushing backend image..."
docker push "$ACR_NAME.azurecr.io/backend:latest"

Write-Host "Step 5: Building frontend image..."
docker build -f Dockerfile.frontend -t "$ACR_NAME.azurecr.io/frontend:latest" `
    --build-arg REACT_APP_API_URL=$BACKEND_URL `
    --build-arg REACT_APP_MICROSOFT_CLIENT_ID=2b74ef92-7feb-45c7-94c2-62978353fc66 `
    --build-arg REACT_APP_MICROSOFT_TENANT_ID=b3235290-db90-4365-b033-ae68284de5bd `
    --build-arg REACT_APP_REDIRECT_URI=$FRONTEND_URL/auth/callback `
    .

Write-Host "Step 6: Pushing frontend image..."
docker push "$ACR_NAME.azurecr.io/frontend:latest"

Write-Host "Step 7: Updating backend container..."
az containerapp update --name backend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/backend:latest" --set-env-vars HOST=0.0.0.0 DEBUG=False ONLYOFFICE_SERVER_URL=$ONLYOFFICE_URL UPLOAD_FOLDER=/mnt/uploads BACKEND_BASE_URL=$BACKEND_URL ALLOWED_ORIGINS=$FRONTEND_URL JWT_SECRET_KEY=email-automation-jwt-secret-2025 JWT_ACCESS_TOKEN_EXPIRES=3600 JWT_REFRESH_TOKEN_EXPIRES=2592000 DATABASE_URL=sqlite:///email_automation.db MICROSOFT_CLIENT_ID=2b74ef92-7feb-45c7-94c2-62978353fc66 MICROSOFT_CLIENT_SECRET=YOUR_MICROSOFT_CLIENT_SECRET MICROSOFT_TENANT_ID=b3235290-db90-4365-b033-ae68284de5bd

Write-Host "Step 8: Updating frontend container..."
az containerapp update --name frontend --resource-group $RESOURCE_GROUP --image "$ACR_NAME.azurecr.io/frontend:latest" --set-env-vars REACT_APP_API_URL=$BACKEND_URL REACT_APP_MICROSOFT_CLIENT_ID=2b74ef92-7feb-45c7-94c2-62978353fc66 REACT_APP_MICROSOFT_TENANT_ID=b3235290-db90-4365-b033-ae68284de5bd REACT_APP_REDIRECT_URI=$FRONTEND_URL/auth/callback

Write-Host ""
Write-Host "DEPLOYMENT COMPLETE!"
Write-Host "Frontend: $FRONTEND_URL"
Write-Host "Backend: $BACKEND_URL"
