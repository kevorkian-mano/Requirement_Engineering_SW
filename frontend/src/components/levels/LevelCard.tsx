'use client';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Progress } from '../ui/progress';

interface LevelCardProps {
  currentLevel: number;
  currentTitle: string;
  currentDescription: string;
  nextTitle: string;
  nextDescription: string;
  totalXP: number;
  currentXP: number;
  xpNeeded: number;
  progressPercentage: number;
  unlockedCount: number;
  lockedCount: number;
  language: 'en' | 'ar';
}

export function LevelCard({
  currentLevel,
  currentTitle,
  currentDescription,
  nextTitle,
  nextDescription,
  totalXP,
  currentXP,
  xpNeeded,
  progressPercentage,
  unlockedCount,
  lockedCount,
  language,
}: LevelCardProps) {
  const texts = {
    en: {
      level: 'Level',
      xpProgress: 'XP Progress',
      nextLevel: 'Next Level',
      gamesUnlocked: 'Games Unlocked',
      gamesLocked: 'Games Locked',
      totalXP: 'Total XP',
    },
    ar: {
      level: 'المستوى',
      xpProgress: 'تقدم النقاط',
      nextLevel: 'المستوى التالي',
      gamesUnlocked: 'الألعاب المفتوحة',
      gamesLocked: 'الألعاب المقفلة',
      totalXP: 'إجمالي XP',
    },
  };

  const t = texts[language];
  const isRTL = language === 'ar';

  return (
    <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-yellow-400">
      <CardHeader className="pb-3">
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }} className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-2xl font-bold">{currentTitle}</h2>
            <div className="bg-yellow-400 text-purple-900 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
              {currentLevel}
            </div>
          </div>
          <p className="text-purple-200">{currentDescription}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Level XP Progress */}
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }} className="space-y-2">
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-semibold">{t.xpProgress}</span>
            <span className="text-xs bg-purple-700 px-2 py-1 rounded">
              {currentXP} / {xpNeeded}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-purple-300">
            {Math.round(progressPercentage)}% {isRTL ? 'الى المستوى التالي' : 'to next level'}
          </p>
        </div>

        {/* Games Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-3">
            <p className="text-purple-300 text-xs font-semibold">{t.gamesUnlocked}</p>
            <p className="text-white text-2xl font-bold">{unlockedCount}</p>
          </div>
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-3">
            <p className="text-red-300 text-xs font-semibold">{t.gamesLocked}</p>
            <p className="text-white text-2xl font-bold">{lockedCount}</p>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3">
          <p className="text-blue-300 text-xs font-semibold">{t.totalXP}</p>
          <p className="text-white text-xl font-bold">{totalXP} XP</p>
        </div>

        {/* Next Level Preview */}
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }} className="border-t border-purple-700 pt-4">
          <p className="text-yellow-300 text-sm font-semibold mb-2">{t.nextLevel}</p>
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-3">
            <h3 className="text-white font-bold">{nextTitle}</h3>
            <p className="text-purple-300 text-sm">{nextDescription}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
