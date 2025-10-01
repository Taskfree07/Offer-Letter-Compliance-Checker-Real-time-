# 📄 Installing LibreOffice for PDF Conversion

## Why LibreOffice?

LibreOffice provides **perfect PDF conversion** that preserves:
- ✅ All fonts and formatting
- ✅ Tables and layouts
- ✅ Colors and styles
- ✅ Page breaks and structure
- ✅ Headers and footers

## Installation Instructions

### Windows

1. **Download LibreOffice:**
   - Go to: https://www.libreoffice.org/download/download/
   - Click "Download" button
   - Choose Windows version (64-bit recommended)

2. **Install:**
   - Run the downloaded `.msi` file
   - Follow installation wizard
   - Use default settings

3. **Add to PATH (Important!):**
   ```powershell
   # Open PowerShell as Administrator
   # Add LibreOffice to system PATH
   $env:Path += ";C:\Program Files\LibreOffice\program"
   
   # Make it permanent
   [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
   ```

4. **Verify Installation:**
   ```powershell
   soffice --version
   ```
   Should show: `LibreOffice 7.x.x.x`

### Mac

1. **Using Homebrew (Recommended):**
   ```bash
   brew install libreoffice
   ```

2. **Manual Installation:**
   - Download from: https://www.libreoffice.org/download/download/
   - Open `.dmg` file
   - Drag LibreOffice to Applications folder

3. **Verify:**
   ```bash
   /Applications/LibreOffice.app/Contents/MacOS/soffice --version
   ```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install libreoffice
```

### Linux (CentOS/RHEL)

```bash
sudo yum install libreoffice
```

---

## Testing PDF Conversion

### Test from Command Line

```bash
# Create a test Word document first
# Then convert it:
soffice --headless --convert-to pdf --outdir . test.docx
```

If this works, your app's PDF download will work!

### Test in the App

1. Start backend: `cd python-nlp && python app.py`
2. Start frontend: `npm start`
3. Import a Word document
4. Click "Download as PDF"
5. Should download perfect PDF!

---

## Troubleshooting

### "soffice not found"

**Windows:**
- LibreOffice not in PATH
- Add manually: `C:\Program Files\LibreOffice\program`
- Restart terminal/VS Code

**Mac:**
- Create symlink:
  ```bash
  sudo ln -s /Applications/LibreOffice.app/Contents/MacOS/soffice /usr/local/bin/soffice
  ```

**Linux:**
- Reinstall: `sudo apt-get install --reinstall libreoffice`

### "PDF conversion timed out"

- Large documents take longer
- Increase timeout in `app.py` (currently 30s)
- Check system resources

### "PDF file was not created"

- Check disk space
- Check temp directory permissions
- Try manual conversion first

---

## Alternative: Download as Word

**If LibreOffice installation is not possible:**

1. Users can download as `.docx` (works perfectly now)
2. Open in Microsoft Word
3. Use Word's "Save as PDF" feature
4. Get perfect PDF output

**This is actually a great workflow!**

---

## What Happens Without LibreOffice?

**With LibreOffice:**
- ✅ Click "Download as PDF" → Perfect PDF
- ✅ One-click solution
- ✅ Server-side conversion

**Without LibreOffice:**
- ✅ Click "Download as Word" → Perfect .docx
- ⚠️ "Download as PDF" shows error message
- ✅ User can convert in Word manually

**Both options work great!**

---

## Recommended Approach

### For Development:
- Install LibreOffice locally
- Test PDF conversion
- Both buttons work

### For Production:
- Install LibreOffice on server
- Enable PDF downloads
- Provide both options

### For Quick Start:
- Skip LibreOffice for now
- Use "Download as Word" only
- Add PDF later when needed

---

## Summary

**To enable PDF download:**
1. Install LibreOffice
2. Ensure `soffice` is in PATH
3. Restart backend
4. Test "Download as PDF" button

**Without LibreOffice:**
- "Download as Word" works perfectly
- Users can convert to PDF in Word
- No functionality lost!

---

**Both options are great - choose what works best for you!** 🚀
