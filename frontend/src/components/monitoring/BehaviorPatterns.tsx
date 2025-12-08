'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface BehaviorPatternsProps {
  patterns: {
    peakHours: number[];
    sessionFrequency: {
      averagePerDay: number;
      totalDays: number;
      maxSessionsInDay: number;
    };
    contentTypes: { type: string; count: number; totalMinutes: number }[];
    gamingPatterns: {
      totalGames: number;
      averageDuration: number;
      longestSession: number;
    };
    breakPatterns: {
      breakCount: number;
      averageBreakDuration: number;
    };
  };
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#06D6A0', '#FF8C42', '#A8DADC', '#AA96DA'];

export function BehaviorPatterns({ patterns }: BehaviorPatternsProps) {
  // Prepare peak hours data
  const peakHoursData = patterns.peakHours.map((hour) => ({
    hour: `${hour}:00`,
    value: 1,
  }));

  // Prepare content types data for pie chart
  const contentTypesData = patterns.contentTypes.map((ct) => ({
    name: ct.type.replace('_', ' '),
    value: ct.totalMinutes,
    count: ct.count,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Peak Activity Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {patterns.peakHours.length > 0 ? (
              <div className="space-y-2">
                {patterns.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-16 text-sm font-medium">{hour}:00</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full"
                      style={{ width: '100%', backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Session Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Average per day:</span>
                <span className="font-semibold">{patterns.sessionFrequency.averagePerDay.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total days active:</span>
                <span className="font-semibold">{patterns.sessionFrequency.totalDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max sessions in a day:</span>
                <span className="font-semibold">{patterns.sessionFrequency.maxSessionsInDay}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Content Types</CardTitle>
          </CardHeader>
          <CardContent>
            {contentTypesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contentTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contentTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} minutes`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-4">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Gaming Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total games played:</span>
                <span className="font-semibold">{patterns.gamingPatterns.totalGames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average duration:</span>
                <span className="font-semibold">{patterns.gamingPatterns.averageDuration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longest session:</span>
                <span className="font-semibold">{patterns.gamingPatterns.longestSession} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Break count:</span>
                <span className="font-semibold">{patterns.breakPatterns.breakCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg break duration:</span>
                <span className="font-semibold">{patterns.breakPatterns.averageBreakDuration} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

