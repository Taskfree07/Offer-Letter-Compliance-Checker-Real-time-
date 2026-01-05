# Environment Files Configuration Guide

## Overview
This application requires environment configuration for **3 components**:
1. **Root Level** - Overall application settings
2. **Frontend (React)** - Client-side configuration
3. **Backend (Python/Flask)** - Server-side configuration

---

## 🔧 1. Root Level: `.env` (Project Root)

**Location:** `E:\Email-automation-MVP\.env`

**Purpose:** Main configuration file for local development

```env
# ==================================================
# Email Automation MVP - Environment Configuration
# ==================================================

# --------------------------------------------------
# FRONTEND CONFIGURATION (React)
# --------------------------------------------------

# API Base URL - Backend service endpoint
# For local: http://127.0.0.1:5000
# For production: https://your-backend.azurecontainerapps.io
REACT_APP_API_URL=http://127.0.0.1:5000

# --------------------------------------------------
# BACKEND CONFIGURATION (Flask)
# --------------------------------------------------

# OnlyOffice Document Server URL
# Local: http://localhost:8080
# Production: https://your-onlyoffice-container.azurecontainerapps.io
ONLYOFFICE_SERVER_URL=http://localhost:8080

# Backend Base URL (for OnlyOffice callbacks)
# Local: Auto-detected (leave empty)
# Production: https://your-backend.azurecontainerapps.io
# BACKEND_BASE_URL=

# Upload folder for document storage
UPLOAD_FOLDER=./uploads

# Flask host and port
HOST=0.0.0.0
PORT=5000

# Debug mode (NEVER enable in production)
DEBUG=False

# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

# Allowed origins for CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# --------------------------------------------------
# AZURE DEPLOYMENT (Optional - for deployment only)
# --------------------------------------------------

# Azure Container Registry (from Azure Portal)
# ACR_REGISTRY_URL=yourregistry.azurecr.io
# ACR_USERNAME=yourregistry
# ACR_PASSWORD=your_password

# Azure Resource Configuration
# RESOURCE_GROUP=your-resource-group
# LOCATION=eastus
# CONTAINER_APP_ENVIRONMENT=your-container-env
```

---

## 🎨 2. Frontend: `.env.production`

**Location:** `E:\Email-automation-MVP\.env.production`

**Purpose:** Frontend production build configuration (for deployment)

```env
# Frontend Production Environment Variables

# Microsoft OAuth Configuration
# Get these from Azure App Registration Portal: https://portal.azure.com
REACT_APP_MICROSOFT_CLIENT_ID=your-client-id-here
REACT_APP_MICROSOFT_TENANT_ID=your-tenant-id-here
REACT_APP_REDIRECT_URI=https://your-frontend.azurecontainerapps.io/auth/callback

# API Base URLs
# Production backend URL
REACT_APP_API_URL=https://your-backend.azurecontainerapps.io

# OnlyOffice server URL (production)
REACT_APP_ONLYOFFICE_URL=https://your-onlyoffice.azurecontainerapps.io
```

**For Local Development:** Create `.env.local` (optional)
```env
# Frontend Local Development (optional - auto-detection works)
REACT_APP_API_URL=http://127.0.0.1:5000
```

---

## 🐍 3. Backend: `python-nlp/.env`

**Location:** `E:\Email-automation-MVP\python-nlp\.env`

**Purpose:** Backend Flask application configuration

```env
# Backend Environment Variables

# --------------------------------------------------
# Microsoft OAuth Configuration
# --------------------------------------------------
# Get these from Azure App Registration Portal
# Guide: https://portal.azure.com → App Registrations
MICROSOFT_CLIENT_ID=your-client-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-here
MICROSOFT_TENANT_ID=your-tenant-id-here

# --------------------------------------------------
# JWT Configuration (Authentication Tokens)
# --------------------------------------------------
# IMPORTANT: Generate a strong random secret key for production!
# Use: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour in seconds
JWT_REFRESH_TOKEN_EXPIRES=2592000  # 30 days in seconds

# --------------------------------------------------
# Database Configuration
# --------------------------------------------------
# SQLite for local development
DATABASE_URL=sqlite:///email_automation.db
SQLALCHEMY_TRACK_MODIFICATIONS=False

# For PostgreSQL (production):
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# --------------------------------------------------
# Flask Configuration
# --------------------------------------------------
HOST=0.0.0.0
PORT=5000
DEBUG=False
FLASK_ENV=production

# --------------------------------------------------
# ONLYOFFICE Configuration
# --------------------------------------------------
# Local Docker: http://localhost:8080
# Production: https://onlyoffice.azurecontainerapps.io
ONLYOFFICE_SERVER_URL=http://localhost:8080
UPLOAD_FOLDER=./uploads

# Backend base URL (optional - auto-detected)
# Only set if OnlyOffice can't reach backend automatically
# BACKEND_BASE_URL=https://your-backend.azurecontainerapps.io

# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------
# Comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# For production, add your deployed frontend URL:
# ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.azurecontainerapps.io
```

---

## 📋 Quick Setup Guide for Team Members

### For Local Development:

1. **Copy example files:**
   ```bash
   # Root level
   cp .env.example .env
   
   # Backend
   cd python-nlp
   cp .env.example .env  # Or create from template above
   ```

2. **Configure Microsoft OAuth (required for login):**
   - Go to [Azure Portal](https://portal.azure.com) → App Registrations
   - Create or use existing app registration
   - Copy Client ID, Tenant ID, and create a Client Secret
   - Update both `.env.production` (frontend) and `python-nlp/.env` (backend)

3. **Configure JWT Secret (security critical!):**
   ```bash
   # Generate a secure secret key
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   # Copy output to JWT_SECRET_KEY in python-nlp/.env
   ```

4. **Start OnlyOffice (Docker):**
   ```bash
   docker-compose up -d
   ```

5. **Start Backend:**
   ```bash
   cd python-nlp
   python app.py
   ```

6. **Start Frontend:**
   ```bash
   npm start
   ```

### For Production Deployment:

1. **Update `.env.production`:**
   - Set all REACT_APP_* variables with production URLs
   - Configure Microsoft OAuth redirect URI

2. **Update `python-nlp/.env`:**
   - Change all localhost URLs to production URLs
   - Update ALLOWED_ORIGINS with production frontend URL
   - **IMPORTANT:** Generate new JWT_SECRET_KEY
   - Consider using PostgreSQL instead of SQLite

3. **Update root `.env`:**
   - Add Azure Container Registry credentials
   - Set production URLs for all services

---

## 🔐 Security Checklist

### NEVER commit these values to Git:
- ✅ `.env` files are in `.gitignore`
- ❌ NEVER commit real credentials
- ❌ NEVER commit production secrets

### Required for Production:
- [ ] Change `JWT_SECRET_KEY` (generate new random key)
- [ ] Update Microsoft OAuth credentials
- [ ] Set `DEBUG=False`
- [ ] Configure proper CORS origins
- [ ] Use PostgreSQL instead of SQLite (recommended)
- [ ] Use environment variables or Azure Key Vault for secrets

### Password/Secret Generation:
```bash
# Generate JWT Secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate API Key
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🌐 URL Reference Table

| Environment | Frontend | Backend | OnlyOffice |
|-------------|----------|---------|------------|
| **Local Dev** | `http://localhost:3000` | `http://127.0.0.1:5000` | `http://localhost:8080` |
| **Production** | `https://frontend.azurecontainerapps.io` | `https://backend.azurecontainerapps.io` | `https://onlyoffice.azurecontainerapps.io` |

---

## 📝 Environment Variables Reference

### Frontend (React) - Prefix: `REACT_APP_`
| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | No* | Backend URL (auto-detected if not set) |
| `REACT_APP_MICROSOFT_CLIENT_ID` | Yes | Microsoft OAuth Client ID |
| `REACT_APP_MICROSOFT_TENANT_ID` | Yes | Microsoft OAuth Tenant ID |
| `REACT_APP_REDIRECT_URI` | Yes | OAuth redirect URL |
| `REACT_APP_ONLYOFFICE_URL` | No* | OnlyOffice server URL |

*Auto-detection works for local development

### Backend (Flask)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MICROSOFT_CLIENT_ID` | Yes | - | OAuth Client ID |
| `MICROSOFT_CLIENT_SECRET` | Yes | - | OAuth Client Secret |
| `MICROSOFT_TENANT_ID` | Yes | - | OAuth Tenant ID |
| `JWT_SECRET_KEY` | Yes | (insecure default) | JWT signing key |
| `JWT_ACCESS_TOKEN_EXPIRES` | No | 3600 | Token expiry (seconds) |
| `JWT_REFRESH_TOKEN_EXPIRES` | No | 2592000 | Refresh token expiry |
| `DATABASE_URL` | No | SQLite | Database connection |
| `ONLYOFFICE_SERVER_URL` | No | localhost:8080 | OnlyOffice URL |
| `BACKEND_BASE_URL` | No | Auto-detect | Backend callback URL |
| `ALLOWED_ORIGINS` | No | localhost | CORS origins |
| `HOST` | No | 0.0.0.0 | Flask bind host |
| `PORT` | No | 5000 | Flask port |
| `DEBUG` | No | False | Debug mode |

---

## 🚀 Testing Your Configuration

### Test Local Setup:
```bash
# 1. Check OnlyOffice is running
curl http://localhost:8080

# 2. Check Backend is running
curl http://127.0.0.1:5000/health

# 3. Check Frontend loads
# Open browser: http://localhost:3000
```

### Test Production Setup:
```bash
# 1. Check all services are accessible
curl https://your-backend.azurecontainerapps.io/health
curl https://your-onlyoffice.azurecontainerapps.io

# 2. Test CORS configuration
# Should work from your frontend domain
```

---

## 🆘 Troubleshooting

### Backend can't connect to OnlyOffice:
- Check `ONLYOFFICE_SERVER_URL` is correct
- For Docker on Windows/Mac: Use `http://host.docker.internal:8080`
- For Docker on Linux: Use your machine's IP address

### Frontend can't reach Backend:
- Check `REACT_APP_API_URL` matches backend URL
- Verify `ALLOWED_ORIGINS` in backend includes frontend URL
- Check CORS headers in browser console

### Authentication not working:
- Verify Microsoft OAuth credentials match in Azure Portal
- Check redirect URI is configured in Azure App Registration
- Ensure `JWT_SECRET_KEY` is set and consistent

### OnlyOffice callbacks failing:
- Check `BACKEND_BASE_URL` is accessible from OnlyOffice container
- For Docker, may need `host.docker.internal` instead of `localhost`
- Verify firewall/network allows OnlyOffice → Backend communication

---

## 📞 Need Help?

Contact your team lead or refer to:
- [QUICK_START.md](./QUICK_START.md) - Setup instructions
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment details
- [README.md](./README.md) - Project overview

---

**Last Updated:** December 30, 2025
