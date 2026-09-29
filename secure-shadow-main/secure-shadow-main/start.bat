@echo off
echo Starting StealthVault...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create .env files if they don't exist
if not exist backend\.env (
    echo Creating backend .env file...
    copy backend\.env.example backend\.env
)

if not exist ml-service\.env (
    echo Creating ML service .env file...
    (
        echo PORT=5000
        echo DEBUG=False
        echo CORS_ORIGIN=http://localhost:8080
    ) > ml-service\.env
)

REM Build and start services
echo Building Docker images...
docker-compose build

echo.
echo Starting services...
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo.
echo Checking service health...

curl -s http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo Frontend is not responding
) else (
    echo Frontend is running at http://localhost:8080
)

curl -s http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo Backend API is not responding
) else (
    echo Backend API is running at http://localhost:3001
)

curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ML Service is not responding
) else (
    echo ML Service is running at http://localhost:5000
)

echo.
echo ================================================================
echo StealthVault is ready!
echo.
echo Frontend:    http://localhost:8080
echo Backend API: http://localhost:3001
echo ML Service:  http://localhost:5000
echo.
echo View logs:   docker-compose logs -f
echo Stop:        docker-compose down
echo Restart:     docker-compose restart
echo ================================================================

pause
