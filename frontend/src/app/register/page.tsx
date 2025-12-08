'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/authStore';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { UserRole, AgeGroup } from '@/src/types';
import { Sparkles, Gamepad2, BookOpen, Shield, Star, Heart } from 'lucide-react';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'child' as UserRole,
    age: '',
    dateOfBirth: '',
    parentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Calculate age group from age
  const calculateAgeGroup = (age: number): AgeGroup | null => {
    if (age >= 3 && age <= 5) return AgeGroup.AGES_3_5;
    if (age >= 6 && age <= 8) return AgeGroup.AGES_6_8;
    if (age >= 9 && age <= 12) return AgeGroup.AGES_9_12;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (formData.role === 'child') {
      if (!formData.age) {
        toast.error('Please enter your age');
        return;
      }
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 3 || ageNum > 12) {
        toast.error('Age must be between 3 and 12 years');
        return;
      }
      const ageGroup = calculateAgeGroup(ageNum);
      if (!ageGroup) {
        toast.error('Age must be between 3 and 12 years');
        return;
      }
    }
    
    setLoading(true);

    try {
      // Prepare data - remove empty strings and convert to undefined
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };
      
      // Calculate and include age group for children
      if (formData.role === 'child' && formData.age) {
        const ageNum = parseInt(formData.age);
        const ageGroup = calculateAgeGroup(ageNum);
        if (ageGroup) {
          registerData.age = ageNum;
          registerData.ageGroup = ageGroup;
        }
      }
      
      if (formData.dateOfBirth) {
        registerData.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.parentId) {
        registerData.parentId = formData.parentId;
      }
      
      const response = await authAPI.register(registerData);
      const { user, token } = response.data;
      
      setAuth(user, token);
      toast.success('Registration successful! 🎉');

      // Show loading spinner during redirect
      setRedirecting(true);

      // Small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect based on role
      if (user.role === 'child') {
        router.push('/dashboard');
      } else if (user.role === 'parent') {
        router.push('/parent');
      } else if (user.role === 'teacher') {
        router.push('/teacher');
      }
    } catch (error: any) {
      // Better error handling
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed';
      toast.error(errorMessage);
      console.error('Registration error:', error.response?.data || error);
      setLoading(false);
    }
  };


  if (redirecting) {
    return <LoadingSpinner message="Setting up your account..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #ffeaa7 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
      }}
    >

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-4 border-yellow-300 bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-4 space-y-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b-2 border-purple-200">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Gamepad2 className="w-10 h-10 text-purple-600" />
            <BookOpen className="w-10 h-10 text-blue-600" />
            <Shield className="w-10 h-10 text-green-600" />
            <Star className="w-10 h-10 text-yellow-500" />
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
            Join the Adventure!
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 font-semibold">
            Create your account and start learning!
          </CardDescription>
          <div className="flex justify-center gap-1 pt-2">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-sm text-gray-600">Let's begin your journey!</span>
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-base font-semibold text-gray-700">
                I am a
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="child" className="text-base">Child</SelectItem>
                  <SelectItem value="parent" className="text-base">Parent</SelectItem>
                  <SelectItem value="teacher" className="text-base">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base font-semibold text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                  placeholder="Your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base font-semibold text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                  placeholder="Your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                placeholder="At least 6 characters"
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            {formData.role === 'child' && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-purple-700">Child Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-base font-semibold text-gray-700">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="3"
                    max="12"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter your age (3-12)"
                    required
                    className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                  />
                  {formData.age && (
                    <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
                      ✅ Age group: {calculateAgeGroup(parseInt(formData.age)) || 'Invalid age'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-base font-semibold text-gray-700">
                    Date of Birth (optional)
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentId" className="text-base font-semibold text-gray-700">
                    Parent ID (optional)
                  </Label>
                  <Input
                    id="parentId"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    placeholder="Link to parent account"
                    className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-lg" 
              disabled={loading}
            >
              {loading ? (
                <span>Creating your account...</span>
              ) : (
                <span>Create My Account!</span>
              )}
            </Button>
            <p className="text-center text-sm text-gray-700 font-medium pt-2">
              Already have an account?{' '}
              <a href="/login" className="text-purple-600 hover:text-purple-800 font-bold hover:underline">
                Login Here!
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
