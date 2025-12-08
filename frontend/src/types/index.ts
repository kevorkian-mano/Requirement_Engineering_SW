export enum UserRole {
  CHILD = 'child',
  PARENT = 'parent',
  TEACHER = 'teacher',
}

export enum AgeGroup {
  AGES_3_5 = '3-5',
  AGES_6_8 = '6-8',
  AGES_9_12 = '9-12',
}

export enum GameCategory {
  PHYSICS = 'physics',
  CHEMISTRY = 'chemistry',
  MATH = 'math',
  LANGUAGE = 'language',
  CODING = 'coding',
  HISTORY = 'history',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  ageGroup?: AgeGroup;
  dateOfBirth?: string;
  points: number;
  level: number;
  totalScreenTime: number;
  parentId?: string;
  childrenIds?: string[];
  studentsIds?: string[];
  isActive: boolean;
  avatar?: string;
  loginStreak: number;
  lastLoginDate?: string;
}

export interface Game {
  _id: string;
  title: string;
  titleArabic?: string;
  description: string;
  descriptionArabic?: string;
  category: GameCategory;
  difficulty: DifficultyLevel;
  ageGroups: AgeGroup[];
  pointsReward: number;
  thumbnail?: string;
  gameUrl?: string;
  isActive: boolean;
  playCount: number;
  averageScore: number;
}

export interface Progress {
  _id: string;
  userId: string;
  gameId: string | Game;
  score: number;
  pointsEarned: number;
  timeSpent: number;
  isCompleted: boolean;
  completionPercentage: number;
  playCount: number;
  lastPlayedAt?: string;
}

export interface Achievement {
  _id: string;
  code: string;
  name: string;
  nameArabic?: string;
  description: string;
  descriptionArabic?: string;
  type: string;
  icon?: string;
  pointsReward: number;
  unlockedAt?: string;
}

export interface Alert {
  _id: string;
  userId: string;
  parentId?: string;
  type: 'cyberbullying' | 'inappropriate_content' | 'excessive_gaming' | 'positive_behavior' | 'achievement';
  severity: 'low' | 'medium' | 'high';
  title: string;
  titleArabic?: string;
  message: string;
  messageArabic?: string;
  isRead: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  points: number;
  gamesCompleted: number;
  level: number;
}

