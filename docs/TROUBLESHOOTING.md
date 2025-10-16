# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" Error

**Symptoms:**
- Error appears when clicking "Import Offer Letter"
- Message says "Error Loading Editor"
- Mentions "Setup Instructions" about Docker

**Root Cause:**
ONLYOFFICE Document Server is either not running or still initializing.

**Solution:**

#### Step 1: Check if Docker is Running
```bash
docker ps
```

You should see a container named `onlyoffice-docs` in the list.

**If you DON'T see the container:**
```bash
# Start ONLYOFFICE
docker-compose up -d

# Wait 1-2 minutes for it to fully start
```

**If you DO see the container:**
The container might be running but ONLYOFFICE is still initializing. Wait 1-2 minutes and try again.

#### Step 2: Verify ONLYOFFICE is Accessible
Open your browser and navigate to:
```
http://localhost:8080
```

You should see the ONLYOFFICE welcome page or documentation.

**If you see an error page or nothing loads:**
- ONLYOFFICE is still starting up (wait 1-2 more minutes)
- Docker might have issues - try restarting:
  ```bash
  docker-compose restart
  ```

#### Step 3: Check the ONLYOFFICE API Endpoint
Open your browser and go to:
```
http://localhost:8080/web-apps/apps/api/documents/api.js
```

You should see JavaScript code (starts with `/*!`). If you see HTML or an error, ONLYOFFICE isn't ready yet.

#### Step 4: Retry the Import
Once ONLYOFFICE is fully running:
1. Refresh your browser page (Ctrl+F5 or Cmd+Shift+R)
2. Click "Import Offer Letter" again
3. Select your .docx file

**The component now has automatic retry logic:**
- It will attempt to load ONLYOFFICE 3 times
- It waits 3 seconds between retries
- If all retries fail, you'll get a detailed error message

---

### 2. "TypeError: vars.forEach is not a function" Error

**Status:** ✅ FIXED (as of latest update)

**Symptoms:**
- Error appears in browser console
- Variables panel doesn't populate
- Document loads but variables don't show

**What Was Wrong:**
Backend was inconsistently returning variables as arrays `[]` vs objects `{}`.

**Fix Applied:**
All backend endpoints now consistently return variables as objects:
- `app.py` lines 1116, 1258, 1279, 1315 updated
- Frontend `onVariablesUpdate` callback handles both formats

**If you still see this error:**
1. Make sure you restarted the Flask backend after pulling latest changes
2. Clear browser cache (Ctrl+Shift+Delete)
3. Reload the page

---

### 3. GLiNER Warnings: "GLiNER processing failed, continuing without entity types"

**Symptoms:**
- See warnings in backend console
- Message: `'str' object has no attribute 'get'`
- Variables still work but don't have entity types

**Root Cause:**
This is a known non-critical issue with GLiNER integration. The system continues to work normally.

**Impact:**
- ✅ Variables are still detected and extracted
- ❌ Entity types (person, date, money, etc.) may not be assigned
- ✅ Real-time editing still works
- ✅ Content Controls still protect variables

**Fix in Progress:**
We're investigating the GLiNER result format. For now, the system gracefully falls back to basic variable extraction.

---

### 4. Backend Not Accessible (Port 5000)

**Symptoms:**
- Error: "Backend returned non-JSON response"
- Can't import documents
- Frontend shows connection errors

**Solution:**

#### Check if Backend is Running
```bash
# Windows
tasklist | findstr python

# Linux/Mac
ps aux | grep python
```

Look for a Python process using significant memory (usually 80-100MB+).

#### Start the Backend
```bash
cd python-nlp
python app.py
```

You should see:
```
INFO:__main__:GLiNER service loaded successfully
INFO:__main__:Starting NLP API server on 0.0.0.0:5000
```

#### Verify Backend is Accessible
Open browser and go to:
```
http://localhost:5000/health
```

You should see JSON:
```json
{
  "status": "healthy",
  "service": "NLP Entity Extraction API",
  "nlp_service_available": true
}
```

---

### 5. Frontend Not Loading (Port 3000)

**Symptoms:**
- Blank page
- "This site can't be reached"
- Connection refused error

**Solution:**

```bash
# Make sure you're in the project root
npm start
```

Wait for:
```
Compiled successfully!
You can now view the app in the browser.
Local: http://localhost:3000
```

---

### 6. ONLYOFFICE Document Won't Load After Upload

**Symptoms:**
- Document uploads successfully
- Shows "Loading ONLYOFFICE Editor..." indefinitely
- No error message

**Solution:**

#### Check Browser Console
Press F12 and look at the Console tab for errors.

Common issues:
- **CORS errors**: Backend CORS is misconfigured
- **Network errors**: ONLYOFFICE can't reach Flask backend
- **Timeout errors**: Document is too large

#### Verify Document was Uploaded
Check the uploads folder:
```bash
ls python-nlp/uploads/
```

You should see .docx files with hash names like `abc123def456.docx`.

#### Check ONLYOFFICE Logs
```bash
docker-compose logs onlyoffice-documentserver
```

Look for errors related to document loading or network connectivity.

---

### 7. Variables Not Updating in Real-time

**Symptoms:**
- Edit a variable in the panel
- Change doesn't appear in ONLYOFFICE document
- Need to refresh to see changes

**Solution:**

#### Check Console Logs
Look for these messages when you edit a variable:
```
📝 Updating variable [Variable_Name] to "new value" in real-time
✅ Variable [Variable_Name] updated successfully
```

**If you see errors instead:**
- ONLYOFFICE JavaScript API might not be initialized
- Check if `window.onlyofficeEditor` exists in browser console
- Reload the page and try again

#### Fallback Behavior
If real-time update fails, the system automatically reloads the document with updated variables. This is slower but ensures changes are applied.

---

### 8. Docker Issues

#### "Cannot connect to the Docker daemon"
```bash
# Start Docker Desktop (Windows/Mac)
# Or start Docker service (Linux):
sudo systemctl start docker
```

#### "Port 8080 is already allocated"
Something else is using port 8080.

```bash
# Find what's using the port (Windows)
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>

# Then restart ONLYOFFICE
docker-compose restart
```

#### "Image pull failed" or "No internet connection"
```bash
# Check Docker can access the internet
docker run --rm alpine ping -c 3 google.com

# If it fails, check your Docker network settings
```

---

## Quick Diagnostic Checklist

Before importing a document, verify:

- [ ] Docker is running: `docker ps`
- [ ] ONLYOFFICE is accessible: http://localhost:8080
- [ ] Backend is running: http://localhost:5000/health
- [ ] Frontend is running: http://localhost:3000
- [ ] No errors in browser console (F12)
- [ ] No errors in backend console

---

## Getting Help

If you encounter issues not covered here:

1. **Check browser console** (F12) for error messages
2. **Check backend console** where `python app.py` is running
3. **Check Docker logs**: `docker-compose logs`
4. **Try the nuclear option**:
   ```bash
   # Stop everything
   docker-compose down
   # Ctrl+C to stop backend
   # Ctrl+C to stop frontend

   # Start fresh
   docker-compose up -d
   cd python-nlp && python app.py &
   npm start
   ```

5. **Clear browser cache and reload** (Ctrl+Shift+R)

---

## Prevention Tips

**To avoid most issues:**

1. **Always start in this order:**
   ```bash
   # Terminal 1: Start Docker first
   docker-compose up -d
   # Wait 2 minutes for ONLYOFFICE to fully start

   # Terminal 2: Start backend
   cd python-nlp
   python app.py
   # Wait for "Starting NLP API server" message

   # Terminal 3: Start frontend
   npm start
   # Wait for "Compiled successfully"
   ```

2. **Don't rush the startup**
   - Give ONLYOFFICE 1-2 minutes to fully initialize
   - Wait for backend to show "Starting NLP API server"
   - Wait for frontend to show "Compiled successfully"

3. **Check services before importing**
   - Visit http://localhost:8080 (should load)
   - Visit http://localhost:5000/health (should return JSON)
   - Visit http://localhost:3000 (should show app)

4. **Keep Docker running**
   - Don't stop Docker while working
   - If you need to restart Docker, restart backend too

---

## Log File Locations

- **Frontend**: Browser console (F12)
- **Backend**: Terminal where `python app.py` is running
- **ONLYOFFICE**: `docker-compose logs onlyoffice-documentserver`
- **Docker**: `docker logs onlyoffice-docs`

---

## Environment Check Commands

```bash
# Check all services at once
echo "=== Docker ===" && docker ps && \
echo "\n=== Backend ===" && curl -s http://localhost:5000/health && \
echo "\n=== ONLYOFFICE ===" && curl -s http://localhost:8080 | head -n 1 && \
echo "\n=== Frontend ===" && curl -s http://localhost:3000 | head -n 1
```

This will show you at a glance which services are running correctly.
