'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, X } from 'lucide-react';
import { gamesAPI, progressAPI } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/authStore';
import { Game } from '@/src/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { toast } from 'sonner';

interface QuickActionsProps {
  language: 'en' | 'ar';
}

export function QuickActions({ language }: QuickActionsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [dailyChallengeGame, setDailyChallengeGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDailyChallenge();
  }, [user]);

  const loadDailyChallenge = async () => {
    if (!user?._id || !user?.ageGroup) return;

    try {
      const gamesRes = await gamesAPI.getAll({ ageGroup: user.ageGroup });
      const games = gamesRes.data || [];
      
      if (games.length > 0) {
        // Get user progress to find games not yet completed
        const progressRes = await progressAPI.getUserProgress();
        const progress = progressRes.data || [];
        const completedGameIds = new Set(
          progress
            .filter((p: any) => p.isCompleted)
            .map((p: any) => {
              const gameId = typeof p.gameId === 'string' ? p.gameId : (p.gameId as any)?._id;
              return gameId;
            })
        );

        // Find a game that's not completed yet, or pick a random one
        const uncompletedGames = games.filter((g: Game) => !completedGameIds.has(g._id));
        const gameToRecommend = uncompletedGames.length > 0 
          ? uncompletedGames[Math.floor(Math.random() * uncompletedGames.length)]
          : games[Math.floor(Math.random() * games.length)];

        setDailyChallengeGame(gameToRecommend);
      }
    } catch (error) {
      console.error('Failed to load daily challenge:', error);
    }
  };

  const handleDailyChallengeClick = () => {
    if (dailyChallengeGame) {
      setShowDailyChallenge(true);
    } else {
      loadDailyChallenge();
      setShowDailyChallenge(true);
    }
  };

  const handlePlayChallenge = async () => {
    if (!dailyChallengeGame) return;

    try {
      setLoading(true);
      await gamesAPI.play(dailyChallengeGame._id);
      toast.success(
        language === 'en' 
          ? `🎉 Daily Challenge! Play this game to earn ${dailyChallengeGame.pointsReward * 2} bonus points!`
          : `🎉 التحدي اليومي! العب هذه اللعبة لكسب ${dailyChallengeGame.pointsReward * 2} نقطة إضافية!`
      );
      router.push(`/games/${dailyChallengeGame._id}`);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to start game' : 'فشل بدء اللعبة');
    } finally {
      setLoading(false);
      setShowDailyChallenge(false);
    }
  };

  const texts = {
    en: {
      title: "Quick Actions",
      dailyChallenge: "Daily Challenge",
      safetyTips: "Safety Tips",
      challengeTitle: "Today's Challenge! ⭐",
      challengeDescription: "Complete this game to earn bonus points!",
      bonusPoints: "Bonus Points",
      playNow: "Play Now",
      close: "Close",
      safetyTitle: "Safety Tips 🛡️",
      safetyDescription: "Important tips to stay safe online",
      tips: [
        {
          title: "Never Share Personal Information",
          content: "Never share your full name, address, phone number, or school name with strangers online."
        },
        {
          title: "Tell a Parent or Teacher",
          content: "If something makes you feel uncomfortable or scared online, tell a parent or teacher right away."
        },
        {
          title: "Don't Meet Online Friends",
          content: "Never meet someone in person that you only know from the internet without a parent's permission."
        },
        {
          title: "Use Strong Passwords",
          content: "Create strong passwords with letters, numbers, and symbols. Don't share them with anyone except your parents."
        },
        {
          title: "Be Kind Online",
          content: "Treat others online the same way you want to be treated. Cyberbullying is never okay."
        },
        {
          title: "Take Breaks",
          content: "Remember to take breaks from screens. Play outside, read a book, or spend time with family."
        }
      ]
    },
    ar: {
      title: "إجراءات سريعة",
      dailyChallenge: "التحدي اليومي",
      safetyTips: "نصائح الأمان",
      challengeTitle: "تحدي اليوم! ⭐",
      challengeDescription: "أكمل هذه اللعبة لكسب نقاط إضافية!",
      bonusPoints: "نقاط إضافية",
      playNow: "العب الآن",
      close: "إغلاق",
      safetyTitle: "نصائح الأمان 🛡️",
      safetyDescription: "نصائح مهمة للبقاء آمناً على الإنترنت",
      tips: [
        {
          title: "لا تشارك المعلومات الشخصية",
          content: "لا تشارك اسمك الكامل أو عنوانك أو رقم هاتفك أو اسم مدرستك مع الغرباء على الإنترنت."
        },
        {
          title: "أخبر الوالدين أو المعلم",
          content: "إذا كان هناك شيء يجعلك تشعر بعدم الراحة أو الخوف على الإنترنت، أخبر والديك أو معلمك على الفور."
        },
        {
          title: "لا تقابل الأصدقاء عبر الإنترنت",
          content: "لا تقابل شخصاً تعرفه فقط من الإنترنت شخصياً دون إذن والديك."
        },
        {
          title: "استخدم كلمات مرور قوية",
          content: "أنشئ كلمات مرور قوية تحتوي على أحرف وأرقام ورموز. لا تشاركها مع أي شخص باستثناء والديك."
        },
        {
          title: "كن لطيفاً على الإنترنت",
          content: "عامل الآخرين على الإنترنت بنفس الطريقة التي تريد أن تُعامل بها. التنمر الإلكتروني غير مقبول أبداً."
        },
        {
          title: "خذ استراحات",
          content: "تذكر أن تأخذ استراحات من الشاشات. العب في الخارج، اقرأ كتاباً، أو اقضِ وقتاً مع العائلة."
        }
      ]
    }
  };

  const t = texts[language];

  const actions = [
    { 
      icon: Sparkles, 
      label: t.dailyChallenge, 
      color: '#FF6B6B',
      emoji: '⭐',
      onClick: handleDailyChallengeClick
    },
    { 
      icon: Shield, 
      label: t.safetyTips, 
      color: '#06D6A0',
      emoji: '🛡️',
      onClick: () => setShowSafetyTips(true)
    }
  ];

  return (
    <>
      <div 
        className="bg-white rounded-3xl p-6 shadow-lg mb-6"
        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
      >
        <h3 className="text-gray-800 mb-4 font-bold text-lg">{t.title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl hover:shadow-md transition-all transform hover:scale-105"
                style={{ backgroundColor: action.color + '20' }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: action.color }}
                >
                  <span className="text-2xl">{action.emoji}</span>
                </div>
                <span 
                  className="text-sm text-center font-semibold"
                  style={{ color: action.color }}
                >
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Challenge Dialog */}
      <Dialog open={showDailyChallenge} onOpenChange={setShowDailyChallenge}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t.challengeTitle}</DialogTitle>
            <DialogDescription>{t.challengeDescription}</DialogDescription>
          </DialogHeader>
          {dailyChallengeGame ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{dailyChallengeGame.title}</CardTitle>
                  <CardDescription>{dailyChallengeGame.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t.bonusPoints}</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dailyChallengeGame.pointsReward * 2} ⭐
                      </p>
                    </div>
                    <div className="text-4xl">
                      {dailyChallengeGame.category === 'math' ? '🔢' :
                       dailyChallengeGame.category === 'physics' ? '⚛️' :
                       dailyChallengeGame.category === 'chemistry' ? '🧪' :
                       dailyChallengeGame.category === 'language' ? '📝' :
                       dailyChallengeGame.category === 'coding' ? '💻' :
                       dailyChallengeGame.category === 'history' ? '🏛️' : '🎮'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-2">
                <Button 
                  onClick={handlePlayChallenge} 
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? '...' : t.playNow}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDailyChallenge(false)}
                >
                  {t.close}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              {language === 'en' ? 'Loading challenge...' : 'جاري تحميل التحدي...'}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Safety Tips Dialog */}
      <Dialog open={showSafetyTips} onOpenChange={setShowSafetyTips}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t.safetyTitle}</DialogTitle>
            <DialogDescription>{t.safetyDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {t.tips.map((tip, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{tip.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowSafetyTips(false)}>
              {t.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
