'use client';

import { CourseStudentActivity } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { User, Clock, Trophy, TrendingUp, Gamepad2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface CourseStudentsProps {
  students: CourseStudentActivity[];
  loading?: boolean;
  onViewStudent?: (studentId: string) => void;
}

export function CourseStudents({ students, loading = false, onViewStudent }: CourseStudentsProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-500">Loading students...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No students have played games in this course yet.</p>
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

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <Card key={student.studentId} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {student.studentName}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{student.studentEmail}</p>
                </div>
              </div>
              {onViewStudent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewStudent(student.studentId)}
                >
                  View Details
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Games Played</p>
                  <p className="text-lg font-semibold">{student.totalGamesPlayed}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Points</p>
                  <p className="text-lg font-semibold">{student.totalPointsEarned}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-semibold">{student.completedGames}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="text-lg font-semibold">{student.currentLevel}</p>
                </div>
              </div>
            </div>

            {student.gameProgress.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Recent Activity:</p>
                <div className="space-y-2">
                  {student.gameProgress.slice(0, 3).map((progress, index) => (
                    <div
                      key={`${progress.gameId}-${index}`}
                      className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                    >
                      <span className="text-gray-700">{progress.gameTitle}</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-gray-600">Score: {progress.score}%</span>
                        <span className="text-gray-600">{progress.playCount} plays</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
