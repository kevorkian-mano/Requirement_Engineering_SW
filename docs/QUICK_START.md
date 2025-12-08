# Quick Start Guide: Play, Learn & Protect

## Project Setup

### 1. Initialize Project Structure
```bash
# Create project directories
mkdir -p frontend backend
cd frontend
npx create-next-app@latest . --typescript --tailwind --app
cd ../backend
npm install -g @nestjs/cli
nest new . --package-manager npm
```

### 2. Frontend Setup (React + Next.js + TypeScript + Tailwind + Phaser.js)
```bash
cd frontend
npm install phaser @types/phaser
npm install axios react-router-dom
npm install @headlessui/react @heroicons/react
```

### 3. Backend Setup (NestJS + TypeScript)
```bash
cd backend
npm install @nestjs/mongoose mongoose
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcryptjs @types/bcryptjs
npm install class-validator class-transformer
```

### 4. Database Setup (MongoDB)
- Install MongoDB locally or use MongoDB Atlas (cloud)
- Create connection string in backend `.env` file
- Configure MongoDB connection in NestJS app module

### 5. Environment Variables
**Backend `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/play-learn-protect
JWT_SECRET=your-secret-key
PORT=3001
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6. Run Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Figma Prompts

### Prompt 1: Main Dashboard Design
```
Design a child-friendly dashboard interface for "Play, Learn & Protect" platform targeting ages 3-12. 
Requirements:
- Colorful, playful design with large, easy-to-click buttons
- Age-appropriate icons and illustrations
- Three main sections: Games, Learning, My Progress
- Display user avatar, points, and current level prominently
- Include quick access to leaderboard and achievements
- Use Arabic and English text support
- Responsive layout for tablet and desktop
- Bright, engaging color palette suitable for Egyptian children
- Include navigation menu with icons for Home, Games, Profile, Settings
```

### Prompt 2: Game Selection Screen
```
Create a game selection interface showing different educational game categories:
- Physics games (icon: falling objects, gravity)
- Chemistry games (icon: test tubes, molecules)
- Math games (icon: numbers, equations)
- Language games (icon: books, letters)
- Coding games (icon: code blocks, robots)

Each game card should show:
- Game thumbnail/preview
- Game title in Arabic and English
- Difficulty level indicator
- Points/rewards available
- Age group badge (3-5, 6-8, 9-12)
- "Play" button with playful design
- Progress indicator if game was started
```

### Prompt 3: Gamification Elements
```
Design gamification UI components:
- Points display widget (animated number counter)
- Achievement badges (circular badges with icons for: First Game, Math Master, Coding Star, etc.)
- Leaderboard card showing top 10 players with avatars, names, points
- Progress bar for leveling up
- Reward notification popup (when earning points/achievements)
- Competition banner showing active competitions
- Streak counter (daily login streak)
Use playful, celebratory design with animations in mind.
```

### Prompt 4: Parent Dashboard
```
Design a parent monitoring dashboard with:
- Screen time visualization (daily/weekly charts)
- Activity breakdown pie chart (games vs learning vs creative)
- Content access timeline
- Alert notifications panel (cyberbullying, inappropriate content, excessive gaming)
- Child profile summary card
- Settings for screen time limits
- Export report button
Use clean, professional design suitable for adults while maintaining brand consistency.
Color code alerts: red for urgent, yellow for warnings, green for positive.
```

### Prompt 5: Teacher Dashboard
```
Create an educator dashboard showing:
- Class overview with student list
- Performance metrics (average scores, completion rates)
- Subject mastery heatmap
- Individual student progress cards
- Engagement analytics (time spent, favorite subjects)
- Comparison charts (class average vs individual)
- Export data button
Professional, data-focused design with clear visualizations.
Use charts, graphs, and color-coded indicators.
```

### Prompt 6: Game Interface Template
```
Design a game interface template for Phaser.js games:
- Game canvas area (center, prominent)
- Score/points display (top right)
- Timer display (if applicable)
- Pause button (top left)
- Help/hint button
- Exit game button (with confirmation)
- Progress indicator (bottom)
- Age-appropriate UI elements (large buttons, clear icons)
- Support for both Arabic and English text
- Playful, engaging design that doesn't distract from gameplay
```

### Prompt 7: Alert & Safety Interface
```
Design educational alert interfaces for:
- Cyberbullying detection alert (friendly, educational message explaining safe online behavior)
- Inappropriate content warning (teaches why content is unsafe)
- Excessive gaming reminder (suggests breaks and balance)
- Positive reinforcement messages (good behavior, achievements)

Each alert should:
- Use child-friendly language and illustrations
- Be educational rather than scary
- Include actionable advice
- Have clear "Got it" or "Learn More" buttons
- Use appropriate colors (not alarming red, but informative)
```

---

## Lovable Prompts

### Prompt 1: Project Setup
```
Create a Next.js 14 project with TypeScript and Tailwind CSS for "Play, Learn & Protect" - a children's educational gaming platform.

Project structure:
- App router structure
- Components folder for reusable UI
- Pages for: Dashboard, Games, Learning, Profile, Leaderboard
- API routes for backend communication
- TypeScript interfaces for User, Game, Achievement, Progress
- Tailwind configuration with child-friendly color palette

Include:
- Responsive layout component
- Navigation component with icons
- User authentication context
- API client setup with axios
```

### Prompt 2: Child Dashboard Component
```
Build a child-friendly dashboard component in React/Next.js with:
- User profile card (avatar, name, level, points)
- Quick access game cards (Physics, Chemistry, Math, Language, Coding)
- Achievement showcase (recent badges earned)
- Leaderboard preview (top 3 players)
- Daily streak indicator
- Progress summary chart
- Playful animations on hover/click
- Support for Arabic and English text
- Age-appropriate design (large buttons, bright colors, simple navigation)

Use Tailwind CSS for styling. Make it responsive for tablets and desktops.
```

### Prompt 3: Game Selection Page
```
Create a game selection page component that:
- Displays game cards in a grid layout
- Each card shows: game thumbnail, title (AR/EN), category icon, difficulty, points, age group
- Filter buttons by category (Physics, Chemistry, Math, Language, Coding)
- Filter by age group (3-5, 6-8, 9-12)
- Search functionality
- Loading states and empty states
- Clicking a card navigates to game page
- Responsive grid (3 columns desktop, 2 tablet, 1 mobile)

Use TypeScript interfaces for Game type. Include hover effects and transitions.
```

### Prompt 4: Gamification Components
```
Build reusable gamification components:
1. PointsDisplay - animated counter showing user points
2. AchievementBadge - circular badge with icon, name, description, unlock status
3. LeaderboardCard - shows ranking, avatar, name, points, with highlight for current user
4. ProgressBar - animated progress bar for leveling up
5. RewardNotification - popup that appears when earning rewards (points, badges)
6. CompetitionBanner - banner showing active competitions with countdown

All components should be:
- Animated and engaging
- Responsive
- Accessible
- TypeScript typed
- Styled with Tailwind CSS
```

### Prompt 5: Parent Dashboard
```
Create a parent monitoring dashboard with:
- Screen time chart (line chart showing daily/weekly usage)
- Activity breakdown (pie/donut chart: games, learning, creative)
- Content access timeline (list of activities with timestamps)
- Alert panel (list of alerts: cyberbullying, inappropriate content, excessive gaming)
- Child profile summary (name, age, total points, level, join date)
- Settings panel (screen time limits, alert preferences)
- Export report button (generates PDF)

Use chart library (recharts or chart.js). Include loading states and empty states.
Make it professional but consistent with brand colors.
```

### Prompt 6: Phaser.js Game Wrapper
```
Create a React component that wraps Phaser.js games:
- Component accepts game configuration (game ID, type, difficulty)
- Initializes Phaser game instance
- Handles game lifecycle (load, play, pause, exit)
- Displays game UI overlay (score, timer, pause button, exit button)
- Communicates with backend API for saving progress and points
- Shows loading screen while game assets load
- Handles game completion and redirects to results page
- Responsive canvas sizing
- TypeScript typed with Phaser types

Include error handling and cleanup on unmount.
```

### Prompt 7: Alert System Components
```
Build educational alert components:
1. CyberbullyingAlert - shows friendly message explaining safe online behavior
2. ContentWarningAlert - teaches why content is inappropriate
3. GamingReminderAlert - suggests breaks and balanced screen time
4. PositiveAlert - celebrates good behavior and achievements

Each alert should:
- Have child-friendly illustrations/icons
- Use simple, clear language
- Include "Got it" and "Learn More" buttons
- Be dismissible
- Log interaction to backend
- Use appropriate colors (not alarming)
- Be accessible and keyboard navigable

Create an AlertProvider context to manage alert state globally.
```

### Prompt 8: API Integration Layer
```
Create API integration layer for frontend:
- API client using axios with base URL configuration
- Authentication service (login, register, logout, token refresh)
- User service (get profile, update profile, get progress)
- Game service (get games, get game details, save progress, submit score)
- Achievement service (get achievements, unlock achievement)
- Leaderboard service (get leaderboard, get user ranking)
- Parent service (get child activity, get alerts, get reports)
- Teacher service (get class data, get student progress)

All services should:
- Use TypeScript interfaces for request/response types
- Handle errors gracefully
- Include loading states
- Support authentication tokens
- Have proper error messages
```

### Prompt 9: Authentication Flow
```
Implement authentication system:
- Login page (email/password, role selection: child/parent/teacher)
- Registration page (with age selection for children, parent linking)
- Protected route wrapper (redirects to login if not authenticated)
- Auth context provider (manages user state, token)
- Token storage (secure localStorage/sessionStorage)
- Auto-logout on token expiration
- Role-based access control (children see games, parents see dashboard, teachers see class view)

Include form validation, error handling, and loading states.
Use Next.js middleware for route protection.
```

### Prompt 10: Responsive Navigation
```
Create a responsive navigation component:
- Desktop: horizontal menu with icons and labels
- Mobile: hamburger menu with slide-out drawer
- Menu items: Home, Games, Learning, My Progress, Leaderboard, Profile, Settings
- User avatar and name display
- Logout button
- Role-based menu items (parents see "Monitor" instead of "Games")
- Active route highlighting
- Smooth transitions and animations
- Accessible keyboard navigation
- Support for Arabic RTL layout

Use Headless UI for mobile menu. Make it sticky on scroll.
```

---

## Development Workflow

1. **Design Phase:** Use Figma prompts to create UI mockups
2. **Prototype Phase:** Use Lovable prompts to generate initial code
3. **Integration:** Connect frontend to NestJS backend
4. **Database:** Set up MongoDB schemas and models
5. **Game Development:** Build Phaser.js games for each subject
6. **Testing:** Test with target age groups
7. **Deployment:** Deploy frontend (Vercel) and backend (AWS/Railway)

---

## Next Steps

1. Start with Figma designs (use prompts above)
2. Generate code with Lovable using the prompts
3. Set up backend API endpoints in NestJS
4. Create MongoDB schemas for users, games, progress, achievements
5. Build first Phaser.js game (start with simple math game)
6. Integrate frontend and backend
7. Test authentication flow
8. Implement gamification features
9. Add monitoring and alert systems
10. Deploy and test with real users

