#!/bin/bash

echo "🚀 Starting StealthVault..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
fi

if [ ! -f ml-service/.env ]; then
    echo "📝 Creating ML service .env file..."
    echo "PORT=5000" > ml-service/.env
    echo "DEBUG=False" >> ml-service/.env
    echo "CORS_ORIGIN=http://localhost:8080" >> ml-service/.env
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🎬 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."

# Check frontend
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Frontend is running at http://localhost:8080"
else
    echo "❌ Frontend is not responding"
fi

# Check backend
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend API is running at http://localhost:3001"
else
    echo "❌ Backend API is not responding"
fi

# Check ML service
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ ML Service is running at http://localhost:5000"
else
    echo "❌ ML Service is not responding"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 StealthVault is ready!"
echo ""
echo "📱 Frontend:    http://localhost:8080"
echo "🔧 Backend API: http://localhost:3001"
echo "🤖 ML Service:  http://localhost:5000"
echo ""
echo "📚 View logs:   docker-compose logs -f"
echo "🛑 Stop:        docker-compose down"
echo "🔄 Restart:     docker-compose restart"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
