# MongoDB Setup Guide

## Overview
This Laravel backend is fully configured to use MongoDB as the primary database instead of SQL. MongoDB integration is handled through the `jenssegers/mongodb` package.

## Database Connection
- **Database Driver:** MongoDB
- **Connection Name:** `mongodb`
- **Container:** `nextstep_mongodb`
- **Host:** `mongodb` (in Docker) or `localhost` (local)
- **Port:** `27017`
- **Database:** `nextstep_db`
- **Authentication:** Disabled by default (you specified no password needed)

## Configuration Files

### Environment Variables (.env)
```env
DB_CONNECTION=mongodb
DB_HOST=mongodb
DB_PORT=27017
DB_DATABASE=nextstep_db
DB_USERNAME=          # Leave empty (no auth required)
DB_PASSWORD=          # Leave empty (no auth required)
```

### config/database.php
MongoDB connection is configured under `connections['mongodb']` with:
- Driver: `mongodb`
- Host, Port, Database settings from environment
- Auth source: `admin` (when needed)

## MongoDB Models

### Available Models
All models extend `MongoDB\Laravel\Eloquent\Model` and are configured to use MongoDB:

1. **User** (`app/Models/User.php`)
   - Collection: `users`
   - Fields: name, email, password, email_verified_at, remember_token

2. **Course** (`app/Models/Course.php`)
   - Collection: `courses`
   - Fields: title, description, instructor_id, category, level, duration_hours, price, image_url, is_published
   - Relations: hasMany(Lesson), hasMany(Enrollment)

3. **Lesson** (`app/Models/Lesson.php`)
   - Collection: `lessons`
   - Fields: course_id, title, description, content, video_url, duration_minutes, order, is_published
   - Relations: belongsTo(Course)

4. **Enrollment** (`app/Models/Enrollment.php`)
   - Collection: `enrollments`
   - Fields: user_id, course_id, progress_percentage, completed_lessons, status, enrolled_at, completed_at
   - Relations: belongsTo(User), belongsTo(Course)

## API Endpoints

All endpoints are prefixed with `/api` and return JSON responses.

### Course Management
- `GET /api/courses` - Get all published courses
- `POST /api/courses` - Create new course
- `GET /api/courses/{id}` - Get course details
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Health Check
- `GET /api/health` - Check API status and database connection

## Docker Services

### Start All Services
```bash
docker-compose up -d --build
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f [service_name]
```

### Service Details

#### MongoDB Container
```bash
docker-compose exec mongodb mongosh -u root -p --authenticationDatabase admin
```

#### Laravel Backend Container
```bash
docker-compose exec backend bash
```

#### React Frontend Container
```bash
docker-compose exec frontend bash
```

## Using MongoDB with Laravel

### Creating Documents (Inserting Data)
```php
$course = Course::create([
    'title' => 'Learn MongoDB',
    'description' => 'Complete MongoDB tutorial',
    'instructor_id' => '1',
    'category' => 'Database',
    'level' => 'beginner',
    'duration_hours' => 10,
    'price' => 49.99,
]);
```

### Reading Documents (Querying)
```php
// Get all published courses
$courses = Course::where('is_published', true)->get();

// Find by ID
$course = Course::find($id);

// Advanced queries
$courses = Course::where('level', 'beginner')
    ->where('category', 'Database')
    ->orderBy('created_at', 'desc')
    ->get();
```

### Updating Documents
```php
$course = Course::find($id);
$course->update(['title' => 'New Title']);
// or
$course->update($request->all());
```

### Deleting Documents
```php
$course = Course::find($id);
$course->delete();
```

### Relationships
```php
// Get course with all lessons
$course = Course::find($id)->load('lessons');

// Get lessons with course info
$lessons = Lesson::with('course')->get();

// Create related documents
$course->lessons()->create([
    'title' => 'Lesson 1',
    'content' => '...',
]);
```

## Important Notes

1. **No Migrations Needed** - MongoDB uses schemaless collections, so traditional Laravel migrations aren't required
2. **Collections Auto-Created** - MongoDB collections are created automatically on first use
3. **_id Field** - MongoDB automatically creates an `_id` field (ObjectId) as primary key
4. **Timestamps** - Use `created_at` and `updated_at` automatically (when included in fillable array)
5. **No Foreign Keys** - MongoDB uses document references instead of foreign keys

## Database Access

### From Docker
```bash
docker-compose exec mongodb mongosh
use nextstep_db
db.courses.find()
db.users.find()
db.lessons.find()
db.enrollments.find()
```

### From MongoDB Compass (GUI)
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connection URI: `mongodb://localhost:27017/nextstep_db`
3. Browse collections visually

## Testing API Endpoints

### Using cURL
```bash
# Get all courses
curl http://localhost:8000/api/courses

# Create course
curl -X POST http://localhost:8000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn PHP",
    "description": "PHP tutorial",
    "instructor_id": "1",
    "category": "Programming",
    "level": "beginner",
    "duration_hours": 20,
    "price": 99.99
  }'

# Health check
curl http://localhost:8000/api/health
```

### Using Postman
1. Import the collection from: `POSTMAN_COLLECTION.json` (can be generated)
2. Set base URL: `http://localhost:8000/api`
3. Test endpoints interactively

## Troubleshooting

### MongoDB Won't Connect
```bash
# Check if MongoDB container is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Models Not Found
- Ensure model extends `MongoDB\Laravel\Eloquent\Model`
- Verify `$connection = 'mongodb'` and `$collection = 'collection_name'` are set

### No Data in Collections
- Collections are created on first document insert
- Use the API endpoints to create sample data

## Next Steps

1. Run Docker: `docker-compose up -d --build`
2. Create sample courses via API
3. Frontend will fetch data from `/api/courses`
4. Use MongoDB Compass to view data in real-time
