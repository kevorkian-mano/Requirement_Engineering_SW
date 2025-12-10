# Play, Learn & Protect – Full API Reference

Base URL (local dev):
```
http://localhost:3001/api
```
Authentication: JWT Bearer unless stated otherwise.
```
Authorization: Bearer <token>
```
Error shape (all modules):
```json
{ "statusCode": 400, "message": "Error message", "error": "Bad Request" }
```

---

## Auth
- **POST /auth/register** – create child/parent/teacher.
  - Body: `{ email, password, firstName, lastName, role, ageGroup?, dateOfBirth?, parentId? }`
  - 201 Response: `{ user: {...}, token }`
- **POST /auth/login** – get JWT.
  - Body: `{ email, password }`
  - 200 Response: `{ user: {...}, token }`
- **GET /auth/profile** – current user profile (auth required).

---

## Games
- **GET /games?category&ageGroup** – list games (auto-filter by user age when logged in).
- **GET /games/:id** – single game details.
- **POST /games/:id/play** – increment play count.
- **POST /games** (Teacher) – create game.
  - Body example:
  ```json
  {
    "title": "Physics Puzzle",
    "description": "...",
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

## Progress
- **POST /progress** – save gameplay result.
  - Body: `{ gameId, score, pointsEarned, timeSpent, isCompleted, completionPercentage, gameData? }`
- **GET /progress** – all progress for current user.
- **GET /progress/leaderboard?ageGroup&limit** – leaderboard slice.
- **GET /progress/achievements** – unlocked achievements.

---

## Levels
Self (current user):
- `GET /levels/me` – level snapshot.
- `GET /levels/me/progress` – XP toward next level.
- `GET /levels/me/unlocked-games` / `locked-games` / `next-level-games` / `all-games-status`.
- `GET /levels/me/can-play/:gameId` – gate check.
- `GET /levels/me/milestones` – unlock milestones.
- `GET /levels/me/xp-transactions` – XP history.
- `GET /levels/me/xp-statistics` – XP analytics.
- `GET /levels/me/available-categories` / `recommended` – discovery.
- `POST /levels/me/award-xp` – award XP to self (limited use).

Teacher/Admin for students (mirrors self endpoints):
- `GET /levels/:userId` (+ `/progress`, `/unlocked-games`, `/locked-games`, `/next-level-games`, `/all-games-status`, `/can-play/:gameId`).
- `POST /levels/:userId/award-xp` – award XP to student.
- `POST /levels/:userId/initialize` – create level profile.
- `POST /levels/:userId/reset` – reset to Level 1.

Config:
- `GET /levels/config/all` | `/levels/config/:level` – level thresholds/unlocks.

---

## Courses
- **POST /courses** – create course (teacher).
- **GET /courses** – list (+ filters: `isActive`, `subject`, `level`).
- **GET /courses/:courseId** – detail.
- **GET /courses/teacher/:teacherId** – by teacher.
- **GET /courses/game/:gameId** – by game.
- **PUT /courses/:courseId** – update course/meta/games/teachers/settings.
- **POST /courses/:courseId/teachers/:teacherId** | **DELETE ...** – manage teachers.
- **POST /courses/:courseId/games/:gameId** | **DELETE ...** – manage games.
- **GET /courses/:courseId/games** – list games in course.
- **POST /courses/:courseId/deactivate** – soft disable.
- **DELETE /courses/:courseId** – delete.

Teacher course dashboards:
- `GET /teachers/courses?teacherId=...` – teacher’s courses.
- `GET /teachers/courses/dashboard?teacherId=...` – dashboard cards.
- `GET /teachers/courses/:courseId/students?teacherId=...` – roster with health.
- `GET /teachers/courses/:courseId/students/:studentId/activity[?startDate&endDate]` – student activity in course.
- `GET /teachers/courses/:courseId/games/activity?teacherId=...` – game analytics.

---

## Teachers
Dashboard & classes:
- `GET /teachers/dashboard?teacherId` – overview (alerts, health, activity).
- `GET /teachers/classes?teacherId` – classes list.
- `GET /teachers/classes/:classId/overview?teacherId` – class snapshot.
- `POST /teachers/classes` – create class.
- `POST /teachers/classes/:classId/students` – bulk add students.
- `DELETE /teachers/classes/:classId/students/:studentId?teacherId` – remove student.
- `PUT /teachers/classes/:classId/settings` – update settings.

Students & activity:
- `GET /teachers/classes/:classId/students?teacherId` – students with status.
- `GET /teachers/students/:studentId/status?teacherId` – detailed status.
- `GET /teachers/activity?teacherId&limit` – recent feed.

Alerts (teacher view):
- `GET /teachers/alerts?teacherId&classId&studentId&alertType&priority&isRead&isResolved&limit`
- `GET /teachers/alerts/unread?teacherId&limit`
- `GET /teachers/alerts/statistics?teacherId`
- `POST /teachers/alerts` – manual alert creation.
- `POST /teachers/alerts/:alertId/read` / `resolve` / `snooze` – manage alert state.

Notes & parent comms (from teacher system):
- `POST /teachers/students/:studentId/notes` – add note/follow-up.
- `GET /teachers/students/:studentId/notes?teacherId`
- `POST /teachers/parents/message` – send parent message.

---

## Monitoring
- **POST /monitoring/activity** – log activity.
- **GET /monitoring/screen-time/:userId?range=day|week|month&startDate&endDate** – screen-time summary.
- **GET /monitoring/activity/:userId?range=day|week|month** – activity log.
- **GET /monitoring/class** – class activity (teacher).
- **GET /monitoring/analytics/:userId** – analytics summary.
- **GET /monitoring/patterns/:userId** – behavior patterns.

---

## Cyberbullying
Student-facing:
- `POST /cyberbullying/check-message` – pre-post scan.
- `GET /cyberbullying/student/:studentId/safety-profile` – risk snapshot.
- `GET /cyberbullying/incidents/student/:studentId?role=reported|victim` – history.

Teacher-facing:
- `GET /cyberbullying/incidents/pending` – review queue.
- `PUT /cyberbullying/incidents/:incidentId/review` – approve/deny with notes.
- `PUT /cyberbullying/incidents/:incidentId/apply-consequences` – restrictions/training.
- `POST /cyberbullying/incidents/:incidentId/notify-victim`
- `POST /cyberbullying/incidents/:incidentId/notify-parent`
- `GET /cyberbullying/statistics/classroom?timeWindowDays=30`
- `GET /cyberbullying/dashboard?classroomId=...`
- `GET /cyberbullying/analysis/hotspots?classroomId=...`

Background/analysis:
- `POST /cyberbullying/analyze/behavior/:studentId`
- `POST /cyberbullying/analyze/social`
- `POST /cyberbullying/full-check/:studentId`

---

## Monitoring/Alerts Quick Examples
**Log activity**
```http
POST /monitoring/activity
Authorization: Bearer <token>
Content-Type: application/json

{ "type": "game_played", "duration": 300, "gameId": "abc123", "metadata": {"score": 85} }
```

**Check screen time**
```http
GET /monitoring/screen-time/USER123?range=week
Authorization: Bearer <token>
```
Response (200):
```json
{
  "userId": "USER123",
  "period": { "start": "2024-01-08T00:00:00Z", "end": "2024-01-15T00:00:00Z" },
  "totalMinutes": 180,
  "dailyBreakdown": [{ "date": "2024-01-15", "minutes": 30 }],
  "activityBreakdown": [{ "type": "game_played", "minutes": 120 }],
  "totalActivities": 15
}
```

**Detect bullying text**
```http
POST /alerts/detect
Authorization: Bearer <token>
Content-Type: application/json

{ "userId": "U1", "content": "you are so stupid", "type": "cyberbullying" }
```

**Apply consequences**
```http
PUT /cyberbullying/incidents/INC123/apply-consequences
Authorization: Bearer <token>
Content-Type: application/json

{ "consequences": ["24h_chat_ban", "kindness_training"], "restrictionDays": 1 }
```

---

## Common Patterns & Guidelines
- **Auth**: Send JWT in `Authorization: Bearer` header; refresh via login.
- **Roles**: Teacher-only endpoints enforce `teacherId` ownership; parent-only views use linked child IDs; child endpoints scoped to self.
- **Pagination/limits**: Where supported (alerts, activity), use `limit` query param; defaults noted above.
- **Date ranges**: Use ISO 8601 strings; `startDate`/`endDate` optional when `range` provided.
- **Idempotency**: Read endpoints are idempotent; write endpoints return created/updated resources.
- **Validation**: ObjectId checks on ids; unique constraints (course code) return `409 Conflict`.
- **Localization**: Many resources store Arabic + English fields (e.g., `titleArabic`, `descriptionArabic`).

---

## Sample Error Cases
- 400 Bad Request – missing required field or invalid ObjectId.
- 401 Unauthorized – missing/invalid JWT.
- 403 Forbidden – role/ownership check failed (e.g., non-teacher calling teacher endpoint).
- 404 Not Found – resource missing (game/course/incident).
- 409 Conflict – duplicate course code or already-linked relation.
- 500 Server Error – unexpected server/db issue.
