# PowerShell script to restart the Flask server

Write-Host "Stopping existing Flask server on port 5000..." -ForegroundColor Yellow

# Find and kill process on port 5000
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1

if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "Stopped process $process" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "No process found on port 5000" -ForegroundColor Gray
}

Write-Host "`nStarting Flask server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

# Start Flask server
python app.py
