# Quick Restart Guide

## When Docker Has Been Closed/Restarted

Follow these steps **IN ORDER**:

### Step 1: Start Docker & ONLYOFFICE
```bash
docker-compose up -d
```

**IMPORTANT:** Wait 2 full minutes! ONLYOFFICE needs time to initialize.

You can verify it's ready by visiting: http://localhost:8080

### Step 2: Verify ONLYOFFICE is Ready
Run this command:
```bash
curl http://localhost:8080/web-apps/apps/api/documents/api.js
```

You should see JavaScript code starting with `/*!`

**OR** open your browser and go to: http://localhost:8080

### Step 3: Check/Restart Backend (if needed)
The Flask backend should still be running. Check with:
```bash
curl http://localhost:5000/health
```

If you get an error, restart it:
```bash
cd python-nlp
python app.py
```

### Step 4: Refresh Frontend
1. Go to your browser where the app is open
2. Press **Ctrl+Shift+R** (hard refresh to clear cache)
3. Or close the tab and open http://localhost:3000 in a new tab

### Step 5: Try Importing Again
Click "Import Offer Letter" and select your .docx file.

The component will now automatically retry 3 times if ONLYOFFICE is still loading!

---

## Quick Check: Is Everything Running?

Run this command to check all services at once:

```bash
echo "=== Docker Container ===" && docker ps | grep onlyoffice && echo "" && echo "=== ONLYOFFICE Web UI ===" && curl -s -o nul -w "HTTP Status: %{http_code}" http://localhost:8080 && echo "" && echo "" && echo "=== ONLYOFFICE API ===" && curl -s http://localhost:8080/web-apps/apps/api/documents/api.js | head -n 1 && echo "" && echo "=== Backend Health ===" && curl -s http://localhost:5000/health
```

You should see:
- ✅ Container running (Up X minutes)
- ✅ HTTP Status: 302 or 200
- ✅ JavaScript comment: `/*!`
- ✅ JSON response with "healthy" status

---

## If You Still Get Errors

### Error: "Cannot connect to Docker daemon"
Docker Desktop isn't running.

**Fix:**
- Open Docker Desktop application
- Wait for it to say "Docker Desktop is running"
- Then run `docker-compose up -d`

### Error: Port 8080 already in use
Something else is using port 8080.

**Fix:**
```bash
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill it (replace <PID> with the actual number)
taskkill /F /PID <PID>

# Then restart
docker-compose restart
```

### Error: "Unexpected token '<'"
ONLYOFFICE is still starting up.

**Fix:**
- Wait 2 more minutes
- Refresh your browser (Ctrl+Shift+R)
- The component will automatically retry 3 times

---

## Common Mistakes to Avoid

❌ **Don't do this:**
- Starting frontend before ONLYOFFICE is ready
- Trying to import immediately after `docker-compose up`
- Not waiting for initialization

✅ **Do this instead:**
- Run `docker-compose up -d`
- Wait 2 full minutes (go get coffee ☕)
- Verify http://localhost:8080 loads
- THEN use the app

---

## Pro Tip: Leave Docker Running

To avoid this issue entirely:
- **Keep Docker Desktop running** while developing
- Don't close Docker Desktop when closing your browser
- Only restart Docker if you absolutely need to
- Docker uses minimal resources when containers are idle

---

## Emergency "Nuclear Option"

If nothing works, do a complete reset:

```bash
# Stop everything
docker-compose down
# Close backend terminal (Ctrl+C)
# Close frontend terminal (Ctrl+C)

# Remove all ONLYOFFICE data (optional - only if truly stuck)
# docker volume rm email-automation-mvp_onlyoffice_data
# docker volume rm email-automation-mvp_onlyoffice_logs

# Start fresh
docker-compose up -d

# Wait 2-3 minutes

# Start backend
cd python-nlp
python app.py

# In another terminal, start frontend
npm start

# Open browser: http://localhost:3000
```

This gives you a completely fresh start.
