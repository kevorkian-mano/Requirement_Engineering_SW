'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { gamesAPI, progressAPI, monitoringAPI, alertsAPI } from '@/src/lib/api';
import { Game, LeaderboardEntry, Achievement, Progress } from '@/src/types';
import { Header } from '@/src/components/layout/Header';
import { NavigationMenu } from '@/src/components/layout/NavigationMenu';
import { GameCard } from '@/src/components/games/GameCard';
import { LearningCard } from '@/src/components/games/LearningCard';
import { ProgressCard } from '@/src/components/dashboard/ProgressCard';
import { Leaderboard } from '@/src/components/dashboard/Leaderboard';
import { AchievementBadge } from '@/src/components/dashboard/AchievementBadge';
import { QuickActions } from '@/src/components/dashboard/QuickActions';
import { SafetyAlert } from '@/src/components/monitoring/SafetyAlert';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/src/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState('home');
  const [games, setGames] = useState<Game[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasStoredAuth = localStorage.getItem('auth-storage') || localStorage.getItem('user');
      if (hasStoredAuth) {
        const timer = setTimeout(() => {
          setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    // Only check auth after hydration is complete
    if (!isHydrated) return;

    if (!user || user.role !== 'child') {
      router.push('/login');
      return;
    }

    loadData();
  }, [user, router, isHydrated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesRes, leaderboardRes, achievementsRes, progressRes, alertsRes] = await Promise.all([
        gamesAPI.getAll(),
        progressAPI.getLeaderboard({ ageGroup: user?.ageGroup, limit: 10 }),
        progressAPI.getAchievements(),
        user?.role === 'child' ? progressAPI.getUserProgress() : Promise.resolve({ data: [] }),
        user?.role === 'child' && user?._id ? alertsAPI.getUserAlerts(user._id, { unreadOnly: true }) : Promise.resolve({ data: [] }),
      ]);

      // Filter games by user's age group if available
      let allGames = gamesRes.data || [];
      if (user?.ageGroup) {
        allGames = allGames.filter((game: Game) => 
          game.ageGroups.includes(user.ageGroup as any)
        );
      }
      
      setGames(allGames);
      setLeaderboard(leaderboardRes.data || []);
      setAchievements(achievementsRes.data || []);
      setAlerts(alertsRes.data || []);
      
      // Map progress by game ID
      if (progressRes.data) {
        const progressMap: Record<string, Progress> = {};
        progressRes.data.forEach((p: Progress) => {
          const gameId = typeof p.gameId === 'string' ? p.gameId : (p.gameId as Game)._id;
          progressMap[gameId] = p;
        });
        setProgress(progressMap);
      }
    } catch (error: any) {
      console.error('Load data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = async (game: Game) => {
    try {
      await gamesAPI.play(game._id);
      router.push(`/games/${game._id}`);
    } catch (error: any) {
      toast.error('Failed to start game');
    }
  };

  if (loading || !user) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const texts = {
    en: {
      games: 'Games',
      learning: 'Learning',
      myProgress: 'My Progress',
      achievements: 'Achievements',
      viewAll: 'View All',
    },
    ar: {
      games: 'الألعاب',
      learning: 'التعلم',
      myProgress: 'تقدمي',
      achievements: 'الإنجازات',
      viewAll: 'عرض الكل',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header 
          language={language} 
          user={user} 
          onLanguageChange={setLanguage}
        />

        {/* Navigation */}
        <NavigationMenu
          language={language}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Quick Actions */}
        <QuickActions language={language} />

        {/* Safety Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert) => (
              <SafetyAlert
                key={alert._id}
                alert={alert}
                language={language}
                onDismiss={loadData}
              />
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Games & Learning */}
          <div className="lg:col-span-2 space-y-6">
            {/* Games Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-3xl font-bold" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                  {t.games}
                </h2>
                <button 
                  onClick={() => router.push('/games')}
                  className="text-white hover:text-[#FFE66D] transition-colors"
                >
                  {t.viewAll} →
                </button>
              </div>
              {games.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">
                      {language === 'en' ? 'No games available for your age group' : 'لا توجد ألعاب متاحة لفئتك العمرية'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.slice(0, 4).map((game) => {
                  // Get progress for this game if available
                  const gameProgress = progress[game._id];
                  
                  return (
                    <div key={game._id} onClick={() => handleGameClick(game)}>
                      <GameCard
                        title={game.title}
                        titleAr={game.titleArabic || game.title}
                        description={game.description}
                        descriptionAr={game.descriptionArabic || game.description}
                        icon={getGameIcon(game.category)}
                        color={getGameColor(game.category)}
                        difficulty={game.difficulty}
                        difficultyAr={getDifficultyAr(game.difficulty)}
                        language={language}
                        isLocked={false}
                        pointsReward={game.pointsReward}
                        ageGroups={game.ageGroups}
                        playCount={gameProgress?.playCount}
                        isCompleted={gameProgress?.isCompleted}
                        bestScore={gameProgress?.score}
                      />
                    </div>
                  );
                })}
                </div>
              )}
            </section>

            {/* Achievements Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-3xl font-bold" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                  {t.achievements}
                </h2>
                <button 
                  onClick={() => router.push('/achievements')}
                  className="text-white hover:text-[#FFE66D] transition-colors"
                >
                  {t.viewAll} →
                </button>
              </div>
              {achievements.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">
                      {language === 'en' ? 'No achievements yet. Play games to unlock achievements!' : 'لا توجد إنجازات بعد. العب الألعاب لفتح الإنجازات!'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.slice(0, 6).map((achievement) => (
                    <AchievementBadge
                      key={achievement._id}
                      title={achievement.name || achievement.code}
                      titleAr={achievement.nameArabic || achievement.name || achievement.code}
                      icon={achievement.icon || '🏆'}
                      color={getAchievementColor(achievement.type || achievement.code)}
                      isUnlocked={!!achievement.unlockedAt}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Progress & Leaderboard */}
          <div className="space-y-6">
            <ProgressCard language={language} user={user} />
            <Leaderboard language={language} leaderboard={leaderboard} currentUserId={user._id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getGameIcon(category: string): string {
  const icons: Record<string, string> = {
    physics: '⚛️',
    chemistry: '🧪',
    math: '🔢',
    language: '📝',
    coding: '💻',
    history: '🏛️',
  };
  return icons[category] || '🎮';
}

function getGameColor(category: string): string {
  const colors: Record<string, string> = {
    physics: '#FF6B6B',
    chemistry: '#4ECDC4',
    math: '#06D6A0',
    language: '#FF8C42',
    coding: '#A8DADC',
    history: '#9B59B6',
  };
  return colors[category] || '#FF69B4';
}

function getDifficultyAr(difficulty: string): string {
  const map: Record<string, string> = {
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',
  };
  return map[difficulty] || difficulty;
}

function getAchievementColor(type: string): string {
  const colors: Record<string, string> = {
    first_game: '#FF6B6B',
    math_master: '#4ECDC4',
    coding_star: '#FFE66D',
    physics_genius: '#06D6A0',
    chemistry_wizard: '#FF8C42',
    language_champion: '#A8DADC',
  };
  return colors[type] || '#FF69B4';
}

