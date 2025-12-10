# 🏗️ Project Setup & Architecture

**Play, Learn & Protect Platform**  
*Complete Setup and Architecture Documentation*

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [User Roles & Access Control](#user-roles--access-control)
- [Architecture Patterns](#architecture-patterns)

---

## 🎯 Overview

**Play, Learn & Protect** is a comprehensive educational gaming platform designed for Egyptian children (ages 3-12) that combines:
- 🎮 Educational games across 6 subjects
- 📊 Progress tracking and gamification
- 👨‍🏫 Teacher management tools
- 🛡️ Advanced safety monitoring
- 👨‍👩‍👧 Parent oversight features

### Target Audience
- **Primary Users**: Children ages 3-12 (Egyptian context)
- **Age Groups**: 3-5, 6-8, 9-12 years old
- **Language Support**: Arabic (primary) + English (bilingual)
- **Cultural Context**: Egyptian history, values, and family structure

---

## 🛠️ Technology Stack

### Frontend
```
Framework:     Next.js 14+ (App Router)
Language:      TypeScript
UI Library:    Radix UI (accessible components)
Styling:       Tailwind CSS
Game Engine:   Phaser.js 3.x
State:         Zustand
Icons:         Lucide React
HTTP Client:   Axios
```

### Backend
```
Framework:     NestJS 10+
Language:      TypeScript
Runtime:       Node.js 18+
Database:      MongoDB + Mongoose ODM
Authentication: JWT (JSON Web Tokens)
Validation:    class-validator, class-transformer
Security:      bcryptjs, helmet, cors
API Style:     RESTful
```

### Database
```
Primary:       MongoDB 8+
ODM:           Mongoose
Collections:   15+ schemas
Indexing:      Compound indexes on queries
```

### Development Tools
```
Package Manager: npm
Version Control: Git
Code Quality:    ESLint, Prettier
Build Tools:     Turbo, Webpack
Testing:         Jest (planned)
```

---

## 📂 Project Structure

```
requiremnet-game/
│
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # JWT authentication & guards
│   │   ├── users/             # User management service
│   │   ├── games/             # Game CRUD operations
│   │   ├── progress/          # Progress & gamification
│   │   ├── levels/            # Level progression system
│   │   ├── achievements/      # Achievement system
│   │   ├── courses/           # Course management
│   │   ├── teachers/          # Teacher dashboard & tools
│   │   │   ├── teachers.controller.ts
│   │   │   ├── teacher-dashboard.service.ts
│   │   │   ├── teacher-course.service.ts
│   │   │   ├── teacher-monitoring.service.ts
│   │   │   ├── teacher-notes.service.ts
│   │   │   └── teacher-authorization.service.ts
│   │   ├── monitoring/        # Activity & screen time tracking
│   │   ├── alerts/            # Alert generation & management
│   │   ├── cyberbullying/     # Safety detection system
│   │   │   ├── cyberbullying.controller.ts
│   │   │   ├── cyberbullying-detection.service.ts
│   │   │   ├── text-analysis.service.ts
│   │   │   ├── behavioral-analysis.service.ts
│   │   │   └── social-network.service.ts
│   │   ├── schemas/           # MongoDB schemas (15+)
│   │   │   ├── user.schema.ts
│   │   │   ├── game.schema.ts
│   │   │   ├── progress.schema.ts
│   │   │   ├── player-level.schema.ts
│   │   │   ├── course.schema.ts
│   │   │   ├── teacher-class.schema.ts
│   │   │   ├── cyberbullying-incident.schema.ts
│   │   │   └── ... (more schemas)
│   │   ├── scripts/           # Database seeding & utilities
│   │   │   ├── seed-games.ts
│   │   │   ├── init-category-courses.ts
│   │   │   └── create-teachers.ts
│   │   ├── common/            # Shared utilities & guards
│   │   ├── app.module.ts      # Main application module
│   │   └── main.ts            # Application entry point
│   ├── test/                  # E2E tests
│   ├── nest-cli.json          # NestJS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── package.json           # Dependencies & scripts
│   └── .env                   # Environment variables
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Registration page
│   │   │   ├── dashboard/     # Student dashboard
│   │   │   ├── games/         # Games browser & player
│   │   │   ├── teacher/       # Teacher dashboard
│   │   │   ├── parent/        # Parent dashboard
│   │   │   └── layout.tsx     # Root layout
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Radix UI components
│   │   │   ├── games/         # Game-related components
│   │   │   ├── courses/       # Course components
│   │   │   ├── teachers/      # Teacher components
│   │   │   └── monitoring/    # Monitoring components
│   │   ├── features/          # Feature modules
│   │   │   ├── game-player/   # Phaser.js game player
│   │   │   └── games/         # Individual game implementations
│   │   │       ├── AlgebraExplorerGame.ts
│   │   │       ├── VocabularyChampionGame.ts
│   │   │       ├── GameDeveloperGame.ts
│   │   │       └── ... (more games)
│   │   ├── lib/               # Utilities & API client
│   │   │   ├── api.ts         # Axios API client
│   │   │   └── utils.ts       # Helper functions
│   │   ├── stores/            # Zustand state management
│   │   │   └── auth.ts        # Authentication store
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── styles/            # Global styles
│   ├── public/                # Static assets
│   │   ├── images/
│   │   └── games/
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.ts     # Tailwind configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── package.json           # Dependencies & scripts
│   └── .env.local             # Environment variables
│
├── docs/                       # Documentation (consolidated)
│   ├── 01-PROJECT-SETUP-AND-ARCHITECTURE.md
│   ├── 02-GAMES-LEVELS-AND-GAMIFICATION.md
│   ├── 03-TEACHER-COURSE-SYSTEM.md
│   ├── 04-SAFETY-AND-MONITORING.md
│   └── 05-API-REFERENCE.md
│
├── data/                       # MongoDB data directory
│   └── db/                    # Database files
│
└── README.md                   # Main project documentation
```

---

## 🚀 Installation & Setup

### Prerequisites

Before starting, ensure you have:

```bash
✅ Node.js 18+ installed
✅ npm or yarn package manager
✅ MongoDB 8+ (local or Atlas)
✅ Git for version control
✅ Code editor (VS Code recommended)
```

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd requiremnet-game
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# (See Environment Configuration section below)
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
```

### Step 4: Database Seeding

```bash
# From backend directory
cd backend

# Seed games (41 games across 6 categories)
npm run seed:games

# Initialize category-based courses (6 courses)
npm run init:courses

# Create teacher accounts (6 teachers, one per course)
npm run create:teachers

# Optional: Seed achievements
npm run seed:achievements
```

---

## ⚙️ Environment Configuration

### Backend `.env` File

Create `/backend/.env` with the following configuration:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/play-learn-protect
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/play-learn-protect

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Optional: Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend `.env.local` File

Create `/frontend/.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## 🗄️ Database Setup

### Local MongoDB Setup

```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community@8.0

# Start MongoDB service
brew services start mongodb-community@8.0

# Verify MongoDB is running
mongosh
# Should connect to mongodb://127.0.0.1:27017
```

### MongoDB Atlas Setup (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get connection string
5. Add to `MONGODB_URI` in `.env`

### Database Structure

The application creates these collections automatically:

```
Collections:
├── users                    # All user accounts
├── games                    # Game catalog
├── progress                 # Game progress records
├── playerlevels             # Level progression
├── xptransactions          # XP history
├── courses                  # Course definitions
├── teacherclasses          # Teacher classes
├── teacheralerts           # Alert system
├── teachernotes            # Teacher notes
├── cyberbullyingincidents  # Safety incidents
├── behavioralanomalies     # Behavior tracking
├── activities              # Activity logs
├── screentimes             # Screen time tracking
└── achievements            # Achievement definitions
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev

# Output:
# [Nest] 12345 - Server running on http://localhost:3001
# [Nest] 12345 - MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Output:
# ▲ Next.js 14.2.33
# - Local:        http://localhost:3000
# ✓ Ready in 9.4s
```

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Access Application

Open browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Health Check**: http://localhost:3001/api/health

---

## 👥 User Roles & Access Control

### Role Hierarchy

```
Administrator (planned)
    ↓
Teacher
    ↓
Parent
    ↓
Child
```

### Role Definitions

#### 1. **Child (Student)**
- **Age Groups**: 3-5, 6-8, 9-12 years
- **Permissions**:
  - ✅ Play age-appropriate games
  - ✅ View own progress and achievements
  - ✅ Unlock games by leveling up
  - ✅ View leaderboards
  - ❌ Cannot register (parent must register them)
  - ❌ Cannot access other students' data

#### 2. **Parent**
- **Permissions**:
  - ✅ Register child accounts
  - ✅ Monitor child activity
  - ✅ View screen time reports
  - ✅ Receive safety alerts
  - ✅ Set screen time limits
  - ✅ View cyberbullying reports
  - ❌ Cannot access teacher dashboard

#### 3. **Teacher**
- **Permissions**:
  - ✅ Manage courses and classes
  - ✅ Monitor all students in their courses
  - ✅ View student progress and analytics
  - ✅ Review cyberbullying incidents
  - ✅ Create alerts and notes
  - ✅ Award bonus XP
  - ✅ Generate reports
  - ❌ Cannot register (admin creates accounts)

### Authentication Flow

```typescript
// Registration (Child/Parent only)
POST /auth/register
{
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'child' | 'parent',
  ageGroup?: '3-5' | '6-8' | '9-12',  // Required for children
  parentId?: string                    // Link child to parent
}

// Login (All roles)
POST /auth/login
{
  email: string,
  password: string
}

// Response includes JWT token
{
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    _id: "...",
    email: "...",
    role: "child",
    firstName: "...",
    // ... other fields
  }
}
```

### JWT Token Structure

```typescript
// Token Payload
{
  sub: userId,           // User ID
  email: userEmail,
  role: userRole,        // child | parent | teacher
  iat: issuedAt,
  exp: expiresAt         // 7 days default
}
```

### Protected Routes

Frontend routes are protected by role:

```typescript
Routes:
/dashboard        → Child, Parent
/games            → Child
/teacher          → Teacher only
/parent           → Parent only
/admin            → Admin only (planned)
```

---

## 🏛️ Architecture Patterns

### Backend Architecture

#### Module Structure (NestJS)
```
AppModule (Root)
├── AuthModule
├── UsersModule
├── GamesModule
├── ProgressModule
├── LevelsModule
├── CoursesModule
├── TeachersModule
├── MonitoringModule
├── AlertsModule
└── CyberbullyingModule
```

#### Layered Architecture
```
Controllers         → HTTP endpoints
    ↓
Services           → Business logic
    ↓
Repositories       → Data access (Mongoose)
    ↓
Database           → MongoDB
```

#### Dependency Injection
```typescript
@Injectable()
export class TeacherCourseService {
  constructor(
    @InjectModel(Course.name) 
    private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) 
    private userModel: Model<UserDocument>,
    @InjectModel(Progress.name) 
    private progressModel: Model<ProgressDocument>,
  ) {}
}
```

### Frontend Architecture

#### Component Structure
```
App Router (Next.js 14)
├── Pages (app/)
├── Components
│   ├── UI Components (Radix)
│   ├── Feature Components
│   └── Layout Components
├── Stores (Zustand)
├── API Client (Axios)
└── Game Engine (Phaser.js)
```

#### State Management
```typescript
// Zustand store example
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: async (email, password) => { /* ... */ },
  logout: () => { /* ... */ },
}));
```

#### API Client Pattern
```typescript
// Centralized API client
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API modules
export const gamesAPI = {
  getAll: (params) => api.get('/games', { params }),
  getById: (id) => api.get(`/games/${id}`),
  play: (id) => api.post(`/games/${id}/play`),
};
```

### Database Patterns

#### Schema Design
```typescript
// Example: User Schema
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: ['child', 'parent', 'teacher'] })
  role: string;

  @Prop({ type: [Types.ObjectId], ref: 'Course' })
  courseIds: Types.ObjectId[];
  
  // ... more fields
}
```

#### Indexing Strategy
```typescript
// Compound indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
GameSchema.index({ category: 1, ageGroups: 1 });
ProgressSchema.index({ userId: 1, gameId: 1 });
CourseSchema.index({ teacherIds: 1, isActive: 1 });
```

---

## 🔐 Security Measures

### Authentication Security
- ✅ JWT tokens with 7-day expiration
- ✅ Bcrypt password hashing (10 rounds)
- ✅ HTTP-only cookies (planned)
- ✅ CORS protection
- ✅ Helmet.js security headers

### Authorization Guards
```typescript
// JWT Auth Guard
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// Role-based Guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
@Get('dashboard')
getTeacherDashboard() {
  // Only teachers can access
}
```

### Input Validation
```typescript
// DTO with validation
export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(GameCategory)
  category: GameCategory;

  @IsNumber()
  @Min(0)
  @Max(200)
  pointsReward: number;
}
```

---

## 📊 Monitoring & Logging

### Application Logging
```typescript
// NestJS Logger
private readonly logger = new Logger(ServiceName.name);

this.logger.log('User logged in successfully');
this.logger.warn('High API usage detected');
this.logger.error('Database connection failed', error.stack);
```

### Error Handling
```typescript
// Global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    // Log error
    // Send appropriate response
  }
}
```

---

## 🧪 Testing (Planned)

### Unit Tests
```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### E2E Tests
```bash
# Backend E2E
cd backend
npm run test:e2e
```

---

## 📚 Additional Resources

### Official Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Phaser.js Documentation](https://photonstorm.github.io/phaser3-docs/)

### Useful Commands

```bash
# Backend
npm run start:dev        # Development mode
npm run start:debug      # Debug mode
npm run build            # Build for production
npm run lint             # Lint code

# Frontend
npm run dev              # Development mode
npm run build            # Build for production
npm run start            # Production mode
npm run lint             # Lint code

# Database
mongosh                  # Open MongoDB shell
mongodump                # Backup database
mongorestore             # Restore database
```

---

## 🤝 Support

For setup issues or questions:
- Check logs in console
- Verify environment variables
- Ensure MongoDB is running
- Check ports 3000 and 3001 are available
- Review error messages carefully

---

**Last Updated**: December 2024  
**Platform Version**: 1.0.0  
**Documentation Version**: 1.0
