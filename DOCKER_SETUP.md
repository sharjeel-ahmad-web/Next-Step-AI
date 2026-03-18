# Docker Setup & Deployment Guide

## Prerequisites

Before running this project in Docker, ensure you have:

- **Docker** (v20.10+) - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v2.0+) - Usually comes with Docker Desktop
- **Git** (for cloning the repository)

## Project Architecture

```
┌─────────────────────────────────────┐
│        Docker Compose Network       │
│   (nextstep_network - bridge)       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Frontend (React + Vite)    │  │
│  │     Port: 3000               │  │
│  │   API Base: http://localhost │  │
│  │          :8000/api           │  │
│  └──────────────────────────────┘  │
│                │                    │
│                │ HTTP Requests      │
│                ▼                    │
│  ┌──────────────────────────────┐  │
│  │  Backend (Laravel 11 + PHP)  │  │
│  │     Port: 8000               │  │
│  │    SQLite Database           │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Quick Start

### 1. Clone or Navigate to Project

```bash
cd /path/to/nextstep-ai/backend
```

### 2. Build the Docker Images

```bash
docker-compose build
```

This will:
- Build the Laravel backend image (based on PHP 8.2)
- Build the React frontend image (multi-stage build with Node 20)

### 3. Start the Services

```bash
docker-compose up -d
```

The `-d` flag runs services in detached mode (background).

### 4. Initialize the Database

```bash
docker-compose exec backend php artisan migrate
```

Optional - Seed the database with sample data:

```bash
docker-compose exec backend php artisan db:seed
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: See [API_INTEGRATION.md](./frontend/API_INTEGRATION.md)

## Common Docker Commands

### View running containers

```bash
docker-compose ps
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Execute commands in containers

```bash
# Run artisan commands
docker-compose exec backend php artisan tinker
docker-compose exec backend php artisan cache:clear

# Run npm commands
docker-compose exec frontend npm install
```

### Stop services

```bash
# Stop (containers persist)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Rebuild without stopping

```bash
docker-compose up -d --build
```

## Environment Configuration

### Backend (.env)

The backend uses the following environment variables configured in `docker-compose.yml`:

```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=sqlite
CACHE_STORE=database
SESSION_DRIVER=database
```

To modify settings, edit `docker-compose.yml` under the `backend` service's `environment` section.

### Frontend (VITE Environment)

Frontend environment is controlled by the `VITE_API_BASE_URL`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

This is set in `docker-compose.yml` under the `frontend` service's `environment` section.

## Persistent Storage

### Backend Storage

Application storage (uploads, logs, cache) is persisted via volume mounts:

```yaml
volumes:
  - ./storage:/app/storage
  - ./bootstrap/cache:/app/bootstrap/cache
```

### Database

SQLite database is stored in the local volume and persists across container restarts.

## Health Checks

Both services include health checks:

```bash
# Check if services are healthy
docker-compose ps

# View health status
docker inspect nextstep_backend | grep -A 20 '"Health"'
```

## Troubleshooting

### Port Already in Use

If port 8000 or 3000 is already in use:

```bash
# Linux/Mac
lsof -i :8000
kill -9 <PID>

# Windows PowerShell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Or change ports in `docker-compose.yml`:

```yaml
backend:
  ports:
    - "8001:8000"  # Changed from 8000
frontend:
  ports:
    - "3001:3000"  # Changed from 3000
```

### Container Crashes

Check logs:

```bash
docker-compose logs backend
docker-compose logs frontend
```

### Database Issues

Reset the database:

```bash
# Remove database volume
docker-compose down -v

# Restart services
docker-compose up -d

# Migrate fresh
docker-compose exec backend php artisan migrate:fresh --seed
```

### Dependencies Not Installed

Rebuild without cache:

```bash
docker-compose build --no-cache
```

## Development Workflow

### Make Code Changes

Edit files in your IDE as normal. Changes are reflected in containers via volume mounts.

### Backend Changes

For most PHP changes, no rebuild needed. For composer dependencies:

```bash
docker-compose exec backend composer install
```

### Frontend Changes

For most JS changes, hot reload works automatically. For npm dependencies:

```bash
docker-compose exec frontend npm install
```

## Production Deployment

For production deployment, consider:

1. **Image Registry**: Push images to Docker Hub, ECR, or similar
2. **Environment Variables**: Use `.env` files or secret management
3. **Database**: Migrate from SQLite to PostgreSQL/MySQL
4. **Cache**: Use Redis container for better performance
5. **Reverse Proxy**: Add Nginx for load balancing
6. **SSL/TLS**: Configure HTTPS with Let's Encrypt

Example production docker-compose:

```yaml
services:
  backend:
    image: your-registry/nextstep-backend:latest
    restart: always
    environment:
      APP_ENV: production
      DB_CONNECTION: mysql
      DB_HOST: mysql
      CACHE_STORE: redis
      REDIS_HOST: redis
    depends_on:
      - mysql
      - redis

  frontend:
    image: your-registry/nextstep-frontend:latest
    restart: always

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
```

## API Integration Notes

The frontend communicates with the backend through the configured API base URL:

```javascript
// frontend/src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})
```

Ensure `VITE_API_BASE_URL` in `docker-compose.yml` matches your deployment setup.

## Support & Documentation

- [API Integration Guide](./frontend/API_INTEGRATION.md)
- [Frontend Deployment Guide](./frontend/DEPLOYMENT_GUIDE.md)
- [Laravel Documentation](https://laravel.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

**Last Updated**: March 10, 2026
