import { Award, Lock } from 'lucide-react';

interface AchievementBadgeProps {
  title: string;
  titleAr: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  language: 'en' | 'ar';
}

export function AchievementBadge({ 
  title, 
  titleAr, 
  icon, 
  color, 
  isUnlocked,
  language 
}: AchievementBadgeProps) {
  const displayTitle = language === 'ar' ? titleAr : title;

  return (
    <div className="relative">
      <div 
        className={`rounded-2xl p-5 text-center transition-all transform hover:scale-105 cursor-pointer ${
          isUnlocked ? 'shadow-md' : 'opacity-50'
        }`}
        style={{ 
          backgroundColor: isUnlocked ? color + '20' : '#F5F5F5'
        }}
      >
        <div 
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 ${
            isUnlocked ? 'shadow-md' : ''
          }`}
          style={{ 
            backgroundColor: isUnlocked ? color : '#E0E0E0'
          }}
        >
          {isUnlocked ? icon : '🔒'}
        </div>
        <p className={`text-sm ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
          {displayTitle}
        </p>
        {!isUnlocked && (
          <div className="absolute top-2 right-2">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
