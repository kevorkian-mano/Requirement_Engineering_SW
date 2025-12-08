'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Student {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  totalMinutes: number;
  activityCount: number;
  lastActivity: Date | null;
}

interface ClassOverviewProps {
  students: Student[];
  totalStudents: number;
}

export function ClassOverview({ students, totalStudents }: ClassOverviewProps) {
  const averageScreenTime = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.totalMinutes, 0) / students.length)
    : 0;

  const activeStudents = students.filter((s) => s.activityCount > 0).length;

  // Prepare data for chart
  const chartData = students
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 10)
    .map((s) => ({
      name: `${s.student.firstName} ${s.student.lastName}`,
      minutes: s.totalMinutes,
      activities: s.activityCount,
    }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeStudents}</p>
            <p className="text-sm text-gray-500 mt-1">
              {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Screen Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageScreenTime} min</p>
            <p className="text-sm text-gray-500 mt-1">Per student</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Students by Screen Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
                <Bar dataKey="minutes" fill="#4ECDC4" name="Screen Time" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Screen Time</TableHead>
                  <TableHead>Activities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student.id}>
                    <TableCell className="font-medium">
                      {student.student.firstName} {student.student.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{student.totalMinutes} min</span>
                        {student.totalMinutes > averageScreenTime * 1.5 && (
                          <Badge variant="outline" className="text-yellow-600">
                            High
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.activityCount}</TableCell>
                    <TableCell>
                      {student.activityCount > 0 ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.lastActivity
                        ? new Date(student.lastActivity).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No students data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

