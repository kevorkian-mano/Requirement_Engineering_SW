# Play, Learn & Protect - Frontend

Next.js frontend for the Play, Learn & Protect educational gaming platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── dashboard/   # Child dashboard
│   │   ├── parent/      # Parent dashboard
│   │   ├── teacher/     # Teacher dashboard
│   │   ├── games/       # Game pages
│   │   ├── login/       # Login page
│   │   └── register/    # Registration page
│   ├── components/      # React components
│   │   ├── ui/          # UI primitives (shadcn/ui)
│   │   └── ...          # Feature components
│   ├── lib/             # Utilities and API client
│   ├── store/           # Zustand state management
│   └── types/           # TypeScript types
```

## Features

- **Authentication**: Login and registration with role-based access
- **Child Dashboard**: Games, progress, achievements, leaderboard
- **Parent Dashboard**: Screen time monitoring, alerts, activity tracking
- **Teacher Dashboard**: Class performance, student analytics
- **Games**: Phaser.js game integration
- **Gamification**: Points, levels, achievements, leaderboard
- **Monitoring**: Screen time tracking, activity logging
- **Alerts**: Safety alerts for cyberbullying, inappropriate content, excessive gaming

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Phaser.js**: Game engine
- **Zustand**: State management
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **shadcn/ui**: UI components

## API Integration

All API calls are handled through `src/lib/api.ts`. The API client automatically:
- Adds JWT tokens to requests
- Handles token expiration
- Redirects to login on 401 errors

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001/api)

## Building for Production

```bash
npm run build
npm start
```
