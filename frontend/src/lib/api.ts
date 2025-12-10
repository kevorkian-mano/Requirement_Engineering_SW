import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Games API
export const gamesAPI = {
  getAll: (params?: { category?: string; ageGroup?: string }) => api.get('/games', { params }),
  getById: (id: string) => api.get(`/games/${id}`),
  play: (id: string) => api.post(`/games/${id}/play`),
};

// Progress API
export const progressAPI = {
  save: (data: any) => api.post('/progress', data),
  getUserProgress: () => api.get('/progress'),
  getLeaderboard: (params?: { ageGroup?: string; limit?: number }) =>
    api.get('/progress/leaderboard', { params }),
  getAchievements: () => api.get('/progress/achievements'),
};

// Levels API
export const levelsAPI = {
  getMyLevel: () => api.get('/levels/me'),
  getPlayerLevel: (userId: string) => api.get(`/levels/${userId}`),
  getMyProgress: () => api.get('/levels/me/progress'),
  getPlayerProgress: (userId: string) => api.get(`/levels/${userId}/progress`),
  getMyUnlockedGames: () => api.get('/levels/me/unlocked-games'),
  getPlayerUnlockedGames: (userId: string) => api.get(`/levels/${userId}/unlocked-games`),
  getMyLockedGames: () => api.get('/levels/me/locked-games'),
  getPlayerLockedGames: (userId: string) => api.get(`/levels/${userId}/locked-games`),
  canPlayGame: (gameId: string) => api.get(`/levels/me/can-play/${gameId}`),
  awardXP: (data: any) => api.post('/levels/me/award-xp', data),
};

// Monitoring API
export const monitoringAPI = {
  logActivity: (data: any) => api.post('/monitoring/activity', data),
  getScreenTime: (userId?: string, params?: any) =>
    api.get(`/monitoring/screen-time/${userId || ''}`, { params }),
  getActivityLog: (userId?: string, params?: any) =>
    api.get(`/monitoring/activity/${userId || ''}`, { params }),
  getClassActivity: () => api.get('/monitoring/class'),
  getBehaviorPatterns: (userId?: string) =>
    api.get(`/monitoring/patterns/${userId || ''}`),
  getAnalytics: (userId?: string) =>
    api.get(`/monitoring/analytics/${userId || ''}`),
  getDashboardData: (userId?: string, params?: any) =>
    api.get(`/monitoring/dashboard/${userId || ''}`, { params }),
};

// Alerts API
export const alertsAPI = {
  detect: (data: any) => api.post('/alerts/detect', data),
  checkGaming: (data: { userId: string }) => api.post('/alerts/check-gaming', data),
  getUserAlerts: (userId?: string, params?: { unreadOnly?: boolean }) =>
    api.get(`/alerts/${userId || ''}`, { params }),
  getParentAlerts: () => api.get('/alerts/parent/all'),
  markAsRead: (id: string) => api.put(`/alerts/${id}/read`),
};

// Users API
export const usersAPI = {
  getChildren: () => api.get('/users/children'),
  getStudents: () => api.get('/users/students'),
  getParent: () => api.get('/users/parent'),
};

// Courses API
export const coursesAPI = {
  // Get all courses
  getAll: () => api.get('/courses'),
  
  // Get course by ID
  getById: (id: string) => api.get(`/courses/${id}`),
  
  // Get teacher's assigned courses
  getMyCourses: () => api.get('/teachers/secure/my-courses'),
  
  // Get course summary (basic info)
  getCourseSummary: (courseId: string) => api.get(`/teachers/secure/courses/${courseId}/summary`),
  
  // Get students enrolled in a course
  getCourseStudents: (courseId: string) => api.get(`/teachers/secure/courses/${courseId}/students`),
  
  // Get specific student's activity in a course
  getStudentActivity: (courseId: string, studentId: string) => 
    api.get(`/teachers/secure/courses/${courseId}/students/${studentId}`),
  
  // Get course analytics
  getCourseAnalytics: (courseId: string) => api.get(`/teachers/secure/courses/${courseId}/analytics`),
  
  // Get course dashboard summary
  getCourseDashboard: (courseId: string) => api.get(`/teachers/secure/courses/${courseId}/dashboard`),
  
  // Get student health analysis in a course
  getStudentHealth: (courseId: string, studentId: string, params?: { days?: number }) =>
    api.get(`/teachers/secure/courses/${courseId}/students/${studentId}/health`, { params }),
  
  // Get at-risk students in a course
  getAtRiskStudents: (courseId: string, params?: { threshold?: number }) =>
    api.get(`/teachers/secure/courses/${courseId}/at-risk`, { params }),
  
  // Get games associated with a course
  getCourseGames: (courseId: string) => api.get(`/teachers/secure/courses/${courseId}/games`),
};

