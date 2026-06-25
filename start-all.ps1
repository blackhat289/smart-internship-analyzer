# Smart Internship Analyzer - Start All Services
# Run this script in PowerShell to start all three services

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Smart Internship Analyzer - Starting All Services " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Terminal 1 - ML Service (FastAPI on port 8000)
Write-Host "Starting ML Service (FastAPI) on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "Write-Host 'ML SERVICE - FastAPI (port 8000)' -ForegroundColor Cyan; " + `
  "Set-Location 'c:\Users\mansi\Documents\GitHub\smart-internship-analyzer\ml-service'; " + `
  "`$env:PYTHONPATH = (Get-Location).Path; " + `
  "python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

# Terminal 2 - Backend (Express on port 5000)
Write-Host "Starting Backend (Express) on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "Write-Host 'BACKEND - Express.js (port 5000)' -ForegroundColor Yellow; " + `
  "Set-Location 'c:\Users\mansi\Documents\GitHub\smart-internship-analyzer\backend'; " + `
  "npm run dev"

Start-Sleep -Seconds 2

# Terminal 3 - Frontend (Vite on port 5173)
Write-Host "Starting Frontend (Vite/React) on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "Write-Host 'FRONTEND - Vite + React (port 5173)' -ForegroundColor Magenta; " + `
  "Set-Location 'c:\Users\mansi\Documents\GitHub\smart-internship-analyzer\frontend'; " + `
  "npm run dev"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  All services are starting in separate terminals!  " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor White
Write-Host "  Frontend:       http://localhost:5173  (Main UI)" -ForegroundColor Magenta
Write-Host "  Backend API:    http://localhost:5000  (REST API)" -ForegroundColor Yellow
Write-Host "  ML Service:     http://localhost:8000  (FastAPI)" -ForegroundColor Green
Write-Host "  ML Docs:        http://localhost:8000/docs  (Swagger UI)" -ForegroundColor Green
Write-Host ""
Write-Host "Wait a few seconds for all services to initialize..." -ForegroundColor Gray
