# Test Your Deployed API from ANY Computer

Copy and run these commands on **any computer** (Windows, Mac, Linux) to test your deployed app!

## 🔐 **RECOMMENDED: Microsoft OAuth Login (Techgene Users)**

**For Techgene team members, use Microsoft OAuth instead of email/password!**

### **Quick Start - Run This Script:**
```powershell
E:\Email-automation-MVP\microsoft-login.ps1
```

This will:
1. ✅ Open Microsoft login (use your Techgene account)
2. ✅ Authenticate with backend
3. ✅ Show existing API keys
4. ✅ Create new API key (optional)
5. ✅ Test the API key
6. ✅ Save API key to file (optional)

**Or see complete Microsoft OAuth guide:** [MICROSOFT_OAUTH_LOGIN.md](./MICROSOFT_OAUTH_LOGIN.md)

---

## 📧 **Alternative: Email/Password Login (For Testing)**

If you need to test with email/password instead:

---

## 🪟 **Windows PowerShell Commands**

### 1. Test Backend Health
```powershell
Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/health"
```

### 2. Register New User
```powershell
$registerBody = @{
    email = "test@example.com"
    password = "YourPassword123!"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
```

### 3. Login
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "YourPassword123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

# Save token for next commands
$token = $response.access_token
Write-Host "Token: $token" -ForegroundColor Green
```

### 4. Create API Key
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$keyBody = @{
    name = "Test from Another PC"
    scopes = "read,write"
    expires_in_days = 90
} | ConvertTo-Json

$apiKeyResponse = Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" -Method POST -Headers $headers -ContentType "application/json" -Body $keyBody

# SAVE THIS API KEY!
$apiKey = $apiKeyResponse.api_key.api_key
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "YOUR API KEY (save this!):" -ForegroundColor Yellow
Write-Host $apiKey -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Yellow
```

### 5. List Your API Keys
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys" -Headers $headers
```

### 6. Get Login Statistics
```powershell
# Using API key
$apiHeaders = @{
    "Authorization" = "Bearer $apiKey"
}

Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week" -Headers $apiHeaders
```

### 7. Get Recent Login Events
```powershell
$apiHeaders = @{
    "Authorization" = "Bearer $apiKey"
}

Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/recent" -Headers $apiHeaders
```

### 8. Get All Login Events (with filters)
```powershell
$apiHeaders = @{
    "Authorization" = "Bearer $apiKey"
}

Invoke-RestMethod -Uri "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?limit=10&event_type=login_success" -Headers $apiHeaders
```

---

## 🐧 **Linux/Mac Terminal Commands (curl)**

### 1. Test Backend Health
```bash
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/health
```

### 2. Register New User
```bash
curl -X POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "YourPassword123!",
    "name": "Test User"
  }'
```

### 3. Login
```bash
curl -X POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "YourPassword123!"
  }'
```

Save the `access_token` from the response, then:

```bash
# Set token variable
TOKEN="paste_your_token_here"
```

### 4. Create API Key
```bash
curl -X POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test from Linux/Mac",
    "scopes": "read,write",
    "expires_in_days": 90
  }'
```

Save the API key from the response, then:

```bash
# Set API key variable
API_KEY="paste_your_api_key_here"
```

### 5. List Your API Keys
```bash
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Get Login Statistics
```bash
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week \
  -H "Authorization: Bearer $API_KEY"
```

### 7. Get Recent Login Events
```bash
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/recent \
  -H "Authorization: Bearer $API_KEY"
```

### 8. Get All Login Events
```bash
curl "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?limit=10" \
  -H "Authorization: Bearer $API_KEY"
```

---

## 🐍 **Python Script**

Save as `test_api.py`:

```python
import requests
import json

BASE_URL = "https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io"

# 1. Health check
print("1. Testing health...")
response = requests.get(f"{BASE_URL}/health")
print(f"   Status: {response.json()}")

# 2. Login
print("\n2. Logging in...")
login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={
        "email": "test@example.com",
        "password": "YourPassword123!"
    }
)
token = login_response.json()['access_token']
print(f"   Token received: {token[:50]}...")

# 3. Create API Key
print("\n3. Creating API key...")
headers = {"Authorization": f"Bearer {token}"}
api_key_response = requests.post(
    f"{BASE_URL}/api/keys",
    headers=headers,
    json={
        "name": "Python Test Key",
        "scopes": "read,write",
        "expires_in_days": 90
    }
)
api_key = api_key_response.json()['api_key']['api_key']
print(f"   API Key: {api_key}")
print("   ⚠️  SAVE THIS KEY!")

# 4. Test API Key - Get Statistics
print("\n4. Getting statistics with API key...")
api_headers = {"Authorization": f"Bearer {api_key}"}
stats = requests.get(
    f"{BASE_URL}/api/analytics/login-events/stats?period=week",
    headers=api_headers
).json()

print(f"   Total logins: {stats['stats']['total_logins']}")
print(f"   Successful: {stats['stats']['successful_logins']}")
print(f"   Failed: {stats['stats']['failed_logins']}")
print(f"   Success rate: {stats['stats']['success_rate']:.1%}")

# 5. List all API keys
print("\n5. Listing all your API keys...")
keys = requests.get(f"{BASE_URL}/api/keys", headers=headers).json()
print(f"   You have {keys['total']} API key(s)")
for key in keys['api_keys']:
    print(f"   - {key['name']}: {key['request_count']} requests")

print("\n✅ All tests passed!")
```

Run with:
```bash
python test_api.py
```

---

## 🟢 **Node.js Script**

Save as `test_api.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io';

async function testAPI() {
  try {
    // 1. Health check
    console.log('1. Testing health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   Status:', health.data.status);

    // 2. Login
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'YourPassword123!'
    });
    const token = loginResponse.data.access_token;
    console.log('   Token received:', token.substring(0, 50) + '...');

    // 3. Create API Key
    console.log('\n3. Creating API key...');
    const apiKeyResponse = await axios.post(
      `${BASE_URL}/api/keys`,
      {
        name: 'Node.js Test Key',
        scopes: 'read,write',
        expires_in_days: 90
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const apiKey = apiKeyResponse.data.api_key.api_key;
    console.log('   API Key:', apiKey);
    console.log('   ⚠️  SAVE THIS KEY!');

    // 4. Test API Key - Get Statistics
    console.log('\n4. Getting statistics with API key...');
    const statsResponse = await axios.get(
      `${BASE_URL}/api/analytics/login-events/stats?period=week`,
      {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    );
    const stats = statsResponse.data.stats;
    console.log(`   Total logins: ${stats.total_logins}`);
    console.log(`   Successful: ${stats.successful_logins}`);
    console.log(`   Failed: ${stats.failed_logins}`);
    console.log(`   Success rate: ${(stats.success_rate * 100).toFixed(1)}%`);

    // 5. List all API keys
    console.log('\n5. Listing all your API keys...');
    const keysResponse = await axios.get(`${BASE_URL}/api/keys`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   You have ${keysResponse.data.total} API key(s)`);
    keysResponse.data.api_keys.forEach(key => {
      console.log(`   - ${key.name}: ${key.request_count} requests`);
    });

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
```

Install axios first:
```bash
npm install axios
```

Run with:
```bash
node test_api.js
```

---

## 🌐 **Test in Browser (JavaScript Console)**

1. Open your browser
2. Go to: https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io
3. Press F12 to open Developer Console
4. Paste this code:

```javascript
const BASE_URL = 'https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io';

// Login
const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'YourPassword123!'
  })
});
const { access_token } = await loginResponse.json();
console.log('Token:', access_token);

// Create API Key
const apiKeyResponse = await fetch(`${BASE_URL}/api/keys`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Browser Test Key',
    scopes: 'read,write',
    expires_in_days: 90
  })
});
const apiKeyData = await apiKeyResponse.json();
console.log('API Key:', apiKeyData.api_key.api_key);

// Get Statistics
const statsResponse = await fetch(
  `${BASE_URL}/api/analytics/login-events/stats?period=week`,
  {
    headers: { 'Authorization': `Bearer ${apiKeyData.api_key.api_key}` }
  }
);
const stats = await statsResponse.json();
console.log('Statistics:', stats.stats);
```

---

## 📱 **Test with Postman**

### Import this collection:

1. Open Postman
2. Click "Import"
3. Create new collection with these requests:

**Request 1: Health Check**
- Method: GET
- URL: `https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/health`

**Request 2: Login**
- Method: POST
- URL: `https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "YourPassword123!"
}
```

**Request 3: Create API Key**
- Method: POST
- URL: `https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys`
- Headers:
  - `Authorization`: `Bearer {{token}}`
  - `Content-Type`: `application/json`
- Body (JSON):
```json
{
  "name": "Postman Test Key",
  "scopes": "read,write",
  "expires_in_days": 90
}
```

**Request 4: Get Statistics**
- Method: GET
- URL: `https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week`
- Headers:
  - `Authorization`: `Bearer {{api_key}}`

---

## 🎯 **One-Line Quick Test**

### Windows (PowerShell):
```powershell
Invoke-RestMethod https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/health
```

### Linux/Mac (Terminal):
```bash
curl https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/health
```

If you see `{"status":"healthy"}` - **it's working!** ✅

---

## 📋 **What to Expect**

### Health Check Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Login Response:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  },
  "access_token": "eyJ0eXAiOiJKV1Qi...",
  "refresh_token": "eyJ0eXAiOiJKV1Qi..."
}
```

### API Key Creation Response:
```json
{
  "success": true,
  "api_key": {
    "id": 1,
    "name": "Test Key",
    "api_key": "ea_live_x7k2m9pqwR3vT8nY4sL1z...",
    "scopes": ["read", "write"],
    "request_count": 0
  }
}
```

### Statistics Response:
```json
{
  "success": true,
  "stats": {
    "total_logins": 25,
    "successful_logins": 24,
    "failed_logins": 1,
    "success_rate": 0.96,
    "by_method": {
      "email": 15,
      "api_key": 10
    },
    "period": "week"
  }
}
```

---

## ✅ **Testing Checklist**

Copy these commands to any PC and verify:

- [ ] Backend health check works
- [ ] Can register new user
- [ ] Can login and get JWT token
- [ ] Can create API key
- [ ] Can view API keys list
- [ ] API key works to get statistics
- [ ] Can see login events
- [ ] Can access from different networks
- [ ] Frontend loads: https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io

---

**🎉 All these commands work from ANY computer with internet!**

Just copy-paste and replace the email/password with your actual credentials.
