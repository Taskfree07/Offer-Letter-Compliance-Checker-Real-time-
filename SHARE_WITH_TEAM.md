# 🌐 Share This With Your Team

## 📧 **Email to Send to Colleagues:**

```
Subject: Email Automation API - Generate Your API Key

Hi Team,

You can now generate API keys for the Email Automation app from any computer.

OPTION 1 - Browser (Easiest):
Open this file in your browser:
generate-api-key.html

Or download from:
[Share the HTML file or host it somewhere]

OPTION 2 - PowerShell:
Copy and paste this command in PowerShell:

Install-Module -Name MSAL.PS -Scope CurrentUser -Force; Import-Module MSAL.PS; $t = Get-MsalToken -ClientId "2b74ef92-7feb-45c7-94c2-62978353fc66" -TenantId "b3235290-db90-4365-b033-ae68284de5bd" -Scopes @("User.Read") -Interactive; $r = Invoke-RestMethod -Method POST -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/microsoft/verify" -ContentType "application/json" -Body (@{access_token=$t.AccessToken}|ConvertTo-Json); $k = Invoke-RestMethod -Method POST -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" -Headers @{"Authorization"="Bearer $($r.access_token)"} -ContentType "application/json" -Body (@{name="My Key";scopes="read,write";expires_in_days=90}|ConvertTo-Json); Write-Host "`nYOUR API KEY:" -ForegroundColor Yellow; Write-Host $k.api_key.api_key -ForegroundColor Cyan; Set-Clipboard -Value $k.api_key.api_key

Once you have your API key, you can check statistics from any PC!

Questions? Let me know!
```

---

## 📊 **How to View Statistics (Once You Have API Key):**

### **Method 1: Browser**
1. Open `generate-api-key.html`
2. Scroll to "Step 3: View Statistics"
3. Paste your API key
4. Click "View Statistics" or "View Recent Events"

### **Method 2: PowerShell**
```powershell
# Replace with your actual API key
$apiKey = "ea_live_your_api_key_here"

# Get statistics
$stats = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week" -Headers @{"Authorization"="Bearer $apiKey"}

# Display nicely
Write-Host "`n📊 LOGIN STATISTICS (Last 7 Days)" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Total logins: $($stats.stats.total_logins)" -ForegroundColor White
Write-Host "Successful: $($stats.stats.successful_logins)" -ForegroundColor Green
Write-Host "Failed: $($stats.stats.failed_logins)" -ForegroundColor Red
Write-Host "Success rate: $([math]::Round($stats.stats.success_rate * 100, 1))%" -ForegroundColor Yellow
Write-Host "`nBy Method:" -ForegroundColor Cyan
$stats.stats.by_method.PSObject.Properties | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor Gray
}

# Get recent events
$events = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?limit=10" -Headers @{"Authorization"="Bearer $apiKey"}

Write-Host "`n📝 RECENT LOGIN EVENTS" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
$events.events | Format-Table event_type, auth_method, email_attempted, ip_address, @{Label="Time";Expression={$_.created_at}} -AutoSize
```

---

## 🔄 **Real-Time Monitoring Script**

Save this to check statistics every 30 seconds:

```powershell
# monitor-logins.ps1
$apiKey = "ea_live_your_api_key_here"

Write-Host "📊 Email Automation - Real-Time Login Monitor" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

while ($true) {
    Clear-Host
    Write-Host "📊 Email Automation - Login Statistics" -ForegroundColor Cyan
    Write-Host "Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    try {
        # Get statistics
        $stats = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=day" -Headers @{"Authorization"="Bearer $apiKey"}
        
        Write-Host "TODAY'S STATISTICS:" -ForegroundColor Yellow
        Write-Host "  Total logins: $($stats.stats.total_logins)" -ForegroundColor White
        Write-Host "  Successful: $($stats.stats.successful_logins)" -ForegroundColor Green
        Write-Host "  Failed: $($stats.stats.failed_logins)" -ForegroundColor Red
        Write-Host "  Success rate: $([math]::Round($stats.stats.success_rate * 100, 1))%" -ForegroundColor Cyan
        
        Write-Host "`nBY METHOD:" -ForegroundColor Yellow
        $stats.stats.by_method.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor White
        }
        
        # Get recent 5 events
        $events = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?limit=5" -Headers @{"Authorization"="Bearer $apiKey"}
        
        Write-Host "`nRECENT LOGINS:" -ForegroundColor Yellow
        foreach ($event in $events.events) {
            $icon = if ($event.success) { "✓" } else { "✗" }
            $color = if ($event.success) { "Green" } else { "Red" }
            $time = ([DateTime]$event.created_at).ToString("HH:mm:ss")
            Write-Host "  $icon " -NoNewline -ForegroundColor $color
            Write-Host "$time - $($event.auth_method) - $($event.email_attempted)" -ForegroundColor White
        }
        
    } catch {
        Write-Host "Error fetching data: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nRefreshing in 30 seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
}
```

---

## 📁 **Files to Share:**

1. **generate-api-key.html** - Open in any browser to generate API keys
2. **One-line PowerShell command** (from email above) - Copy-paste to generate key

---

## ✅ **What Your API Key Can Do:**

Once generated, the API key works from **ANY computer** and can:

✅ View login statistics (hourly, daily, weekly, monthly)
✅ See recent login events (with IP addresses, timestamps)
✅ List all your API keys and their usage
✅ Track authentication methods (Microsoft, email, API key)
✅ Monitor success/failure rates
✅ See unique users and IPs

---

## 🎯 **Quick Commands Reference:**

```powershell
# Set your API key once
$apiKey = "ea_live_your_key_here"

# Weekly stats
Invoke-RestMethod "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week" -Headers @{"Authorization"="Bearer $apiKey"}

# Daily stats
Invoke-RestMethod "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=day" -Headers @{"Authorization"="Bearer $apiKey"}

# Recent 50 events
Invoke-RestMethod "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?limit=50" -Headers @{"Authorization"="Bearer $apiKey"}

# Only failed logins
Invoke-RestMethod "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?success=false&limit=20" -Headers @{"Authorization"="Bearer $apiKey"}

# Only Microsoft logins
Invoke-RestMethod "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?auth_method=microsoft&limit=20" -Headers @{"Authorization"="Bearer $apiKey"}

# List all your API keys
Invoke-RestMethod "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" -Headers @{"Authorization"="Bearer $apiKey"}
```

---

**🎉 Now anyone can generate API keys and view statistics from any computer!**
