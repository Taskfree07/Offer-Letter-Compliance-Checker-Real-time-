# ========================================
# Microsoft OAuth Login - Quick Test
# For Techgene Team Members
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Microsoft OAuth API Key Generator" -ForegroundColor Cyan
Write-Host "  Techgene Solutions Pvt Ltd" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration
$clientId = "2b74ef92-7feb-45c7-94c2-62978353fc66"
$tenantId = "b3235290-db90-4365-b033-ae68284de5bd"
$backendUrl = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"

# Check if MSAL module is installed
Write-Host "Checking MSAL.PS module..." -ForegroundColor Yellow
if (-not (Get-Module -ListAvailable -Name MSAL.PS)) {
    Write-Host "Installing MSAL.PS module (first time only)..." -ForegroundColor Yellow
    try {
        Install-Module -Name MSAL.PS -Scope CurrentUser -Force -AllowClobber
        Write-Host "✓ MSAL.PS installed successfully!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install MSAL.PS" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`nPlease run PowerShell as Administrator and try again." -ForegroundColor Yellow
        Write-Host "Or install manually: Install-Module -Name MSAL.PS -Scope CurrentUser -Force`n" -ForegroundColor Yellow
        exit 1
    }
}

Import-Module MSAL.PS

try {
    # Step 1: Authenticate with Microsoft
    Write-Host "Step 1: Authenticating with Microsoft..." -ForegroundColor Yellow
    Write-Host "A browser window will open for Microsoft login." -ForegroundColor Cyan
    Write-Host "Please sign in with your Techgene Microsoft account.`n" -ForegroundColor Cyan
    
    $msalToken = Get-MsalToken -ClientId $clientId -TenantId $tenantId -Scopes @("User.Read") -Interactive
    
    Write-Host "✓ Microsoft authentication successful!" -ForegroundColor Green
    Write-Host "  Signed in as: $($msalToken.Account.Username)" -ForegroundColor Cyan
    
    # Step 2: Verify with backend
    Write-Host "`nStep 2: Verifying with backend..." -ForegroundColor Yellow
    $verifyBody = @{
        access_token = $msalToken.AccessToken
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Method POST `
        -Uri "$backendUrl/api/auth/microsoft/verify" `
        -ContentType "application/json" `
        -Body $verifyBody
    
    $jwtToken = $response.access_token
    
    Write-Host "✓ Backend verification successful!" -ForegroundColor Green
    Write-Host "  User: $($response.user.name)" -ForegroundColor Cyan
    Write-Host "  Email: $($response.user.email)" -ForegroundColor Cyan
    
    # Step 3: List existing API keys
    Write-Host "`nStep 3: Checking existing API keys..." -ForegroundColor Yellow
    $existingKeys = Invoke-RestMethod -Method GET `
        -Uri "$backendUrl/api/keys" `
        -Headers @{"Authorization"="Bearer $jwtToken"}
    
    Write-Host "✓ You have $($existingKeys.total) API key(s)" -ForegroundColor Green
    
    if ($existingKeys.total -gt 0) {
        Write-Host "`nYour existing API keys:" -ForegroundColor Cyan
        foreach ($key in $existingKeys.api_keys) {
            $status = if ($key.is_active) { "Active" } else { "Inactive" }
            Write-Host "  • $($key.name)" -ForegroundColor White
            Write-Host "    Prefix: $($key.key_prefix)  |  Status: $status  |  Requests: $($key.request_count)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    # Step 4: Ask to create new API key
    Write-Host "Do you want to create a new API key? (Y/N): " -NoNewline -ForegroundColor Yellow
    $createNew = Read-Host
    
    if ($createNew -eq 'Y' -or $createNew -eq 'y' -or $createNew -eq '') {
        Write-Host "`nStep 4: Creating new API key..." -ForegroundColor Yellow
        Write-Host "Enter a name for this API key (e.g., 'My Laptop', 'Desktop PC'): " -NoNewline -ForegroundColor Cyan
        $keyName = Read-Host
        
        if ([string]::IsNullOrWhiteSpace($keyName)) {
            $keyName = "API Key - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        $keyBody = @{
            name = $keyName
            scopes = "read,write"
            expires_in_days = 90
        } | ConvertTo-Json
        
        $keyResponse = Invoke-RestMethod -Method POST `
            -Uri "$backendUrl/api/keys" `
            -Headers @{"Authorization"="Bearer $jwtToken"} `
            -ContentType "application/json" `
            -Body $keyBody
        
        $apiKey = $keyResponse.api_key.api_key
        
        Write-Host "`n✓ API key created successfully!" -ForegroundColor Green
        Write-Host "`n================================================" -ForegroundColor Yellow
        Write-Host "  YOUR API KEY - SAVE THIS SECURELY!" -ForegroundColor Yellow
        Write-Host "================================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host $apiKey -ForegroundColor Cyan
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Details:" -ForegroundColor White
        Write-Host "  Name: $($keyResponse.api_key.name)" -ForegroundColor Gray
        Write-Host "  Scopes: $($keyResponse.api_key.scopes -join ', ')" -ForegroundColor Gray
        Write-Host "  Expires: $($keyResponse.api_key.expires_at)" -ForegroundColor Gray
        Write-Host ""
        
        # Try to copy to clipboard
        try {
            Set-Clipboard -Value $apiKey
            Write-Host "✓ API key copied to clipboard!" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Couldn't copy to clipboard - please copy manually" -ForegroundColor Yellow
        }
        
        # Step 5: Test the API key
        Write-Host "`nStep 5: Testing API key..." -ForegroundColor Yellow
        
        try {
            $stats = Invoke-RestMethod -Method GET `
                -Uri "$backendUrl/api/analytics/login-events/stats?period=week" `
                -Headers @{"Authorization"="Bearer $apiKey"}
            
            Write-Host "✓ API key is working!" -ForegroundColor Green
            Write-Host "`nYour Statistics (Last 7 days):" -ForegroundColor Cyan
            Write-Host "  Total logins: $($stats.stats.total_logins)" -ForegroundColor White
            Write-Host "  Successful: $($stats.stats.successful_logins)" -ForegroundColor White
            Write-Host "  Failed: $($stats.stats.failed_logins)" -ForegroundColor White
            Write-Host "  Success rate: $([math]::Round($stats.stats.success_rate * 100, 1))%" -ForegroundColor White
            
            if ($stats.stats.by_method) {
                Write-Host "`n  By method:" -ForegroundColor White
                $stats.stats.by_method.PSObject.Properties | ForEach-Object {
                    Write-Host "    $($_.Name): $($_.Value)" -ForegroundColor Gray
                }
            }
        } catch {
            Write-Host "⚠ API key created but test failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        Write-Host "`n================================================" -ForegroundColor Green
        Write-Host "  ✅ SUCCESS! API KEY READY TO USE" -ForegroundColor Green
        Write-Host "================================================`n" -ForegroundColor Green
        
        # Save to file
        Write-Host "Would you like to save the API key to a file? (Y/N): " -NoNewline -ForegroundColor Yellow
        $saveFile = Read-Host
        
        if ($saveFile -eq 'Y' -or $saveFile -eq 'y') {
            $fileName = "api_key_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
            @"
Techgene Email Automation API Key
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
User: $($response.user.name) ($($response.user.email))
Key Name: $($keyResponse.api_key.name)

API Key:
$apiKey

Backend URL:
$backendUrl

Example Usage (PowerShell):
Invoke-RestMethod -Uri "$backendUrl/api/analytics/login-events/stats" -Headers @{"Authorization"="Bearer $apiKey"}

Example Usage (cURL):
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats \
  -H "Authorization: Bearer $apiKey"

⚠️ KEEP THIS FILE SECURE!
"@ | Out-File -FilePath $fileName -Encoding UTF8
            
            Write-Host "✓ API key saved to: $fileName" -ForegroundColor Green
        }
        
    } else {
        Write-Host "`nNo new API key created." -ForegroundColor Yellow
    }
    
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "  Next Steps:" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "1. Use your API key from any computer" -ForegroundColor White
    Write-Host "2. Access app: https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io" -ForegroundColor White
    Write-Host "3. View docs: E:\Email-automation-MVP\API_AUTHENTICATION_GUIDE.md" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "`n❌ ERROR OCCURRED" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "`nServer Response:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Gray
        } catch {
            # Ignore
        }
    }
    
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're using a Techgene Microsoft account" -ForegroundColor White
    Write-Host "2. Check internet connection" -ForegroundColor White
    Write-Host "3. Try running PowerShell as Administrator" -ForegroundColor White
    Write-Host "4. Contact IT support if issue persists`n" -ForegroundColor White
    
    exit 1
}
