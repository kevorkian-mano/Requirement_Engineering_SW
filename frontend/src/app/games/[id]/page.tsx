'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { authAPI, gamesAPI, progressAPI, monitoringAPI } from '@/src/lib/api';
import { Game } from '@/src/types';
import * as Phaser from 'phaser';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { AlgebraExplorerGame } from '@/src/features/games/AlgebraExplorerGame';
import { VocabularyChampionGame } from '@/src/features/games/VocabularyChampionGame';
import { GameDeveloperGame } from '@/src/features/games/GameDeveloperGame';
import { PyramidBuilderGame } from '@/src/features/games/PyramidBuilderGame';
import { NumberAdventureGame } from '@/src/features/games/NumberAdventureGame';
import { ShapeExplorerGame } from '@/src/features/games/ShapeExplorerGame';
import { AlphabetJourneyGame } from '@/src/features/games/AlphabetJourneyGame';
import { MultiplicationMasterGame } from '@/src/features/games/MultiplicationMasterGame';
import { ForceMotionLabGame } from '@/src/features/games/ForceMotionLabGame';
import { StoryBuilderGame } from '@/src/features/games/StoryBuilderGame';
import { PharaohQuestGame } from '@/src/features/games/PharaohQuestGame';
import { JavaBasicsGame } from '@/src/features/games/JavaBasicsGame';
import { LogicGatesMasterGame } from '@/src/features/games/LogicGatesMasterGame';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;
  const { user, updateUser } = useAuthStore();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameInitializing, setGameInitializing] = useState(false);
  const gameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Only redirect if explicitly not authenticated
    const checkAuth = async () => {
      // Check if user exists or allow page to load if already on the page
      if (!user) {
        // Add a small delay to check if user data is loading
        const timer = setTimeout(() => {
          if (!user) {
            router.push('/login');
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    };

    checkAuth();
    loadGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, [gameId, user, router]);

  const loadGame = async () => {
    try {
      const response = await gamesAPI.getById(gameId);
      const gameData = response.data;
      
      // Check if this is a standalone game and redirect
      const title = gameData.title.toLowerCase();
      if (title.includes('pattern play') || title.includes('لعبة الأنماط')) {
        router.replace('/games/pattern-play');
        return;
      } else if (title.includes('memory match') || title.includes('مطابقة الذاكرة')) {
        router.replace('/games/memory-match');
        return;
      }
      
      setGame(gameData);
    } catch (error: any) {
      console.error('Failed to load game:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameScene = (gameTitle: string): any => {
    const title = gameTitle.toLowerCase();
    
    // Ages 9-12 games
    if (title.includes('algebra') || title.includes('مستكشف الجبر')) {
      return AlgebraExplorerGame;
    } else if (title.includes('vocabulary') || title.includes('بطل المفردات')) {
      return VocabularyChampionGame;
    } else if (title.includes('game developer') || title.includes('مطور الألعاب')) {
      return GameDeveloperGame;
    } else if (title.includes('pyramid') || title.includes('باني الأهرامات')) {
      return PyramidBuilderGame;
    } else if (title.includes('java basics') || title.includes('رحلة جافا')) {
      return JavaBasicsGame;
    } else if (title.includes('logic gates') || title.includes('بوابات المنطق')) {
      return LogicGatesMasterGame;
    }
    // Ages 3-5 games
    else if (title.includes('number adventure') || title.includes('مغامرة الأرقام')) {
      return NumberAdventureGame;
    } else if (title.includes('shape explorer') || title.includes('مستكشف الأشكال')) {
      return ShapeExplorerGame;
    } else if (title.includes('alphabet journey') || title.includes('رحلة الأبجدية')) {
      return AlphabetJourneyGame;
    }
    // Ages 6-8 games
    else if (title.includes('multiplication master') || title.includes('سيد الضرب')) {
      return MultiplicationMasterGame;
    } else if (title.includes('force & motion lab') || title.includes('force and motion') || title.includes('مختبر القوة والحركة')) {
      return ForceMotionLabGame;
    } else if (title.includes('story builder') || title.includes('باني القصص')) {
      return StoryBuilderGame;
    } else if (title.includes('pharaoh quest') || title.includes('رحلة الفرعون')) {
      return PharaohQuestGame;
    }
    
    // Default simple game for others
    return null;
  };

  const startGame = () => {
    if (!game) {
      console.error('Game not loaded');
      return;
    }

    // Set loading state
    setGameInitializing(true);
    setGameStarted(true);
    startTimeRef.current = Date.now();
    setScore(0); // Reset score

    // Wait for container to be rendered in DOM
    setTimeout(() => {
      if (!containerRef.current) {
        console.error('Container not available');
        setGameStarted(false);
        setGameInitializing(false);
        return;
      }

      // Ensure container has proper dimensions
      containerRef.current.style.width = '800px';
      containerRef.current.style.height = '600px';
      containerRef.current.style.margin = '0 auto';

      const GameScene = getGameScene(game.title);

      if (GameScene) {
        try {
          // Use the actual game implementation
          const config: any = {
            type: (Phaser as any).AUTO,
            width: 800,
            height: 600,
            parent: containerRef.current,
            physics: {
              default: 'arcade',
              arcade: {
                gravity: { y: 300 },
                debug: false,
              },
            },
            scene: GameScene,
            scale: {
              mode: (Phaser as any).Scale.FIT,
              autoCenter: (Phaser as any).Scale.CENTER_BOTH,
            },
          };

          // Create game instance
          gameRef.current = new (Phaser as any).Game(config);
          
          // Pass score update callback after scene is created
          setTimeout(() => {
            try {
              const scenes = gameRef.current?.scene?.getScenes(true);
              if (scenes && scenes.length > 0) {
                const scene = scenes[0];
                const scoreCallback = (newScore: number) => {
                  setScore(newScore);
                };
                
                // Set callback in scene data (primary method)
                if (scene && scene.data) {
                  scene.data.set('onScoreUpdate', scoreCallback);
                }
                
                // Also try init if available (backup method)
                if (scene && typeof scene.init === 'function') {
                  scene.init({
                    onScoreUpdate: scoreCallback,
                  });
                }
              }
              setGameInitializing(false);
            } catch (e) {
              console.error('Error passing callback to scene:', e);
              setGameInitializing(false);
            }
          }, 500);
        } catch (error) {
          console.error('Error creating Phaser game:', error);
          setGameStarted(false);
          setGameInitializing(false);
        }
      } else {
        // Fallback simple game for games without specific implementation
        try {
          const config: any = {
            type: (Phaser as any).AUTO,
            width: 800,
            height: 600,
            parent: containerRef.current,
            physics: {
              default: 'arcade',
              arcade: {
                gravity: { y: 300 },
                debug: false,
              },
            },
            scene: {
              create: function (this: any) {
                const text = this.add.text(400, 300, `Playing: ${game.title}`, {
                  fontSize: '32px',
                  color: '#ffffff',
                });
                text.setOrigin(0.5);

                this.input.on('pointerdown', () => {
                  setScore((prev) => prev + 10);
                });
              },
            },
          };

          gameRef.current = new (Phaser as any).Game(config);
          setGameInitializing(false);
        } catch (error) {
          console.error('Error creating fallback game:', error);
          setGameStarted(false);
          setGameInitializing(false);
        }
      }
    }, 100);
  };

  const endGame = async () => {
    if (!game || !user) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    // Calculate points: base points from game + score-based bonus
    const basePoints = game.pointsReward || 50;
    const scoreBonus = Math.floor(score / 10); // 1 point per 10 score
    const pointsEarned = basePoints + scoreBonus;
    
    // Completion logic: score threshold based on game difficulty
    const completionThreshold = game.difficulty === 'easy' ? 30 : game.difficulty === 'medium' ? 50 : 70;
    const isCompleted = score >= completionThreshold;
    const completionPercentage = Math.min(100, (score / completionThreshold) * 100);

    try {
      await progressAPI.save({
        gameId: game._id,
        score,
        pointsEarned,
        timeSpent,
        isCompleted,
        completionPercentage,
      });

      await monitoringAPI.logActivity({
        type: 'game_played',
        duration: timeSpent,
        gameId: game._id,
      });

      if (gameRef.current) {
        gameRef.current.destroy(true);
      }

      // Refresh user points from backend; fallback to local increment
      try {
        const profile = await authAPI.getProfile();
        const serverPoints = profile.data?.points;
        if (typeof serverPoints === 'number') {
          updateUser({ points: serverPoints });
        } else {
          updateUser({ points: (user?.points || 0) + pointsEarned });
        }
      } catch (e) {
        console.warn('[Game Page] Failed to refresh profile, updating points locally.');
        updateUser({ points: (user?.points || 0) + pointsEarned });
      }

      // Show completion message briefly before redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to save progress:', error);
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    }
  };

  if (loading || !game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            ← Back to Dashboard
          </Button>
          {gameStarted && (
            <div className="flex items-center gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-2xl font-bold">{score}</p>
                </CardContent>
              </Card>
              <Button onClick={endGame} variant="destructive">
                End Game
              </Button>
            </div>
          )}
        </div>

        {!gameStarted ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-3xl font-bold mb-4">{game.title}</h1>
              <p className="text-gray-600 mb-6">{game.description}</p>
              <p className="text-sm text-gray-500 mb-6">
                Points Reward: {game.pointsReward} | Difficulty: {game.difficulty}
              </p>
              <Button onClick={startGame} size="lg">
                Start Game
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {gameInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg z-10">
                <div className="text-white text-xl">Loading game...</div>
              </div>
            )}
            <div 
              ref={containerRef} 
              className="bg-black rounded-lg overflow-hidden"
              style={{ width: '800px', height: '600px', margin: '0 auto' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

