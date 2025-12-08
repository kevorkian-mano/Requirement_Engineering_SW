'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StudentData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  totalMinutes: number;
  activityCount: number;
  patterns?: {
    peakHours: number[];
    gamingPatterns: {
      totalGames: number;
      averageDuration: number;
    };
  };
}

interface ComparativeAnalyticsProps {
  students: StudentData[];
}

export function ComparativeAnalytics({ students }: ComparativeAnalyticsProps) {
  // Prepare comparison data
  const screenTimeComparison = students.map((s) => ({
    name: `${s.student.firstName} ${s.student.lastName}`,
    screenTime: s.totalMinutes,
    activities: s.activityCount,
  }));

  const gamingComparison = students
    .filter((s) => s.patterns?.gamingPatterns)
    .map((s) => ({
      name: `${s.student.firstName} ${s.student.lastName}`,
      games: s.patterns!.gamingPatterns.totalGames,
      avgDuration: s.patterns!.gamingPatterns.averageDuration,
    }));

  // Calculate statistics
  const stats = {
    averageScreenTime: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.totalMinutes, 0) / students.length)
      : 0,
    maxScreenTime: Math.max(...students.map((s) => s.totalMinutes), 0),
    minScreenTime: Math.min(...students.map((s) => s.totalMinutes), 0),
    totalActivities: students.reduce((sum, s) => sum + s.activityCount, 0),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Screen Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.averageScreenTime} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Highest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.maxScreenTime} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lowest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.minScreenTime} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalActivities}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screen Time Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {screenTimeComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={screenTimeComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${value} min`, 'Screen Time']} />
                <Legend />
                <Bar dataKey="screenTime" fill="#4ECDC4" name="Screen Time" />
                <Bar dataKey="activities" fill="#FF6B6B" name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      {gamingComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gaming Patterns Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gamingComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="games" fill="#06D6A0" name="Games Played" />
                <Bar dataKey="avgDuration" fill="#FF8C42" name="Avg Duration (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

