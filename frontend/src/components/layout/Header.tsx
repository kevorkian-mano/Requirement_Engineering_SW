'use client';

import { useState, useEffect } from 'react';
import { Star, Trophy, Medal, LogOut, Globe, Heart } from 'lucide-react';
import { User } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { usersAPI, progressAPI } from '@/src/lib/api';

interface HeaderProps {
  language: 'en' | 'ar';
  user?: User;
  onLanguageChange?: (lang: 'en' | 'ar') => void;
}

export function Header({ language, user, onLanguageChange }: HeaderProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [parentName, setParentName] = useState<string | null>(null);
  const [achievementsCount, setAchievementsCount] = useState(0);

  useEffect(() => {
    const loadParentInfo = async () => {
      if (user?.parentId && user?.role === 'child') {
        try {
          const res = await usersAPI.getParent();
          if (res.data && res.data.firstName) {
            setParentName(`${res.data.firstName} ${res.data.lastName || ''}`);
          }
        } catch (error) {
          console.error('Failed to load parent info:', error);
          // Don't fail the whole app if parent info fails to load
        }
      }
    };

    const loadAchievements = async () => {
      if (user?._id && user?.role === 'child') {
        try {
          const res = await progressAPI.getAchievements();
          const achievements = res.data || [];
          const unlockedCount = achievements.filter((a: any) => a.unlockedAt).length;
          setAchievementsCount(unlockedCount);
        } catch (error) {
          console.error('Failed to load achievements:', error);
          // Don't fail the whole app if achievements fail to load
        }
      }
    };

    if (user) {
      loadParentInfo();
      loadAchievements();
    }
  }, [user]);

  const texts = {
    en: {
      welcome: 'Welcome back',
      hiParent: 'Hi Parent!',
      points: 'Points',
      level: 'Level',
      logout: 'Logout',
    },
    ar: {
      welcome: 'مرحباً بعودتك',
      hiParent: 'مرحباً أيها الوالد!',
      points: 'النقاط',
      level: 'المستوى',
      logout: 'تسجيل الخروج',
    },
  };

  const t = texts[language];
  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const points = user?.points || 0;
  const level = user?.level || 1;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div
      className="bg-white rounded-[2rem] p-6 mb-6 shadow-lg"
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
    >
      {/* Language and Logout buttons */}
      <div className="flex justify-end gap-2 mb-4">
        {onLanguageChange && (
          <Button
            variant="outline"
            onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
            className="bg-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="bg-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t.logout}
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8C42] p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#4ECDC4] to-[#457B9D] flex items-center justify-center">
                <span className="text-3xl">{user?.avatar || '👦'}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-lg">{t.welcome}</p>
            <h2 className="text-[#457B9D]">{userName}!</h2>
            {user?.parentId && parentName && (
              <div className="flex items-center gap-2 mt-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-pink-600 font-medium">
                  {t.hiParent} {parentName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          {/* Points */}
          <div className="bg-gradient-to-br from-[#FFE66D] to-[#FF8C42] rounded-2xl px-6 py-4 min-w-[140px] shadow-md transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Star className="w-5 h-5 fill-white text-white" />
              <span className="text-white">{t.points}</span>
            </div>
            <p className="text-center text-3xl text-white">{points.toLocaleString()}</p>
          </div>

          {/* Level */}
          <div className="bg-gradient-to-br from-[#06D6A0] to-[#4ECDC4] rounded-2xl px-6 py-4 min-w-[140px] shadow-md transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-white">{t.level}</span>
            </div>
            <p className="text-center text-3xl text-white">{level}</p>
          </div>

          {/* Stars (Progression) */}
          <div className="bg-gradient-to-br from-[#FF69B4] to-[#FF6B6B] rounded-2xl px-6 py-4 min-w-[140px] shadow-md transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Medal className="w-5 h-5 text-white" />
              <span className="text-white">⭐</span>
            </div>
            <p className="text-center text-3xl text-white">{Math.max(0, level - 1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
