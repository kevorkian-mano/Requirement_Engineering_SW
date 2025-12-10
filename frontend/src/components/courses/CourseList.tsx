'use client';

import { Course } from '@/src/types';
import { CourseCard } from './CourseCard';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';

interface CourseListProps {
  courses: Course[];
  loading?: boolean;
  onViewDetails?: (courseId: string) => void;
  emptyMessage?: string;
}

export function CourseList({ 
  courses, 
  loading = false, 
  onViewDetails,
  emptyMessage = 'No courses found'
}: CourseListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner message="Loading courses..." />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course._id}
          course={course}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
