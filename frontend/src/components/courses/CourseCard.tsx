'use client';

import { Course } from '@/src/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BookOpen, Users, Gamepad2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface CourseCardProps {
  course: Course;
  onViewDetails?: (courseId: string) => void;
}

export function CourseCard({ course, onViewDetails }: CourseCardProps) {
  const gameCount = Array.isArray(course.gameIds) ? course.gameIds.length : 0;
  const teacherCount = Array.isArray(course.teacherIds) ? course.teacherIds.length : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">{course.name}</CardTitle>
              <CardDescription className="text-sm font-mono">{course.code}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {course.description && (
          <p className="text-sm text-gray-600">{course.description}</p>
        )}
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Gamepad2 className="w-4 h-4" />
            <span>{gameCount} games</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{teacherCount} teachers</span>
          </div>
        </div>

        {course.isActive === false && (
          <div className="text-xs text-red-600 font-medium">
            Course is inactive
          </div>
        )}

        {onViewDetails && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onViewDetails(course._id)}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
