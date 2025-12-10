import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from '../schemas/progress.schema';

interface SocialAnomaly {
  type: 'coordinated_bullying' | 'student_isolation' | 'exclusion_pattern';
  severity: 'medium' | 'high' | 'critical';
  description: string;
  targetedStudent: string;
  bullyingStudents: string[];
  metrics: Record<string, any>;
}

interface SocialNetwork {
  studentId: string;
  connections: Array<{
    connectedWith: string;
    interactionCount: number;
    lastInteraction: Date;
  }>;
  socialScore: number;
}

@Injectable()
export class SocialNetworkAnalysisService {
  constructor(
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
  ) {}

  /**
   * Analyzes social patterns to detect coordinated bullying or isolation
   */
  async analyzeSocialPatterns(
    classroomId: string,
    timeWindowDays: number = 14,
  ): Promise<SocialAnomaly[]> {
    const anomalies: SocialAnomaly[] = [];

    const startDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);
    
    // Get all class progress data in time window
    const classProgress = await this.progressModel
      .find({
        createdAt: { $gte: startDate },
      })
      .populate('userId', 'email name');

    if (classProgress.length === 0) return anomalies;

    // Build social network from shared game sessions
    const socialNetworks = this.buildSocialNetworks(classProgress);

    // Detect isolation patterns
    const isolationAnomalies = this.detectIsolation(socialNetworks);
    anomalies.push(...isolationAnomalies);

    // Detect coordinated negative behavior (multiple students targeting one)
    // This would be combined with comment analysis in real implementation
    const coordinatedAnomalies = this.detectCoordinatedBullying(
      classProgress,
    );
    anomalies.push(...coordinatedAnomalies);

    return anomalies;
  }

  /**
   * Builds social network from shared game sessions
   */
  private buildSocialNetworks(
    progressData: ProgressDocument[],
  ): Map<string, SocialNetwork> {
    const networks = new Map<string, SocialNetwork>();

    // Group by game sessions
    const gameSessions = new Map<string, Set<string>>();

    for (const progress of progressData) {
      const key = `${progress.gameId}_${Math.floor((progress as any).createdAt.getTime() / (5 * 60 * 1000))}`; // 5-min windows
      if (!gameSessions.has(key)) {
        gameSessions.set(key, new Set());
      }
      const userId = progress.userId?.toString();
      if (userId) {
        gameSessions.get(key).add(userId);
      }
    }

    // Build connection graph
    const connections = new Map<string, Map<string, number>>();

    for (const [_, playerIds] of gameSessions) {
      const players = Array.from(playerIds);
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          const player1 = players[i];
          const player2 = players[j];

          if (!connections.has(player1)) {
            connections.set(player1, new Map());
          }
          const count = connections.get(player1).get(player2) || 0;
          connections.get(player1).set(player2, count + 1);

          if (!connections.has(player2)) {
            connections.set(player2, new Map());
          }
          const count2 = connections.get(player2).get(player1) || 0;
          connections.get(player2).set(player1, count2 + 1);
        }
      }
    }

    // Create social network objects
    for (const [studentId, connectedPlayers] of connections) {
      const connectedWithList = Array.from(connectedPlayers).map(
        ([connectedWith, count]) => ({
          connectedWith,
          interactionCount: count,
          lastInteraction: new Date(), // Would get actual date in real implementation
        }),
      );

      const socialScore = connectedWithList.reduce(
        (sum, c) => sum + c.interactionCount,
        0,
      );

      networks.set(studentId, {
        studentId,
        connections: connectedWithList,
        socialScore,
      });
    }

    return networks;
  }

  /**
   * Detects student isolation patterns
   */
  private detectIsolation(networks: Map<string, SocialNetwork>): SocialAnomaly[] {
    const anomalies: SocialAnomaly[] = [];

    // Get average social score
    const scores = Array.from(networks.values()).map((n) => n.socialScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(
      scores.reduce((sq, n) => sq + Math.pow(n - avgScore, 2), 0) / scores.length,
    );

    // Students with unusually low social scores
    for (const [studentId, network] of networks) {
      if (network.socialScore < avgScore - 2 * stdDev) {
        anomalies.push({
          type: 'student_isolation',
          severity: 'high',
          description: `Student ${studentId} is significantly isolated (plays with very few peers)`,
          targetedStudent: studentId,
          bullyingStudents: [],
          metrics: {
            socialScore: network.socialScore,
            averageSocialScore: avgScore.toFixed(1),
            uniqueConnections: network.connections.length,
            isolation: 'extreme',
          },
        });
      }
    }

    return anomalies;
  }

  /**
   * Detects coordinated bullying (multiple students targeting one)
   */
  private detectCoordinatedBullying(
    progressData: ProgressDocument[],
  ): SocialAnomaly[] {
    const anomalies: SocialAnomaly[] = [];

    // Track negative interactions per student pair
    // This is a simplified version - in real system would integrate with message analysis
    const targetCounts = new Map<string, Map<string, number>>();

    for (const progress of progressData) {
      // In real implementation, this would be tied to negative comments
      // For now, just track game participation patterns
      const userId = progress.userId?.toString();
      if (userId) {
        if (!targetCounts.has(userId)) {
          targetCounts.set(userId, new Map());
        }
      }
    }

    // Detect when multiple students consistently interact negatively with one student
    // This requires message/comment data integration which would be added

    return anomalies;
  }

  /**
   * Detects exclusion patterns (group excludes specific student)
   */
  async detectExclusion(
    classroomId: string,
    studentId: string,
    timeWindowDays: number = 7,
  ): Promise<boolean> {
    const startDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

    // Get all group games in time window
    const groupGames = await this.progressModel
      .find({
        createdAt: { $gte: startDate },
        gameType: 'group',
      })
      .lean();

    if (groupGames.length === 0) return false;

    // Count how many group games the student played vs. peers
    const studentGroupGames = groupGames.filter(
      (g) => g.userId?.toString() === studentId,
    ).length;

    // Get peer play counts
    const peerCounts = new Map<string, number>();
    for (const game of groupGames) {
      const userId = game.userId?.toString();
      if (userId !== studentId) {
        peerCounts.set(userId, (peerCounts.get(userId) || 0) + 1);
      }
    }

    const avgPeerGames =
      Array.from(peerCounts.values()).reduce((a, b) => a + b, 0) /
      peerCounts.size;

    // Student plays significantly fewer group games than peers
    return studentGroupGames < avgPeerGames * 0.3; // Less than 30% of average
  }

  /**
   * Gets social network analysis for a specific student
   */
  async getStudentSocialProfile(
    studentId: string,
    timeWindowDays: number = 14,
  ): Promise<{
    connections: number;
    frequentPartners: Array<{ partnerId: string; sharedGames: number }>;
    socialHealth: 'healthy' | 'isolated' | 'at_risk';
  }> {
    const startDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

    const studentProgress = await this.progressModel
      .find({
        userId: new Types.ObjectId(studentId),
        createdAt: { $gte: startDate },
      })
      .populate('userId');

    if (studentProgress.length === 0) {
      return {
        connections: 0,
        frequentPartners: [],
        socialHealth: 'isolated',
      };
    }

    // Would build from actual classroom session data
    // For now, return placeholder based on game participation
    const uniqueGames = new Set(
      studentProgress.map((p) => p.gameId?.toString()),
    );

    return {
      connections: uniqueGames.size,
      frequentPartners: [],
      socialHealth: uniqueGames.size < 3 ? 'isolated' : 'healthy',
    };
  }

  /**
   * Analyzes trend of specific student exclusion
   */
  async analyzeExclusionTrend(
    studentId: string,
    timeWindowDays: number = 30,
  ): Promise<{
    isIncreasing: boolean;
    exclusionScore: number;
    timeline: Array<{ day: number; exclusionLevel: number }>;
  }> {
    const timeline: Array<{ day: number; exclusionLevel: number }> = [];
    let previousScore = 0;

    for (let day = timeWindowDays; day >= 0; day--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - day);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const dayProgress = await this.progressModel
        .countDocuments({
          userId: new Types.ObjectId(studentId),
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        });

      const exclusionLevel = dayProgress === 0 ? 100 : Math.max(0, 100 - dayProgress * 10);
      timeline.push({ day, exclusionLevel });
      previousScore = exclusionLevel;
    }

    // Calculate trend
    const recentScore = timeline.slice(-3).reduce((a, b) => a + b.exclusionLevel, 0) / 3;
    const oldScore = timeline.slice(0, 3).reduce((a, b) => a + b.exclusionLevel, 0) / 3;

    return {
      isIncreasing: recentScore > oldScore,
      exclusionScore: recentScore,
      timeline,
    };
  }
}
