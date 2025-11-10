#!/bin/bash

# Azure Container Apps Deployment Script
# Email Automation MVP - Quick Deploy

set -e  # Exit on error

echo "🚀 Starting Azure Container Apps Deployment..."
echo "================================================"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="email-automation-rg"
LOCATION="eastus"
ENVIRONMENT_NAME="email-automation-env"
ACR_NAME="emailautomation$RANDOM"
STORAGE_ACCOUNT="emailstorage$RANDOM"

echo -e "${BLUE}Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Container Registry: $ACR_NAME"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${YELLOW}❌ Azure CLI not found. Please install it first.${NC}"
    echo "   Download: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker not found. Please install it first.${NC}"
    echo "   Download: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Login to Azure
echo -e "${BLUE}📝 Step 1: Azure Login${NC}"
az login
echo ""

# Create Resource Group
echo -e "${BLUE}📦 Step 2: Creating Resource Group${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION
echo -e "${GREEN}✅ Resource group created${NC}"
echo ""

# Create Container Apps Environment
echo -e "${BLUE}🌐 Step 3: Creating Container Apps Environment${NC}"
az containerapp env create \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
echo -e "${GREEN}✅ Environment created${NC}"
echo ""

# Create Azure Container Registry
echo -e "${BLUE}📦 Step 4: Creating Container Registry${NC}"
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true
echo -e "${GREEN}✅ Registry created${NC}"
echo ""

# Login to ACR
echo -e "${BLUE}🔐 Step 5: Logging into Container Registry${NC}"
az acr login --name $ACR_NAME
echo -e "${GREEN}✅ Logged in to ACR${NC}"
echo ""

# Build and push images
echo -e "${BLUE}🏗️  Step 6: Building and Pushing Docker Images${NC}"

echo "  Building frontend..."
docker build -f Dockerfile.frontend -t $ACR_NAME.azurecr.io/frontend:latest .
docker push $ACR_NAME.azurecr.io/frontend:latest
echo -e "${GREEN}  ✅ Frontend image pushed${NC}"

echo "  Building backend..."
docker build -f Dockerfile.backend -t $ACR_NAME.azurecr.io/backend:latest .
docker push $ACR_NAME.azurecr.io/backend:latest
echo -e "${GREEN}  ✅ Backend image pushed${NC}"

echo "  Pulling and pushing ONLYOFFICE..."
docker pull onlyoffice/documentserver:latest
docker tag onlyoffice/documentserver:latest $ACR_NAME.azurecr.io/onlyoffice:latest
docker push $ACR_NAME.azurecr.io/onlyoffice:latest
echo -e "${GREEN}  ✅ ONLYOFFICE image pushed${NC}"
echo ""

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Create Azure File Share
echo -e "${BLUE}💾 Step 7: Creating Persistent Storage${NC}"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

az storage share create \
  --name uploads \
  --account-name $STORAGE_ACCOUNT

STORAGE_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP \
  --account-name $STORAGE_ACCOUNT \
  --query "[0].value" -o tsv)

az containerapp env storage set \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --storage-name uploads \
  --azure-file-account-name $STORAGE_ACCOUNT \
  --azure-file-account-key $STORAGE_KEY \
  --azure-file-share-name uploads \
  --access-mode ReadWrite
echo -e "${GREEN}✅ Storage created${NC}"
echo ""

# Deploy ONLYOFFICE
echo -e "${BLUE}🚀 Step 8: Deploying ONLYOFFICE Container${NC}"
az containerapp create \
  --name onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $ACR_NAME.azurecr.io/onlyoffice:latest \
  --target-port 80 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 1.0 --memory 2.0Gi \
  --min-replicas 1 --max-replicas 1 \
  --env-vars \
    JWT_ENABLED=false \
    WOPI_ENABLED=false \
    USE_UNAUTHORIZED_STORAGE=true \
    ALLOW_PRIVATE_IP_ADDRESS=true

ONLYOFFICE_URL=$(az containerapp show \
  --name onlyoffice \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)
echo -e "${GREEN}✅ ONLYOFFICE deployed: https://$ONLYOFFICE_URL${NC}"
echo ""

# Deploy Backend
echo -e "${BLUE}🚀 Step 9: Deploying Backend Container${NC}"
az containerapp create \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $ACR_NAME.azurecr.io/backend:latest \
  --target-port 5000 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 1 --max-replicas 2 \
  --env-vars \
    HOST=0.0.0.0 \
    DEBUG=False \
    ONLYOFFICE_SERVER_URL=https://$ONLYOFFICE_URL \
    UPLOAD_FOLDER=/mnt/uploads

BACKEND_URL=$(az containerapp show \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)
echo -e "${GREEN}✅ Backend deployed: https://$BACKEND_URL${NC}"
echo ""

# Deploy Frontend
echo -e "${BLUE}🚀 Step 10: Deploying Frontend Container${NC}"
az containerapp create \
  --name frontend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $ACR_NAME.azurecr.io/frontend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.25 --memory 0.5Gi \
  --min-replicas 1 --max-replicas 1 \
  --env-vars \
    REACT_APP_API_URL=https://$BACKEND_URL

FRONTEND_URL=$(az containerapp show \
  --name frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)
echo -e "${GREEN}✅ Frontend deployed: https://$FRONTEND_URL${NC}"
echo ""

# Summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}Application URLs:${NC}"
echo "  Frontend:   https://$FRONTEND_URL"
echo "  Backend:    https://$BACKEND_URL"
echo "  ONLYOFFICE: https://$ONLYOFFICE_URL"
echo ""
echo -e "${BLUE}Resource Information:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Registry: $ACR_NAME"
echo "  Storage: $STORAGE_ACCOUNT"
echo ""
echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
echo "  1. Update backend CORS settings to allow: https://$FRONTEND_URL"
echo "  2. Test health endpoints:"
echo "     curl https://$BACKEND_URL/health"
echo "     curl https://$BACKEND_URL/api/gliner-health"
echo "  3. Monitor costs in Azure Portal"
echo ""
echo -e "${BLUE}To delete all resources:${NC}"
echo "  az group delete --name $RESOURCE_GROUP --yes --no-wait"
echo ""
