'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { monitoringAPI, alertsAPI, usersAPI } from '@/src/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { ScreenTimeChart } from '@/src/components/monitoring/ScreenTimeChart';
import { ActivityTimeline } from '@/src/components/monitoring/ActivityTimeline';
import { AlertCenter } from '@/src/components/monitoring/AlertCenter';
import { BehaviorPatterns } from '@/src/components/monitoring/BehaviorPatterns';

export default function ParentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [screenTimeData, setScreenTimeData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [loadingChildren, setLoadingChildren] = useState(true);
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

  // Load children list on mount
  useEffect(() => {
    // Only check auth after hydration is complete
    if (!isHydrated) return;

    if (!user || user.role !== 'parent') {
      router.push('/login');
      return;
    }

    loadChildren();
  }, [user, router, isHydrated]);

  // Load child data when selected child or time range changes
  useEffect(() => {
    if (selectedChild) {
      loadChildData();
    } else {
      // Reset data when no child is selected
      setScreenTimeData(null);
      setAlerts([]);
      setActivities([]);
      setPatterns(null);
    }
  }, [selectedChild, timeRange]);

  const loadChildren = async () => {
    try {
      setLoadingChildren(true);
      const childrenRes = await usersAPI.getChildren();
      const childrenList = childrenRes.data || [];
      setChildren(childrenList);
      
      // Auto-select first child if available
      if (childrenList.length > 0 && !selectedChild) {
        setSelectedChild(childrenList[0]._id);
      }
    } catch (error: any) {
      console.error('Failed to load children:', error);
    } finally {
      setLoadingChildren(false);
      setLoading(false);
    }
  };

  const loadChildData = async () => {
    if (!selectedChild) return;

    try {
      setLoading(true);
      const [screenTimeRes, alertsRes, activitiesRes, patternsRes] = await Promise.all([
        monitoringAPI.getScreenTime(selectedChild, { range: timeRange }),
        alertsAPI.getUserAlerts(selectedChild),
        monitoringAPI.getActivityLog(selectedChild, { range: timeRange }),
        monitoringAPI.getBehaviorPatterns(selectedChild),
      ]);
      setScreenTimeData(screenTimeRes.data);
      setAlerts(alertsRes.data || []);
      setActivities(activitiesRes.data || []);
      setPatterns(patternsRes.data);
    } catch (error: any) {
      console.error('Failed to load child data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingChildren || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const selectedChildData = children.find((c) => c._id === selectedChild);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Parent Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        {/* Child Selector */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle>Select Child</CardTitle>
            <CardDescription>Choose a child to view their monitoring data</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full md:w-64 bg-white">
                <SelectValue placeholder="Select a child">
                  {selectedChildData 
                    ? `${selectedChildData.firstName} ${selectedChildData.lastName}` 
                    : 'Select a child'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {children.length === 0 ? (
                    <SelectItem value="none" disabled>No children found</SelectItem>
                ) : (
                  children.map((child) => (
                    <SelectItem key={child._id} value={child._id}>
                      {child.firstName} {child.lastName} {child.ageGroup ? `(${child.ageGroup})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="bg-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="screen-time">Screen Time</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="patterns">Behavior Patterns</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            {selectedChild && (
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value="overview" className="space-y-4">
            {!selectedChild ? (
              <Card className="bg-white">
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Please select a child to view overview data</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {selectedChildData && (
                  <Card className="mb-4 bg-white">
                    <CardHeader>
                      <CardTitle>Child Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-lg font-semibold">
                            {selectedChildData.firstName} {selectedChildData.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Age Group</p>
                          <p className="text-lg font-semibold">{selectedChildData.ageGroup || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Points</p>
                          <p className="text-lg font-semibold">{selectedChildData.points || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Level</p>
                          <p className="text-lg font-semibold">{selectedChildData.level || 1}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Total Screen Time</CardTitle>
                      <CardDescription>For selected time range</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {screenTimeData?.totalMinutes || 0} min
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {screenTimeData?.totalActivities || 0} activities
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Active Alerts</CardTitle>
                      <CardDescription>Unread alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-red-600">
                        {alerts.filter((a) => !a.isRead).length}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {alerts.length} total alerts
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Activities</CardTitle>
                      <CardDescription>Total activities logged</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {activities.length}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        In selected time range
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {screenTimeData?.activityBreakdown && screenTimeData.activityBreakdown.length > 0 && (
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Activity Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {screenTimeData.activityBreakdown.map((activity: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                            <span className="font-semibold">{activity.minutes} min</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="screen-time" className="space-y-4">
            {screenTimeData ? (
              <ScreenTimeChart data={screenTimeData} timeRange={timeRange} />
            ) : (
              <Card className="bg-white">
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Select a child to view screen time data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            {!selectedChild ? (
              <Card className="bg-white">
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Select a child to view activities</p>
                </CardContent>
              </Card>
            ) : activities.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">No activities found for the selected time range</p>
                </CardContent>
              </Card>
            ) : (
              <ActivityTimeline activities={activities} />
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            {patterns ? (
              <BehaviorPatterns patterns={patterns} />
            ) : (
              <Card className="bg-white">
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Select a child to view behavior patterns</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {!selectedChild ? (
              <Card className="bg-white">
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">Select a child to view alerts</p>
                </CardContent>
              </Card>
            ) : (
              <AlertCenter alerts={alerts} onRefresh={loadChildData} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

