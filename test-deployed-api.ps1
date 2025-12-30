# Test Deployed API - Azure Container Apps
# Email Automation MVP - API Authentication Testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Email Automation API - Azure Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Deployed URLs
$BACKEND_URL = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"
$FRONTEND_URL = "https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io"

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Green
Write-Host "Frontend URL: $FRONTEND_URL`n" -ForegroundColor Green

# Test 1: Health Check
Write-Host "Test 1: Backend Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET
    Write-Host "✓ Backend is healthy!" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Login (Update with your actual credentials)
Write-Host "Test 2: Login to get JWT token..." -ForegroundColor Yellow
Write-Host "Enter your email: " -NoNewline -ForegroundColor Cyan
$email = Read-Host
Write-Host "Enter your password: " -NoNewline -ForegroundColor Cyan
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    $loginBody = @{
        email = $email
        password = $passwordPlain
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.access_token
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.user.name)" -ForegroundColor White
    Write-Host "  Email: $($loginResponse.user.email)" -ForegroundColor White
    Write-Host "  Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host ""

    # Test 3: List existing API keys
    Write-Host "Test 3: List your existing API keys..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $keysResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/keys" -Method GET -Headers $headers
        
        Write-Host "✓ Found $($keysResponse.total) API key(s)" -ForegroundColor Green
        if ($keysResponse.total -gt 0) {
            foreach ($key in $keysResponse.api_keys) {
                Write-Host "  • $($key.name)" -ForegroundColor White
                Write-Host "    Prefix: $($key.key_prefix)" -ForegroundColor Gray
                Write-Host "    Scopes: $($key.scopes -join ', ')" -ForegroundColor Gray
                Write-Host "    Requests: $($key.request_count)" -ForegroundColor Gray
                Write-Host "    Active: $($key.is_active)" -ForegroundColor Gray
                Write-Host ""
            }
        }
    } catch {
        Write-Host "✗ Failed to list API keys: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }

    # Test 4: Create new API key
    Write-Host "Test 4: Create new API key..." -ForegroundColor Yellow
    Write-Host "Do you want to create a new API key? (y/n): " -NoNewline -ForegroundColor Cyan
    $createKey = Read-Host
    
    if ($createKey -eq 'y' -or $createKey -eq 'Y') {
        Write-Host "Enter API key name: " -NoNewline -ForegroundColor Cyan
        $keyName = Read-Host
        
        try {
            $keyBody = @{
                name = $keyName
                scopes = "read,write"
                expires_in_days = 90
            } | ConvertTo-Json

            $keyResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/keys" -Method POST -Headers $headers -ContentType "application/json" -Body $keyBody
            
            Write-Host "✓ API Key created successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "================================================" -ForegroundColor Yellow
            Write-Host "  SAVE THIS API KEY - IT WON'T BE SHOWN AGAIN!" -ForegroundColor Yellow
            Write-Host "================================================" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "API Key: " -NoNewline -ForegroundColor White
            Write-Host "$($keyResponse.api_key.api_key)" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  Name: $($keyResponse.api_key.name)" -ForegroundColor White
            Write-Host "  Scopes: $($keyResponse.api_key.scopes -join ', ')" -ForegroundColor White
            Write-Host "  Expires: $($keyResponse.api_key.expires_at)" -ForegroundColor White
            Write-Host ""
            
            # Copy to clipboard if available
            try {
                Set-Clipboard -Value $keyResponse.api_key.api_key
                Write-Host "✓ API key copied to clipboard!" -ForegroundColor Green
            } catch {
                Write-Host "Note: Couldn't copy to clipboard, please copy manually" -ForegroundColor Yellow
            }
            Write-Host ""

            # Test the newly created API key
            Write-Host "Test 5: Test the new API key..." -ForegroundColor Yellow
            try {
                $apiKeyHeaders = @{
                    "Authorization" = "Bearer $($keyResponse.api_key.api_key)"
                }
                $statsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/analytics/login-events/stats?period=week" -Method GET -Headers $apiKeyHeaders
                
                Write-Host "✓ API key works! Here are your login statistics:" -ForegroundColor Green
                Write-Host "  Total logins: $($statsResponse.stats.total_logins)" -ForegroundColor White
                Write-Host "  Successful: $($statsResponse.stats.successful_logins)" -ForegroundColor White
                Write-Host "  Failed: $($statsResponse.stats.failed_logins)" -ForegroundColor White
                Write-Host "  Success rate: $([math]::Round($statsResponse.stats.success_rate * 100, 1))%" -ForegroundColor White
                Write-Host "  Period: $($statsResponse.stats.period)" -ForegroundColor White
                Write-Host ""
            } catch {
                Write-Host "✗ Failed to test API key: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host ""
            }
        } catch {
            Write-Host "✗ Failed to create API key: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
        }
    }

    # Test 6: Get login statistics
    Write-Host "Test 6: Get your login statistics..." -ForegroundColor Yellow
    try {
        $statsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/analytics/login-events/stats?period=week" -Method GET -Headers $headers
        
        Write-Host "✓ Login statistics (last week):" -ForegroundColor Green
        Write-Host "  Total logins: $($statsResponse.stats.total_logins)" -ForegroundColor White
        Write-Host "  Successful: $($statsResponse.stats.successful_logins)" -ForegroundColor White
        Write-Host "  Failed: $($statsResponse.stats.failed_logins)" -ForegroundColor White
        Write-Host "  Success rate: $([math]::Round($statsResponse.stats.success_rate * 100, 1))%" -ForegroundColor White
        Write-Host ""
        Write-Host "  By method:" -ForegroundColor White
        $statsResponse.stats.by_method.PSObject.Properties | ForEach-Object {
            Write-Host "    $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
        Write-Host ""
    } catch {
        Write-Host "✗ Failed to get statistics: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }

    # Test 7: Get recent login events
    Write-Host "Test 7: Get recent login events..." -ForegroundColor Yellow
    try {
        $eventsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/analytics/login-events/recent" -Method GET -Headers $headers
        
        Write-Host "✓ Recent login events (last 24h): $($eventsResponse.count)" -ForegroundColor Green
        if ($eventsResponse.count -gt 0) {
            $eventsResponse.events | Select-Object -First 5 | ForEach-Object {
                Write-Host "  • $($_.event_type) - $($_.auth_method)" -ForegroundColor White
                Write-Host "    IP: $($_.ip_address)" -ForegroundColor Gray
                Write-Host "    Time: $($_.created_at)" -ForegroundColor Gray
                Write-Host ""
            }
        }
    } catch {
        Write-Host "✗ Failed to get recent events: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }

} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you have registered an account first!" -ForegroundColor Yellow
    Write-Host "Visit: $FRONTEND_URL" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Use your API key from anywhere" -ForegroundColor White
Write-Host "2. Visit frontend: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "3. View API docs: https://github.com/your-repo/API_AUTHENTICATION_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
