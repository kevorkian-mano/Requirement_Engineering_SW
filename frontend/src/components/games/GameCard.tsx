import { Play, Lock, Star } from 'lucide-react';

interface GameCardProps {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
  isLocked?: boolean;
  language: 'en' | 'ar';
  difficulty: string;
  difficultyAr: string;
  pointsReward?: number;
  ageGroups?: string[];
  playCount?: number;
  isCompleted?: boolean;
  bestScore?: number;
  onPlay?: () => void;
}

export function GameCard({ 
  title, 
  titleAr, 
  description, 
  descriptionAr, 
  icon, 
  color, 
  isLocked = false,
  language,
  difficulty,
  difficultyAr,
  pointsReward,
  ageGroups,
  playCount,
  isCompleted,
  bestScore,
  onPlay
}: GameCardProps) {
  const displayTitle = language === 'ar' ? titleAr : title;
  const displayDescription = language === 'ar' ? descriptionAr : description;
  const displayDifficulty = language === 'ar' ? difficultyAr : difficulty;

  // Debug logging
  console.log(`GameCard [${title}]:`, {
    isCompleted,
    isLocked,
    playCount,
    bestScore,
  });

  return (
    <div 
      className={`bg-white rounded-3xl p-6 shadow-lg ${!isLocked ? 'hover:shadow-xl transform hover:scale-105' : 'opacity-60'} transition-all ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} relative overflow-hidden`}
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-40 rounded-3xl flex flex-col items-center justify-center z-20">
          <Lock className="w-12 h-12 text-white mb-2" />
          <span className="text-white font-bold text-lg">{language === 'en' ? 'LOCKED' : 'مقفل'}</span>
        </div>
      )}

      {/* Background decoration */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: color, transform: 'translate(30%, -30%)' }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md ${isLocked ? 'grayscale opacity-50' : ''}`}
            style={{ backgroundColor: color + '20' }}
          >
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && !isLocked && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ✓ {language === 'en' ? 'Done' : 'مكتمل'}
              </span>
            )}
            {isLocked && (
              <div className="bg-gray-200 rounded-full p-2">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
        </div>
        
        <h3 className={`mb-2 font-bold text-lg ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>{displayTitle}</h3>
        <p className={`text-sm mb-4 line-clamp-2 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>{displayDescription}</p>
        
        {/* Game Info */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium ${isLocked ? 'bg-gray-100 text-gray-500' : ''}`}
            style={!isLocked ? { backgroundColor: color + '20', color: color } : {}}
          >
            {displayDifficulty}
          </span>
          {pointsReward && (
            <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-800'}`}>
              <Star className="w-3 h-3 fill-yellow-600" />
              {pointsReward} {language === 'en' ? 'pts' : 'نقطة'}
            </span>
          )}
          {ageGroups && ageGroups.length > 0 && (
            <span className={`px-3 py-1 rounded-full text-xs ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-800'}`}>
              {ageGroups.join(', ')}
            </span>
          )}
        </div>

        {/* Progress Info */}
        {!isLocked && (bestScore !== undefined || playCount !== undefined) && (
          <div className="mb-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              {bestScore !== undefined && (
                <span>{language === 'en' ? 'Best' : 'أفضل'}: {bestScore}</span>
              )}
              {playCount !== undefined && playCount > 0 && (
                <span>{playCount} {language === 'en' ? 'plays' : 'مرات'}</span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-end">
          {!isLocked && (
            <button 
              onClick={onPlay}
              className="rounded-full p-3 shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
              style={{ backgroundColor: color }}
            >
              <Play className="w-5 h-5 text-white fill-white" />
              <span className="text-white text-sm font-medium pr-1">
                {language === 'en' ? 'Play' : 'العب'}
              </span>
            </button>
          )}
          {isLocked && (
            <div className="rounded-full p-3 flex items-center gap-2 bg-gray-300">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-500 text-sm font-medium pr-1">
                {language === 'en' ? 'Locked' : 'مقفل'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
