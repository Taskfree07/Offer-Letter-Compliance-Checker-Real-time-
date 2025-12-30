# Microsoft OAuth Login - Test from ANY Computer

## 🔐 Microsoft Authentication Configuration

**Your Microsoft OAuth Details:**
- **Client ID:** `2b74ef92-7feb-45c7-94c2-62978353fc66`
- **Tenant ID:** `b3235290-db90-4365-b033-ae68284de5bd`
- **Authority:** `https://login.microsoftonline.com/b3235290-db90-4365-b033-ae68284de5bd`

---

## 🚀 **Option 1: Use Frontend (Easiest)**

Simply open the frontend and click "Sign in with Microsoft":

**Frontend URL:** https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io

This will:
1. Redirect to Microsoft login
2. Authenticate with your Microsoft account
3. Automatically get JWT token
4. Store in browser session

Then you can create API keys from the UI!

---

## 🪟 **Option 2: PowerShell with MSAL (Microsoft Authentication Library)**

### Step 1: Install MSAL.PS Module
```powershell
# Install MSAL module (only once)
Install-Module -Name MSAL.PS -Scope CurrentUser -Force
```

### Step 2: Get Microsoft Access Token
```powershell
# Microsoft OAuth configuration
$clientId = "2b74ef92-7feb-45c7-94c2-62978353fc66"
$tenantId = "b3235290-db90-4365-b033-ae68284de5bd"
$authority = "https://login.microsoftonline.com/$tenantId"
$scopes = @("User.Read")

# Get Microsoft token (will open browser for login)
$msalToken = Get-MsalToken -ClientId $clientId -TenantId $tenantId -Scopes $scopes -Interactive

$microsoftAccessToken = $msalToken.AccessToken
Write-Host "Microsoft Access Token obtained!" -ForegroundColor Green
```

### Step 3: Verify with Backend
```powershell
# Send Microsoft token to your backend
$verifyBody = @{
    access_token = $microsoftAccessToken
} | ConvertTo-Json

$response = Invoke-RestMethod -Method POST `
    -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/microsoft/verify" `
    -ContentType "application/json" `
    -Body $verifyBody

# Get your JWT token
$token = $response.access_token
Write-Host "✓ Logged in as: $($response.user.name)" -ForegroundColor Green
Write-Host "✓ Email: $($response.user.email)" -ForegroundColor Cyan
Write-Host "JWT Token: $token" -ForegroundColor Yellow
```

### Step 4: Create API Key
```powershell
$keyBody = @{
    name = "My Microsoft Login Key"
    scopes = "read,write"
    expires_in_days = 90
} | ConvertTo-Json

$keyResponse = Invoke-RestMethod -Method POST `
    -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" `
    -Headers @{"Authorization"="Bearer $token"} `
    -ContentType "application/json" `
    -Body $keyBody

$apiKey = $keyResponse.api_key.api_key
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "YOUR API KEY (save this!):" -ForegroundColor Yellow
Write-Host $apiKey -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Yellow
```

### Step 5: Test API Key
```powershell
# Use API key to get statistics
Invoke-RestMethod `
    -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week" `
    -Headers @{"Authorization"="Bearer $apiKey"}
```

---

## 🔄 **Option 3: Complete PowerShell Script**

Copy and run this entire block:

```powershell
# ========================================
# Microsoft OAuth Login Test Script
# ========================================

Write-Host "Microsoft OAuth Login Test" -ForegroundColor Cyan
Write-Host "===========================`n" -ForegroundColor Cyan

# Check if MSAL module is installed
if (-not (Get-Module -ListAvailable -Name MSAL.PS)) {
    Write-Host "Installing MSAL.PS module..." -ForegroundColor Yellow
    Install-Module -Name MSAL.PS -Scope CurrentUser -Force
}

Import-Module MSAL.PS

# Microsoft OAuth configuration
$clientId = "2b74ef92-7feb-45c7-94c2-62978353fc66"
$tenantId = "b3235290-db90-4365-b033-ae68284de5bd"
$scopes = @("User.Read")
$backendUrl = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"

try {
    # Step 1: Get Microsoft token
    Write-Host "Step 1: Authenticating with Microsoft..." -ForegroundColor Yellow
    $msalToken = Get-MsalToken -ClientId $clientId -TenantId $tenantId -Scopes $scopes -Interactive
    Write-Host "✓ Microsoft authentication successful!" -ForegroundColor Green

    # Step 2: Verify with backend
    Write-Host "`nStep 2: Verifying with backend..." -ForegroundColor Yellow
    $verifyBody = @{ access_token = $msalToken.AccessToken } | ConvertTo-Json
    $response = Invoke-RestMethod -Method POST -Uri "$backendUrl/api/auth/microsoft/verify" -ContentType "application/json" -Body $verifyBody
    $token = $response.access_token
    Write-Host "✓ Logged in as: $($response.user.name)" -ForegroundColor Green
    Write-Host "  Email: $($response.user.email)" -ForegroundColor Cyan

    # Step 3: Create API key
    Write-Host "`nStep 3: Creating API key..." -ForegroundColor Yellow
    $keyBody = @{
        name = "Microsoft Login - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        scopes = "read,write"
        expires_in_days = 90
    } | ConvertTo-Json
    
    $keyResponse = Invoke-RestMethod -Method POST -Uri "$backendUrl/api/keys" -Headers @{"Authorization"="Bearer $token"} -ContentType "application/json" -Body $keyBody
    $apiKey = $keyResponse.api_key.api_key
    
    Write-Host "✓ API key created successfully!" -ForegroundColor Green
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "YOUR API KEY (save this!):" -ForegroundColor Yellow
    Write-Host $apiKey -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Yellow

    # Try to copy to clipboard
    try {
        Set-Clipboard -Value $apiKey
        Write-Host "✓ API key copied to clipboard!" -ForegroundColor Green
    } catch {
        Write-Host "Note: Couldn't copy to clipboard, please copy manually" -ForegroundColor Yellow
    }

    # Step 4: Test API key
    Write-Host "`nStep 4: Testing API key..." -ForegroundColor Yellow
    $stats = Invoke-RestMethod -Uri "$backendUrl/api/analytics/login-events/stats?period=week" -Headers @{"Authorization"="Bearer $apiKey"}
    
    Write-Host "✓ API key works! Statistics:" -ForegroundColor Green
    Write-Host "  Total logins: $($stats.stats.total_logins)" -ForegroundColor White
    Write-Host "  Successful: $($stats.stats.successful_logins)" -ForegroundColor White
    Write-Host "  Success rate: $([math]::Round($stats.stats.success_rate * 100, 1))%" -ForegroundColor White

    Write-Host "`n✅ ALL TESTS PASSED!" -ForegroundColor Green

} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
```

---

## 🐍 **Option 4: Python with MSAL**

### Install MSAL
```bash
pip install msal requests
```

### Python Script
```python
import msal
import requests
import json

# Configuration
CLIENT_ID = "2b74ef92-7feb-45c7-94c2-62978353fc66"
TENANT_ID = "b3235290-db90-4365-b033-ae68284de5bd"
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = ["User.Read"]
BACKEND_URL = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"

print("Microsoft OAuth Login Test")
print("=" * 50)

# Step 1: Get Microsoft token
print("\n1. Authenticating with Microsoft...")
app = msal.PublicClientApplication(CLIENT_ID, authority=AUTHORITY)
result = app.acquire_token_interactive(scopes=SCOPES)

if "access_token" in result:
    microsoft_token = result["access_token"]
    print("✓ Microsoft authentication successful!")
    
    # Step 2: Verify with backend
    print("\n2. Verifying with backend...")
    response = requests.post(
        f"{BACKEND_URL}/api/auth/microsoft/verify",
        json={"access_token": microsoft_token}
    )
    data = response.json()
    jwt_token = data["access_token"]
    print(f"✓ Logged in as: {data['user']['name']}")
    print(f"  Email: {data['user']['email']}")
    
    # Step 3: Create API key
    print("\n3. Creating API key...")
    key_response = requests.post(
        f"{BACKEND_URL}/api/keys",
        headers={"Authorization": f"Bearer {jwt_token}"},
        json={
            "name": "Python Microsoft Login",
            "scopes": "read,write",
            "expires_in_days": 90
        }
    )
    api_key = key_response.json()["api_key"]["api_key"]
    print(f"✓ API key created!")
    print(f"\nYOUR API KEY: {api_key}")
    
    # Step 4: Test API key
    print("\n4. Testing API key...")
    stats = requests.get(
        f"{BACKEND_URL}/api/analytics/login-events/stats?period=week",
        headers={"Authorization": f"Bearer {api_key}"}
    ).json()
    
    print(f"✓ API key works!")
    print(f"  Total logins: {stats['stats']['total_logins']}")
    print(f"  Success rate: {stats['stats']['success_rate']:.1%}")
    
    print("\n✅ ALL TESTS PASSED!")
else:
    print(f"❌ Authentication failed: {result.get('error')}")
    print(f"   {result.get('error_description')}")
```

---

## 🌐 **Option 5: Browser (JavaScript)**

1. Go to: https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io
2. Click "Sign in with Microsoft"
3. After login, open Developer Console (F12)
4. Run this:

```javascript
// Your token is already in the app!
const token = localStorage.getItem('access_token');
console.log('JWT Token:', token);

// Create API key
const response = await fetch('https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Browser Microsoft Login',
    scopes: 'read,write',
    expires_in_days: 90
  })
});

const data = await response.json();
console.log('API Key:', data.api_key.api_key);

// Copy to clipboard
navigator.clipboard.writeText(data.api_key.api_key);
console.log('✓ API key copied to clipboard!');
```

---

## 📋 **Manual Steps (If Scripting Fails)**

### 1. Get Microsoft Token Manually

Visit this URL in browser (replace YOUR_REDIRECT_URI):
```
https://login.microsoftonline.com/b3235290-db90-4365-b033-ae68284de5bd/oauth2/v2.0/authorize?client_id=2b74ef92-7feb-45c7-94c2-62978353fc66&response_type=token&redirect_uri=https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io/auth/callback&scope=User.Read&response_mode=fragment
```

After login, you'll be redirected with `access_token` in the URL.

### 2. Use Token with Backend

```powershell
# Use the token from URL
$microsoftToken = "paste_access_token_here"

# Verify with backend
$response = Invoke-RestMethod -Method POST `
    -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/microsoft/verify" `
    -ContentType "application/json" `
    -Body (@{access_token=$microsoftToken} | ConvertTo-Json)

$jwtToken = $response.access_token
Write-Host "JWT Token: $jwtToken"
```

### 3. Create API Key with JWT

```powershell
$keyResponse = Invoke-RestMethod -Method POST `
    -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" `
    -Headers @{"Authorization"="Bearer $jwtToken"} `
    -ContentType "application/json" `
    -Body (@{name="Test";scopes="read,write";expires_in_days=90} | ConvertTo-Json)

Write-Host "API Key: $($keyResponse.api_key.api_key)"
```

---

## 🎯 **Recommended Approach**

**For your colleagues at Techgene:**

1. **Easiest:** Open frontend → Sign in with Microsoft → Use UI
   - https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io

2. **For developers:** Use PowerShell script with MSAL (Option 3)
   - Copy the complete script above
   - Run once, get API key
   - Use API key forever!

3. **For automation:** Python with MSAL (Option 4)
   - Good for CI/CD pipelines
   - Can run headless with service principal

---

## ⚠️ **Important Notes**

- **All users must be in your Azure AD tenant** (b3235290-db90-4365-b033-ae68284de5bd)
- **App registration must allow your colleagues' accounts**
- **First-time users:** Will be automatically registered in your database
- **Microsoft token expires:** But JWT token is stored, or you get a new one
- **API keys never expire** (unless you set expiration)

---

## ✅ **What Gets Tracked**

When users login with Microsoft:
- `auth_method`: "microsoft"
- `event_type`: "login_success"
- User's Microsoft email and name
- IP address and user agent
- All visible in login statistics!

Check statistics:
```powershell
Invoke-RestMethod `
    -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week" `
    -Headers @{"Authorization"="Bearer YOUR_API_KEY"}
```

You'll see:
```json
{
  "by_method": {
    "microsoft": 45,  // ← Microsoft logins tracked!
    "api_key": 10
  }
}
```

---

**🎉 Your app now supports Microsoft OAuth for Techgene users!**
