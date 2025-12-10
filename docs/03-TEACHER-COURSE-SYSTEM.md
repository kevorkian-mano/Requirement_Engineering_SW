# 👨‍🏫 Teacher Course System

**Play, Learn & Protect Platform**  
*Complete Teacher Tools & Course Management Documentation*

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Course Management](#course-management)
- [Student Monitoring](#student-monitoring)
- [Teacher Dashboard](#teacher-dashboard)
- [Alert System](#alert-system)
- [Notes & Communication](#notes--communication)
- [Reports & Analytics](#reports--analytics)
- [API Reference](#api-reference)

---

## 🎯 System Overview

### Purpose
The Teacher Course System enables educators to:
- ✅ Manage subject-based courses
- ✅ Monitor student progress and activity
- ✅ Track course-specific game performance
- ✅ Identify students needing attention
- ✅ Communicate with parents
- ✅ Generate comprehensive reports

### Architecture

```
Teacher (User with role='teacher')
    ↓
Assigned to Courses (courseIds array)
    ↓
Courses contain Games (gameIds array)
    ↓
Students play Games → Progress records
    ↓
Teacher monitors Progress for their courses only
```

### Key Features
- 📚 **6 Subject Courses** (Physics, Chemistry, Math, Language, Coding, History)
- 🎮 **41 Games** automatically assigned to courses by category
- 👥 **Student Activity Tracking** across course games
- 📊 **Real-time Analytics** and health monitoring
- 🚨 **Automated Alerts** for concerning behavior
- 📝 **Note System** for observations and follow-ups
- 📧 **Parent Communication** tools

---

## 📚 Course Management

### Course Database Schema

```typescript
@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;                    // "Advanced Mathematics"

  @Prop({ required: true, unique: true })
  code: string;                    // "MATH401"

  @Prop({ required: true })
  description: string;

  @Prop()
  nameArabic: string;

  @Prop()
  descriptionArabic: string;

  @Prop({ required: true })
  subject: string;                 // "Mathematics"

  @Prop()
  level: string;                   // "Beginner" | "Intermediate" | "Advanced"

  @Prop({ type: [String] })
  topics: string[];                // ["Algebra", "Geometry", "Calculus"]

  @Prop()
  academicYear: string;            // "2024-2025"

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  teacherIds: Types.ObjectId[];    // Teachers assigned

  @Prop({ type: [Types.ObjectId], ref: 'Game' })
  gameIds: Types.ObjectId[];       // Games in course

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  studentCount: number;            // Calculated field

  @Prop({ type: Object })
  settings: {
    enableGameBasedLearning: boolean;
    enableLeaderboard: boolean;
    enableTeamWork: boolean;
    minGamesRequired: number;
  };
}
```

### Category-Based Course System

The platform automatically creates **6 courses** mapped to game categories:

```
Course 1: Physics
├── Code: PHYS2024
├── Games: All Physics games (3 games)
├── Description: "Explore forces, motion, energy, and circuits"
└── Teacher: physics.teacher@school.com

Course 2: Chemistry
├── Code: CHEM2024
├── Games: All Chemistry games (2 games)
├── Description: "Discover matter, reactions, and elements"
└── Teacher: chemistry.teacher@school.com

Course 3: Math
├── Code: MATH2024
├── Games: All Math games (8 games)
├── Description: "Master numbers, algebra, geometry, and problem-solving"
└── Teacher: math.teacher@school.com

Course 4: Language
├── Code: LANG2024
├── Games: All Language games (6 games)
├── Description: "Develop vocabulary, grammar, and communication skills"
└── Teacher: language.teacher@school.com

Course 5: Coding
├── Code: CODE2024
├── Games: All Coding games (8 games)
├── Description: "Learn programming, logic, and computational thinking"
└── Teacher: coding.teacher@school.com

Course 6: History
├── Code: HIST2024
├── Games: All History games (5 games)
├── Description: "Journey through Egyptian and world history"
└── Teacher: history.teacher@school.com
```

### Initialize Courses (Script)

```bash
cd backend
npm run init:courses

# Output:
# ✅ Course created: Physics (PHYS2024) - 3 games assigned
# ✅ Course created: Chemistry (CHEM2024) - 2 games assigned
# ✅ Course created: Math (MATH2024) - 8 games assigned
# ✅ Course created: Language (LANG2024) - 6 games assigned
# ✅ Course created: Coding (CODE2024) - 8 games assigned
# ✅ Course created: History (HIST2024) - 5 games assigned
# 
# 🎉 Successfully created 6 courses with 32 games assigned!
```

### Create Teacher Accounts (Script)

```bash
cd backend
npm run create:teachers

# Creates 6 teachers, one per course:
# ✅ physics.teacher@school.com   → Physics Course
# ✅ chemistry.teacher@school.com → Chemistry Course
# ✅ math.teacher@school.com      → Math Course
# ✅ language.teacher@school.com  → Language Course
# ✅ coding.teacher@school.com    → Coding Course
# ✅ history.teacher@school.com   → History Course
#
# All passwords: Teacher123!
```

### Course API Endpoints

```typescript
// Get teacher's assigned courses
GET /teachers/secure/my-courses
Headers: Authorization: Bearer <jwt>

Response:
{
  "courses": [
    {
      "_id": "...",
      "name": "Mathematics Course 2024",
      "code": "MATH2024",
      "subject": "Mathematics",
      "gameIds": [
        {
          "_id": "...",
          "title": "Algebra Explorer",
          "category": "Math",
          "difficulty": "hard",
          "pointsReward": 100
        },
        // ... more games
      ],
      "teacherIds": ["teacherId1", "teacherId2"],
      "studentCount": 45,
      "isActive": true
    }
  ]
}

// Get games for a specific course
GET /teachers/secure/courses/:courseId/games
Headers: Authorization: Bearer <jwt>

// Get course students
GET /teachers/secure/courses/:courseId/students
Headers: Authorization: Bearer <jwt>

// Get course analytics
GET /teachers/secure/courses/:courseId/analytics
Headers: Authorization: Bearer <jwt>
```

---

## 👥 Student Monitoring

### Student Activity Interface

```typescript
export interface CourseStudentActivity {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalGamesPlayed: number;
  completedGames: number;
  totalPointsEarned: number;
  currentLevel: number;
  lastActive: Date;
  
  gameProgress: {
    gameId: string;
    gameTitle: string;
    playCount: number;
    score: number;
    timeSpent: number;          // seconds
    isCompleted: boolean;
    completionPercentage: number;
    lastPlayedAt: Date;
  }[];
  
  recentActivities: {
    gameId: string;
    gameTitle: string;
    playedAt: Date;
    score: number;
    pointsEarned: number;
    isCompleted: boolean;
  }[];
  
  healthStatus: 'healthy' | 'concerning' | 'critical';
}
```

### Health Status Calculation

```typescript
// Critical Status
if (cyberbullyingIncidentCount > 2 || daysSinceLastActive > 7) {
  healthStatus = 'critical';
}

// Concerning Status
else if (recentCyberbullyingIncident || daysSinceLastActive >= 3) {
  healthStatus = 'concerning';
}

// Healthy Status
else {
  healthStatus = 'healthy';
}
```

### Get Course Students

```typescript
GET /teachers/secure/courses/:courseId/students
Headers: Authorization: Bearer <jwt>

Response:
{
  "courseId": "...",
  "courseName": "Mathematics Course 2024",
  "totalStudents": 45,
  "students": [
    {
      "studentId": "...",
      "studentName": "Ahmed Mohamed",
      "studentEmail": "ahmed@example.com",
      "totalGamesPlayed": 12,
      "completedGames": 8,
      "totalPointsEarned": 950,
      "currentLevel": 3,
      "lastActive": "2024-12-09T14:30:00Z",
      "healthStatus": "healthy",
      "gameProgress": [
        {
          "gameId": "...",
          "gameTitle": "Algebra Explorer",
          "playCount": 3,
          "score": 85,
          "timeSpent": 450,
          "isCompleted": true,
          "completionPercentage": 100,
          "lastPlayedAt": "2024-12-08T10:15:00Z"
        },
        // ... more games
      ],
      "recentActivities": [
        {
          "gameId": "...",
          "gameTitle": "Geometry Master",
          "playedAt": "2024-12-09T14:30:00Z",
          "score": 78,
          "pointsEarned": 95,
          "isCompleted": true
        }
      ]
    },
    // ... more students
  ]
}
```

### Get Individual Student Activity

```typescript
GET /teachers/secure/courses/:courseId/students/:studentId/full-activity
Headers: Authorization: Bearer <jwt>

Response:
{
  "student": {
    "studentId": "...",
    "studentName": "Ahmed Mohamed",
    "studentEmail": "ahmed@example.com",
    "currentLevel": 3,
    "totalXP": 450
  },
  "courseActivity": {
    "totalGamesInCourse": 8,
    "gamesPlayed": 5,
    "gamesCompleted": 3,
    "averageScore": 82.5,
    "totalTimeSpent": 2400,  // 40 minutes
    "completionRate": 60,     // 3/5 games
    "lastActive": "2024-12-09T14:30:00Z"
  },
  "gameDetails": [
    {
      "gameId": "...",
      "gameTitle": "Algebra Explorer",
      "attempts": 3,
      "bestScore": 85,
      "avgScore": 78,
      "totalTimeSpent": 450,
      "isCompleted": true,
      "hintsUsed": 2,
      "attempts": [
        {
          "attemptNumber": 1,
          "score": 65,
          "date": "2024-12-05T10:00:00Z",
          "timeSpent": 180
        },
        {
          "attemptNumber": 2,
          "score": 78,
          "date": "2024-12-07T15:00:00Z",
          "timeSpent": 150
        },
        {
          "attemptNumber": 3,
          "score": 85,
          "date": "2024-12-08T10:15:00Z",
          "timeSpent": 120
        }
      ]
    }
  ],
  "behaviorInsights": {
    "playPattern": "regular",      // regular | sporadic | excessive
    "performanceTrend": "improving", // improving | declining | stable
    "engagementLevel": "high",     // high | medium | low
    "riskFactors": []
  }
}
```

---

## 📊 Teacher Dashboard

### Dashboard Overview

```typescript
GET /teachers/secure/courses/dashboard
Headers: Authorization: Bearer <jwt>

Response:
{
  "teacherInfo": {
    "teacherId": "...",
    "name": "Dr. Sarah Ahmed",
    "email": "math.teacher@school.com"
  },
  
  "courseSummary": [
    {
      "courseId": "...",
      "courseName": "Mathematics Course 2024",
      "studentCount": 45,
      "activeStudents": 38,
      "gamesCount": 8,
      "avgCompletion": 65.5,
      "pendingAlerts": 3,
      "criticalAlerts": 1
    }
  ],
  
  "recentActivity": [
    {
      "studentName": "Ahmed Mohamed",
      "courseName": "Mathematics",
      "activity": "Completed Algebra Explorer",
      "score": 85,
      "timestamp": "2024-12-09T14:30:00Z"
    },
    // ... more activities
  ],
  
  "topPerformers": [
    {
      "studentName": "Fatima Ali",
      "courseName": "Mathematics",
      "totalPoints": 1250,
      "level": 4,
      "completionRate": 95
    }
  ],
  
  "studentsNeedingAttention": [
    {
      "studentName": "Omar Hassan",
      "courseName": "Mathematics",
      "reason": "7+ days inactive",
      "priority": "critical",
      "lastActive": "2024-12-02T10:00:00Z"
    }
  ]
}
```

### Course Analytics

```typescript
GET /teachers/secure/courses/:courseId/analytics
Headers: Authorization: Bearer <jwt>

Response:
{
  "courseId": "...",
  "courseName": "Mathematics Course 2024",
  "timestamp": "2024-12-10T12:00:00Z",
  
  "studentMetrics": {
    "totalStudents": 45,
    "activeStudents": 38,
    "inactiveOrCriticalStudents": 7,
    "activitiesPercentage": "84.4%"
  },
  
  "pointsMetrics": {
    "totalPointsDistributed": 28450,
    "avgPointsPerStudent": "632.22"
  },
  
  "engagementMetrics": {
    "avgGamesPlayedPerStudent": "5.67",
    "avgCompletionRate": "68.5%"
  },
  
  "gameMetrics": [
    {
      "gameId": "...",
      "gameTitle": "Algebra Explorer",
      "totalPlays": 125,
      "uniquePlayers": 38,
      "avgScore": 78.5,
      "completionRate": 82
    },
    // ... more games
  ],
  
  "topPerformers": [
    {
      "studentName": "Fatima Ali",
      "pointsEarned": 1250,
      "gamesCompleted": 8
    },
    // Top 5 students
  ],
  
  "needsAttention": [
    {
      "studentName": "Omar Hassan",
      "status": "critical",
      "lastActive": "2024-12-02T10:00:00Z"
    }
  ]
}
```

---

## 🚨 Alert System

### Alert Types & Priorities

```typescript
export enum AlertType {
  LOW_ENGAGEMENT = 'low_engagement',            // Priority: medium
  NO_ACTIVITY = 'no_activity',                  // Priority: high
  BEHAVIORAL_CONCERN = 'behavioral_concern',    // Priority: high
  CYBERBULLYING_INCIDENT = 'cyberbullying_incident', // Priority: critical
  STRUGGLING_STUDENT = 'struggling_student',    // Priority: high
  ACHIEVEMENT_MILESTONE = 'achievement_milestone', // Priority: low
  LEVEL_UP = 'level_up',                       // Priority: low
  RAPID_PROGRESS = 'rapid_progress',           // Priority: medium
  DISTRESS_PATTERN = 'distress_pattern',       // Priority: critical
  PARENT_CONTACT_NEEDED = 'parent_contact_needed', // Priority: high
}
```

### Alert Schema

```typescript
@Schema({ timestamps: true })
export class TeacherAlert {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TeacherClass' })
  classId?: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ required: true, enum: AlertType })
  alertType: AlertType;

  @Prop({ required: true, enum: ['low', 'medium', 'high', 'critical'] })
  priority: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isResolved: boolean;

  @Prop()
  resolutionNotes: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}
```

### Automated Alert Generation

```typescript
// Check Low Engagement (Daily at 6 AM)
@Cron('0 6 * * *')
async checkLowEngagement() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const inactiveStudents = await this.userModel.find({
    role: 'child',
    lastActive: { $lt: threeDaysAgo },
    isActive: true
  });
  
  for (const student of inactiveStudents) {
    await this.createAlert({
      studentId: student._id,
      alertType: AlertType.LOW_ENGAGEMENT,
      priority: 'medium',
      message: `${student.firstName} has been inactive for 3+ days`,
      metadata: { daysSinceActive: calculateDays(student.lastActive) }
    });
  }
}

// Check Struggling Students (Daily at 7 AM)
@Cron('0 7 * * *')
async checkStrugglingStudents() {
  const students = await this.getStudentsWithLowScores();
  
  for (const student of students) {
    if (student.avgScore < 50) {
      await this.createAlert({
        studentId: student._id,
        alertType: AlertType.STRUGGLING_STUDENT,
        priority: 'high',
        message: `${student.firstName} has average score below 50%`,
        metadata: { avgScore: student.avgScore }
      });
    }
  }
}
```

### Alert API Endpoints

```typescript
// Get unread alerts
GET /teachers/alerts/unread
Headers: Authorization: Bearer <jwt>

Response:
{
  "unreadCount": 5,
  "alerts": [
    {
      "alertId": "...",
      "alertType": "cyberbullying_incident",
      "priority": "critical",
      "message": "Cyberbullying incident detected for Ahmed Mohamed",
      "studentName": "Ahmed Mohamed",
      "createdAt": "2024-12-09T10:00:00Z",
      "metadata": {
        "incidentId": "...",
        "severity": "high"
      }
    }
  ]
}

// Mark alert as read
PUT /teachers/alerts/:alertId/read
Headers: Authorization: Bearer <jwt>

// Resolve alert with notes
PUT /teachers/alerts/:alertId/resolve
Headers: Authorization: Bearer <jwt>
Body: {
  "resolutionNotes": "Contacted parent, student received counseling"
}

// Get alert statistics
GET /teachers/alerts/statistics
Headers: Authorization: Bearer <jwt>

Response:
{
  "totalAlerts": 45,
  "unreadAlerts": 5,
  "resolvedAlerts": 35,
  "pendingAlerts": 10,
  "byPriority": {
    "critical": 2,
    "high": 8,
    "medium": 15,
    "low": 20
  },
  "byType": {
    "low_engagement": 12,
    "struggling_student": 8,
    "cyberbullying_incident": 2,
    // ... more types
  }
}
```

---

## 📝 Notes & Communication

### Teacher Notes System

```typescript
@Schema({ timestamps: true })
export class TeacherNote {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  teacherId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  note: string;

  @Prop({ required: true, enum: NoteType })
  noteType: NoteType;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop()
  followUpDate: Date;

  @Prop({ default: false })
  followUpCompleted: boolean;
}

export enum NoteType {
  OBSERVATION = 'observation',
  CONCERN = 'concern',
  ACHIEVEMENT = 'achievement',
  PARENT_CONTACT = 'parent_contact',
  INTERVENTION = 'intervention',
  FOLLOW_UP = 'follow_up',
}
```

### Notes API

```typescript
// Create note
POST /teachers/notes
Headers: Authorization: Bearer <jwt>
Body: {
  "studentId": "...",
  "note": "Ahmed showed significant improvement in algebra concepts",
  "noteType": "observation",
  "tags": ["math", "improvement", "algebra"],
  "isPrivate": false,
  "followUpDate": "2024-12-15T10:00:00Z"
}

// Get student notes
GET /teachers/notes/student/:studentId
Headers: Authorization: Bearer <jwt>

Response:
{
  "studentName": "Ahmed Mohamed",
  "totalNotes": 8,
  "notes": [
    {
      "noteId": "...",
      "teacherName": "Dr. Sarah Ahmed",
      "note": "Ahmed showed significant improvement in algebra concepts",
      "noteType": "observation",
      "tags": ["math", "improvement", "algebra"],
      "createdAt": "2024-12-09T10:00:00Z",
      "followUpDate": "2024-12-15T10:00:00Z",
      "followUpCompleted": false
    }
  ]
}

// Get pending follow-ups
GET /teachers/notes/follow-ups
Headers: Authorization: Bearer <jwt>

Response:
{
  "pendingFollowUps": 5,
  "notes": [
    {
      "noteId": "...",
      "studentName": "Omar Hassan",
      "note": "Needs extra help with geometry",
      "followUpDate": "2024-12-10T10:00:00Z",
      "daysOverdue": 0
    }
  ]
}

// Complete follow-up
PUT /teachers/notes/:noteId/complete
Headers: Authorization: Bearer <jwt>
Body: {
  "completionNotes": "Provided extra tutoring, student now understands concepts"
}
```

---

## 📄 Reports & Analytics

### Generate Class Report

```typescript
GET /teachers/secure/courses/:courseId/reports/students
Headers: Authorization: Bearer <jwt>
Query: ?sortBy=name|pointsEarned|lastActive

Response:
{
  "courseId": "...",
  "courseName": "Mathematics Course 2024",
  "generatedAt": "2024-12-10T12:00:00Z",
  "totalStudents": 45,
  "students": [
    {
      "studentName": "Fatima Ali",
      "studentEmail": "fatima@example.com",
      "totalGamesPlayed": 8,
      "completedGames": 7,
      "totalPointsEarned": 1250,
      "currentLevel": 4,
      "lastActive": "2024-12-09T18:00:00Z",
      "healthStatus": "healthy",
      "averageScore": 88.5,
      "completionRate": 87.5
    },
    // ... sorted by requested field
  ]
}
```

---

## 🔌 API Reference

### Complete Endpoint List

```
Course Management:
POST   /courses                                      # Create course (Admin)
GET    /courses                                      # List all courses
GET    /courses/:id                                  # Course details
PUT    /courses/:id                                  # Update course
DELETE /courses/:id                                  # Delete course

Teacher Course Access:
GET    /teachers/secure/my-courses                   # My assigned courses
GET    /teachers/secure/courses/:courseId/games      # Course games
GET    /teachers/secure/courses/:courseId/students   # Course students
GET    /teachers/secure/courses/:courseId/analytics  # Course analytics

Student Monitoring:
GET    /teachers/secure/courses/:courseId/students/:studentId/full-activity  # Student details

Alerts:
POST   /teachers/alerts                              # Create alert
GET    /teachers/alerts/unread                       # Unread alerts
GET    /teachers/alerts                              # All alerts (filtered)
PUT    /teachers/alerts/:id/read                     # Mark read
PUT    /teachers/alerts/:id/resolve                  # Resolve alert
GET    /teachers/alerts/statistics                   # Alert stats

Notes:
POST   /teachers/notes                               # Create note
GET    /teachers/notes/student/:studentId            # Student notes
GET    /teachers/notes                               # All notes
GET    /teachers/notes/follow-ups                    # Pending follow-ups
PUT    /teachers/notes/:id/complete                  # Complete follow-up
PUT    /teachers/notes/:id                           # Update note

Reports:
GET    /teachers/secure/courses/:courseId/reports/students  # Class report
```

---

**Last Updated**: December 2024  
**System Version**: 1.0  
**Total Courses**: 6  
**Documentation Version**: 1.0