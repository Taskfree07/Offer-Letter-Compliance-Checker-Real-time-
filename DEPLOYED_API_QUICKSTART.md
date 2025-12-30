# Using Your Deployed API - Quick Start

## 🌐 Your Application is Live!

**Frontend:** https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io  
**Backend API:** https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io  
**ONLYOFFICE:** https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io

✅ **Access from any computer with internet!**

---

## 🚀 Quick Start - Generate Your First API Key

### Option 1: Using PowerShell Script (Easiest)

```powershell
# Run this from any computer
./test-deployed-api.ps1
```

This script will:
1. Check if backend is healthy
2. Log you in
3. Show your existing API keys
4. Create a new API key (optional)
5. Test the API key
6. Show your login statistics

### Option 2: Manual Steps

#### Step 1: Register/Login

**Register a new account:**
```powershell
$body = @{
    email = "your@email.com"
    password = "yourpassword"
    name = "Your Name"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/register" -Method POST -ContentType "application/json" -Body $body
```

**Or Login:**
```powershell
$body = @{
    email = "your@email.com"
    password = "yourpassword"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$token = $response.access_token
Write-Host "Token: $token"
```

#### Step 2: Create API Key

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    name = "My Production Key"
    scopes = "read,write"
    expires_in_days = 90
} | ConvertTo-Json

$apiKeyResponse = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" -Method POST -Headers $headers -ContentType "application/json" -Body $body

# SAVE THIS - You won't see it again!
Write-Host "Your API Key: $($apiKeyResponse.api_key.api_key)" -ForegroundColor Green
```

#### Step 3: Use Your API Key

```powershell
# Use the API key instead of JWT token
$apiHeaders = @{
    "Authorization" = "Bearer ea_live_your_api_key_here"
}

# Get login statistics
$stats = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week" -Headers $apiHeaders
$stats.stats
```

---

## 📊 What Can You Track?

### 1. View All Your API Keys
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" -Headers $headers
```

**Shows:**
- Key name and prefix
- Request count (how many times it's been used)
- Last used timestamp
- Active status
- Scopes/permissions

### 2. View Login Statistics
```powershell
$headers = @{ "Authorization" = "Bearer $apiKey" }
Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week" -Headers $headers
```

**Shows:**
- Total logins
- Successful vs failed
- Success rate
- Breakdown by method (email, Microsoft OAuth, API key)
- Unique IP addresses

### 3. View Login Events
```powershell
$headers = @{ "Authorization" = "Bearer $apiKey" }
Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?limit=50" -Headers $headers
```

**Shows for each login:**
- Event type (login_success, login_failed, logout)
- Authentication method
- IP address
- User agent (browser/device info)
- Timestamp
- Success/failure reason

### 4. View Recent Events (Last 24h)
```powershell
$headers = @{ "Authorization" = "Bearer $apiKey" }
Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/recent" -Headers $headers
```

---

## 🔐 API Key Features

### Scopes (Permissions)
- **read**: View data only
- **write**: Create/modify data  
- **admin**: Full access (requires admin user)

### Security Features
- Keys are SHA-256 hashed (never stored in plain text)
- Configurable expiration (30, 60, 90 days, etc.)
- Rate limiting (1000 requests/hour by default)
- Can be activated/deactivated
- Can be revoked permanently

### Usage Tracking
Every time you use an API key:
- ✅ Request count increments
- ✅ Last used timestamp updates
- ✅ Login event is recorded with IP and user agent
- ✅ Available in your statistics

---

## 📱 Use From Any Programming Language

### Python
```python
import requests

# Create API key
response = requests.post(
    'https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys',
    headers={'Authorization': f'Bearer {jwt_token}'},
    json={'name': 'Python App', 'scopes': 'read,write', 'expires_in_days': 90}
)
api_key = response.json()['api_key']['api_key']

# Use API key
stats = requests.get(
    'https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats',
    headers={'Authorization': f'Bearer {api_key}'}
).json()
print(stats['stats'])
```

### JavaScript/Node.js
```javascript
// Create API key
const response = await fetch('https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'JS App',
    scopes: 'read,write',
    expires_in_days: 90
  })
});
const { api_key } = await response.json();

// Use API key
const stats = await fetch('https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats', {
  headers: { 'Authorization': `Bearer ${api_key.api_key}` }
}).then(r => r.json());
console.log(stats.stats);
```

### cURL
```bash
# Create API key
curl -X POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","scopes":"read,write","expires_in_days":90}'

# Use API key
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats \
  -H "Authorization: Bearer ea_live_your_api_key"
```

---

## 📖 Full Documentation

For complete API documentation, see [API_AUTHENTICATION_GUIDE.md](./API_AUTHENTICATION_GUIDE.md)

---

## ✅ Testing Checklist

- [ ] Can access frontend from any computer
- [ ] Can register/login from any computer
- [ ] Can create API keys
- [ ] Can view API key usage statistics
- [ ] Can view login statistics
- [ ] Can view login events
- [ ] API key works from different computers
- [ ] Can revoke/manage API keys

---

## 🎯 Common Use Cases

### 1. **Integration with Other Apps**
Generate an API key for each integration. Track usage per integration by key name.

### 2. **Monitor Security**
Check login events regularly for suspicious activity (unusual IPs, failed attempts).

### 3. **Usage Analytics**
View which API keys are used most, when they're used, and from where.

### 4. **Key Rotation**
Create new keys before old ones expire, update integrations, revoke old keys.

### 5. **Multi-User Access**
Each user gets their own API keys. Admin can see all login events.

---

## 🆘 Troubleshooting

### "Backend not responding"
- Check internet connection
- Verify URL: https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/health

### "Invalid API key"
- Key may be expired or revoked
- Check if key is active: `GET /api/keys`
- Create a new key if needed

### "Rate limit exceeded"
- Default limit: 1000 requests/hour
- Wait for rate limit to reset
- Contact admin to increase limit

---

**🎉 Your API is now accessible from anywhere in the world!**
