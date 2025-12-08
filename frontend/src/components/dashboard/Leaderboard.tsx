import { Crown, Trophy, Medal } from 'lucide-react';
import { LeaderboardEntry } from '@/src/types';

interface LeaderboardProps {
  language: 'en' | 'ar';
  leaderboard?: LeaderboardEntry[];
  currentUserId?: string;
}

export function Leaderboard({ language, leaderboard = [], currentUserId }: LeaderboardProps) {
  const texts = {
    en: {
      title: 'Leaderboard',
      viewAll: 'View All',
      you: 'You',
      points: 'points',
    },
    ar: {
      title: 'لوحة المتصدرين',
      viewAll: 'عرض الكل',
      you: 'أنت',
      points: 'نقطة',
    },
  };

  const t = texts[language];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5" style={{ color: '#FFD700' }} />;
      case 2:
        return <Trophy className="w-5 h-5" style={{ color: '#C0C0C0' }} />;
      case 3:
        return <Medal className="w-5 h-5" style={{ color: '#CD7F32' }} />;
      default:
        return <span className="text-gray-500">{rank}</span>;
    }
  };

  const getAvatar = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-lg"
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF69B4] to-[#FF6B6B] rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-800">{t.title}</h3>
        </div>
        <button className="text-[#4ECDC4] text-sm hover:underline">{t.viewAll}</button>
      </div>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{language === 'ar' ? 'لا توجد بيانات' : 'No data yet'}</p>
        ) : (
          leaderboard.slice(0, 4).map((leader) => {
            const isYou = leader.userId === currentUserId;
            return (
              <div
                key={leader.rank}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isYou
                    ? 'bg-gradient-to-r from-[#4ECDC4] to-[#06D6A0] shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(leader.rank)}
                </div>

                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${
                    isYou ? 'bg-white text-[#4ECDC4]' : 'bg-white text-gray-700'
                  }`}
                  style={{
                    border: isYou ? '3px solid white' : 'none',
                  }}
                >
                  {leader.avatar || getAvatar(leader.firstName)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={isYou ? 'text-white' : 'text-gray-800'}>
                      {leader.firstName} {leader.lastName}
                    </span>
                    {isYou && (
                      <span className="bg-white text-[#4ECDC4] text-xs px-2 py-0.5 rounded-full">
                        {t.you}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isYou ? 'text-white/90' : 'text-gray-500'}`}>
                    {leader.points.toLocaleString()} {t.points}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
