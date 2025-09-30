# Disk Space Cleanup Guide

GLiNER requires downloading model files (~500MB-1GB). Your system shows "No space left on device" error.

## Quick Cleanup Options:

### 1. **Clean Temporary Files**
```bash
# Windows Disk Cleanup
cleanmgr

# Or manually delete temp files
del /q /f %TEMP%\*.*
del /q /f C:\Windows\Temp\*.*
```

### 2. **Clear Python Cache**
```bash
# Clear pip cache
pip cache purge

# Clear Python __pycache__ folders
find . -type d -name __pycache__ -exec rm -rf {} +
```

### 3. **Clear Node.js Cache**
```bash
npm cache clean --force
```

### 4. **Check Large Files**
```bash
# Find large files
forfiles /p C:\ /m *.* /s /c "cmd /c if @fsize gtr 104857600 echo @path @fsize"
```

## After Cleanup:

1. **Restart Python server** to retry GLiNER download
2. **Change GLiNER setting** in `EntitiesPanel.js`:
   ```javascript
   useGLiNER: true  // Enable after cleanup
   ```

## Alternative: Use Smaller Model

The system is now configured to use `gliner_small-v2.1` instead of `gliner_medium-v2.1` (smaller download).

## Current Status

✅ **Regex field detection** - Working now  
⚠️ **GLiNER enhancement** - Disabled due to disk space  
✅ **Basic NLP** - Working  
✅ **PDF import** - Working  
