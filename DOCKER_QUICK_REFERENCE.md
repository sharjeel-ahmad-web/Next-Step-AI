# Docker Quick Reference & Cheat Sheet

## 🚀 Quick Start (5 minutes)

```bash
# 1. Navigate to project
cd /path/to/backend

# 2. Build images
docker-compose build

# 3. Start services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend php artisan migrate

# 5. Visit application
# Frontend: http://localhost:3000
# API: http://localhost:8000/api
```

## 📋 Essential Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Start and rebuild
docker-compose up -d --build

# Stop services (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# View running services
docker-compose ps

# View service status with details
docker-compose ps -a
```

### Logs & Debugging

```bash
# View all logs (follow mode)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs -f --tail=100 backend

# View logs without follow
docker-compose logs backend

# View logs from specific time
docker-compose logs --since 2024-01-01T00:00:00 backend

# Clear old logs
docker system prune --volumes
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend php artisan migrate

# Rollback migrations
docker-compose exec backend php artisan migrate:rollback

# Fresh migration (reset database)
docker-compose exec backend php artisan migrate:fresh

# Seed database
docker-compose exec backend php artisan db:seed

# Fresh migrate with seeding
docker-compose exec backend php artisan migrate:fresh --seed

# Access database shell
docker-compose exec backend sqlite3 database/database.sqlite

# Tinker shell (PHP REPL)
docker-compose exec backend php artisan tinker
```

### Backend Commands

```bash
# Cache operations
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache

# Generate app key
docker-compose exec backend php artisan key:generate

# Generate JWT secret
docker-compose exec backend php artisan jwt:secret

# Run tests
docker-compose exec backend php artisan test

# Make controller
docker-compose exec backend php artisan make:controller MyController

# Make migration
docker-compose exec backend php artisan make:migration create_tablename

# Composer install
docker-compose exec backend composer install

# Run composer update
docker-compose exec backend composer update

# Run specific artisan command
docker-compose exec backend php artisan [command]
```

### Frontend Commands

```bash
# Install dependencies
docker-compose exec frontend npm install

# Update dependencies
docker-compose exec frontend npm update

# Run tests
docker-compose exec frontend npm test

# Lint code
docker-compose exec frontend npm run lint

# Build for production
docker-compose exec frontend npm run build

# Preview production build
docker-compose exec frontend npm run preview

# Run specific npm command
docker-compose exec frontend npm [command]
```

### Container Inspection

```bash
# Access backend shell
docker-compose exec backend bash

# Access frontend shell
docker-compose exec frontend sh

# View resource usage
docker stats

# View specific container info
docker inspect nextstep_backend

# Check container health
docker-compose ps  # Shows (healthy) status

# View container processes
docker top nextstep_backend
```

## 🔧 Common Issues & Solutions

### Ports Already in Use

```bash
# Find process using port
# Windows PowerShell
netstat -ano | findstr :8000

# Kill process
taskkill /PID [PID] /F

# Or change port in docker-compose.yml
# ports:
#   - "8001:8000"  # Changed from 8000
```

### Container Exits Immediately

```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend

# Start with verbose output
docker-compose up backend  # (without -d)
```

### Out of Disk Space

```bash
# Clean up hanging images/containers
docker system prune

# Aggressive cleanup
docker system prune -a --volumes

# Remove specific image
docker rmi image-name
```

### Can't Connect to Backend from Frontend

```bash
# Check if both services are running
docker-compose ps

# Check network
docker network ls
docker network inspect nextstep_network

# Check backend logs
docker-compose logs backend

# Test from frontend container
docker-compose exec frontend curl http://backend:8000
```

### Database Permission Issues

```bash
# Reset permissions
docker-compose exec backend chmod -R 775 storage
docker-compose exec backend chmod -R 775 bootstrap/cache

# Fresh start
docker-compose down -v
docker-compose up -d --build
docker-compose exec backend php artisan migrate
```

## 📂 File Structure in Containers

### Backend
```
/app/
├── app/ (Laravel app code)
├── bootstrap/ (Bootstrap files)
├── config/ (Configuration)
├── database/ (Migrations, seeders)
├── public/ (Public files)
├── resources/ (Views, assets)
├── routes/ (Web routes)
├── storage/ (Logs, cache, uploads) - VOLUME
├── tests/ (Tests)
├── vendor/ (Composer packages)
├── artisan (Laravel CLI)
└── composer.json
```

### Frontend
```
/app/
├── node_modules/ (NPM packages) - VOLUME
├── public/ (Static files)
├── src/ (React source)
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── dist/ (Built files)
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🌐 URLs & Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Frontend Dev | http://localhost:5173 | Vite dev server |
| Backend | http://localhost:8000 | Laravel server |
| Backend API | http://localhost:8000/api | REST API |
| DB Access | Via container | SQLite |

## 🔒 Environment Variables

### Backend (.env in docker-compose)
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
CACHE_STORE=database
SESSION_DRIVER=database
```

### Frontend (VITE environment)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📦 Building Custom Images

```bash
# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache

# Build with progress
docker-compose build --progress=plain
```

## 🚢 Deployment Commands

```bash
# Pull latest images
docker-compose pull

# Update services
docker-compose up -d --pull always

# Scale service (e.g., 3 instances)
docker-compose up -d --scale backend=3

# Service health check
docker-compose ps --services --filter "status=exited"
```

## 📊 Resource Management

```bash
# View resource usage
docker stats

# Set resource limits in docker-compose.yml
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           cpus: '1'
#           memory: 512M
#         reservations:
#           cpus: '0.5'
#           memory: 256M
```

## 🔐 Security Checks

```bash
# Scan images for vulnerabilities
docker scan nextstep_backend:latest

# View image history
docker history nextstep_backend:latest

# Check open ports
docker port nextstep_backend

# View environment variables
docker inspect -f '{{json .Config.Env}}' nextstep_backend | jq
```

## 📱 Mobile Testing

```bash
# Access from another machine on same network
# Find your IP
ipconfig getifaddr en0  # macOS
ipconfig               # Windows
ip addr               # Linux

# Use IP:PORT instead of localhost:3000
# http://YOUR_IP:3000
# http://YOUR_IP:8000/api
```

## 💾 Backup & Restore

```bash
# Backup database
docker-compose exec backend sqlite3 database/database.sqlite ".dump" > backup.sql

# Restore database
docker-compose exec backend sqlite3 database/database.sqlite < backup.sql

# Backup entire volume
docker run --rm -v nextstep_network_backend_storage:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volume
docker run --rm -v nextstep_network_backend_storage:/data -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /data
```

## 🎯 Performance Monitoring

```bash
# Real-time stats
watch docker stats

# High-level system info
docker system df

# Check build cache
docker builder du

# Network statistics
docker network stats
```

---

**Pro Tips:**
- Use `docker-compose logs -f` regularly to catch issues early
- Always backup database before running `migrate:fresh`
- Tag images for production deployments
- Use `.dockerignore` to reduce image size
- Keep Docker and Docker Compose updated

**Last Updated**: March 10, 2026
