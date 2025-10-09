# How to Restart the Backend

The new `/api/docx-to-html` endpoint was added to the code, but Flask needs to be restarted to load it.

## Option 1: Restart from your terminal

If you're running Flask in a terminal/command prompt:

1. Press `Ctrl+C` to stop the Flask server
2. Restart it with:
   ```bash
   cd python-nlp
   python app.py
   ```
   OR if using a virtual environment:
   ```bash
   cd python-nlp
   .venv\Scripts\activate  # On Windows
   python app.py
   ```

## Option 2: Kill and restart the process

If you can't find the terminal:

**Windows:**
```bash
# Kill the processes
taskkill /PID 27500 /F
taskkill /PID 14796 /F

# Restart
cd python-nlp
python app.py
```

**After Restarting:**

Verify the endpoint is available:
```bash
curl http://127.0.0.1:5000/api/docx-health
```

You should see:
```json
{"available":true,"message":"Word document service ready"}
```

Then verify the new endpoint exists:
```bash
curl -X POST http://127.0.0.1:5000/api/docx-to-html
```

You should see an error about "No file provided" (which is good - it means the endpoint exists):
```json
{"error":"No file provided"}
```

## Troubleshooting

If the backend won't start:

1. **Check if port 5000 is in use:**
   ```bash
   netstat -ano | findstr :5000
   ```

2. **Kill all processes on port 5000:**
   ```bash
   # Windows
   for /f "tokens=5" %a in ('netstat -ano ^| findstr :5000') do taskkill /PID %a /F
   ```

3. **Check Python environment:**
   ```bash
   cd python-nlp
   python --version
   pip list | findstr -i "flask docx"
   ```

4. **Check for errors in app.py:**
   ```bash
   cd python-nlp
   python -c "from app import app; print('App loaded OK')"
   ```
