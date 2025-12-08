# Frontend Directory Structure

This document describes the organized structure of the frontend application.

## Directory Structure

```
frontend/src/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # Child dashboard page
│   ├── games/                   # Games listing and detail pages
│   │   └── [id]/               # Dynamic game route
│   ├── login/                  # Login page
│   ├── parent/                 # Parent dashboard page
│   ├── profile/                # User profile page
│   ├── register/               # Registration page
│   ├── settings/               # Settings page
│   ├── teacher/                # Teacher dashboard page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css            # Global styles
│
├── components/                  # React components
│   ├── common/                 # Shared/common components
│   │   ├── ImageWithFallback.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── AchievementBadge.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── ProgressCard.tsx
│   │   └── QuickActions.tsx
│   │
│   ├── games/                  # Game-related components
│   │   ├── GameCard.tsx
│   │   └── LearningCard.tsx
│   │
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   └── NavigationMenu.tsx
│   │
│   ├── monitoring/             # Monitoring feature components
│   │   ├── ActivityTimeline.tsx
│   │   ├── AlertCenter.tsx
│   │   ├── BehaviorPatterns.tsx
│   │   ├── ClassOverview.tsx
│   │   ├── ComparativeAnalytics.tsx
│   │   ├── SafetyAlert.tsx
│   │   └── ScreenTimeChart.tsx
│   │
│   └── ui/                     # Shadcn UI components
│       └── (all shadcn components)
│
├── features/                    # Feature modules
│   └── games/                  # Game engines/logic
│       ├── AlgebraExplorerGame.ts
│       ├── AlphabetJourneyGame.ts
│       ├── ForceMotionLabGame.ts
│       ├── GameDeveloperGame.ts
│       ├── MultiplicationMasterGame.ts
│       ├── NumberAdventureGame.ts
│       ├── PharaohQuestGame.ts
│       ├── PyramidBuilderGame.ts
│       ├── ShapeExplorerGame.ts
│       ├── StoryBuilderGame.ts
│       └── VocabularyChampionGame.ts
│
├── lib/                        # Utility libraries
│   └── api.ts                  # API client
│
├── store/                      # State management
│   └── authStore.ts            # Authentication store (Zustand)
│
├── types/                      # TypeScript type definitions
│   ├── index.ts
│   └── phaser.d.ts
│
└── docs/                       # Documentation
    ├── Attributions.md
    └── Guidelines.md
```

## Organization Principles

### Components
- **common/**: Reusable components used across multiple features
- **dashboard/**: Components specific to the dashboard functionality
- **games/**: Components related to games display and interaction
- **layout/**: Layout and navigation components
- **monitoring/**: Components for monitoring and analytics features
- **ui/**: Third-party UI component library (Shadcn)

### Features
- **features/games/**: Game engine implementations and game logic
- Each feature module contains related business logic

### App Routes
- All routes follow Next.js App Router conventions
- Each route has its own `page.tsx` file
- Dynamic routes use bracket notation `[id]`

### Other Directories
- **lib/**: Shared utilities and API clients
- **store/**: State management stores
- **types/**: TypeScript type definitions
- **docs/**: Project documentation

## Import Paths

All imports use the `@/src/` alias:
- Components: `@/src/components/{category}/{ComponentName}`
- Features: `@/src/features/{feature}/{FileName}`
- Lib: `@/src/lib/{fileName}`
- Store: `@/src/store/{storeName}`
- Types: `@/src/types/{fileName}`

## Removed Files

The following files were removed during reorganization:
- `App.tsx` - Not used (Next.js uses app directory)
- `main.tsx` - Not used (Next.js entry point)
- `index.css` - Duplicate of globals.css
- `styles/globals.css` - Duplicate of app/globals.css

