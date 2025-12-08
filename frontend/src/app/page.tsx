'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/src/components/ui/button';
import { Gamepad2, BookOpen, Shield, Star, Sparkles, Rocket, Heart } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showContent, setShowContent] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    // Check if auth data exists in localStorage
    if (typeof window !== 'undefined') {
      const hasStoredAuth = localStorage.getItem('auth-storage') || localStorage.getItem('user');
      if (hasStoredAuth) {
        // Give Zustand time to hydrate
        const timer = setTimeout(() => {
          setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // No stored auth, we can proceed immediately
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    // Only proceed after hydration is complete
    if (!isHydrated) return;

    if (user) {
      // User is authenticated, redirect to their dashboard
      if (user.role === 'child') {
        router.push('/dashboard');
      } else if (user.role === 'parent') {
        router.push('/parent');
      } else if (user.role === 'teacher') {
        router.push('/teacher');
      }
    } else {
      // User is not authenticated, show welcome content (don't redirect)
      setShowContent(true);
    }
  }, [user, router, isHydrated]);

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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .float { animation: float 3s ease-in-out infinite; }
        .float-delay-1 { animation: float 3s ease-in-out infinite 0.5s; }
        .float-delay-2 { animation: float 3s ease-in-out infinite 1s; }
        .float-delay-3 { animation: float 3s ease-in-out infinite 1.5s; }
        .spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>

      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-7xl float">🎮</div>
        <div className="absolute top-40 right-20 text-6xl float-delay-1">📚</div>
        <div className="absolute bottom-32 left-20 text-8xl float-delay-2">⭐</div>
        <div className="absolute bottom-20 right-10 text-7xl float-delay-3">🎨</div>
        <div className="absolute top-1/2 left-1/4 text-6xl float">🚀</div>
        <div className="absolute top-1/3 right-1/3 text-7xl float-delay-1">🌈</div>
        <div className="absolute top-1/4 left-1/2 text-5xl float-delay-2">🎯</div>
        <div className="absolute bottom-1/3 right-1/4 text-6xl float-delay-3">💡</div>
        <div className="absolute top-1/2 right-1/4 text-5xl float">🎪</div>
      </div>

      {showContent && !user && (
        <div className="text-center relative z-10 animate-fade-in">
          <div className="mb-8 flex justify-center items-center gap-4">
            <Gamepad2 className="w-16 h-16 text-yellow-300 float" />
            <BookOpen className="w-16 h-16 text-blue-300 float-delay-1" />
            <Shield className="w-16 h-16 text-green-300 float-delay-2" />
            <Star className="w-16 h-16 text-pink-300 float-delay-3" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 via-purple-300 via-blue-300 to-green-300 bg-clip-text text-transparent drop-shadow-2xl">
            Play, Learn & Protect
          </h1>
          
          <p className="text-2xl md:text-3xl text-white font-semibold mb-4 drop-shadow-lg">
            Where Learning Meets Fun! 🎉
          </p>
          
          <div className="flex justify-center items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            <p className="text-lg text-white/90 font-medium">
              Your adventure starts here!
            </p>
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.push('/login')}
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200 rounded-full"
            >
              <span className="flex items-center gap-2">
                🚀 Get Started
              </span>
            </Button>
            <Button
              onClick={() => router.push('/register')}
              variant="outline"
              className="h-14 px-8 text-lg font-bold border-4 border-white text-white hover:bg-white hover:text-purple-600 shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200 rounded-full bg-transparent"
            >
              <span className="flex items-center gap-2">
                ✨ Join Now
              </span>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
              <div className="text-4xl mb-2">🎮</div>
              <p className="text-white font-semibold">Fun Games</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-white font-semibold">Learn & Grow</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
              <div className="text-4xl mb-2">🛡️</div>
              <p className="text-white font-semibold">Stay Safe</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-white font-semibold">Earn Rewards</p>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="text-center relative z-10">
          <div className="mb-6 flex justify-center items-center gap-4">
            <Rocket className="w-12 h-12 text-yellow-300 animate-bounce" />
            <Heart className="w-12 h-12 text-pink-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <Star className="w-12 h-12 text-yellow-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
            Welcome Back! 👋
          </h1>
          <p className="text-xl text-white font-semibold">
            Taking you to your dashboard...
          </p>
          <div className="mt-6">
            <div className="inline-block animate-spin text-4xl">⏳</div>
          </div>
        </div>
      )}
    </div>
  );
}
