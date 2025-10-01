# PowerShell startup script for fullstack deployment from frontend directory

Write-Host "🚀 Starting Dexian RCA Full Stack Application..." -ForegroundColor Cyan

# Change to the frontend directory (where docker-compose.fullstack.yml is located)
Set-Location $PSScriptRoot

Write-Host "📂 Working from directory: $(Get-Location)" -ForegroundColor Yellow

# Build and start all services
Write-Host "📦 Building and starting all services..." -ForegroundColor Yellow
docker-compose -f docker-compose.fullstack.yml up --build -d

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
docker-compose -f docker-compose.fullstack.yml ps

Write-Host "✅ Full stack application started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3002" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8082" -ForegroundColor White
Write-Host "   MongoDB: localhost:27017" -ForegroundColor White
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "   SuperTokens: localhost:3567" -ForegroundColor White
Write-Host "   Qdrant: localhost:6333" -ForegroundColor White
Write-Host ""
Write-Host "📊 To view logs:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.fullstack.yml logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.fullstack.yml down" -ForegroundColor White
