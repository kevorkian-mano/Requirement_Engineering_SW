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
import { Sparkles, Gamepad2, BookOpen, Shield } from 'lucide-react';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      
      setAuth(user, token);
      toast.success('Login successful! 🎉');

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
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  if (redirecting) {
    return <LoadingSpinner message="Taking you to your dashboard..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
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

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-4 border-yellow-300 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4 space-y-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Gamepad2 className="w-10 h-10 text-purple-600" />
            <BookOpen className="w-10 h-10 text-blue-600" />
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 font-semibold">
            Sign in to Play, Learn & Protect
          </CardDescription>
          <div className="flex justify-center gap-1 pt-2">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-sm text-gray-600">Let's continue the adventure!</span>
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-lg" 
              disabled={loading}
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <span>Let's Go!</span>
              )}
            </Button>
            <p className="text-center text-sm text-gray-700 font-medium pt-2">
              Don't have an account?{' '}
              <a href="/register" className="text-purple-600 hover:text-purple-800 font-bold hover:underline">
                Register Now!
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
