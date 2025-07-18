#!/bin/bash

# AskEd AI Assistant - Dependency Checker
# This script checks if all required dependencies are installed

echo "🔍 Checking dependencies for AskEd AI Assistant..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check Java
print_status "Checking Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    print_success "Java is installed: $JAVA_VERSION"
else
    print_error "Java is not installed!"
    echo "   Please install Java 17 or higher:"
    echo "   - Windows: Download from https://adoptium.net/"
    echo "   - macOS: brew install openjdk@17"
    echo "   - Linux: sudo apt install openjdk-17-jdk"
fi

# Check Maven
print_status "Checking Maven..."
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version 2>&1 | head -n 1 | cut -d' ' -f3)
    print_success "Maven is installed: $MVN_VERSION"
else
    print_error "Maven is not installed!"
    echo "   Please install Maven:"
    echo "   - Windows: Download from https://maven.apache.org/download.cgi"
    echo "   - macOS: brew install maven"
    echo "   - Linux: sudo apt install maven"
    echo "   - Or use the wrapper: ./mvnw (if available)"
fi

# Check Node.js
print_status "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed!"
    echo "   Please install Node.js 16 or higher:"
    echo "   - Windows: Download from https://nodejs.org/"
    echo "   - macOS: brew install node"
    echo "   - Linux: sudo apt install nodejs npm"
fi

# Check npm
print_status "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed!"
    echo "   Please install npm with Node.js"
fi

# Check Docker (optional)
print_status "Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker is installed: $DOCKER_VERSION"
else
    print_warning "Docker is not installed (optional for deployment)"
    echo "   Docker is only needed for deployment, not for testing"
fi

echo ""
echo "📋 Summary:"
echo "   If you see any [✗] errors above, please install the missing dependencies."
echo "   Once all dependencies are installed, you can run:"
echo "   ./run-tests.sh"
echo ""
echo "🚀 Quick start after installing dependencies:"
echo "   1. cd backend && mvn test"
echo "   2. cd frontend && npm test"
echo "   3. ./run-tests.sh (for all tests)" 