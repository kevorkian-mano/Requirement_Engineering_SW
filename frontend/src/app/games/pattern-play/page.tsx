'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { authAPI, gamesAPI, progressAPI } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/authStore';
import { toast } from 'sonner';
import { ArrowLeft, Star, Trophy } from 'lucide-react';

// Define pattern types
const SHAPES = ['🔴', '🟦', '🟡', '🟢', '🟣', '🟠'];
const PATTERN_LENGTH = 4;

interface Pattern {
  sequence: string[];
  missingIndex: number;
  options: string[];
  correctAnswer: string;
}

// Resolve game ID dynamically from backend to avoid mismatches after reseeding
// Title must match the seeded game title exactly: 'Pattern Play'
const GAME_TITLE = 'Pattern Play';

export default function PatternPlayGame() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [gameId, setGameId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Fetch the game ID by title once the user is available
    const resolveGameId = async () => {
      try {
        const res = await gamesAPI.getAll();
        const allGames = res.data || [];
        const match = allGames.find((g: any) => g.title === GAME_TITLE);
        if (match && match._id) {
          const id = typeof match._id === 'string' ? match._id : match._id.toString();
          setGameId(id);
          console.log(`[Pattern Play] Resolved gameId:`, id);
        } else {
          console.warn(`[Pattern Play] Game with title '${GAME_TITLE}' not found.`);
        }
      } catch (e) {
        console.error('[Pattern Play] Failed to resolve gameId:', e);
      }
    };
    resolveGameId();
  }, [user]);

  useEffect(() => {
    generatePattern();
  }, [level]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !gameWon) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame(false);
    }
  }, [timeLeft, gameOver, gameWon]);

  const generatePattern = () => {
    // Create a simple repeating pattern
    const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const secondShape = SHAPES.filter(s => s !== baseShape)[Math.floor(Math.random() * (SHAPES.length - 1))];
    
    // Pattern: A-B-A-B
    const sequence = [baseShape, secondShape, baseShape, secondShape];
    const missingIndex = Math.floor(Math.random() * PATTERN_LENGTH);
    const correctAnswer = sequence[missingIndex];
    
    // Create 3 wrong options
    const wrongOptions = SHAPES.filter(s => s !== correctAnswer).slice(0, 2);
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    // Hide the missing shape
    const displaySequence = [...sequence];
    displaySequence[missingIndex] = '❓';
    
    setCurrentPattern({
      sequence: displaySequence,
      missingIndex,
      options,
      correctAnswer: correctAnswer
    });
  };

  const handleAnswer = async (selectedShape: string) => {
    if (!currentPattern) return;
    
    // Check if answer is correct using the stored correctAnswer
    if (selectedShape === currentPattern.correctAnswer) {
      // Correct!
      const points = 10 + (level * 5);
      setScore(score + points);
      toast.success(language === 'en' ? '🎉 Correct!' : '🎉 صحيح!');
      
      if (level >= 5) {
        endGame(true);
      } else {
        setLevel(level + 1);
      }
    } else {
      // Wrong!
      const newLives = lives - 1;
      setLives(newLives);
      toast.error(language === 'en' ? '❌ Try again!' : '❌ حاول مرة أخرى!');
      
      if (newLives <= 0) {
        endGame(false);
      } else {
        generatePattern();
      }
    }
  };

  const endGame = async (won: boolean) => {
    if (won) {
      setGameWon(true);
      toast.success(language === 'en' ? '🎉 You won!' : '🎉 فزت!');
    } else {
      setGameOver(true);
      toast.error(language === 'en' ? '😢 Game Over!' : '😢 انتهت اللعبة!');
    }
    
    // Save progress
    try {
      if (!gameId) {
        console.warn('[Pattern Play] Missing gameId, skipping progress save.');
        return;
      }
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const progressData = {
        gameId: gameId,
        score,
        isCompleted: won,
        timeSpent,
        pointsEarned: won ? score : Math.floor(score / 2),
        completionPercentage: (level / 5) * 100,
      };
      
      console.log('Saving progress:', progressData);
      const response = await progressAPI.save(progressData);
      console.log('Progress saved successfully:', response.data);
      
      if (won) {
        toast.success(language === 'en' ? '✅ Progress saved! Game completed!' : '✅ تم حفظ التقدم! اكتملت اللعبة!');
        // Refresh user points from backend; fallback to local increment
        try {
          const profile = await authAPI.getProfile();
          const serverPoints = profile.data?.points;
          if (typeof serverPoints === 'number') {
            updateUser({ points: serverPoints });
          } else {
            updateUser({ points: (user?.points || 0) + progressData.pointsEarned });
          }
        } catch (e) {
          console.warn('[Pattern Play] Failed to refresh profile, updating points locally.');
          updateUser({ points: (user?.points || 0) + progressData.pointsEarned });
        }
      }
    } catch (error: any) {
      console.error('Failed to save progress:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(language === 'en' ? `Failed to save progress: ${error.response?.data?.message || error.message}` : `فشل في حفظ التقدم: ${error.response?.data?.message || error.message}`);
    }
  };

  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setGameOver(false);
    setGameWon(false);
    generatePattern();
  };

  const texts = {
    en: {
      title: 'Pattern Play',
      level: 'Level',
      score: 'Score',
      lives: 'Lives',
      time: 'Time',
      question: 'Which shape completes the pattern?',
      playAgain: 'Play Again',
      backToGames: 'Back to Games',
      gameOver: 'Game Over!',
      youWon: 'You Won!',
      finalScore: 'Final Score',
    },
    ar: {
      title: 'لعبة الأنماط',
      level: 'المستوى',
      score: 'النقاط',
      lives: 'الحياة',
      time: 'الوقت',
      question: 'ما هو الشكل الذي يكمل النمط؟',
      playAgain: 'العب مرة أخرى',
      backToGames: 'العودة إلى الألعاب',
      gameOver: 'انتهت اللعبة!',
      youWon: 'فزت!',
      finalScore: 'النقاط النهائية',
    }
  };

  const t = texts[language];

  if (gameOver || gameWon) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              {gameWon ? t.youWon : t.gameOver}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{gameWon ? '🏆' : '😢'}</div>
              <p className="text-2xl font-bold mb-2">{t.finalScore}</p>
              <p className="text-4xl font-bold text-purple-600">{score}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={restartGame} className="flex-1 bg-green-500 hover:bg-green-600">
                {t.playAgain}
              </Button>
              <Button onClick={() => router.push('/games')} variant="outline" className="flex-1">
                {t.backToGames}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => router.push('/games')}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t.backToGames}
          </Button>
          <Button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            {language === 'en' ? 'عربي' : 'English'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90">
            <CardContent className="pt-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
              <p className="text-xs text-gray-600">{t.level}</p>
              <p className="text-2xl font-bold">{level}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="pt-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <p className="text-xs text-gray-600">{t.score}</p>
              <p className="text-2xl font-bold">{score}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl mb-1">❤️</div>
              <p className="text-xs text-gray-600">{t.lives}</p>
              <p className="text-2xl font-bold">{lives}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-xs text-gray-600">{t.time}</p>
              <p className="text-2xl font-bold">{timeLeft}s</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Pattern Display */}
            {currentPattern && (
              <div className="flex justify-center gap-4 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
                {currentPattern.sequence.map((shape, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 flex items-center justify-center text-6xl bg-white rounded-xl shadow-lg"
                  >
                    {shape}
                  </div>
                ))}
              </div>
            )}

            {/* Options */}
            {currentPattern && (
              <div className="grid grid-cols-3 gap-4">
                {currentPattern.options.map((shape, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(shape)}
                    className="w-full aspect-square flex items-center justify-center text-7xl bg-white hover:bg-purple-100 rounded-2xl shadow-lg transform hover:scale-105 transition-all border-4 border-purple-200 hover:border-purple-400"
                  >
                    {shape}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
