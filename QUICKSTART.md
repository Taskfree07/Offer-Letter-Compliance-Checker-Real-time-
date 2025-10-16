# Quick Start Guide - Email Automation App

## For Non-Technical Users

This guide will help you run the Email Automation application in just 2 steps!

---

## Prerequisites (Install These First)

Before running the app, you need to install these 3 programs:

### 1. Node.js
- **Download:** https://nodejs.org/
- **What it does:** Runs the frontend of the application
- **Installation:** Download the LTS version, run the installer, click "Next" through all steps

### 2. Python
- **Download:** https://www.python.org/downloads/
- **What it does:** Runs the backend AI and document processing
- **Installation:**
  - Download the latest version
  - **IMPORTANT:** Check the box "Add Python to PATH" during installation
  - Click "Install Now"

### 3. Docker Desktop
- **Download:** https://www.docker.com/products/docker-desktop
- **What it does:** Runs the document editor server
- **Installation:**
  - Download and install
  - After installation, **start Docker Desktop** and wait for it to load completely
  - You'll see a green icon in your system tray when it's ready

---

## Running the Application

### First Time Setup (One Time Only)

1. **Double-click** `SETUP.bat`
2. Wait 5-10 minutes while it installs everything
3. That's it! You only need to do this once.

### Starting the Application (Every Time You Want to Use It)

1. **Make sure Docker Desktop is running** (check system tray for green icon)
2. **Double-click** `START.bat`
3. Wait 10-15 seconds
4. Your browser will automatically open to http://localhost:3000

**That's it! The app is now running.**

---

## What You'll See

When you run `START.bat`, three windows will open:

1. **This launcher window** - You can close this after reading the instructions
2. **Backend Server window** - Keep this open! Don't close it.
3. **Frontend App window** - Keep this open! Don't close it.

Your web browser will automatically open the application.

---

## Stopping the Application

When you're done using the app:

1. Go to the **Backend Server window** and press `Ctrl+C`
2. Go to the **Frontend App window** and press `Ctrl+C`
3. (Optional) Run `docker-compose down` to stop the document server

---

## Troubleshooting

### Problem: "Docker is not running"
**Solution:**
- Open Docker Desktop from your Start menu
- Wait for it to fully start (green icon appears)
- Run `START.bat` again

### Problem: "Dependencies not installed"
**Solution:**
- Run `SETUP.bat` first
- Make sure it completes successfully

### Problem: "Port already in use"
**Solution:**
- Close any existing backend/frontend windows
- Try running `START.bat` again

### Problem: Browser doesn't open automatically
**Solution:**
- Manually open your browser
- Go to: http://localhost:3000

### Check if Everything is Working
- Run `check-services.bat` to verify all services are running

---

## Need More Help?

**For detailed technical documentation:** See README.md

**For troubleshooting guides:** See docs/TROUBLESHOOTING.md

**Common issues:**
- Make sure Docker Desktop is running before starting the app
- Make sure you ran SETUP.bat at least once
- Make sure ports 3000, 5000, and 8080 are not being used by other programs

---

## Summary

1. **Install**: Node.js, Python, Docker Desktop (one time)
2. **Setup**: Run `SETUP.bat` (one time)
3. **Start**: Run `START.bat` (every time you want to use the app)
4. **Use**: Browser opens to http://localhost:3000
5. **Stop**: Press Ctrl+C in both server windows

**That's all there is to it!**
