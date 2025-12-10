import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { SaveProgressDto } from './dto/save-progress.dto';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { LevelProgressionService } from '../levels/level-progression.service';
import { Achievement, AchievementDocument, UserAchievement, UserAchievementDocument } from '../schemas/achievement.schema';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
    @InjectModel(UserAchievement.name) private userAchievementModel: Model<UserAchievementDocument>,
    private usersService: UsersService,
    private gamesService: GamesService,
    private levelProgressionService: LevelProgressionService,
  ) {}

  async saveProgress(userId: string, saveProgressDto: SaveProgressDto): Promise<ProgressDocument> {
    const { gameId, pointsEarned, ...progressData } = saveProgressDto;

    // Update or create progress
    let progress = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
      gameId: new Types.ObjectId(gameId),
    });

    if (progress) {
      Object.assign(progress, progressData);
      progress.lastPlayedAt = new Date();
      progress.playCount += 1;
    } else {
      progress = new this.progressModel({
        userId: new Types.ObjectId(userId),
        gameId: new Types.ObjectId(gameId),
        ...progressData,
        lastPlayedAt: new Date(),
        playCount: 1,
      });
    }

    await progress.save();

    // Update user points
    if (pointsEarned > 0) {
      await this.usersService.updatePoints(userId, pointsEarned);
    }

    // Award XP for completed games and bonuses
    if (saveProgressDto.isCompleted) {
      const game = await this.gamesService.findOne(gameId);

      const baseXP = this.levelProgressionService.calculateGameCompletionXP(game.difficulty);
      const highScoreBonus = this.levelProgressionService.calculateHighScoreBonusXP(
        saveProgressDto.score,
      );
      const noHintsBonus = this.levelProgressionService.calculateNoHintsBonusXP(
        (saveProgressDto.gameData as any)?.hintsUsed ?? 0,
      );
      const speedBonus = this.levelProgressionService.calculateSpeedBonusXP(
        saveProgressDto.timeSpent,
      );
      const consecutiveBonus = await this.levelProgressionService.awardConsecutiveDaysBonus(userId);

      const totalXPAwarded =
        baseXP + highScoreBonus + noHintsBonus + speedBonus + consecutiveBonus;

      if (totalXPAwarded > 0) {
        await this.levelProgressionService.awardXP(
          userId,
          totalXPAwarded,
          'game_completion',
          `Completed ${game.title}`,
          {
            difficulty: game.difficulty,
            score: saveProgressDto.score,
            timeSeconds: saveProgressDto.timeSpent,
            hintsUsed: (saveProgressDto.gameData as any)?.hintsUsed ?? 0,
          },
        );
      }

      // Check if completing this game unlocks new difficulty tiers
      await this.levelProgressionService.unlockNextDifficultyTier(userId);
    }

    // Update game average score
    await this.gamesService.updateAverageScore(gameId, saveProgressDto.score);

    // Check for achievements
    await this.checkAchievements(userId);

    return progress;
  }

  async getUserProgress(userId: string): Promise<ProgressDocument[]> {
    return this.progressModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('gameId')
      .sort({ lastPlayedAt: -1 });
  }

  async getGameProgress(userId: string, gameId: string): Promise<ProgressDocument | null> {
    return this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
      gameId: new Types.ObjectId(gameId),
    });
  }

  async getLeaderboard(ageGroup?: string, limit: number = 10): Promise<any[]> {
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$pointsEarned' },
          gamesCompleted: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          user: { $first: '$user' },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit },
    ];

    if (ageGroup) {
      pipeline.splice(2, 0, {
        $match: { 'user.ageGroup': ageGroup },
      });
    }

    const results = await this.progressModel.aggregate(pipeline);

    return results.map((result, index) => ({
      rank: index + 1,
      userId: result.user._id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      avatar: result.user.avatar,
      points: result.user.points,
      gamesCompleted: result.gamesCompleted,
      level: result.user.level,
    }));
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    const userAchievements = await this.userAchievementModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('achievementId')
      .sort({ unlockedAt: -1 });

    return userAchievements.map((ua) => {
      // After populate, achievementId is populated as AchievementDocument
      const achievement = ua.achievementId as unknown as AchievementDocument;
      if (!achievement || typeof achievement.toObject !== 'function') {
        // Fallback if populate didn't work
        return {
          _id: ua.achievementId,
          unlockedAt: ua.unlockedAt,
        };
      }
      return {
        ...achievement.toObject(),
        unlockedAt: ua.unlockedAt,
      };
    });
  }

  async getAllAchievements(): Promise<AchievementDocument[]> {
    return this.achievementModel.find();
  }

  private async checkAchievements(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) return;

    const progress = await this.getUserProgress(userId);
    const achievements = await this.getAllAchievements();
    const userAchievements = await this.userAchievementModel.find({
      userId: new Types.ObjectId(userId),
    });

    const unlockedAchievementIds = userAchievements.map((ua) => ua.achievementId.toString());

    for (const achievement of achievements) {
      if (unlockedAchievementIds.includes(achievement._id.toString())) {
        continue;
      }

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'first_game':
          shouldUnlock = progress.length >= 1;
          break;
        case 'game_completion':
          const completedGames = progress.filter((p) => p.isCompleted).length;
          shouldUnlock = completedGames >= (achievement.criteria?.gamesCompleted || 5);
          break;
        case 'points_milestone':
          shouldUnlock = user.points >= (achievement.criteria?.points || 100);
          break;
        case 'streak_master':
          shouldUnlock = user.loginStreak >= (achievement.criteria?.days || 7);
          break;
        case 'math_master':
          const mathGames = progress.filter(
            (p) => p.gameId && (p.gameId as any).category === 'math',
          );
          shouldUnlock = mathGames.length >= (achievement.criteria?.gamesCompleted || 5);
          break;
        // Add more achievement types as needed
      }

      if (shouldUnlock) {
        await this.unlockAchievement(userId, achievement._id.toString());
        if (achievement.pointsReward > 0) {
          await this.usersService.updatePoints(userId, achievement.pointsReward);
        }
      }
    }
  }

  private async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const existing = await this.userAchievementModel.findOne({
      userId: new Types.ObjectId(userId),
      achievementId: new Types.ObjectId(achievementId),
    });

    if (!existing) {
      const userAchievement = new this.userAchievementModel({
        userId: new Types.ObjectId(userId),
        achievementId: new Types.ObjectId(achievementId),
      });
      await userAchievement.save();
    }
  }
}

