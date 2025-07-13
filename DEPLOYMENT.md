# AskEd AI Assistant - Deployment Guide

## 🚀 **Quick Start (Docker)**

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 80, 8080, and 3306 available

### 1. Clone and Deploy
```bash
# Clone the repository
git clone <your-repo-url>
cd backend

# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

### 2. Access the Application
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Database**: localhost:3306

## 🐳 **Docker Deployment**

### **Architecture Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (MySQL)       │
│   Port: 80      │    │   Port: 8080    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Services**
1. **Frontend**: React application served by Nginx
2. **Backend**: Spring Boot API with JWT authentication
3. **Database**: MySQL 8.0 with persistent storage
4. **Nginx**: Reverse proxy (optional for production)

### **Environment Configuration**

Create a `.env` file in the project root:
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=asked_db
MYSQL_USER=asked_user
MYSQL_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=86400000

# AI Service Configuration
OPENROUTER_API_KEY=your-openrouter-api-key

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:80,http://localhost:3000

# Production Settings
NODE_ENV=production
SPRING_PROFILES_ACTIVE=docker
```

### **Docker Commands**

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Update services
docker-compose up --build -d

# View service status
docker-compose ps
```

## 🔧 **Manual Deployment**

### **Backend (Spring Boot)**

1. **Build the JAR**
```bash
mvn clean package -DskipTests
```

2. **Run with Docker**
```bash
docker build -t asked-backend .
docker run -p 8080:8080 asked-backend
```

### **Frontend (React)**

1. **Build the application**
```bash
cd frontend
npm install
npm run build
```

2. **Serve with Nginx**
```bash
docker build -t asked-frontend ./frontend
docker run -p 80:80 asked-frontend
```

## 🔒 **Security Configuration**

### **Production Security Checklist**

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Configure HTTPS/SSL
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-change-this-in-production` |
| `OPENROUTER_API_KEY` | AI service API key | Required |
| `MYSQL_PASSWORD` | Database password | `your_password` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:80,http://localhost:3000` |

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
- **Frontend**: `http://localhost:80/health`
- **Backend**: `http://localhost:8080/actuator/health`
- **Database**: Built into Docker health checks

### **Logs**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## 🔄 **Updates & Maintenance**

### **Updating the Application**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d
```

### **Database Backups**
```bash
# Create backup
docker-compose exec mysql mysqldump -u root -p asked_db > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u root -p asked_db < backup.sql
```

### **Data Persistence**
- **Database**: Stored in `mysql_data` volume
- **Uploads**: Stored in `uploads_data` volume
- **Flashcards**: Stored in `flashcards_data` volume
- **Quizzes**: Stored in `quizzes_data` volume

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :80
   netstat -tulpn | grep :8080
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs mysql
   ```

3. **Memory issues**
   ```bash
   # Check container resource usage
   docker stats
   ```

4. **Build failures**
   ```bash
   # Clean and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

### **Performance Optimization**

1. **Database tuning**
   - Increase connection pool size
   - Optimize MySQL configuration
   - Add database indexes

2. **Application tuning**
   - Enable JVM optimizations
   - Configure proper memory settings
   - Use CDN for static assets

3. **Infrastructure**
   - Use load balancers
   - Implement caching
   - Set up monitoring

## 📚 **Additional Resources**

- [Docker Documentation](https://docs.docker.com/)
- [Spring Boot Deployment](https://spring.io/guides/gs/spring-boot-docker/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [MySQL Docker](https://hub.docker.com/_/mysql)

---

**⚠️ Important**: Change all default passwords and secrets before deploying to production! 