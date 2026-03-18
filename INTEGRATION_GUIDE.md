# Backend-Frontend Integration Guide

## Overview

This document describes how the NextStep AI backend (Laravel) and frontend (React) are integrated and how they work together in Docker.

## Architecture

### Technology Stack

**Backend:**
- Framework: Laravel 11
- Language: PHP 8.2
- Database: SQLite (with support for MySQL/PostgreSQL)
- ORM: Eloquent
- Authentication: JWT (tymon/jwt-auth)
- Additional: MongoDB support, PDF processing, QR codes

**Frontend:**
- Framework: React 18
- Build Tool: Vite
- Styling: Tailwind CSS
- State Management: Zustand
- HTTP Client: Axios
- Routing: React Router v6

### Communication Flow

```
┌─────────────────────────┐
│    React Frontend       │
│   (Port 3000)           │
│ ┌─────────────────────┐ │
│ │ Components/Pages    │ │
│ │ ↓                   │ │
│ │ React Router        │ │
│ │ ↓                   │ │
│ │ API Services        │ │
│ │ (api.js)            │ │
│ │ ↓                   │ │
│ │ Axios Instance      │ │
│ │ ↓                   │ │
│ │ JWT Interceptors    │ │
│ └─────────────────────┘ │
└────────┬────────────────┘
         │ HTTP/REST
         │ JSON
         ↓
┌─────────────────────────┐
│   Laravel Backend       │
│   (Port 8000)           │
│ ┌─────────────────────┐ │
│ │ API Routes (api.php)│ │
│ │ ↓                   │ │
│ │ Middleware          │ │
│ │ (JWT, CORS)         │ │
│ │ ↓                   │ │
│ │ Controllers         │ │
│ │ ↓                   │ │
│ │ Models/Logic        │ │
│ │ ↓                   │ │
│ │ SQLite Database     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## API Integration Points

### 1. Authentication Flow

```javascript
// User registers/logs in
Frontend → POST /api/auth/register or /api/auth/login
Backend → Validates credentials → Generates JWT tokens
Response → { access_token, refresh_token, user }
Frontend → Stores tokens in localStorage → Sets auth header
```

**Key Files:**
- Frontend: `src/services/api.js` - Axios interceptors
- Frontend: `src/pages/LoginPage.jsx`, `RegisterPage.jsx`
- Backend: `app/Http/Controllers/AuthController.php`
- Backend: `routes/api.php` - Auth routes

### 2. Skill Gap Analysis

```javascript
// User uploads resume
Frontend → POST /api/skill-gap/analyze (FormData with file)
Backend → Parses PDF → Extracts skills → Compares with job description
Response → { current_skills, skill_gaps, recommendations }
Frontend → Displays results and generates roadmap
```

**Key Files:**
- Frontend: `src/pages/AnalyzePage.jsx`
- Backend: `app/Http/Controllers/SkillGapController.php`
- Backend: Uses `smalot/pdfparser` package

### 3. Roadmap Generation

```javascript
// Generate learning roadmap
Frontend → POST /api/roadmaps/generate (skill gaps, current skills)
Backend → AI processes → Creates learning path with milestones
Response → { id, target_role, nodes, created_at }
Frontend → Renders roadmap visualization with React Flow
```

**Key Files:**
- Frontend: `src/pages/RoadmapsPage.jsx`, `RoadmapDetailPage.jsx`
- Backend: `app/Http/Controllers/RoadmapController.php`
- Frontend: Uses `react-flow-renderer` for visualization

### 4. Progress Tracking

```javascript
// Track user progress
Frontend → POST /api/progress/start (roadmap_id, skill)
Backend → Creates progress record → Tracks video completions
Frontend → Updates UI → Shows progress percentage
```

**Key Files:**
- Frontend: `src/pages/ProgressPage.jsx`
- Backend: `app/Http/Controllers/ProgressController.php`
- Backend: `app/Models/Progress.php`

### 5. Certification

```javascript
// Generate certificate
Frontend → POST /api/certificates/generate/{roadmapId}
Backend → Validates completion → Generates PDF + QR code
Response → Certificate data + download URL
Frontend → Shows certificate details → Allows download/sharing
```

**Key Files:**
- Frontend: `src/pages/CertificatesPage.jsx`
- Backend: `app/Http/Controllers/CertificateController.php`
- Backend: Uses `spatie/laravel-pdf` and `simplesoftwareio/simple-qrcode`

## Environment Configuration

### Backend Environment (.env)

Critical variables for Docker:

```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
LOG_LEVEL=debug
```

**For Production:**
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
DB_HOST=mysql-service
CACHE_STORE=redis
LOG_LEVEL=warning
```

### Frontend Environment (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**In Docker:**
- Automatically set via `docker-compose.yml`
- Can be overridden for different environments

## Data Flow Examples

### Complete User Journey

1. **Registration**
   ```
   Register Form → POST /api/auth/register
   ↓
   Backend: Creates User → Generates JWT → Encrypts password
   ↓
   Frontend: Stores tokens → Redirects to dashboard
   ```

2. **Skill Analysis**
   ```
   Upload Resume → POST /api/skill-gap/analyze
   ↓
   Backend: Parses PDF → Extracts text → Analyzes with AI
   ↓
   Frontend: Displays skills → Shows gaps → Suggests roadmap
   ```

3. **Learning Path**
   ```
   Generate Roadmap → POST /api/roadmaps/generate
   ↓
   Backend: Creates roadmap nodes → Assigns resources
   ↓
   Frontend: Renders flow diagram → Shows milestones → Tracks progress
   ```

4. **Certification**
   ```
   Complete Roadmap → POST /api/certificates/generate
   ↓
   Backend: Validates completion → Generates certificate
   ↓
   Frontend: Shows certificate → Allows download → QR verification
   ```

## Docker Integration Details

### Service Communication

Services communicate through the `nextstep_network`:

```yaml
networks:
  nextstep_network:
    driver: bridge

services:
  backend:
    networks:
      - nextstep_network
  frontend:
    networks:
      - nextstep_network
```

### URL Resolution in Docker

**Frontend to Backend:**
```javascript
// In docker-compose.yml
VITE_API_BASE_URL=http://localhost:8000/api

// This allows:
// - Frontend container → localhost:8000 (backend service)
// - External access → localhost:3000 (frontend service)
```

### Volume Mounts for Development

```yaml
# Backend - Live code changes
volumes:
  - ./:/app

# Frontend - Live code changes  
volumes:
  - ./frontend:/app
  - /app/node_modules
```

## Deployment Considerations

### Development (Current Setup)
- Uses SQLite on local filesystem
- Hot reload enabled
- Debug mode enabled
- Volumes mounted for live edits

### Production Migration

1. **Database**: PostgreSQL or MySQL
   ```yaml
   mysql:
     image: mysql:8.0
     environment:
       MYSQL_DATABASE: nextstep
       MYSQL_ROOT_PASSWORD: secure-password
   
   backend:
     environment:
       DB_CONNECTION: mysql
       DB_HOST: mysql
   ```

2. **Caching**: Redis
   ```yaml
   redis:
     image: redis:7-alpine
   
   backend:
     environment:
       CACHE_STORE: redis
       REDIS_HOST: redis
   ```

3. **Reverse Proxy**: Nginx
   ```yaml
   nginx:
     image: nginx:alpine
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - ./nginx.conf:/etc/nginx/nginx.conf
   ```

4. **Frontend Build**: Static files only
   ```dockerfile
   # Production: serve from CDN or static server
   # No need for `serve` package
   ```

## Error Handling & Debugging

### Common Integration Issues

1. **CORS Errors**
   - Backend needs CORS middleware
   - Check `config/cors.php` in Laravel
   - Ensure frontend URL is whitelisted

2. **Token Expiration**
   - Frontend interceptor handles refresh
   - See `src/services/api.js` - response interceptor
   - Auto-logout on refresh failure

3. **Network Timeouts**
   - Check service health: `docker-compose ps`
   - Check logs: `docker-compose logs backend`
   - Verify API endpoint in browser

### Debugging Commands

```bash
# View all requests/responses
docker-compose logs -f backend

# Test API endpoint
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Inspect database
docker-compose exec backend php artisan tinker

# Check frontend logs
docker-compose logs -f frontend
```

## Testing Integration

### Backend Testing
```bash
# Run tests
docker-compose exec backend php artisan test

# Run specific test
docker-compose exec backend php artisan test --filter=AuthTest
```

### Frontend Testing
```bash
# Run tests
docker-compose exec frontend npm test

# Run with coverage
docker-compose exec frontend npm test -- --coverage
```

## Performance Optimization

### Backend
- Query optimization with Eager Loading
- API response caching
- Database indexing
- JWT token caching

### Frontend
- Code splitting by route
- Image optimization
- CSS/JS minification
- Build-time tree shaking

### Docker
- Multi-stage builds for frontend
- PHP-FPM for better resource usage
- Volume mounting for development
- Health checks for reliability

## Security Considerations

1. **JWT Tokens**
   - Stored in localStorage (XSS risk)
   - Consider httpOnly cookies for production
   - Token refresh mechanism implemented

2. **CORS**
   - Must be configured on backend
   - Whitelist frontend URL in production

3. **Environment Variables**
   - Never commit `.env` files
   - Use secret management in production
   - Rotate credentials regularly

4. **HTTPS**
   - Use SSL certificates in production
   - Nginx reverse proxy with Let's Encrypt
   - Enforce HTTPS redirect

## Next Steps

1. Configure production database (MySQL/PostgreSQL)
2. Set up Redis for caching
3. Configure email with SMTP
4. Add OAuth providers (Google, GitHub)
5. Set up monitoring and logging
6. Deploy to container orchestration (Kubernetes)

---

**Last Updated**: March 10, 2026
