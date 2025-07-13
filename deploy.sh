#!/bin/bash

# AskEd AI Assistant - Deployment Script
# This script deploys the entire application using Docker Compose

set -e  # Exit on any error

echo "🚀 Starting AskEd AI Assistant deployment..."

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

# Check if .env file exists, create if not
if [ ! -f .env ]; then
    echo "📝 Creating .env file with default values..."
    cat > .env << EOF
# AskEd AI Assistant Environment Variables
# Change these values for production

# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=asked_db
MYSQL_USER=asked_user
MYSQL_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=86400000

# AI Service Configuration
OPENROUTER_API_KEY=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

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:80,http://localhost:3000

# Production Settings
NODE_ENV=production
SPRING_PROFILES_ACTIVE=docker
EOF
    echo "✅ .env file created. Please review and update the values."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
if docker-compose ps | grep -q "unhealthy"; then
    echo "❌ Some services are unhealthy. Check logs with: docker-compose logs"
    exit 1
fi

echo "✅ All services are healthy!"

# Display service information
echo ""
echo "🎉 AskEd AI Assistant is now running!"
echo ""
echo "📱 Frontend: http://localhost:80"
echo "🔧 Backend API: http://localhost:8080"
echo "🗄️  Database: localhost:3306"
echo ""
echo "📊 Health Checks:"
echo "   Frontend: http://localhost:80/health"
echo "   Backend: http://localhost:8080/actuator/health"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update services: docker-compose up --build -d"
echo ""
echo "🔐 Default credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   (Register a new account for production use)" 