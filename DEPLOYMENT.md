# 🚀 Car Rental API - Deployment Guide

This guide will walk you through deploying the Car Rental API using Docker.

## 📋 Prerequisites

- Docker installed and running
- Docker Compose installed
- Git (to clone the repository)
- Basic knowledge of Docker commands

## 🐳 Quick Start (Development)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd car-rental-api

# Copy environment file
cp env.production.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Start with Docker Compose

```bash
# Start all services (database + app)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access the Application

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Database**: localhost:5432

## 🚀 Production Deployment

### 1. Environment Configuration

Create a `.env` file with production values:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=rentcar

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### 2. Using the Deployment Script

```bash
# Make script executable
chmod +x deploy.sh

# Deploy the application
./deploy.sh

# Other available commands
./deploy.sh build      # Only build the image
./deploy.sh run        # Only run the container
./deploy.sh status     # Check container status
./deploy.sh logs       # View logs
./deploy.sh stop       # Stop the application
./deploy.sh restart    # Restart the application
```

### 3. Manual Docker Commands

```bash
# Build the image
docker build -t rentcar:latest .

# Run the container
docker run -d \
  --name rentcar_app \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  rentcar:latest

# Check logs
docker logs -f rentcar_app

# Stop and remove
docker stop rentcar_app
docker rm rentcar_app
```

## 🐘 Database Setup

### PostgreSQL Connection

```bash
# Connect to database
docker exec -it rentcar_postgres psql -U postgres -d rentcar

# Or from host
psql -h localhost -U postgres -d rentcar
```

### Database Initialization

The database will be automatically initialized with the entities defined in your code. Make sure `synchronize: true` is set in development or use migrations for production.

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Application port |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | - | Database password |
| `DB_NAME` | `rentcar` | Database name |
| `JWT_SECRET` | - | JWT signing secret |
| `JWT_EXPIRES_IN` | `24h` | JWT expiration time |

### Docker Compose Overrides

You can create `docker-compose.override.yml` for local development customizations:

```yaml
version: '3.8'
services:
  app:
    environment:
      NODE_ENV: development
    volumes:
      - .:/app
      - /app/node_modules
```

## 📊 Monitoring and Health Checks

### Health Check Endpoint

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### Container Health Checks

Docker containers include health checks that monitor application status:

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"

# View health check logs
docker inspect rentcar_app | grep -A 10 Health
```

## 🔒 Security Considerations

### Production Security

1. **Change default passwords** in `.env` file
2. **Use strong JWT secrets** (32+ characters)
3. **Restrict database access** to application only
4. **Enable SSL** for database connections
5. **Use secrets management** for sensitive data

### Network Security

```bash
# Only expose necessary ports
# Database: localhost only
# Application: localhost only (use reverse proxy for external access)
```

## 🚨 Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check logs
docker logs rentcar_app

# Check environment variables
docker exec rentcar_app env | grep DB_
```

#### Database connection failed
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec rentcar_postgres pg_isready -U postgres
```

#### Port already in use
```bash
# Check what's using the port
lsof -i :3000

# Stop conflicting service or change port in .env
```

### Logs and Debugging

```bash
# Application logs
docker logs -f rentcar_app

# Database logs
docker logs -f rentcar_postgres

# All services logs
docker-compose logs -f

# Container shell access
docker exec -it rentcar_app sh
```

## 📈 Scaling and Performance

### Resource Limits

```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

### Load Balancing

For production, consider using:
- **Nginx** as reverse proxy
- **Docker Swarm** for orchestration
- **Kubernetes** for advanced scaling

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
./deploy.sh

# Or manually
docker-compose down
docker-compose up -d --build
```

### Database Backups

```bash
# Create backup
docker exec rentcar_postgres pg_dump -U postgres rentcar > backup.sql

# Restore backup
docker exec -i rentcar_postgres psql -U postgres rentcar < backup.sql
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker logs rentcar_app`
2. Verify environment variables
3. Check container health: `docker ps`
4. Review this documentation
5. Check GitHub issues

---

**Happy Deploying! 🎉** 