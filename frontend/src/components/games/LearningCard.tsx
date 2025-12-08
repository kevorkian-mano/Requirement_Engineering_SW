import { BookOpen, Clock, CheckCircle } from 'lucide-react';

interface LearningCardProps {
  title: string;
  titleAr: string;
  duration: string;
  durationAr: string;
  progress: number;
  icon: string;
  color: string;
  language: 'en' | 'ar';
  completed?: boolean;
}

export function LearningCard({ 
  title, 
  titleAr, 
  duration, 
  durationAr, 
  progress, 
  icon, 
  color,
  language,
  completed = false
}: LearningCardProps) {
  const displayTitle = language === 'ar' ? titleAr : title;
  const displayDuration = language === 'ar' ? durationAr : duration;

  return (
    <div 
      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm"
          style={{ backgroundColor: color + '20' }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg mb-1 text-gray-800">{displayTitle}</h3>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{displayDuration}</span>
          </div>
        </div>
        {completed && (
          <CheckCircle className="w-6 h-6 text-green-500 fill-green-100" />
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1 text-gray-600">
          <span>{language === 'ar' ? 'التقدم' : 'Progress'}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: color,
              width: `${progress}%`
            }}
          />
        </div>
      </div>
      
      <button 
        className="w-full py-3 rounded-xl text-white mt-3 hover:shadow-md transition-shadow"
        style={{ backgroundColor: color }}
      >
        {completed 
          ? (language === 'ar' ? 'إعادة المراجعة' : 'Review') 
          : (language === 'ar' ? 'متابعة التعلم' : 'Continue Learning')
        }
      </button>
    </div>
  );
}
