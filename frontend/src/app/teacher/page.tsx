'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { monitoringAPI } from '@/src/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { ClassOverview } from '@/src/components/monitoring/ClassOverview';
import { ComparativeAnalytics } from '@/src/components/monitoring/ComparativeAnalytics';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

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
  }, [user, router, isHydrated]);

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

  if (!isHydrated || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white">
            <TabsTrigger value="overview">Class Overview</TabsTrigger>
            <TabsTrigger value="analytics">Comparative Analytics</TabsTrigger>
          </TabsList>

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

