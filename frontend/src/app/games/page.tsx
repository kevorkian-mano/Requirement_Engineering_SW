'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { gamesAPI, progressAPI, levelsAPI } from '@/src/lib/api';
import { Game, GameCategory, AgeGroup, Progress } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { GameCard } from '@/src/components/games/GameCard';
import { toast } from 'sonner';
import { Search, Filter, ArrowLeft, Lock } from 'lucide-react';

export default function GamesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [unlockedGameIds, setUnlockedGameIds] = useState<Set<string>>(new Set());
  const [playerLevel, setPlayerLevel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGameLoading, setSelectedGameLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
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
    // Only proceed after hydration is complete
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    loadGames();
    loadProgress();
    loadPlayerLevel();
  }, [user, router, isHydrated]);

  useEffect(() => {
    filterGames();
  }, [games, searchQuery, selectedCategory, selectedDifficulty, unlockedGameIds]);

  const loadPlayerLevel = async () => {
    try {
      if (user?.role === 'child') {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No auth token found');
          return;
        }
        
        const response = await levelsAPI.getMyLevel();
        setPlayerLevel(response.data);
        
        // Get unlocked games
        const unlockedResponse = await levelsAPI.getMyUnlockedGames();
        const unlockedIds = new Set<string>(
          (unlockedResponse.data?.unlockedGames || []).map((id: string) => id)
        );
        console.log('Loaded unlocked games:', unlockedIds.size, 'games');
        setUnlockedGameIds(unlockedIds);
      }
    } catch (error: any) {
      console.error('Level loading error:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed - redirecting to login');
      }
    }
  };

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getAll();
      // Backend already filters by age group, but we'll also filter on frontend for safety
      const userAgeGroup = user?.ageGroup;
      let allGames = response.data || [];
      
      // Filter by age group if user is a child
      if (userAgeGroup) {
        allGames = allGames.filter((game: Game) => 
          game.ageGroups.includes(userAgeGroup as AgeGroup)
        );
      }
      
      setGames(allGames);
      setFilteredGames(allGames);
    } catch (error: any) {
      toast.error('Failed to load games');
      console.error('Games loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      if (user?.role === 'child') {
        const response = await progressAPI.getUserProgress();
        console.log('Progress API response:', response);
        const progressMap: Record<string, Progress> = {};
        (response.data || []).forEach((p: any) => {
          // Handle both cases: gameId as string or as populated object
          let gameId: string;
          if (typeof p.gameId === 'string') {
            gameId = p.gameId;
          } else if (p.gameId && typeof p.gameId === 'object' && p.gameId._id) {
            gameId = p.gameId._id.toString ? p.gameId._id.toString() : p.gameId._id;
          } else {
            console.warn('Invalid gameId:', p.gameId);
            return;
          }
          
          console.log(`Mapping progress for game ${gameId}:`, {
            isCompleted: p.isCompleted,
            score: p.score,
            playCount: p.playCount,
          });
          progressMap[gameId] = p;
        });
        console.log('Final progress map:', progressMap);
        setProgress(progressMap);
      }
    } catch (error: any) {
      console.error('Progress loading error:', error);
    }
  };

  const filterGames = () => {
    let filtered = [...games];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.titleArabic?.toLowerCase().includes(query) ||
          game.descriptionArabic?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((game) => game.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((game) => game.difficulty === selectedDifficulty);
    }

    setFilteredGames(filtered);
  };

  const handleGameClick = async (game: Game) => {
    // Check if game is locked
    if (user?.role === 'child' && !unlockedGameIds.has(game._id)) {
      toast.error(language === 'en' ? 'This game is locked. Level up to unlock!' : 'هذه اللعبة مقفلة. ارتقِ مستوى لفتحها!');
      return;
    }

    try {
      setSelectedGameLoading(true);
      await gamesAPI.play(game._id);
      router.push(`/games/${game._id}`);
    } catch (error: any) {
      toast.error('Failed to start game');
      setSelectedGameLoading(false);
    }
  };

  const getGameIcon = (category: string): string => {
    const icons: Record<string, string> = {
      physics: '⚛️',
      chemistry: '🧪',
      math: '🔢',
      language: '📝',
      coding: '💻',
      history: '🏛️',
    };
    return icons[category] || '🎮';
  };

  const getGameColor = (category: string): string => {
    const colors: Record<string, string> = {
      physics: '#FF6B6B',
      chemistry: '#4ECDC4',
      math: '#06D6A0',
      language: '#FF8C42',
      coding: '#A8DADC',
      history: '#9B59B6',
    };
    return colors[category] || '#FF69B4';
  };

  const getDifficultyAr = (difficulty: string): string => {
    const map: Record<string, string> = {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
    };
    return map[difficulty] || difficulty;
  };

  const getCategoryName = (category: string, lang: 'en' | 'ar'): string => {
    const names: Record<string, { en: string; ar: string }> = {
      physics: { en: 'Physics', ar: 'الفيزياء' },
      chemistry: { en: 'Chemistry', ar: 'الكيمياء' },
      math: { en: 'Math', ar: 'الرياضيات' },
      language: { en: 'Language', ar: 'اللغة' },
      coding: { en: 'Coding', ar: 'البرمجة' },
      history: { en: 'History', ar: 'التاريخ' },
    };
    return names[category]?.[lang] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-xl">Loading games...</p>
      </div>
    );
  }

  const texts = {
    en: {
      title: 'Games',
      search: 'Search games...',
      category: 'Category',
      difficulty: 'Difficulty',
      all: 'All',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      noGames: 'No games found',
      points: 'Points',
      plays: 'plays',
      back: 'Back to Dashboard',
      filter: 'Filters',
      progressionGuide: 'Progression Guide',
      level1: 'Level 1: All Easy Games',
      level2: 'Level 2: All Medium Games',
      level3: 'Level 3: All Hard Games',
      unlockHint: 'Complete 1 game of current level to unlock the next!',
      currentLevel: 'Current Level',
    },
    ar: {
      title: 'الألعاب',
      search: 'ابحث عن الألعاب...',
      category: 'الفئة',
      difficulty: 'الصعوبة',
      all: 'الكل',
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
      noGames: 'لم يتم العثور على ألعاب',
      points: 'نقاط',
      plays: 'مرات اللعب',
      back: 'العودة إلى لوحة التحكم',
      filter: 'المرشحات',
      progressionGuide: 'دليل التقدم',
      level1: 'المستوى 1: جميع الألعاب السهلة',
      level2: 'المستوى 2: جميع الألعاب المتوسطة',
      level3: 'المستوى 3: جميع الألعاب الصعبة',
      unlockHint: 'أكمل لعبة واحدة من المستوى الحالي لفتح المستوى التالي!',
      currentLevel: 'المستوى الحالي',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
            <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="bg-white"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="physics">{getCategoryName('physics', language)}</SelectItem>
                  <SelectItem value="chemistry">{getCategoryName('chemistry', language)}</SelectItem>
                  <SelectItem value="math">{getCategoryName('math', language)}</SelectItem>
                  <SelectItem value="language">{getCategoryName('language', language)}</SelectItem>
                  <SelectItem value="coding">{getCategoryName('coding', language)}</SelectItem>
                  <SelectItem value="history">{getCategoryName('history', language)}</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={t.difficulty} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="easy">{t.easy}</SelectItem>
                  <SelectItem value="medium">{t.medium}</SelectItem>
                  <SelectItem value="hard">{t.hard}</SelectItem>
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center justify-end">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {filteredGames.length} {language === 'en' ? 'games' : 'ألعاب'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 text-xl">{t.noGames}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => {
              const gameProgress = progress[game._id];
              const isCompleted = gameProgress?.isCompleted || false;
              const bestScore = gameProgress?.score || 0;
              const playCount = gameProgress?.playCount || 0;
              const isLocked = user?.role === 'child' && !unlockedGameIds.has(game._id);

              console.log(`Game [${game.title}]:`, {
                gameId: game._id,
                gameProgress,
                isCompleted,
                isLocked,
              });

              return (
                <div 
                  key={game._id} 
                  onClick={() => !isLocked && handleGameClick(game)}
                  className={isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                >
                  <Card className={`h-full transition-shadow ${!isLocked ? 'hover:shadow-xl' : ''} bg-white relative`}>
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-40 rounded-lg flex flex-col items-center justify-center z-20">
                        <Lock className="w-12 h-12 text-white mb-2" />
                        <span className="text-white font-bold text-lg">{language === 'en' ? 'LOCKED' : 'مقفل'}</span>
                        <span className="text-white text-sm mt-1">
                          {language === 'en' ? 'Level up to unlock' : 'ارتقِ مستوى لفتح'}
                        </span>
                      </div>
                    )}
                    <CardContent className={`p-6 ${isLocked ? 'pointer-events-none' : ''}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md ${isLocked ? 'grayscale opacity-50' : ''}`}
                          style={{ backgroundColor: getGameColor(game.category) + '20' }}
                        >
                          {getGameIcon(game.category)}
                        </div>
                        {isCompleted && (
                          <Badge className="bg-green-500">✓ {language === 'en' ? 'Completed' : 'مكتمل'}</Badge>
                        )}
                      </div>

                      <h3 className={`text-xl font-bold mb-2 ${isLocked ? 'text-gray-400' : ''}`}>
                        {language === 'ar' ? game.titleArabic || game.title : game.title}
                      </h3>
                      <p className={`text-sm mb-4 line-clamp-2 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'ar' ? game.descriptionArabic || game.description : game.description}
                      </p>

                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge variant="outline" className={isLocked ? 'bg-gray-100 text-gray-500' : ''}>
                          {getCategoryName(game.category, language)}
                        </Badge>
                        <Badge variant="outline" className={isLocked ? 'bg-gray-100 text-gray-500' : ''}>
                          {language === 'ar' ? getDifficultyAr(game.difficulty) : game.difficulty}
                        </Badge>
                        <Badge variant="outline" className={`${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100'}`}>
                          ⭐ {game.pointsReward} {t.points}
                        </Badge>
                      </div>

                      {gameProgress && !isLocked && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{language === 'en' ? 'Best Score' : 'أفضل نتيجة'}: {bestScore}</span>
                            <span>{playCount} {t.plays}</span>
                          </div>
                          {gameProgress.completionPercentage > 0 && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${gameProgress.completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4">
                        <Button
                          className="w-full"
                          disabled={isLocked}
                          style={{ 
                            backgroundColor: isLocked ? '#ccc' : getGameColor(game.category),
                            cursor: isLocked ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isLocked ? (language === 'en' ? 'Locked' : 'مقفل') : (language === 'en' ? 'Play Now' : 'العب الآن')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading Overlay */}
        {selectedGameLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-xl font-semibold">{language === 'en' ? 'Loading Game...' : 'تحميل اللعبة...'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

