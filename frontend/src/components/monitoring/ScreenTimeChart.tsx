'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScreenTimeChartProps {
  data: {
    dailyBreakdown: { date: string; minutes: number }[];
    activityBreakdown: { type: string; minutes: number }[];
    totalMinutes: number;
  };
  timeRange: 'day' | 'week' | 'month';
}

export function ScreenTimeChart({ data, timeRange }: ScreenTimeChartProps) {
  const COLORS = ['#FF6B6B', '#4ECDC4', '#06D6A0', '#FF8C42', '#A8DADC', '#AA96DA'];

  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Daily Screen Time</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.dailyBreakdown && data.dailyBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return timeRange === 'day' 
                      ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number) => [`${value} min`, 'Screen Time']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#4ECDC4" 
                  strokeWidth={2}
                  name="Screen Time"
                  dot={{ fill: '#4ECDC4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.activityBreakdown && data.activityBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.activityBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${value} min`, 'Time']} />
                <Legend />
                <Bar dataKey="minutes" fill="#4ECDC4" name="Minutes">
                  {data.activityBreakdown.map((entry: any, index: number) => (
                    <Bar key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

