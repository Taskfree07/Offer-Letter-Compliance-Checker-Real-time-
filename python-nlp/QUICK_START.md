# Quick Start Guide

Get the Compliance Checker API running in 5 minutes!

---

## Prerequisites

- Python 3.11+
- 8GB RAM minimum
- Internet connection (for first-time setup)

---

## Step 1: Activate Virtual Environment

```bash
# Navigate to project
cd python-nlp

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source .venv/bin/activate
```

---

## Step 2: Verify Data is Loaded

```bash
# Check if vector database exists
ls vector_store/

# If empty, load data:
python load_all_states.py --data-dir "data/Data json"

# Expected output:
# [SUCCESS] Loaded 14 states with 98 total laws
```

---

## Step 3: Start API Server

```bash
# Start the API
python api_v2.py

# Wait for startup message:
# "Running on http://127.0.0.1:5000"
```

**Note**: First startup takes 15-20 seconds to load embedding models.

---

## Step 4: Test the API

Open a new terminal and test:

```bash
# Test 1: Health check
curl http://localhost:5000/api/v2/health

# Expected: {"status": "healthy", ...}

# Test 2: Get states
curl http://localhost:5000/api/v2/states

# Expected: {"total_states": 14, "states": [...]}

# Test 3: Check compliance
curl -X POST http://localhost:5000/api/v2/compliance-check \
  -H "Content-Type: application/json" \
  -d '{
    "document_text": "You agree not to compete for 2 years after employment ends.",
    "state": "CA"
  }'

# Expected: Violation detected for non-compete in CA
```

---

## Step 5: Run End-to-End Tests (Optional)

```bash
# Run comprehensive test suite
python test_api_e2e.py

# Press Enter when prompted
# Expected: 7/8 tests passed
```

---

## Common Issues

### Issue 1: "ModuleNotFoundError"

**Solution**: Install missing dependency
```bash
pip install <module-name>
```

### Issue 2: "Address already in use"

**Solution**: Kill process on port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Issue 3: API times out on first request

**Solution**: This is normal! First request initializes services (15-20s). Subsequent requests are fast (<1s).

---

## Next Steps

1. **Read Full Documentation**: See `API_DOCUMENTATION.md`
2. **View Test Results**: See `API_TEST_RESULTS.md`
3. **Deploy to Production**: See `DEPLOYMENT_GUIDE.md`
4. **Integrate with Frontend**: See examples in `DEPLOYMENT_GUIDE.md`

---

## Quick Reference

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v2/health` | Health check |
| GET | `/api/v2/states` | List supported states |
| POST | `/api/v2/compliance-check` | Full compliance analysis |
| POST | `/api/v2/analyze-laws` | Query relevant laws |
| POST | `/api/v2/validate-document` | Quick validation |

### Supported States (14)

AZ, CA, CO, FL, IL, MA, MI, NC, NJ, NY, OR, TX, VA, WA

### Topics Covered

- Non-compete agreements
- Salary history inquiries
- Background checks
- Drug screening
- Arbitration clauses
- Pay transparency
- At-will employment

---

## Stop the API

```bash
# Press Ctrl+C in the terminal running the API
```

---

**Need Help?**
- Documentation: `API_DOCUMENTATION.md`
- Test Results: `API_TEST_RESULTS.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
