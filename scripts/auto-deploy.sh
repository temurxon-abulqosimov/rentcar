#!/bin/bash

# 🚀 Auto-Deployment Script for Car Rental API
# This script can be triggered by webhooks, cron jobs, or manually

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="rentcar"
PROJECT_DIR="$HOME/$PROJECT_NAME"
BRANCH="main"
LOG_FILE="$HOME/deploy.log"
BACKUP_DIR="$HOME/backups"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "${RED}❌ ERROR: $1${NC}"
    exit 1
}

# Success message
success() {
    log "${GREEN}✅ $1${NC}"
}

# Warning message
warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

# Main deployment function
deploy() {
    log "🚀 Starting auto-deployment for $PROJECT_NAME"
    
    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        error_exit "Project directory $PROJECT_DIR not found"
    fi
    
    # Navigate to project directory
    cd "$PROJECT_DIR" || error_exit "Cannot navigate to $PROJECT_DIR"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup current environment file
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
        success "Environment file backed up"
    fi
    
    # Check if there are new changes
    git fetch origin
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/$BRANCH)
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        warning "No new changes to deploy"
        return 0
    fi
    
    log "📥 Pulling latest changes from $BRANCH branch"
    git pull origin $BRANCH || error_exit "Failed to pull latest changes"
    
    # Show what changed
    log "📋 Recent commits:"
    git log --oneline -5
    
    # Stop existing containers
    log "🛑 Stopping existing containers"
    docker-compose down || warning "Failed to stop containers (might not be running)"
    
    # Clean up Docker resources
    log "🧹 Cleaning up Docker resources"
    docker system prune -f || warning "Docker cleanup failed"
    
    # Rebuild and start services
    log "🔨 Rebuilding and starting services"
    docker-compose up -d --build || error_exit "Failed to start services"
    
    # Wait for services to be healthy
    log "⏳ Waiting for services to be healthy"
    sleep 30
    
    # Health check
    log "🏥 Performing health check"
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Health check passed"
    else
        error_exit "Health check failed"
    fi
    
    # Show deployment info
    log "📊 Deployment completed successfully!"
    log "🌐 Application: http://localhost:3000"
    log "📚 API Docs: http://localhost:3000/api-docs"
    log "🏥 Health: http://localhost:3000/health"
    
    # Show container status
    log "🐳 Container status:"
    docker-compose ps
    
    return 0
}

# Rollback function
rollback() {
    log "🔄 Starting rollback process"
    
    cd "$PROJECT_DIR" || error_exit "Cannot navigate to $PROJECT_DIR"
    
    # Stop current containers
    docker-compose down || warning "Failed to stop containers"
    
    # Reset to previous commit
    git reset --hard HEAD~1 || error_exit "Failed to reset to previous commit"
    
    # Start services
    docker-compose up -d --build || error_exit "Failed to start services after rollback"
    
    success "Rollback completed successfully"
}

# Status check function
status() {
    log "📊 Checking deployment status"
    
    cd "$PROJECT_DIR" || error_exit "Cannot navigate to $PROJECT_DIR"
    
    # Git status
    log "📋 Git status:"
    git status --short
    
    # Container status
    log "🐳 Container status:"
    docker-compose ps
    
    # Health check
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Application is healthy"
    else
        warning "Application health check failed"
    fi
    
    # Recent logs
    log "📋 Recent application logs:"
    docker-compose logs --tail 10 app
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "status")
        status
        ;;
    "logs")
        cd "$PROJECT_DIR" && docker-compose logs -f
        ;;
    "restart")
        cd "$PROJECT_DIR" && docker-compose restart
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|status|logs|restart]"
        echo "Default action: deploy"
        exit 1
        ;;
esac

# Log completion
log "🏁 Auto-deployment script completed" 