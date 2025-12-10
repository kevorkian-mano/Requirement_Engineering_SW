'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { gamesAPI, progressAPI, monitoringAPI, alertsAPI, levelsAPI } from '@/src/lib/api';
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
import { LevelCard } from '@/src/components/levels/LevelCard';
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
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [unlockedGameIds, setUnlockedGameIds] = useState<Set<string>>(new Set());
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
    // Ensure user is loaded before attempting to load data
    if (!user || !user._id) {
      console.warn('User not loaded, skipping data load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading dashboard data for user:', user);
      
      const promises = [
        gamesAPI.getAll().catch(e => { console.error('Games API failed:', e); throw e; }),
        progressAPI.getLeaderboard({ ageGroup: user.ageGroup, limit: 10 }).catch(e => { console.error('Leaderboard API failed:', e); throw e; }),
        progressAPI.getAchievements().catch(e => { console.error('Achievements API failed:', e); throw e; }),
        user.role === 'child' ? progressAPI.getUserProgress().catch(e => { console.error('User progress API failed:', e); throw e; }) : Promise.resolve({ data: [] }),
        user.role === 'child' ? alertsAPI.getUserAlerts(user._id, { unreadOnly: true }).catch(e => { console.error('Alerts API failed:', e); throw e; }) : Promise.resolve({ data: [] }),
        user.role === 'child' ? levelsAPI.getMyLevel().catch(e => { console.error('Level API failed:', e); throw e; }) : Promise.resolve({ data: null }),
        user.role === 'child' ? levelsAPI.getMyUnlockedGames().catch(e => { console.error('Unlocked games API failed:', e); throw e; }) : Promise.resolve({ data: { unlockedGames: [] } }),
      ];
      
      const [gamesRes, leaderboardRes, achievementsRes, progressRes, alertsRes, levelRes, unlockedRes] = await Promise.all(promises);

      console.log('API Responses:', { gamesRes, leaderboardRes, achievementsRes, progressRes, alertsRes, levelRes, unlockedRes });

      // Filter games by user's age group if available
      let allGames = gamesRes.data || [];
      if (user.ageGroup) {
        allGames = allGames.filter((game: Game) => 
          game.ageGroups && game.ageGroups.includes(user.ageGroup as any)
        );
      }
      
      setGames(allGames);
      setLeaderboard(leaderboardRes.data || []);
      setAchievements(achievementsRes.data || []);
      setAlerts(alertsRes.data || []);
      setLevelInfo(levelRes.data);
      
      // Set unlocked games
      const unlockedIds = new Set<string>(
        (unlockedRes.data?.unlockedGames || []).map((id: string) => id)
      );
      setUnlockedGameIds(unlockedIds);
      
      // Map progress by game ID
      if (progressRes.data && Array.isArray(progressRes.data)) {
        const progressMap: Record<string, Progress> = {};
        progressRes.data.forEach((p: Progress) => {
          try {
            if (!p || !p.gameId) {
              console.warn('Progress entry missing gameId:', p);
              return;
            }
            const gameId = typeof p.gameId === 'string' ? p.gameId : (p.gameId as any)?._id;
            if (gameId) {
              console.log(`Setting progress for game ${gameId}:`, {
                isCompleted: p.isCompleted,
                score: p.score,
                playCount: p.playCount,
                fullProgress: p,
              });
              progressMap[gameId] = p;
            }
          } catch (err) {
            console.error('Error processing progress entry:', err, p);
          }
        });
        setProgress(progressMap);
        console.log('Final progress map:', progressMap);
      }
      
      console.log('Dashboard data loaded successfully');
    } catch (error: any) {
      console.error('Load data error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast.error(`Failed to load data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = async (game: Game) => {
    // Check if game is locked
    if (user?.role === 'child' && !unlockedGameIds.has(game._id)) {
      toast.error(language === 'en' ? 'This game is locked. Level up to unlock!' : 'هذه اللعبة مقفلة. ارتقِ مستوى لفتحها!');
      return;
    }

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
          {/* Left Column - Games */}
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
                  const isLocked = user?.role === 'child' && !unlockedGameIds.has(game._id);
                  
                  return (
                    <div key={game._id} onClick={() => !isLocked && handleGameClick(game)} className={isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}>
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
                        isLocked={isLocked}
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

