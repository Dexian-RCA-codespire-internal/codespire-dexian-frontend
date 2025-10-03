@echo off
echo 🧹 Cleaning up existing containers and images...

REM Stop and remove all containers from the fullstack compose
echo 📦 Stopping and removing fullstack containers...
docker-compose -f docker-compose.fullstack.yml down --volumes --remove-orphans

REM Remove any existing containers with similar names
echo 🗑️ Removing any existing containers...
docker rm -f codespire-fullstack-frontend 2>nul
docker rm -f codespire-fullstack-backend 2>nul
docker rm -f codespire-fullstack-mongodb 2>nul
docker rm -f codespire-fullstack-postgres 2>nul
docker rm -f codespire-fullstack-supertokens 2>nul
docker rm -f codespire-fullstack-qdrant 2>nul

REM Remove any existing images
echo 🖼️ Removing existing images...
docker rmi -f codespire-dexian-frontend-frontend 2>nul
docker rmi -f codespire-dexian-frontend-backend 2>nul

REM Clean up unused images and containers
echo 🧽 Cleaning up unused Docker resources...
docker system prune -f

echo ✅ Cleanup completed!
echo.

echo 🚀 Starting fresh with new ports...
echo    Frontend: Port 3002
echo    Backend: Port 8082
echo.

REM Build and start all services
echo 📦 Building and starting all services...
docker-compose -f docker-compose.fullstack.yml up --build -d

echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak > nul

echo 🔍 Checking service status...
docker-compose -f docker-compose.fullstack.yml ps

echo ✅ Full stack application started with new ports!
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3002
echo    Backend API: http://localhost:8082
echo    MongoDB: localhost:27017
echo    PostgreSQL: localhost:5432
echo    SuperTokens: localhost:3567
echo    Qdrant: localhost:6333
echo.
echo 📊 To view logs:
echo    docker-compose -f docker-compose.fullstack.yml logs -f
echo.
echo 🛑 To stop:
echo    docker-compose -f docker-compose.fullstack.yml down

pause
