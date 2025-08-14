#!/bin/bash

# Car Rental API Deployment Script
# This script automates the deployment process for the NestJS application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="rentcar"
DOCKER_IMAGE="${APP_NAME}:latest"
CONTAINER_NAME="${APP_NAME}_app"

echo -e "${GREEN}🚀 Starting deployment of ${APP_NAME}...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    if [ -f env.production.example ]; then
        cp env.production.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your production values before continuing.${NC}"
        echo -e "${YELLOW}⚠️  Press Enter when ready to continue...${NC}"
        read
    else
        echo -e "${RED}❌ No environment example file found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Function to cleanup old containers and images
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up old containers and images...${NC}"
    
    # Stop and remove old container
    if docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}🛑 Stopping old container...${NC}"
        docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
    fi
    
    # Remove old image
    if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "^${DOCKER_IMAGE}$"; then
        echo -e "${YELLOW}🗑️  Removing old image...${NC}"
        docker rmi ${DOCKER_IMAGE} || true
    fi
}

# Function to build the application
build() {
    echo -e "${GREEN}🔨 Building Docker image...${NC}"
    
    # Build the image
    docker build -t ${DOCKER_IMAGE} .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to build Docker image.${NC}"
        exit 1
    fi
}

# Function to run the application
run() {
    echo -e "${GREEN}🚀 Starting application...${NC}"
    
    # Run the container
    docker run -d \
        --name ${CONTAINER_NAME} \
        --env-file .env \
        -p 3000:3000 \
        --restart unless-stopped \
        ${DOCKER_IMAGE}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Application started successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to start application.${NC}"
        exit 1
    fi
}

# Function to check application health
health_check() {
    echo -e "${GREEN}🏥 Checking application health...${NC}"
    
    # Wait for application to start
    echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy and responding!${NC}"
        echo -e "${GREEN}🌐 Application is running at: http://localhost:3000${NC}"
        echo -e "${GREEN}📚 API Documentation: http://localhost:3000/api-docs${NC}"
    else
        echo -e "${RED}❌ Application health check failed.${NC}"
        echo -e "${YELLOW}📋 Container logs:${NC}"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
}

# Function to show container status
status() {
    echo -e "${GREEN}📊 Container status:${NC}"
    docker ps --filter "name=${CONTAINER_NAME}"
    
    echo -e "\n${GREEN}📋 Recent logs:${NC}"
    docker logs --tail 20 ${CONTAINER_NAME}
}

# Main deployment process
main() {
    cleanup
    build
    run
    health_check
    status
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Check command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "build")
        build
        ;;
    "run")
        run
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        status
        ;;
    "logs")
        docker logs -f ${CONTAINER_NAME}
        ;;
    "stop")
        echo -e "${YELLOW}🛑 Stopping application...${NC}"
        docker stop ${CONTAINER_NAME} || true
        echo -e "${GREEN}✅ Application stopped.${NC}"
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting application...${NC}"
        docker restart ${CONTAINER_NAME}
        echo -e "${GREEN}✅ Application restarted.${NC}"
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 [deploy|build|run|cleanup|status|logs|stop|restart]${NC}"
        echo -e "${YELLOW}Default action: deploy${NC}"
        exit 1
        ;;
esac 