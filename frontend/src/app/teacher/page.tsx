'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { monitoringAPI, coursesAPI } from '@/src/lib/api';
import { Course, CourseStudentActivity, CourseAnalytics, Game } from '@/src/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { ClassOverview } from '@/src/components/monitoring/ClassOverview';
import { ComparativeAnalytics } from '@/src/components/monitoring/ComparativeAnalytics';
import { CourseList, CourseStudents, CourseAnalyticsDisplay } from '@/src/components/courses';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { BookOpen, Gamepad2 } from 'lucide-react';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Course-related state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseStudents, setCourseStudents] = useState<CourseStudentActivity[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
  const [courseGames, setCourseGames] = useState<Game[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingCourseData, setLoadingCourseData] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasStoredAuth = localStorage.getItem('auth-storage') || localStorage.getItem('user');
      if (hasStoredAuth) {
        const timer = setTimeout(() => {
          setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    // Only check auth after hydration is complete
    if (!isHydrated) return;

    if (!user || user.role !== 'teacher') {
      router.push('/login');
      return;
    }

    loadData();
    loadCourses();
  }, [user, router, isHydrated]);

  // Load course data when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadCourseData(selectedCourse);
    }
  }, [selectedCourse]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await monitoringAPI.getClassActivity();
      setClassData(response.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data);
      // Auto-select first course if available
      if (response.data.length > 0 && !selectedCourse) {
        setSelectedCourse(response.data[0]._id);
      }
    } catch (error: any) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadCourseData = async (courseId: string) => {
    try {
      setLoadingCourseData(true);
      const [studentsRes, analyticsRes, gamesRes] = await Promise.all([
        coursesAPI.getCourseStudents(courseId),
        coursesAPI.getCourseAnalytics(courseId),
        coursesAPI.getCourseGames(courseId),
      ]);
      setCourseStudents(studentsRes.data);
      setCourseAnalytics(analyticsRes.data);
      setCourseGames(gamesRes.data);
    } catch (error: any) {
      console.error('Failed to load course data:', error);
    } finally {
      setLoadingCourseData(false);
    }
  };

  if (!isHydrated || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
            <p className="text-white/80 mt-1">Welcome back, {user.firstName}!</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList className="bg-white">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="overview">Class Overview</TabsTrigger>
            <TabsTrigger value="analytics">Comparative Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            {loadingCourses ? (
              <Card>
                <CardContent className="py-8">
                  <LoadingSpinner message="Loading courses..." />
                </CardContent>
              </Card>
            ) : courses.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">
                    You are not assigned to any courses yet. Please contact your administrator.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Course selector and info */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Select Course
                    </CardTitle>
                    <CardDescription>View students and analytics for your courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedCourseData && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-lg">{selectedCourseData.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCourseData.description || `Course Code: ${selectedCourseData.code}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedCourse && (
                  <>
                    {/* Course Analytics */}
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle>Course Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingCourseData ? (
                          <LoadingSpinner message="Loading analytics..." />
                        ) : courseAnalytics ? (
                          <CourseAnalyticsDisplay analytics={courseAnalytics} />
                        ) : (
                          <p className="text-center text-gray-500 py-4">No analytics data available</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Course Games */}
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gamepad2 className="w-5 h-5" />
                          Games in {selectedCourseData?.name}
                        </CardTitle>
                        <CardDescription>
                          Games available in this course
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingCourseData ? (
                          <LoadingSpinner message="Loading games..." />
                        ) : courseGames.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">No games assigned to this course yet</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courseGames.map((game) => (
                              <div
                                key={game._id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Gamepad2 className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 truncate">{game.title}</h4>
                                    {game.titleArabic && (
                                      <p className="text-sm text-gray-500 truncate">{game.titleArabic}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mt-3 space-y-2">
                                  {game.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{game.description}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                      {game.category}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                      {game.difficulty}
                                    </span>
                                    {game.ageGroups && game.ageGroups.length > 0 && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                        {game.ageGroups[0]}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                    <span className="text-xs text-gray-500">
                                      🏆 {game.pointsReward || 0} pts
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ⏱️ {game.estimatedDuration || 'N/A'} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {courseGames.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>{courseGames.length}</strong> game{courseGames.length > 1 ? 's' : ''} available in this course
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Course Students */}
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle>Students in {selectedCourseData?.name}</CardTitle>
                        <CardDescription>
                          View detailed performance for each student
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingCourseData ? (
                          <LoadingSpinner message="Loading students..." />
                        ) : (
                          <CourseStudents students={courseStudents} />
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            {classData ? (
              <ClassOverview 
                students={classData.students || []} 
                totalStudents={classData.totalStudents || 0} 
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">No class data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {classData?.students ? (
              <ComparativeAnalytics students={classData.students} />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">No analytics data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

