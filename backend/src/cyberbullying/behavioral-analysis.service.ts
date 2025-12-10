import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BehavioralAnomaly, BehavioralAnomalyDocument } from '../schemas/behavioral-anomaly.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { User, UserDocument } from '../schemas/user.schema';

interface DistressIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  metrics: Record<string, any>;
}

@Injectable()
export class BehavioralAnalysisService {
  constructor(
    @InjectModel(BehavioralAnomaly.name)
    private behavioralAnomalyModel: Model<BehavioralAnomalyDocument>,
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  /**
   * Analyzes student behavior for distress signals
   */
  async analyzeBehavioralPatterns(studentId: string): Promise<DistressIndicator[]> {
    const distressIndicators: DistressIndicator[] = [];

    // Get last 2 weeks of progress data
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const progressData = await this.progressModel
      .find({
        userId: studentId,
        createdAt: { $gte: twoWeeksAgo },
      })
      .sort({ createdAt: -1 });

    if (progressData.length < 3) {
      // Not enough data for analysis
      return distressIndicators;
    }

    // Analyze score patterns
    const scoreDropIndicator = this.analyzeScoreDrop(progressData);
    if (scoreDropIndicator) distressIndicators.push(scoreDropIndicator);

    // Analyze game avoidance patterns
    const avoidanceIndicator = this.analyzeGameAvoidance(progressData);
    if (avoidanceIndicator) distressIndicators.push(avoidanceIndicator);

    // Analyze play frequency
    const frequencyIndicator = this.analyzePlayFrequency(progressData);
    if (frequencyIndicator) distressIndicators.push(frequencyIndicator);

    // Analyze hint usage patterns
    const hintIndicator = this.analyzeHintPatterns(progressData);
    if (hintIndicator) distressIndicators.push(hintIndicator);

    // Analyze time spent patterns
    const timeIndicator = this.analyzeTimeSpentPatterns(progressData);
    if (timeIndicator) distressIndicators.push(timeIndicator);

    return distressIndicators;
  }

  /**
   * Detects sudden performance drop
   */
  private analyzeScoreDrop(
    progressData: ProgressDocument[],
  ): DistressIndicator | null {
    if (progressData.length < 5) return null;

    const recentScores = progressData.slice(0, 5).map((p) => p.score || 0);
    const olderScores = progressData.slice(5, 10).map((p) => p.score || 0);

    const recentAvg =
      recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg =
      olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    const dropPercentage = ((olderAvg - recentAvg) / olderAvg) * 100;

    if (dropPercentage > 20) {
      // More than 20% drop is concerning
      return {
        type: 'sudden_performance_drop',
        severity: dropPercentage > 40 ? 'high' : 'medium',
        description: `Student's game scores dropped ${dropPercentage.toFixed(1)}% compared to previous performance`,
        metrics: {
          previousAverageScore: olderAvg.toFixed(1),
          currentAverageScore: recentAvg.toFixed(1),
          changePercentage: dropPercentage.toFixed(1),
        },
      };
    }

    return null;
  }

  /**
   * Detects game avoidance (avoiding games usually played)
   */
  private analyzeGameAvoidance(
    progressData: ProgressDocument[],
  ): DistressIndicator | null {
    if (progressData.length < 10) return null;

    const recentGames = new Set(
      progressData.slice(0, 5).map((p) => p.gameId?.toString()),
    );
    const usualGames = new Set(
      progressData.slice(5, 15).map((p) => p.gameId?.toString()),
    );

    const gamesAvoided = Array.from(usualGames).filter(
      (game) => !recentGames.has(game),
    );
    const avoidanceRate = gamesAvoided.length / usualGames.size;

    if (avoidanceRate > 0.6) {
      // Avoiding more than 60% of usual games
      return {
        type: 'game_avoidance',
        severity: 'medium',
        description: `Student is avoiding ${(avoidanceRate * 100).toFixed(0)}% of games usually played`,
        metrics: {
          gamesAvoided: gamesAvoided.length,
          totalUsualGames: usualGames.size,
          avoidancePercentage: (avoidanceRate * 100).toFixed(1),
        },
      };
    }

    return null;
  }

  /**
   * Detects excessive or reduced play frequency
   */
  private analyzePlayFrequency(
    progressData: ProgressDocument[],
  ): DistressIndicator | null {
    if (progressData.length < 5) return null;

    const dates = progressData.map((p) => new Date((p as any).createdAt).toDateString());
    const uniqueDays = new Set(dates).size;
    const totalDays = Math.ceil(
      ((progressData[0] as any).createdAt.getTime() -
        (progressData[progressData.length - 1] as any).createdAt.getTime()) /
        (24 * 60 * 60 * 1000),
    );

    const activeDayRate = uniqueDays / totalDays;

    if (activeDayRate < 0.2) {
      // Playing less than 20% of days (very low engagement)
      return {
        type: 'social_withdrawal',
        severity: 'high',
        description: `Student has significantly reduced play frequency (active ${(activeDayRate * 100).toFixed(0)}% of days)`,
        metrics: {
          activeDays: uniqueDays,
          totalDays: totalDays,
          daysSinceLastPlay: this.daysSinceLastActivity((progressData[0] as any).createdAt),
        },
      };
    }

    if (activeDayRate > 0.9 && progressData.length > 15) {
      // Playing almost every day with high volume (avoidance coping)
      return {
        type: 'excessive_play',
        severity: 'medium',
        description: `Student is playing excessively (${(activeDayRate * 100).toFixed(0)}% of days) which may indicate avoidance coping`,
        metrics: {
          activeDays: uniqueDays,
          totalDays: totalDays,
          recentGameCount: progressData.slice(0, 5).length,
        },
      };
    }

    return null;
  }

  /**
   * Detects changes in hint usage patterns
   */
  private analyzeHintPatterns(
    progressData: ProgressDocument[],
  ): DistressIndicator | null {
    if (progressData.length < 5) return null;

    const recentHintUsage = progressData
      .slice(0, 5)
      .filter((p) => p.gameData?.hintsUsed > 0).length;
    const olderHintUsage = progressData
      .slice(5, 10)
      .filter((p) => p.gameData?.hintsUsed > 0).length;

    const recentRate = recentHintUsage / 5;
    const olderRate = olderHintUsage / Math.min(5, progressData.length - 5);

    // Sudden stop using hints (loss of confidence)
    if (olderRate > 0.6 && recentRate === 0) {
      return {
        type: 'hint_pattern_change',
        severity: 'medium',
        description: `Student suddenly stopped using hints after previously relying on them (confidence indicator)`,
        metrics: {
          previousHintUsageRate: (olderRate * 100).toFixed(0),
          currentHintUsageRate: '0',
          daysSinceLastHintUse: this.daysSinceLastHintUse(
            progressData.slice(0, 10),
          ),
        },
      };
    }

    return null;
  }

  /**
   * Detects unusual time spent patterns
   */
  private analyzeTimeSpentPatterns(
    progressData: ProgressDocument[],
  ): DistressIndicator | null {
    if (progressData.length < 5) return null;

    const recentTimes = progressData
      .slice(0, 5)
      .map((p) => p.gameData?.timeTakenSeconds || p.timeSpent || 0);
    const olderTimes = progressData
      .slice(5, 10)
      .map((p) => p.gameData?.timeTakenSeconds || p.timeSpent || 0);

    const recentAvgTime =
      recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
    const olderAvgTime =
      olderTimes.reduce((a, b) => a + b, 0) / olderTimes.length;

    const timeIncreasePercentage =
      ((recentAvgTime - olderAvgTime) / olderAvgTime) * 100;

    if (timeIncreasePercentage > 100) {
      // Spending double the time (possible anxiety/overthinking)
      return {
        type: 'behavioral_anomaly',
        severity: 'medium',
        description: `Student is spending significantly more time on games (${timeIncreasePercentage.toFixed(0)}% increase)`,
        metrics: {
          previousAverageTimeSeconds: Math.round(olderAvgTime),
          currentAverageTimeSeconds: Math.round(recentAvgTime),
          increasePercentage: timeIncreasePercentage.toFixed(1),
        },
      };
    }

    return null;
  }

  /**
   * Helper: Calculate days since last activity
   */
  private daysSinceLastActivity(lastActivityDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Calculate days since last hint use
   */
  private daysSinceLastHintUse(progressData: ProgressDocument[]): number {
    const lastHintUse = progressData.find((p) => p.gameData?.hintsUsed > 0);
    if (!lastHintUse) return Math.ceil((new Date().getDate() - new Date().getDate()) / 24);
    return this.daysSinceLastActivity((lastHintUse as any).createdAt);
  }

  /**
   * Records a behavioral anomaly in the database
   */
  async recordAnomaly(
    studentId: string,
    anomaly: DistressIndicator,
  ): Promise<BehavioralAnomalyDocument> {
    return this.behavioralAnomalyModel.create({
      studentId,
      anomalyType: anomaly.type,
      severity: anomaly.severity,
      description: anomaly.description,
      metrics: anomaly.metrics,
      teacherNotified: false,
      status: 'new',
    });
  }

  /**
   * Get all anomalies for a student
   */
  async getStudentAnomalies(studentId: string): Promise<BehavioralAnomalyDocument[]> {
    return this.behavioralAnomalyModel
      .find({ studentId })
      .sort({ createdAt: -1 });
  }
}
