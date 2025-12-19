'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { authAPI, gamesAPI, progressAPI } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/authStore';
import { toast } from 'sonner';
import { ArrowLeft, Star, Trophy } from 'lucide-react';

// Define card items
const CARD_ITEMS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];
// Resolve game ID dynamically from backend to avoid mismatches after reseeding
// Title must match the seeded game title exactly: 'Memory Match'
const GAME_TITLE = 'Memory Match';

interface CardType {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatchGame() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [gameId, setGameId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [startTime] = useState(Date.now());
  const totalPairs = 6;

  useEffect(() => {
    initializeGame();
  }, []);

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
          console.log(`[Memory Match] Resolved gameId:`, id);
        } else {
          console.warn(`[Memory Match] Game with title '${GAME_TITLE}' not found.`);
        }
      } catch (e) {
        console.error('[Memory Match] Failed to resolve gameId:', e);
      }
    };
    resolveGameId();
  }, [user]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !gameWon) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame(false);
    }
  }, [timeLeft, gameOver, gameWon]);

  useEffect(() => {
    if (matchedPairs === totalPairs && matchedPairs > 0) {
      endGame(true);
    }
  }, [matchedPairs]);

  const initializeGame = () => {
    // Select 6 random items for 12 cards (6 pairs)
    const selectedItems = CARD_ITEMS.slice(0, totalPairs);
    const cardPairs = [...selectedItems, ...selectedItems];
    
    // Shuffle cards
    const shuffled = cardPairs
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
  };

  const handleCardClick = (cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    
    if (!card) {
      console.error('Card not found:', cardId);
      return;
    }

    // Don't allow clicking if we already have 2 flipped cards
    if (flippedCards.length >= 2) return;
    // Don't allow clicking the same card twice
    if (flippedCards.includes(cardId)) return;
    // Don't allow clicking matched cards
    if (card.isMatched) return;
    // Don't allow clicking already flipped cards
    if (card.isFlipped) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlippedCards, newCards);
    }
  };

  const checkMatch = (flippedIds: number[], currentCards: CardType[]) => {
    const [firstId, secondId] = flippedIds;
    const firstCard = currentCards.find(c => c.id === firstId);
    const secondCard = currentCards.find(c => c.id === secondId);

    if (!firstCard || !secondCard) {
      console.error('Card not found:', { firstId, secondId });
      return;
    }

    console.log('Comparing cards:', { 
      first: { id: firstId, value: firstCard.value }, 
      second: { id: secondId, value: secondCard.value },
      match: firstCard.value === secondCard.value 
    });

    if (firstCard.value === secondCard.value) {
      // Match found!
      setTimeout(() => {
        const updatedCards = currentCards.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        );
        setCards(updatedCards);
        setFlippedCards([]);
        setMatchedPairs(matchedPairs + 1);
        
        const points = 20 + timeLeft;
        setScore(score + points);
        toast.success(language === 'en' ? '🎉 Match found!' : '🎉 تم العثور على تطابق!');
      }, 500);
    } else {
      // No match - flip cards back
      setTimeout(() => {
        const updatedCards = currentCards.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isFlipped: false }
            : card
        );
        setCards(updatedCards);
        setFlippedCards([]);
        toast.error(language === 'en' ? '❌ Not a match!' : '❌ ليس تطابقاً!');
      }, 1000);
    }
  };

  const endGame = async (won: boolean) => {
    if (won) {
      setGameWon(true);
      const bonusScore = timeLeft * 2;
      setScore(score + bonusScore);
      toast.success(language === 'en' ? `🎉 You won! Bonus: +${bonusScore}` : `🎉 فزت! مكافأة: +${bonusScore}`);
    } else {
      setGameOver(true);
      toast.error(language === 'en' ? '😢 Time\'s up!' : '😢 انتهى الوقت!');
    }

    // Save progress
    try {
      if (!gameId) {
        console.warn('[Memory Match] Missing gameId, skipping progress save.');
        return;
      }
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const finalScore = won ? score + (timeLeft * 2) : score;
      const progressData = {
        gameId: gameId,
        score: finalScore,
        isCompleted: won,
        timeSpent,
        pointsEarned: won ? finalScore : Math.floor(score / 2),
        completionPercentage: (matchedPairs / totalPairs) * 100,
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
          console.warn('[Memory Match] Failed to refresh profile, updating points locally.');
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
    setGameOver(false);
    setGameWon(false);
    setTimeLeft(90);
    initializeGame();
  };

  const texts = {
    en: {
      title: 'Memory Match',
      moves: 'Moves',
      score: 'Score',
      pairs: 'Pairs',
      time: 'Time',
      playAgain: 'Play Again',
      backToGames: 'Back to Games',
      gameOver: 'Time\'s Up!',
      youWon: 'You Won!',
      finalScore: 'Final Score',
    },
    ar: {
      title: 'مطابقة الذاكرة',
      moves: 'الحركات',
      score: 'النقاط',
      pairs: 'الأزواج',
      time: 'الوقت',
      playAgain: 'العب مرة أخرى',
      backToGames: 'العودة إلى الألعاب',
      gameOver: 'انتهى الوقت!',
      youWon: 'فزت!',
      finalScore: 'النقاط النهائية',
    }
  };

  const t = texts[language];

  if (gameOver || gameWon) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300">
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
              <p className="text-4xl font-bold text-blue-600">{score}</p>
              <p className="text-lg text-gray-600 mt-2">{t.moves}: {moves}</p>
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
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300">
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
              <p className="text-xs text-gray-600">{t.pairs}</p>
              <p className="text-2xl font-bold">{matchedPairs}/{totalPairs}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="pt-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-gray-600">{t.score}</p>
              <p className="text-2xl font-bold">{score}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-xs text-gray-600">{t.moves}</p>
              <p className="text-2xl font-bold">{moves}</p>
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

        {/* Game Board */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || flippedCards.length >= 2}
                  className={`aspect-square rounded-2xl shadow-lg transform transition-all duration-300 ${
                    card.isFlipped || card.isMatched
                      ? 'bg-white scale-100'
                      : 'bg-gradient-to-br from-blue-400 to-purple-400 hover:scale-105 cursor-pointer'
                  } ${card.isMatched ? 'opacity-50' : ''} ${(card.isMatched || flippedCards.length >= 2) && !card.isMatched ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {card.isFlipped || card.isMatched ? card.value : '❓'}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
