# Inject Compliance Search Plugin into Azure OnlyOffice Container
# Run this AFTER the OnlyOffice container is running in Azure

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Injecting Compliance Plugin into OnlyOffice" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RESOURCE_GROUP = "TECHGENE_group"
$CONTAINER_APP = "onlyoffice"

# Get the plugin files
$pluginDir = ".\onlyoffice-plugin\compliance-search"

Write-Host "Step 1: Checking plugin files..." -ForegroundColor Green
if (-not (Test-Path "$pluginDir\config.json")) {
    Write-Host "ERROR: Plugin files not found at $pluginDir" -ForegroundColor Red
    exit 1
}
Write-Host "  Plugin files found" -ForegroundColor White
Write-Host ""

# Read plugin files and encode as base64
Write-Host "Step 2: Preparing plugin files..." -ForegroundColor Green
$configJson = Get-Content "$pluginDir\config.json" -Raw
$indexHtml = Get-Content "$pluginDir\index.html" -Raw
$codeJs = Get-Content "$pluginDir\code.js" -Raw
$relayHtml = Get-Content "$pluginDir\relay.html" -Raw

Write-Host "  Files loaded: config.json, index.html, code.js, relay.html" -ForegroundColor White
Write-Host ""

# Create the plugin directory and files in the container
Write-Host "Step 3: Installing plugin in OnlyOffice container..." -ForegroundColor Green
Write-Host "  This uses Azure Container Apps exec..." -ForegroundColor Cyan

# Create directory
$mkdirCmd = "mkdir -p /var/www/onlyoffice/documentserver/sdkjs-plugins/compliance-search"
az containerapp exec --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --command "/bin/bash" -- -c "$mkdirCmd"

# Write each file using heredoc-style approach
Write-Host "  Writing config.json..." -ForegroundColor White
$configEscaped = $configJson -replace '"', '\"' -replace '\$', '\$'
$writeConfigCmd = "cat > /var/www/onlyoffice/documentserver/sdkjs-plugins/compliance-search/config.json << 'EOFCONFIG'`n$configJson`nEOFCONFIG"
az containerapp exec --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --command "/bin/bash" -- -c $writeConfigCmd

Write-Host "  Writing index.html..." -ForegroundColor White
$writeIndexCmd = "cat > /var/www/onlyoffice/documentserver/sdkjs-plugins/compliance-search/index.html << 'EOFINDEX'`n$indexHtml`nEOFINDEX"
az containerapp exec --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --command "/bin/bash" -- -c $writeIndexCmd

Write-Host "  Writing code.js..." -ForegroundColor White
$writeCodeCmd = "cat > /var/www/onlyoffice/documentserver/sdkjs-plugins/compliance-search/code.js << 'EOFCODE'`n$codeJs`nEOFCODE"
az containerapp exec --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --command "/bin/bash" -- -c $writeCodeCmd

Write-Host "  Writing relay.html..." -ForegroundColor White
$writeRelayCmd = "cat > /var/www/onlyoffice/documentserver/sdkjs-plugins/compliance-search/relay.html << 'EOFRELAY'`n$relayHtml`nEOFRELAY"
az containerapp exec --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --command "/bin/bash" -- -c $writeRelayCmd

# Set permissions
Write-Host "  Setting permissions..." -ForegroundColor White
$chmodCmd = "chmod -R 755 /var/www/onlyoffice/documentserver/sdkjs-plugins/compliance-search"
az containerapp exec --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --command "/bin/bash" -- -c "$chmodCmd"

# Verify
Write-Host "  Verifying installation..." -ForegroundColor White
$lsCmd = "ls -la /var/www/onlyoffice/documentserver/sdkjs-plugins/compliance-search/"
az containerapp exec --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --command "/bin/bash" -- -c "$lsCmd"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "*** PLUGIN INSTALLED! ***" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The compliance search plugin is now installed in OnlyOffice." -ForegroundColor White
Write-Host "Reload any open documents to activate the plugin." -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: This injection is temporary - it will be lost if the container restarts." -ForegroundColor Yellow
Write-Host "For permanent installation, consider using Azure Files mount." -ForegroundColor Yellow
Write-Host ""
