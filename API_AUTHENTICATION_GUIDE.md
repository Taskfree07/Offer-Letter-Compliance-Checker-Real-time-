# API Authentication & Security Guide

## 🌐 Deployed Application URLs

**Frontend:** https://frontend.reddesert-f6724e64.centralus.azurecontainerapps.io  
**Backend API:** https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io  
**ONLYOFFICE:** https://onlyoffice.reddesert-f6724e64.centralus.azurecontainerapps.io

**Access from anywhere:** These URLs work from any computer with internet access!

---

## Overview

This application now includes production-grade API key authentication, login event tracking, and real-time WebSocket streaming for security monitoring.

## Features Implemented

### 1. API Key System
- **Secure key generation** with SHA-256 hashing
- **Scoped permissions** (read, write, admin)
- **Rate limiting** support
- **Expiration** management
- **Usage tracking** and analytics
- **Key prefix identification** (ea_live_...)

### 2. Login Event Tracking
- Comprehensive logging of all authentication attempts
- Success/failure tracking
- IP address and user agent capture
- Support for email, Microsoft OAuth, and API key auth
- Queryable history with filters

### 3. Real-Time WebSocket Streaming
- Live login event notifications
- JWT and API key authentication for WebSocket connections
- Room-based isolation (users only see their own events)
- Bi-directional communication

---

## API Endpoints

### Authentication Endpoints

Base URL: `/api/auth`

#### 1. Register User
```http
POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "auth_provider": "email"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 2. Login
```http
POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as register

#### 3. Microsoft OAuth Login
```http
POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/microsoft/verify
Content-Type: application/json

{
  "access_token": "microsoft_access_token_from_msal"
}
```

---

### API Key Management

Base URL: `/api/keys`

#### 1. Create API Key
```http
POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My Production API Key",
  "scopes": "read,write",
  "expires_in_days": 90
}
```

**Response:**
```json
{
  "success": true,
  "api_key": {
    "id": 1,
    "name": "My Production API Key",
    "api_key": "ea_live_abc123def456...",  // ONLY SHOWN ONCE!
    "key_prefix": "ea_live_",
    "scopes": ["read", "write"],
    "is_active": true,
    "rate_limit": 1000,
    "created_at": "2024-01-15T10:30:00",
    "expires_at": "2024-04-15T10:30:00"
  },
  "message": "API key created successfully. Save this key - it won't be shown again!",
  "warning": "Store this API key securely. You will not be able to see it again."
}
```

#### 2. List API Keys
```http
GET https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys?include_revoked=false
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "api_keys": [
    {
      "id": 1,
      "name": "Production API",
      "key_prefix": "ea_live_",
      "scopes": ["read", "write"],
      "is_active": true,
      "request_count": 1523,
      "last_used_at": "2024-01-15T14:22:00",
      "created_at": "2024-01-01T10:00:00"
    }
  ],
  "total": 3,
  "active": 2
}
```

#### 3. Revoke API Key
```http
DELETE https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys/1
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully",
  "api_key": {
    "id": 1,
    "revoked_at": "2024-01-15T15:00:00"
  }
}
```

#### 4. Update API Key
```http
PATCH https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "scopes": "read",
  "is_active": false
}
```

---

### Login Events & Analytics

Base URL: `/api/analytics`

#### 1. Get Login Events
```http
GET https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events?limit=50&offset=0&event_type=login_success&auth_method=email
Authorization: Bearer <jwt_token_or_api_key>
```

**Query Parameters:**
- `limit`: Max results (default: 50, max: 500)
- `offset`: Pagination offset
- `event_type`: Filter by type (login_success, login_failed, logout, token_refresh)
- `auth_method`: Filter by method (email, microsoft, api_key)
- `success`: Filter by success status (true/false)
- `from_date`: ISO format date (2024-01-01T00:00:00)
- `to_date`: ISO format date

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": 123,
      "user_id": 1,
      "event_type": "login_success",
      "auth_method": "email",
      "email_attempted": "user@example.com",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "location": null,
      "success": true,
      "failure_reason": null,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0,
  "stats": {
    "total_events": 150,
    "failed_events": 5,
    "success_rate": 0.967
  }
}
```

#### 2. Get Recent Login Events (Last 24h)
```http
GET https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/recent
Authorization: Bearer <jwt_token_or_api_key>
```

**Response:**
```json
{
  "success": true,
  "events": [...],
  "count": 12,
  "period": "24h"
}
```

#### 3. Get Login Statistics
```http
GET https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events/stats?period=week
Authorization: Bearer <jwt_token_or_api_key>
```

**Query Parameters:**
- `period`: hour, day, week, month (default: week)

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_logins": 150,
    "successful_logins": 145,
    "failed_logins": 5,
    "success_rate": 0.967,
    "by_method": {
      "email": 100,
      "microsoft": 40,
      "api_key": 10
    },
    "by_event_type": {
      "login_success": 145,
      "login_failed": 5
    },
    "unique_ips": 8,
    "period": "week",
    "since": "2024-01-08T10:00:00",
    "until": "2024-01-15T10:00:00"
  }
}
```

#### 4. Admin: Get All Login Events
```http
GET https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/admin/all-events?limit=100&user_id=1
Authorization: Bearer <admin_jwt_token>
```

Requires admin privileges. Supports same filters as regular endpoint plus `user_id`.

---

## WebSocket Real-Time Events

### Connection

```javascript
import { io } from 'socket.io-client';

// Connect with JWT token
const socket = io('https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io', {
  auth: {
    token: 'your_jwt_token_or_api_key'
  }
});

// Connection success
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // {
  //   success: true,
  //   message: 'Connected to login events stream',
  //   user_id: 1,
  //   room: 'user_1'
  // }
});

// Listen for login events
socket.on('login_event', (data) => {
  console.log('New login event:', data);
  // {
  //   event: {
  //     id: 456,
  //     event_type: 'login_success',
  //     auth_method: 'email',
  //     ip_address: '192.168.1.100',
  //     ...
  //   },
  //   timestamp: '2024-01-15T10:30:00'
  // }
});

// Listen for API key events
socket.on('api_key_event', (data) => {
  console.log('API key event:', data);
  // {
  //   event_type: 'api_key_created',
  //   api_key: {...},
  //   timestamp: '2024-01-15T10:30:00'
  // }
});

// Disconnect
socket.on('disconnect', () => {
  console.log('Disconnected');
});

// Keep-alive ping
setInterval(() => {
  socket.emit('ping');
}, 30000);

socket.on('pong', (data) => {
  console.log('Pong received:', data.timestamp);
});
```

---

## Using API Keys

### In HTTP Requests

```bash
# Using API key instead of JWT token
curl -X GET http://localhost:5000/api/analytics/login-events \
  -H "Authorization: Bearer ea_live_abc123def456..."
```

### In WebSocket Connections

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'ea_live_abc123def456...'  // Use API key instead of JWT
  }
});
```

---

## Security Best Practices

### API Key Management

1. **Never expose API keys in client-side code**
   - Store in environment variables
   - Use server-side only

2. **Use scoped permissions**
   - Grant minimal required permissions
   - Use `read` for read-only operations
   - Use `write` for mutations
   - Restrict `admin` to trusted services

3. **Set expiration dates**
   - Production keys: 90 days
   - Development keys: 30 days
   - Short-lived integrations: 7 days

4. **Rotate keys regularly**
   - Create new key before old one expires
   - Update services with new key
   - Revoke old key

5. **Monitor usage**
   - Check `request_count` and `last_used_at`
   - Revoke unused keys
   - Investigate suspicious activity

### Login Event Monitoring

1. **Set up alerts for:**
   - Multiple failed login attempts
   - Logins from new IP addresses
   - Unusual authentication patterns
   - API key usage spikes

2. **Review login events regularly**
   - Check weekly statistics
   - Investigate failed login attempts
   - Monitor geographic distribution

3. **Use WebSocket for real-time monitoring**
   - Build admin dashboard
   - Display live login events
   - Alert on suspicious activity

---

## Middleware Usage in Code

### Protecting Endpoints with API Keys

```python
from middleware import api_key_required, jwt_or_api_key_required, admin_required
from flask import g

# Require API key with read scope
@app.route('/api/data', methods=['GET'])
@api_key_required(scopes=['read'])
def get_data():
    user = g.current_user
    api_key = g.current_api_key
    return jsonify({"user_id": user.id})

# Accept JWT or API key
@app.route('/api/resource', methods=['GET'])
@jwt_or_api_key_required(scopes=['read'])
def get_resource():
    user = g.current_user
    auth_method = g.auth_method  # 'jwt' or 'api_key'
    return jsonify({"data": "..."})

# Require admin privileges
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
@admin_required()
def list_users():
    # Only admins can access
    return jsonify({"users": [...]})
```

---

## Rate Limiting

API keys have configurable rate limits (default: 1000 requests/hour).

When limit is exceeded:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "You have exceeded your rate limit of 1000 requests per hour",
  "retry_after": "2024-01-15T11:00:00"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid API key",
  "message": "The provided API key does not exist"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "message": "This API key does not have required scope: write"
}
```

### 429 Rate Limit
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "You have exceeded your rate limit"
}
```

---

## Database Schema

### ApiKey Table
```sql
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    scopes VARCHAR(500) DEFAULT 'read',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    request_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### LoginEvent Table
```sql
CREATE TABLE login_events (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    event_type VARCHAR(50) NOT NULL,
    auth_method VARCHAR(50) NOT NULL,
    email_attempted VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    location VARCHAR(255),
    api_key_id INTEGER,
    failure_reason VARCHAR(255),
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);
```

---

## Testing

### Create Test API Key
```bash
# Login to get JWT token
curl -X POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Create API key
curl -X POST https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/keys \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key", "scopes": "read,write", "expires_in_days": 30}'
```

### Test API Key
```bash
# Use API key to access endpoint
curl -X GET https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io/api/analytics/login-events \
  -H "Authorization: Bearer ea_live_abc123..."
```

### Test WebSocket
See JavaScript example above or use a WebSocket client like [websocat](https://github.com/vi/websocat).

---

## Production Deployment

### Environment Variables
```bash
# Required
JWT_SECRET_KEY=your-super-secret-key-min-32-chars-long
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Optional
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour
JWT_REFRESH_TOKEN_EXPIRES=2592000  # 30 days
```

### Running with Gunicorn + Eventlet (for WebSocket support)
```bash
pip install gunicorn eventlet
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app
```

**Note:** With eventlet worker class, use only 1 worker (-w 1) for WebSocket support.

---

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify database migrations are up to date
3. Ensure all dependencies are installed
4. Review the API endpoint documentation above

---

**Built with:**
- Flask (Web framework)
- Flask-SocketIO (WebSocket support)
- Flask-JWT-Extended (JWT authentication)
- Flask-SQLAlchemy (ORM)
- Flask-Bcrypt (Password hashing)
- MSAL (Microsoft authentication)

**Security features:**
- SHA-256 API key hashing
- Bcrypt password hashing
- JWT token-based authentication
- Scoped permissions
- Rate limiting
- Login event tracking
- Real-time security monitoring
