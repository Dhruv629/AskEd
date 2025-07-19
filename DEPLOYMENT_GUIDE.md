# AskEd Deployment Guide

This guide will help you deploy your AskEd project to Vercel (frontend) and Render (backend + database).

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **OpenRouter API Key**: Get your API key from [openrouter.ai](https://openrouter.ai)

## Step 1: Deploy Database on Render

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign in to your account

2. **Create MySQL Database**
   - Click "New +" → "PostgreSQL" (Render uses PostgreSQL, we'll configure it for MySQL compatibility)
   - Name: `asked-database`
   - Database: `asked_db`
   - User: `asked_user`
   - Region: Choose closest to your users
   - Click "Create Database"

3. **Get Database Credentials**
   - Note down the connection string, username, and password
   - These will be used in the backend deployment

## Step 2: Deploy Backend on Render

1. **Connect GitHub Repository**
   - In Render dashboard, click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your repository

2. **Configure Web Service**
   - **Name**: `asked-backend`
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
   - **Branch**: `main` (or your default branch)

3. **Set Environment Variables**
   - Click on "Environment" tab
   - Add the following variables:
     ```
     SPRING_PROFILES_ACTIVE=prod
     PORT=8080
     JWT_SECRET=<generate-a-secure-random-string>
     OPENROUTER_API_KEY=<your-openrouter-api-key>
     DATABASE_URL=<your-database-connection-string>
     DB_USERNAME=<your-database-username>
     DB_PASSWORD=<your-database-password>
     FRONTEND_URL=https://asked-frontend.vercel.app
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete
   - Note the URL (e.g., `https://asked-backend.onrender.com`)

## Step 3: Deploy Frontend on Vercel

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign in and click "New Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL=https://asked-backend.onrender.com
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://asked-frontend.vercel.app`)

## Step 4: Update CORS Configuration

After getting your frontend URL, update the backend CORS configuration:

1. **In Render Dashboard**
   - Go to your backend service
   - Click "Environment"
   - Update `FRONTEND_URL` with your actual Vercel URL

2. **Redeploy Backend**
   - The service will automatically redeploy with the new environment variable

## Step 5: Test Your Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Try registering/logging in
   - Test file upload and AI features

2. **Test Backend**
   - Visit `https://your-backend-url.onrender.com/actuator/health`
   - Should return a health status

3. **Test Database**
   - Check if users can register and login
   - Verify data is being stored

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is correctly set in backend environment variables
   - Check that the URL doesn't have trailing slashes

2. **Database Connection Issues**
   - Verify database credentials in environment variables
   - Check if database is accessible from Render

3. **Build Failures**
   - Check build logs in Render/Vercel
   - Ensure all dependencies are properly configured

4. **API Key Issues**
   - Verify OpenRouter API key is correct
   - Check API key permissions

### Environment Variables Reference:

**Backend (Render):**
```
SPRING_PROFILES_ACTIVE=prod
PORT=8080
JWT_SECRET=<secure-random-string>
OPENROUTER_API_KEY=<your-api-key>
DATABASE_URL=<database-connection-string>
DB_USERNAME=<database-username>
DB_PASSWORD=<database-password>
FRONTEND_URL=<your-vercel-url>
```

**Frontend (Vercel):**
```
REACT_APP_API_URL=<your-render-backend-url>
```

## Security Notes

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Generate a strong JWT secret** for production
4. **Enable HTTPS** (Vercel and Render do this automatically)

## Monitoring

- **Vercel**: Check deployment status and logs in your project dashboard
- **Render**: Monitor service health and logs in the Render dashboard
- **Database**: Monitor connection usage and performance

Your AskEd application should now be fully deployed and accessible online! 