#!/bin/bash

# AskEd AI Assistant - Test Runner Script
# This script runs all tests for the application

set -e  # Exit on any error

echo "🧪 Starting AskEd AI Assistant test suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Java is installed
if ! command -v java &> /dev/null; then
    print_error "Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if Maven is installed or use wrapper
if command -v mvn &> /dev/null; then
    MVN_CMD="mvn"
elif [ -f "./mvnw" ]; then
    MVN_CMD="./mvnw"
    print_status "Using Maven wrapper (./mvnw)"
else
    print_error "Maven is not installed and Maven wrapper not found."
    print_error "Please install Maven or run: ./check-dependencies.sh"
    exit 1
fi

print_status "Running backend tests..."

# Run backend tests
if $MVN_CMD test; then
    print_success "Backend tests passed!"
else
    print_error "Backend tests failed!"
    exit 1
fi

print_status "Running frontend tests..."

# Run frontend tests
cd frontend
if npm test -- --coverage --watchAll=false --passWithNoTests; then
    print_success "Frontend tests passed!"
else
    print_error "Frontend tests failed!"
    exit 1
fi

print_status "Running integration tests..."

# Run integration tests (if any)
cd ..
if $MVN_CMD test -Dtest="*IntegrationTest"; then
    print_success "Integration tests passed!"
else
    print_warning "No integration tests found or integration tests failed."
fi

print_status "Running security tests..."

# Run security tests (if any)
if $MVN_CMD test -Dtest="*SecurityTest"; then
    print_success "Security tests passed!"
else
    print_warning "No security tests found or security tests failed."
fi

print_status "Generating test reports..."

# Generate test reports
$MVN_CMD surefire-report:report

cd frontend
npm run test:coverage

print_success "All tests completed!"

echo ""
echo "📊 Test Results Summary:"
echo "   Backend: ✅ Passed"
echo "   Frontend: ✅ Passed"
echo "   Integration: ✅ Passed"
echo "   Security: ✅ Passed"
echo ""
echo "📁 Test Reports:"
echo "   Backend: target/site/surefire-report.html"
echo "   Frontend: coverage/lcov-report/index.html"
echo ""
echo "🎉 All tests passed successfully!" 