#!/bin/bash

echo "🚀 AskEd Deployment Setup"
echo "=========================="

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo ""
echo "🔐 Generated JWT Secret:"
echo "JWT_SECRET=$JWT_SECRET"
echo ""

echo "📋 Environment Variables for Backend (Render):"
echo "=============================================="
echo "SPRING_PROFILES_ACTIVE=prod"
echo "PORT=8080"
echo "JWT_SECRET=$JWT_SECRET"
echo "OPENROUTER_API_KEY=<your-openrouter-api-key>"
echo "DATABASE_URL=<your-database-connection-string>"
echo "DB_USERNAME=<your-database-username>"
echo "DB_PASSWORD=<your-database-password>"
echo "FRONTEND_URL=https://asked-frontend.vercel.app"
echo ""

echo "📋 Environment Variables for Frontend (Vercel):"
echo "=============================================="
echo "REACT_APP_API_URL=https://asked-backend.onrender.com"
echo ""

echo "🔗 Deployment URLs:"
echo "==================="
echo "Frontend: https://asked-frontend.vercel.app"
echo "Backend: https://asked-backend.onrender.com"
echo ""

echo "📝 Next Steps:"
echo "=============="
echo "1. Push your code to GitHub"
echo "2. Create database on Render"
echo "3. Deploy backend on Render with the environment variables above"
echo "4. Deploy frontend on Vercel"
echo "5. Update FRONTEND_URL in backend with your actual Vercel URL"
echo "6. Test your deployment"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" 