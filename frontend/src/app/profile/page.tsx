'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className="mb-6 bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-lg">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            {user.ageGroup && (
              <div>
                <label className="text-sm font-medium text-gray-700">Age Group</label>
                <p className="text-lg">{user.ageGroup}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Points</label>
              <p className="text-lg">{user.points}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Level</label>
              <p className="text-lg">{user.level}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Login Streak</label>
              <p className="text-lg">{user.loginStreak} days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

