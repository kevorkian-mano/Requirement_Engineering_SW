# Play, Learn & Protect - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "child", // "child" | "parent" | "teacher"
  "ageGroup": "6-8", // "3-5" | "6-8" | "9-12" (required for children)
  "dateOfBirth": "2015-05-15", // optional
  "parentId": "parent-id-here" // optional, for linking child to parent
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token-here"
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token-here"
}
```

### Get Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "child",
  "ageGroup": "6-8",
  "points": 150,
  "level": 2,
  ...
}
```

---

## Games Endpoints

### Get All Games
**GET** `/games?category=math&ageGroup=6-8`

**Query Parameters:**
- `category` (optional): "physics" | "chemistry" | "math" | "language" | "coding"
- Games are automatically filtered by user's age group if logged in

**Response:**
```json
[
  {
    "_id": "...",
    "title": "Math Adventure",
    "titleArabic": "مغامرة الرياضيات",
    "description": "...",
    "category": "math",
    "difficulty": "easy",
    "ageGroups": ["6-8", "9-12"],
    "pointsReward": 50,
    "thumbnail": "...",
    "gameUrl": "..."
  }
]
```

### Get Game by ID
**GET** `/games/:id`

**Response:**
```json
{
  "_id": "...",
  "title": "...",
  ...
}
```

### Start Playing Game
**POST** `/games/:id/play`

Increments play count for the game.

### Create Game (Teacher Only)
**POST** `/games`

**Body:**
```json
{
  "title": "Physics Puzzle",
  "titleArabic": "لغز الفيزياء",
  "description": "...",
  "descriptionArabic": "...",
  "category": "physics",
  "difficulty": "medium",
  "ageGroups": ["9-12"],
  "pointsReward": 75,
  "thumbnail": "url",
  "gameUrl": "url",
  "gameConfig": {}
}
```

---

## Progress & Gamification Endpoints

### Save Game Progress
**POST** `/progress`

**Body:**
```json
{
  "gameId": "game-id",
  "score": 85,
  "pointsEarned": 50,
  "timeSpent": 300, // seconds
  "isCompleted": true,
  "completionPercentage": 100,
  "gameData": {} // optional game-specific data
}
```

**Response:**
```json
{
  "_id": "...",
  "userId": "...",
  "gameId": "...",
  "score": 85,
  "pointsEarned": 50,
  "timeSpent": 300,
  "isCompleted": true,
  "completionPercentage": 100,
  "playCount": 1,
  "lastPlayedAt": "2024-01-15T10:30:00Z"
}
```

### Get User Progress
**GET** `/progress`

Returns all progress records for the current user.

**Response:**
```json
[
  {
    "_id": "...",
    "gameId": { ... },
    "score": 85,
    "pointsEarned": 50,
    "isCompleted": true,
    ...
  }
]
```

### Get Leaderboard
**GET** `/progress/leaderboard?ageGroup=6-8&limit=10`

**Query Parameters:**
- `ageGroup` (optional): Filter by age group
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
[
  {
    "rank": 1,
    "userId": "...",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "...",
    "points": 500,
    "gamesCompleted": 10,
    "level": 5
  }
]
```

### Get User Achievements
**GET** `/progress/achievements`

**Response:**
```json
[
  {
    "_id": "...",
    "code": "first_game",
    "name": "First Game",
    "nameArabic": "أول لعبة",
    "description": "...",
    "type": "first_game",
    "pointsReward": 10,
    "unlockedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## Monitoring Endpoints

### Log Activity
**POST** `/monitoring/activity`

**Body:**
```json
{
  "type": "game_played", // "game_played" | "learning_module" | "creative_project" | "achievement_unlocked" | "competition_joined"
  "duration": 300, // seconds
  "gameId": "game-id", // optional
  "metadata": {} // optional
}
```

### Get Screen Time
**GET** `/monitoring/screen-time/:userId?range=week`

**Query Parameters:**
- `range` (optional): "day" | "week" | "month"
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `userId` (optional): For parents/teachers to view child's data

**Response:**
```json
{
  "userId": "...",
  "period": {
    "start": "2024-01-08T00:00:00Z",
    "end": "2024-01-15T00:00:00Z"
  },
  "totalMinutes": 180,
  "totalSeconds": 10800,
  "dailyBreakdown": [
    {
      "date": "2024-01-15",
      "minutes": 30
    }
  ],
  "activityBreakdown": [
    {
      "type": "game_played",
      "minutes": 120
    }
  ],
  "totalActivities": 15
}
```

### Get Activity Log
**GET** `/monitoring/activity/:userId?range=week`

Returns detailed activity log for the specified user.

### Get Class Activity (Teacher Only)
**GET** `/monitoring/class`

**Response:**
```json
{
  "students": [
    {
      "student": {
        "id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "..."
      },
      "totalMinutes": 120,
      "activityCount": 10,
      "lastActivity": "2024-01-15T10:30:00Z"
    }
  ],
  "totalStudents": 25
}
```

---

## Alerts Endpoints

### Detect Threats
**POST** `/alerts/detect`

**Body:**
```json
{
  "userId": "user-id",
  "content": "text content to check",
  "type": "cyberbullying" // or "inappropriate"
}
```

### Check Excessive Gaming
**POST** `/alerts/check-gaming`

**Body:**
```json
{
  "userId": "user-id"
}
```

Checks if user has exceeded daily screen time limit (2 hours).

### Get User Alerts
**GET** `/alerts/:userId?unreadOnly=true`

**Query Parameters:**
- `unreadOnly` (optional): "true" | "false"

**Response:**
```json
[
  {
    "_id": "...",
    "userId": "...",
    "type": "cyberbullying",
    "severity": "high",
    "title": "Cyberbullying Detected",
    "titleArabic": "تم اكتشاف تنمر إلكتروني",
    "message": "...",
    "messageArabic": "...",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Parent Alerts (Parent Only)
**GET** `/alerts/parent/all`

Returns all unread alerts for parent's children.

### Mark Alert as Read
**PUT** `/alerts/:id/read`

Marks an alert as read.

---

## Error Responses

All endpoints may return the following error formats:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## User Roles

- **child**: Can play games, view own progress, earn points
- **parent**: Can monitor children's activity, view alerts, screen time
- **teacher**: Can create games, view class performance, monitor students

---

## Data Models

### User
- `email`: string (unique)
- `password`: string (hashed)
- `firstName`: string
- `lastName`: string
- `role`: "child" | "parent" | "teacher"
- `ageGroup`: "3-5" | "6-8" | "9-12" (for children)
- `points`: number
- `level`: number
- `totalScreenTime`: number (minutes)
- `parentId`: string (for children)
- `childrenIds`: string[] (for parents)
- `studentsIds`: string[] (for teachers)
- `loginStreak`: number

### Game
- `title`: string
- `titleArabic`: string (optional)
- `description`: string
- `category`: "physics" | "chemistry" | "math" | "language" | "coding"
- `difficulty`: "easy" | "medium" | "hard"
- `ageGroups`: string[]
- `pointsReward`: number
- `thumbnail`: string (optional)
- `gameUrl`: string (optional)

### Progress
- `userId`: ObjectId
- `gameId`: ObjectId
- `score`: number
- `pointsEarned`: number
- `timeSpent`: number (seconds)
- `isCompleted`: boolean
- `completionPercentage`: number
- `playCount`: number

### Alert
- `userId`: ObjectId
- `parentId`: ObjectId (optional)
- `type`: "cyberbullying" | "inappropriate_content" | "excessive_gaming" | "positive_behavior" | "achievement"
- `severity`: "low" | "medium" | "high"
- `title`: string
- `message`: string
- `titleArabic`: string (optional)
- `messageArabic`: string (optional)
- `isRead`: boolean

