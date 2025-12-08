import { useState, useEffect } from 'react';
import { TrendingUp, Target, Flame } from 'lucide-react';
import { User } from '@/src/types';
import { progressAPI, monitoringAPI } from '@/src/lib/api';

interface ProgressCardProps {
  language: 'en' | 'ar';
  user?: User;
}

export function ProgressCard({ language, user }: ProgressCardProps) {
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        // Get progress for the week
        const [progressRes, screenTimeRes] = await Promise.all([
          progressAPI.getUserProgress(),
          monitoringAPI.getScreenTime(user._id, { range: 'week' }),
        ]);

        const progress = progressRes.data || [];
        const screenTime = screenTimeRes.data || {};

        // Calculate weekly activities completed
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const recentProgress = progress.filter((p: any) => {
          const lastPlayed = new Date(p.lastPlayedAt || p.createdAt);
          return lastPlayed >= weekStart;
        });

        const weeklyGoal = 20; // 20 activities per week
        const completed = recentProgress.length;
        const progressPercent = Math.min((completed / weeklyGoal) * 100, 100);

        setWeeklyCompleted(completed);
        setWeeklyProgress(progressPercent);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  const texts = {
    en: {
      title: 'My Progress',
      weeklyGoal: 'Weekly Goal',
      completed: 'Completed',
      streak: 'Day Streak',
      thisWeek: 'This Week',
      activities: 'Activities',
    },
    ar: {
      title: 'تقدمي',
      weeklyGoal: 'الهدف الأسبوعي',
      completed: 'مكتمل',
      streak: 'سلسلة الأيام',
      thisWeek: 'هذا الأسبوع',
      activities: 'نشاطات',
    },
  };

  const t = texts[language];
  const streak = user?.loginStreak || 0;
  const weeklyGoal = 20;

  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-lg"
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B6B] to-[#FF8C42] rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-gray-800">{t.title}</h3>
      </div>

      {/* Weekly Goal */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#4ECDC4]" />
            <span className="text-gray-700">{t.weeklyGoal}</span>
          </div>
          <span className="text-gray-600">
            {loading ? '...' : `${weeklyCompleted}/${weeklyGoal}`} {t.activities}
          </span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#06D6A0] rounded-full"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {loading ? '...' : `${Math.round(weeklyProgress)}%`} {t.completed}! 🎉
        </p>
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-br from-[#FFE66D] to-[#FF8C42] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-white fill-white" />
              <span className="text-white">{t.streak}</span>
            </div>
            <p className="text-4xl text-white">{streak}</p>
          </div>
          <div className="text-6xl">🔥</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h4 className="text-gray-700 mb-3">{t.thisWeek}</h4>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const completed = index < weeklyCompleted;
            const isToday = index === new Date().getDay() - 1;
            return (
              <div key={day} className="text-center">
                <div
                  className={`w-10 h-10 rounded-xl mb-1 flex items-center justify-center ${
                    completed
                      ? 'bg-gradient-to-br from-[#06D6A0] to-[#4ECDC4]'
                      : 'bg-gray-100'
                  } ${isToday ? 'ring-2 ring-[#FF6B6B] ring-offset-2' : ''}`}
                >
                  {completed ? (
                    <span className="text-white text-xl">✓</span>
                  ) : (
                    <span className="text-gray-400 text-xl">-</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
