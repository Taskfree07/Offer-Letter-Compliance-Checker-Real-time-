# Deployment Guide - Compliance Checker API

**Last Updated**: January 13, 2026
**API Version**: 2.0

---

## Table of Contents

1. [Production Deployment Options](#production-deployment-options)
2. [Local Development Setup](#local-development-setup)
3. [Azure Deployment](#azure-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Frontend Integration](#frontend-integration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Production Deployment Options

### Option 1: Azure App Service (Recommended)

**Advantages**:
- Managed service (no server maintenance)
- Auto-scaling capabilities
- Built-in load balancing
- Easy CI/CD integration
- Better RAM for Phi-3 LLM

**Requirements**:
- Azure subscription
- Minimum: Standard S2 tier (3.5GB RAM)
- Recommended: Premium P1v2 tier (7GB RAM) for Phi-3

**Estimated Cost**: $73-146/month

### Option 2: AWS EC2

**Advantages**:
- Full control over environment
- Wide range of instance types
- Good for GPU workloads

**Requirements**:
- AWS account
- Minimum: t3.large (8GB RAM)
- Recommended: t3.xlarge (16GB RAM)

**Estimated Cost**: $60-120/month

### Option 3: DigitalOcean Droplet

**Advantages**:
- Simple pricing
- Easy to set up
- Good for small-medium scale

**Requirements**:
- DigitalOcean account
- Minimum: 8GB RAM droplet
- Recommended: 16GB RAM droplet

**Estimated Cost**: $48-96/month

---

## Local Development Setup

### Prerequisites

```bash
# Python 3.11+
python --version

# pip
pip --version

# Git
git --version
```

### Step 1: Clone Repository

```bash
cd /path/to/project
git clone <repository-url>
cd Offer-Letter-Compliance-Checker-Real-time-/python-nlp
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/Mac)
source .venv/bin/activate
```

### Step 3: Install Dependencies

```bash
# Install requirements
pip install -r requirements.txt

# Verify installation
pip list
```

### Step 4: Load State Data

```bash
# Load all 14 states into vector database
python load_all_states.py --data-dir "data/Data json"

# Expected output:
# [SUCCESS] Loaded 14 states with 98 total laws
```

### Step 5: Start API Server

```bash
# Development mode (with auto-reload)
python api_v2.py

# Production mode (with Gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 api_v2:app
```

### Step 6: Verify Installation

```bash
# Test health endpoint
curl http://localhost:5000/api/v2/health

# Expected response:
# {"status": "healthy", "version": "2.0", ...}
```

---

## Azure Deployment

### Step 1: Prepare Application

Create `requirements.txt` with production dependencies:

```txt
# Core Framework
Flask==3.1.2
flask-cors==5.0.0
gunicorn==21.2.0

# NLP & ML
sentence-transformers==2.2.2
transformers==4.36.0
torch==2.1.0
chromadb==0.4.18

# Document Processing
PyPDF2==3.0.1
python-docx==1.1.0

# Optional: Caching
flask-caching==2.3.1
redis==5.0.1
```

### Step 2: Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name ComplianceCheckerRG --location eastus

# Create App Service plan (Premium P1v2 - 7GB RAM)
az appservice plan create \
  --name ComplianceCheckerPlan \
  --resource-group ComplianceCheckerRG \
  --sku P1v2 \
  --is-linux

# Create web app
az webapp create \
  --name compliance-checker-api \
  --resource-group ComplianceCheckerRG \
  --plan ComplianceCheckerPlan \
  --runtime "PYTHON|3.11"
```

### Step 3: Configure Application Settings

```bash
# Set Python version
az webapp config set \
  --resource-group ComplianceCheckerRG \
  --name compliance-checker-api \
  --linux-fx-version "PYTHON|3.11"

# Set startup command
az webapp config set \
  --resource-group ComplianceCheckerRG \
  --name compliance-checker-api \
  --startup-file "startup.sh"

# Configure app settings
az webapp config appsettings set \
  --resource-group ComplianceCheckerRG \
  --name compliance-checker-api \
  --settings \
    FLASK_ENV=production \
    MAX_CONTENT_LENGTH=5242880 \
    WORKERS=4
```

### Step 4: Create Startup Script

Create `startup.sh`:

```bash
#!/bin/bash

# Load state data on startup
python load_all_states.py --data-dir "data/Data json"

# Start Gunicorn with 4 workers
gunicorn -w 4 -b 0.0.0.0:8000 api_v2:app --timeout 120
```

Make executable:
```bash
chmod +x startup.sh
```

### Step 5: Deploy Code

```bash
# Deploy using Azure CLI
az webapp up \
  --resource-group ComplianceCheckerRG \
  --name compliance-checker-api \
  --runtime "PYTHON|3.11"

# Or deploy using Git
git remote add azure <azure-git-url>
git push azure main
```

### Step 6: Configure Custom Domain (Optional)

```bash
# Map custom domain
az webapp config hostname add \
  --resource-group ComplianceCheckerRG \
  --webapp-name compliance-checker-api \
  --hostname api.yourdomain.com

# Enable HTTPS
az webapp config ssl bind \
  --resource-group ComplianceCheckerRG \
  --name compliance-checker-api \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

### Step 7: Monitor Deployment

```bash
# View logs
az webapp log tail \
  --resource-group ComplianceCheckerRG \
  --name compliance-checker-api

# Test endpoint
curl https://compliance-checker-api.azurewebsites.net/api/v2/health
```

---

## Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Load state data
RUN python load_all_states.py --data-dir "data/Data json"

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "api_v2:app", "--timeout", "120"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - MAX_CONTENT_LENGTH=5242880
    volumes:
      - ./vector_store:/app/vector_store
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### Step 3: Build and Run

```bash
# Build image
docker build -t compliance-checker-api .

# Run container
docker run -d -p 5000:5000 --name compliance-api compliance-checker-api

# Or use docker-compose
docker-compose up -d

# View logs
docker logs -f compliance-api

# Test
curl http://localhost:5000/api/v2/health
```

### Step 4: Deploy to Docker Hub

```bash
# Tag image
docker tag compliance-checker-api yourusername/compliance-checker-api:v2.0

# Push to Docker Hub
docker push yourusername/compliance-checker-api:v2.0

# Pull and run on production server
docker pull yourusername/compliance-checker-api:v2.0
docker run -d -p 5000:5000 yourusername/compliance-checker-api:v2.0
```

---

## Frontend Integration

### React Integration

```javascript
// src/services/complianceAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v2';

class ComplianceAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async checkCompliance(documentText, state, options = {}) {
    try {
      const response = await this.client.post('/compliance-check', {
        document_text: documentText,
        state: state,
        options: {
          min_confidence: options.minConfidence || 0.3
        }
      });
      return response.data;
    } catch (error) {
      console.error('Compliance check failed:', error);
      throw error;
    }
  }

  async getSupportedStates() {
    const response = await this.client.get('/states');
    return response.data;
  }

  async analyzeLaws(documentText, state, topK = 5) {
    const response = await this.client.post('/analyze-laws', {
      document_text: documentText,
      state: state,
      top_k: topK
    });
    return response.data;
  }
}

export default new ComplianceAPI();
```

### React Component Example

```javascript
// src/components/ComplianceChecker.jsx
import React, { useState } from 'react';
import ComplianceAPI from '../services/complianceAPI';

function ComplianceChecker() {
  const [documentText, setDocumentText] = useState('');
  const [selectedState, setSelectedState] = useState('CA');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ComplianceAPI.checkCompliance(
        documentText,
        selectedState,
        { minConfidence: 0.3 }
      );
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compliance-checker">
      <h1>Offer Letter Compliance Checker</h1>

      <div className="form-group">
        <label>State:</label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <option value="CA">California</option>
          <option value="NY">New York</option>
          <option value="TX">Texas</option>
          {/* Add all 14 states */}
        </select>
      </div>

      <div className="form-group">
        <label>Offer Letter Text:</label>
        <textarea
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          rows={15}
          placeholder="Paste your offer letter here..."
        />
      </div>

      <button onClick={handleCheck} disabled={loading || !documentText}>
        {loading ? 'Analyzing...' : 'Check Compliance'}
      </button>

      {error && (
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="results">
          <h2>Analysis Results</h2>

          <div className={`summary ${results.summary.is_compliant ? 'compliant' : 'non-compliant'}`}>
            <h3>
              {results.summary.is_compliant ? '✓ Compliant' : '✗ Non-Compliant'}
            </h3>
            <p>Risk Level: {results.summary.overall_risk}</p>
            <p>Total Violations: {results.total_violations}</p>
          </div>

          {results.violations && results.violations.length > 0 && (
            <div className="violations">
              <h3>Violations Found</h3>
              {results.violations.map((v, idx) => (
                <div key={idx} className={`violation ${v.severity}`}>
                  <h4>{v.topic}</h4>
                  <p>{v.message}</p>
                  <div className="meta">
                    <span>Severity: {v.severity}</span>
                    <span>Confidence: {(v.confidence * 100).toFixed(0)}%</span>
                    <span>Citation: {v.law_citation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComplianceChecker;
```

### Environment Variables

Create `.env.production`:

```bash
REACT_APP_API_URL=https://compliance-checker-api.azurewebsites.net/api/v2
```

---

## Monitoring and Maintenance

### Health Monitoring

Create a monitoring script `monitor.py`:

```python
import requests
import time
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_URL = "http://localhost:5000/api/v2/health"
CHECK_INTERVAL = 60  # seconds

def check_health():
    try:
        response = requests.get(API_URL, timeout=10)

        if response.status_code == 200:
            data = response.json()
            logger.info(f"[{datetime.now()}] API Healthy - {data['database']['total_laws']} laws loaded")
            return True
        else:
            logger.error(f"[{datetime.now()}] API Unhealthy - Status: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"[{datetime.now()}] Health check failed: {e}")
        return False

def main():
    logger.info("Starting health monitoring...")

    while True:
        check_health()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
```

Run as background service:
```bash
nohup python monitor.py > monitor.log 2>&1 &
```

### Performance Monitoring

Enable Application Insights (Azure):

```python
# Add to api_v2.py
from applicationinsights.flask.ext import AppInsights

app = Flask(__name__)
app.config['APPINSIGHTS_INSTRUMENTATIONKEY'] = os.getenv('APPINSIGHTS_KEY')
appinsights = AppInsights(app)
```

### Log Management

Configure production logging:

```python
# logging_config.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    # File handler
    file_handler = RotatingFileHandler(
        'logs/api.log',
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))

    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Compliance Checker API startup')
```

### Database Backup

Backup vector database regularly:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/vector_store"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
cp -r vector_store "$BACKUP_DIR/vector_store_$TIMESTAMP"

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -t | tail -n +8 | xargs rm -rf

echo "Backup completed: vector_store_$TIMESTAMP"
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Security Recommendations

### 1. API Authentication

Add API key validation:

```python
# middleware/auth.py
from functools import wraps
from flask import request, jsonify
import os

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')

        if not api_key or api_key != os.getenv('API_KEY'):
            return jsonify({'error': 'Invalid API key'}), 401

        return f(*args, **kwargs)
    return decorated_function

# Usage
@app.route('/api/v2/compliance-check', methods=['POST'])
@require_api_key
def compliance_check():
    # ...
```

### 2. Rate Limiting

```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)

@app.route('/api/v2/compliance-check', methods=['POST'])
@limiter.limit("10 per minute")
def compliance_check():
    # ...
```

### 3. HTTPS Only

Configure HTTPS redirect:

```python
from flask_talisman import Talisman

Talisman(app, force_https=True)
```

### 4. CORS Configuration

Restrict origins in production:

```python
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourdomain.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

## Troubleshooting

### Issue: API Times Out on First Request

**Solution**: Pre-warm services on startup

```python
# api_v2.py - Add at end of file
if __name__ == "__main__":
    # Pre-warm services
    print("Pre-warming services...")
    _ = get_rag_service()
    _ = get_analyzer()
    print("Services ready!")

    app.run(host='0.0.0.0', port=5000, debug=False)
```

### Issue: Out of Memory on Production

**Solution**: Reduce model size or increase RAM

```python
# Use smaller embedding model
embedding_model = "sentence-transformers/paraphrase-MiniLM-L3-v2"  # 61MB vs 90MB
```

### Issue: Slow Response Times

**Solution**: Enable caching

```bash
# Use api_v2_optimized.py with Redis
docker run -d -p 6379:6379 redis:alpine
python api_v2_optimized.py
```

---

## Checklist for Production

- [ ] Environment variables configured
- [ ] Database backup strategy implemented
- [ ] Logging configured and tested
- [ ] Health monitoring enabled
- [ ] HTTPS configured
- [ ] API authentication enabled
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] Error tracking enabled (Sentry/AppInsights)
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Frontend integrated and tested

---

## Support

For deployment assistance:
- **Documentation**: See API_DOCUMENTATION.md
- **Test Results**: See API_TEST_RESULTS.md
- **Issues**: Create GitHub issue

---

**Last Updated**: January 13, 2026
**Deployment Version**: 2.0
