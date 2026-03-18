# Frontend-Backend API Integration Fix

## Problems Identified

### ✅ Fixed
1. **MongoDB Port**: Changed from `27018` → `27017`
2. **API URL**: `VITE_API_BASE_URL=http://localhost:8000/api`

### Current Issues to Resolve

## Step 1: Restart Docker Desktop

**On Windows:**
1. Close Docker Desktop completely
2. Open PowerShell as Administrator
3. Run:
```powershell
# Restart Docker daemon
Restart-Service Docker
```

Or manually:
- Right-click Docker Desktop icon
- Click "Quit"
- Wait 10 seconds
- Open Docker Desktop again
- Wait for it to be fully ready (green "Docker is running")

## Step 2: Clean Up and Start Services

```powershell
# Stop all containers
docker-compose down -v

# Remove all Docker images (optional - forces fresh build)
docker system prune -af

# Start services with fresh build
docker-compose up -d --build

# Wait 2-3 minutes for services to initialize

# Check status
docker-compose ps
```

Expected output:
```
NAME               STATUS
nextstep_mongodb   Healthy
nextstep_backend   Healthy
nextstep_frontend  Healthy
```

## Step 3: Verify Backend API Works

```powershell
# Test API health
curl http://localhost:8000/api/health

# Should return:
# {"status":"ok","timestamp":"...","database":"mongodb","message":"Backend API is running"}

# Test courses endpoint
curl http://localhost:8000/api/courses

# Should return:
# {"success":true,"data":[],"count":0}
```

## Step 4: Verify Frontend Can Reach Backend

Open browser DevTools and check:

```javascript
// In browser console at http://localhost:3000
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Frontend can reach backend:', d))
  .catch(e => console.log('❌ Frontend cannot reach backend:', e))
```

Should print: `✅ Frontend can reach backend: {...}`

## Step 5: Check Frontend API Service Configuration

File: `frontend/src/services/courseApi.js`

Verify it has:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Step 6: Check Backend CORS Configuration

File: `bootstrap/app.php`

Ensure API routes are properly configured:
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

## Step 7: Insert Sample Data

Once everything is running:

```powershell
# Option A: Python script (fastest)
pip install pymongo
python seed_data.py

# Option B: Direct MongoDB command
docker-compose exec mongodb mongosh

# Then in MongoDB shell:
use nextstep_db

db.courses.insertOne({
  title: "Test Course",
  description: "Test",
  instructor_id: "1",
  category: "Test",
  level: "beginner",
  duration_hours: 10,
  price: 29.99,
  is_published: true,
  created_at: new Date(),
  updated_at: new Date()
})

db.roadmaps.insertOne({
  target_role: "Developer",
  nodes: [{id: "1", skill_name: "JavaScript", level: "beginner"}],
  created_at: new Date(),
  updated_at: new Date()
})
```

## Step 8: Test Complete Integration

Navigate to:
1. **Home**: http://localhost:3000
2. **Courses API**: http://localhost:8000/api/courses
3. **Health Check**: http://localhost:8000/api/health

All should work without errors.

## Troubleshooting

### Frontend shows "Cannot reach backend"
```bash
# Check backend is running
docker-compose logs backend

# Check API is responding
curl http://localhost:8000/api/health

# Check frontend environment
docker-compose logs frontend | grep VITE_API_BASE_URL
```

### MongoDB connection error
```bash
# Verify MongoDB is accessible
docker-compose exec mongodb mongosh

# Check connection string
echo mongodb://mongodb:27017/nextstep_db
```

### Port already in use
```bash
# Kill existing processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Stop-Process -Name php -Force -ErrorAction SilentlyContinue

# Or change ports in docker-compose.yml:
# ports:
#   - "8001:8000"  # Use 8001 instead of 8000
#   - "3001:3000"  # Use 3001 instead of 3000
```

### Services won't start
```bash
# Check logs
docker-compose logs -f

# Rebuild everything
docker-compose down -v
docker-compose up -d --build --force-recreate
```

## Network Configuration Summary

```
┌─────────────────────────────────────────┐
│         Frontend (Vite Dev Server)      │
│              Port: 3000                 │
│    Environment: NODE_ENV=development    │
│API_URL: http://localhost:8000/api       │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTP/CORS
                   │ (via Axios)
                   ↓
┌─────────────────────────────────────────┐
│           Backend (Laravel/PHP)         │
│         Port: 8000 (dev server)         │
│      Database: MongoDB on 27017         │
│         Routes: /api/* (JSON)           │
└──────────────────┬──────────────────────┘
                   │
                   │ Mongoose/Driver
                   ↓
┌─────────────────────────────────────────┐
│         MongoDB (NoSQL Database)        │
│             Port: 27017                 │
│         DB: nextstep_db                 │
└─────────────────────────────────────────┘
```

## Quick Start Script

Create `start.bat` and run it:

```batch
@echo off
echo Starting NextStep AI Services...
echo.

docker-compose down
docker-compose up -d --build

timeout /t 30 /nobreak

echo.
echo ✅ Services should be running now:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000/api
echo    MongoDB: mongodb://localhost:27017

pause
```

## API Response Format

All backend endpoints return:

```json
{
  "success": true/false,
  "data": {...},
  "message": "optional message"
}
```

Example:
```bash
GET http://localhost:8000/api/courses

Response:
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId(...)",
      "title": "Course Name",
      "description": "...",
      "price": 49.99,
      "is_published": true
    }
  ],
  "count": 1
}
```

---

**Execute these steps in order and let me know if you encounter any errors!**
