@echo off
echo 🚀 Starting Dexian RCA Full Stack Application...

REM Change to the frontend directory
cd /d "%~dp0"

echo 📂 Working from directory: %CD%

echo 📦 Building and starting all services...
docker-compose -f docker-compose.fullstack.yml up --build -d

echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak > nul

echo 🔍 Checking service status...
docker-compose -f docker-compose.fullstack.yml ps

echo ✅ Full stack application started!
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
