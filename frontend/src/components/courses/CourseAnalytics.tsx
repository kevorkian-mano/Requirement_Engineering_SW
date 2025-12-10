'use client';

import { CourseAnalytics } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Users, Clock, Trophy, Target, TrendingUp, Activity } from 'lucide-react';

interface CourseAnalyticsDisplayProps {
  analytics: CourseAnalytics;
  loading?: boolean;
}

export function CourseAnalyticsDisplay({ analytics, loading = false }: CourseAnalyticsDisplayProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{analytics.studentMetrics.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{analytics.studentMetrics.activeStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{analytics.pointsMetrics.totalPointsDistributed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{analytics.engagementMetrics.avgCompletionRate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Points Per Student</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-blue-600">{analytics.pointsMetrics.avgPointsPerStudent}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Games Played</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-green-600">{analytics.engagementMetrics.avgGamesPlayedPerStudent}</p>
                <p className="text-xs text-gray-500">per student</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Activity Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-purple-600">{analytics.studentMetrics.activitiesPercentage}</p>
                <p className="text-xs text-gray-500">active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Performance */}
      {analytics.gameMetrics && analytics.gameMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Game Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.gameMetrics.map((game) => (
                <div key={game.gameId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{game.gameTitle}</h4>
                      <p className="text-sm text-gray-500">{game.totalPlays} plays · {game.completedCount} completed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{game.avgScore}</p>
                      <p className="text-xs text-gray-500">avg score</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Points</p>
                      <p className="font-semibold">{game.totalPointsDistributed}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time Spent</p>
                      <p className="font-semibold">{formatDuration(game.avgTimeSpent)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Completion</p>
                      <p className="font-semibold">{game.completionRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {analytics.topPerformers && analytics.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topPerformers.map((student, index) => (
                <div key={`${student.studentName}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-500">#{index + 1}</span>
                    <p className="font-medium">{student.studentName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{student.pointsEarned} pts</p>
                    <p className="text-xs text-gray-500">{student.gamesCompleted} games</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Needs Attention */}
      {analytics.needsAttention && analytics.needsAttention.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Students Needing Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.needsAttention.map((student, index) => (
                <div key={`${student.studentName}-${index}`} className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <div>
                    <p className="font-medium">{student.studentName}</p>
                    <p className="text-sm text-gray-600">{student.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last active</p>
                    <p className="text-sm font-medium">{formatDate(student.lastActive)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
