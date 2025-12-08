'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Clock, Gamepad2, BookOpen, Trophy, Users } from 'lucide-react';

interface Activity {
  _id: string;
  type: string;
  duration: number;
  timestamp: Date;
  gameId?: {
    title: string;
    titleArabic?: string;
  };
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons: Record<string, any> = {
  game_played: Gamepad2,
  learning_module: BookOpen,
  achievement_unlocked: Trophy,
  competition_joined: Users,
};

const activityColors: Record<string, string> = {
  game_played: 'bg-blue-100 text-blue-800',
  learning_module: 'bg-green-100 text-green-800',
  achievement_unlocked: 'bg-yellow-100 text-yellow-800',
  competition_joined: 'bg-purple-100 text-purple-800',
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No activities recorded</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] || Clock;
              const colorClass = activityColors[activity.type] || 'bg-gray-100 text-gray-800';

              return (
                <div
                  key={activity._id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={colorClass}>
                        {formatType(activity.type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDuration(activity.duration)}
                      </span>
                    </div>
                    {activity.gameId && (
                      <p className="text-sm font-medium text-gray-700">
                        {activity.gameId.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

