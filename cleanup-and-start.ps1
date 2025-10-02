# PowerShell script to cleanup existing containers and start fresh with new ports

Write-Host "🧹 Cleaning up existing containers and images..." -ForegroundColor Yellow

# Stop and remove all containers from the fullstack compose
Write-Host "📦 Stopping and removing fullstack containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.fullstack.yml down --volumes --remove-orphans

# Remove any existing containers with similar names
Write-Host "🗑️ Removing any existing containers..." -ForegroundColor Yellow
docker rm -f codespire-fullstack-frontend 2>$null
docker rm -f codespire-fullstack-backend 2>$null
docker rm -f codespire-fullstack-mongodb 2>$null
docker rm -f codespire-fullstack-postgres 2>$null
docker rm -f codespire-fullstack-supertokens 2>$null
docker rm -f codespire-fullstack-qdrant 2>$null

# Remove any existing images
Write-Host "🖼️ Removing existing images..." -ForegroundColor Yellow
docker rmi -f codespire-dexian-frontend-frontend 2>$null
docker rmi -f codespire-dexian-frontend-backend 2>$null

# Clean up unused images and containers
Write-Host "🧽 Cleaning up unused Docker resources..." -ForegroundColor Yellow
docker system prune -f

Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting fresh with new ports..." -ForegroundColor Cyan
Write-Host "   Frontend: Port 3002" -ForegroundColor White
Write-Host "   Backend: Port 8082" -ForegroundColor White
Write-Host ""

# Build and start all services
Write-Host "📦 Building and starting all services..." -ForegroundColor Yellow
docker-compose -f docker-compose.fullstack.yml up --build -d

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
docker-compose -f docker-compose.fullstack.yml ps

Write-Host "✅ Full stack application started with new ports!" -ForegroundColor Green
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
