# Play, Learn & Protect - Complete Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas account)
- Git

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection:
```env
MONGODB_URI=mongodb://localhost:27017/play-learn-protect
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

5. Start MongoDB (if using local):
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

6. Start the backend server:
```bash
npm run start:dev
```

Backend will run on `http://localhost:3001`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Testing the Application

### 1. Register a User

Visit `http://localhost:3000/register` and create:
- A child account (age 3-12)
- A parent account
- A teacher account

### 2. Login

Visit `http://localhost:3000/login` and login with your credentials.

### 3. Access Dashboards

- **Child**: Automatically redirected to `/dashboard`
- **Parent**: Redirected to `/parent`
- **Teacher**: Redirected to `/teacher`

## API Testing

You can test the API using:
- Postman
- curl
- The frontend application

Example API calls:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "child@test.com",
    "password": "password123",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "role": "child",
    "ageGroup": "6-8"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "child@test.com",
    "password": "password123"
  }'
```

## Project Structure

```
requiremnet-game/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── games/       # Games CRUD
│   │   ├── progress/    # Progress & gamification
│   │   ├── monitoring/  # Screen time & activity
│   │   ├── alerts/      # Safety alerts
│   │   └── schemas/     # MongoDB schemas
│   └── package.json
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # React components
│   │   ├── lib/         # API client
│   │   ├── store/       # State management
│   │   └── types/       # TypeScript types
│   └── package.json
├── requirements.md      # Project requirements
├── QUICK_START.md       # Quick start guide
└── SETUP.md            # This file
```

## Features Implemented

### ✅ Backend
- [x] User authentication (JWT)
- [x] Role-based access control (child, parent, teacher)
- [x] Game management (CRUD)
- [x] Progress tracking
- [x] Gamification (points, achievements, leaderboard)
- [x] Screen time monitoring
- [x] Activity logging
- [x] Alert system (cyberbullying, inappropriate content, excessive gaming)
- [x] Parent/Teacher dashboards

### ✅ Frontend
- [x] Next.js 14 with TypeScript
- [x] Authentication pages (login, register)
- [x] Child dashboard
- [x] Parent dashboard with monitoring
- [x] Teacher dashboard with analytics
- [x] Game pages with Phaser.js integration
- [x] API integration
- [x] Responsive design
- [x] Bilingual support (English/Arabic)

## Next Steps

1. **Add Real Games**: Implement actual Phaser.js games for each subject
2. **Enhance Alert System**: Add ML-based detection for threats
3. **Add Competitions**: Implement competition system
4. **Creative Projects**: Add creative knowledge application features
5. **Testing**: Add unit and integration tests
6. **Deployment**: Deploy to production (Vercel for frontend, Railway/AWS for backend)

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists and has correct MongoDB URI
- Check port 3001 is not in use

### Frontend won't start
- Check Node.js version (18+)
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Verify `.env.local` has correct API URL

### API calls failing
- Check backend is running on port 3001
- Verify CORS settings in backend
- Check browser console for errors
- Verify JWT token is being stored in localStorage

## Support

For issues or questions, refer to:
- Backend API docs: `backend/API_DOCUMENTATION.md`
- Requirements: `requirements.md`
- Quick Start: `QUICK_START.md`

