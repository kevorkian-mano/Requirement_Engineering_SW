# Play, Learn & Protect - Backend API

NestJS backend for the Play, Learn & Protect educational gaming platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret.

4. Run the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Games
- `GET /games` - Get all games (filtered by age)
- `GET /games/:id` - Get game details
- `POST /games/:id/play` - Start playing a game

### Progress & Gamification
- `POST /progress` - Save game progress
- `GET /progress` - Get user progress
- `GET /achievements` - Get user achievements
- `GET /leaderboard` - Get leaderboard

### Monitoring (Parents/Teachers)
- `GET /monitoring/screen-time` - Get screen time data
- `GET /monitoring/activity` - Get activity breakdown
- `GET /monitoring/alerts` - Get alerts

### Alerts
- `POST /alerts` - Create alert
- `GET /alerts` - Get user alerts
- `PUT /alerts/:id/read` - Mark alert as read

