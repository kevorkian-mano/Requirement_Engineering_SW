import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlayerLevel, PlayerLevelDocument } from '../schemas/player-level.schema';
import { XPTransaction, XPTransactionDocument } from '../schemas/xp-transaction.schema';
import { Game, GameDocument, DifficultyLevel } from '../schemas/game.schema';
import { User } from '../schemas/user.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { GamesService } from '../games/games.service';
import { AgeGroup } from '../schemas/user.schema';

export interface LevelConfig {
  level: number;
  title: string;
  description: string;
  difficultyStage: 'easy-starter' | 'easy-all' | 'medium-starter' | 'medium-all' | 'hard-starter' | 'hard-all' | 'legend';
  xpThreshold: number;
}

@Injectable()
export class LevelProgressionService {
  private readonly logger = new Logger(LevelProgressionService.name);

  // Define level progression system (difficulty-based per age group)
  private readonly levelConfigs: LevelConfig[] = [
    {
      level: 1,
      title: 'The Beginning',
      description: 'Master all easy games',
      difficultyStage: 'easy-all',
      xpThreshold: 0,
    },
    {
      level: 2,
      title: 'Medium Challenger',
      description: 'Master all medium games',
      difficultyStage: 'medium-all',
      xpThreshold: 1,
    },
    {
      level: 3,
      title: 'Hard Master',
      description: 'Master all hard games',
      difficultyStage: 'hard-all',
      xpThreshold: 2,
    },
    {
      level: 4,
      title: 'LEGEND! 🌟',
      description: 'All games unlocked!',
      difficultyStage: 'hard-all',
      xpThreshold: 3,
    },
  ];

  constructor(
    @InjectModel(PlayerLevel.name)
    private playerLevelModel: Model<PlayerLevelDocument>,
    @InjectModel(XPTransaction.name)
    private xpTransactionModel: Model<XPTransactionDocument>,
    @InjectModel('Game') private gameModel: Model<GameDocument>,
    @InjectModel(User.name) private usersModel: Model<any>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private gamesService: GamesService,
  ) {}

  /**
   * Initialize player level for new user
   */
  async initializePlayerLevel(userId: string, ageGroup: AgeGroup): Promise<PlayerLevelDocument> {
    const levelConfig = this.levelConfigs[0]; // Level 1

    // Get ALL easy games for user's age group
    const unlockedGames = await this.getGamesByDifficultyAndAge(
      DifficultyLevel.EASY,
      ageGroup,
    );

    // Convert game objects to string IDs
    const unlockedGameIds = unlockedGames.map((g) => g._id.toString());

    this.logger.log(`Initializing player ${userId} with ${unlockedGameIds.length} easy games: ${unlockedGameIds.join(', ')}`);

    const playerLevel = await this.playerLevelModel.create({
      userId: new Types.ObjectId(userId),
      currentLevel: 1,
      currentXP: 0,
      totalXPEarned: 0,
      xpNeededForNextLevel: this.levelConfigs[1].xpThreshold,
      totalPoints: 0,
      unlockedGames: unlockedGameIds,
      lockedGames: [],
      currentLevelTitle: levelConfig.title,
      currentLevelDescription: levelConfig.description,
      nextLevelTitle: this.levelConfigs[1].title,
      nextLevelDescription: this.levelConfigs[1].description,
      ageGroup,
    });

    this.logger.log(`Player level initialized for user ${userId} (Age: ${ageGroup}) with ${unlockedGameIds.length} easy games unlocked`);
    return playerLevel;
  }

  /**
   * Check if player has completed at least one game of a specific difficulty
   */
  async hasCompletedDifficulty(userId: string, difficulty: DifficultyLevel): Promise<boolean> {
    const completedGames = await this.progressModel.find({
      userId: new Types.ObjectId(userId),
      isCompleted: true,
    }).populate('gameId');

    const hasCompleted = completedGames.some((progress: any) => 
      progress.gameId && progress.gameId.difficulty === difficulty
    );

    this.logger.log(`User ${userId} has completed ${difficulty} game: ${hasCompleted}`);
    return hasCompleted;
  }

  /**
   * Unlock next difficulty tier for player
   * Called after completing a game to check if new difficulties should be unlocked
   */
  async unlockNextDifficultyTier(userId: string): Promise<string[]> {
    const playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!playerLevel) {
      return [];
    }

    const user = await this.usersModel.findById(userId);
    if (!user || !user.ageGroup) {
      return [];
    }

    const newlyUnlockedGames: string[] = [];
    let levelChanged = false;

    // Check if player completed at least one easy game -> unlock medium games (Level 1 -> 2)
    const completedEasy = await this.hasCompletedDifficulty(userId, DifficultyLevel.EASY);
    if (completedEasy && playerLevel.currentLevel < 2) {
      const mediumGames = await this.getGamesByDifficultyAndAge(
        DifficultyLevel.MEDIUM,
        user.ageGroup,
      );
      
      for (const game of mediumGames) {
        const gameId = game._id.toString();
        if (!playerLevel.unlockedGames.includes(gameId)) {
          playerLevel.unlockedGames.push(gameId);
          newlyUnlockedGames.push(gameId);
        }
      }

      // Upgrade to level 2 (1 star)
      if (newlyUnlockedGames.length > 0 && playerLevel.currentLevel === 1) {
        playerLevel.currentLevel = 2;
        playerLevel.currentLevelTitle = 'Medium Challenger';
        playerLevel.currentLevelDescription = 'Master all medium games';
        playerLevel.nextLevelTitle = 'Hard Master';
        playerLevel.nextLevelDescription = 'Master all hard games';
        levelChanged = true;
        this.logger.log(`User ${userId} advanced to Level 2 (1 star) - Medium games unlocked`);
      }
    }

    // Check if player completed at least one medium game -> unlock hard games (Level 2 -> 3)
    const completedMedium = await this.hasCompletedDifficulty(userId, DifficultyLevel.MEDIUM);
    if (completedMedium && playerLevel.currentLevel < 3) {
      const hardGames = await this.getGamesByDifficultyAndAge(
        DifficultyLevel.HARD,
        user.ageGroup,
      );
      
      for (const game of hardGames) {
        const gameId = game._id.toString();
        if (!playerLevel.unlockedGames.includes(gameId)) {
          playerLevel.unlockedGames.push(gameId);
          newlyUnlockedGames.push(gameId);
        }
      }

      // Upgrade to level 3 (2 stars)
      if (newlyUnlockedGames.length > 0 && playerLevel.currentLevel === 2) {
        playerLevel.currentLevel = 3;
        playerLevel.currentLevelTitle = 'Hard Master';
        playerLevel.currentLevelDescription = 'Master all hard games';
        playerLevel.nextLevelTitle = 'LEGEND! 🌟';
        playerLevel.nextLevelDescription = 'All games unlocked!';
        levelChanged = true;
        this.logger.log(`User ${userId} advanced to Level 3 (2 stars) - Hard games unlocked`);
      }
    }

    if (newlyUnlockedGames.length > 0 || levelChanged) {
      await playerLevel.save();
      this.logger.log(`Unlocked ${newlyUnlockedGames.length} new games for user ${userId}`);
    }

    return newlyUnlockedGames;
  }

  /**
   * Get games by difficulty and age group
   */
  private async getGamesByDifficultyAndAge(
    difficulty: DifficultyLevel,
    ageGroup: AgeGroup,
    limit?: number,
  ): Promise<GameDocument[]> {
    const query: any = {
      isActive: true,
      difficulty,
      ageGroups: { $in: [ageGroup] },
    };

    let games = await this.gameModel.find(query).sort({ createdAt: 1 });

    if (limit) {
      games = games.slice(0, limit);
    }

    return games;
  }

  /**
   * Get all games for a difficulty and age group
   */
  private async getAllGamesByDifficultyAndAge(
    difficulty: DifficultyLevel,
    ageGroup: AgeGroup,
  ): Promise<GameDocument[]> {
    return this.getGamesByDifficultyAndAge(difficulty, ageGroup);
  }

  /**
   * Get games to unlock based on difficulty stage
   */
  private async getGamesByStage(
    stage: string,
    ageGroup: AgeGroup,
  ): Promise<GameDocument[]> {
    let games: GameDocument[] = [];

    switch (stage) {
      case 'easy-starter':
        games = await this.getGamesByDifficultyAndAge(
          DifficultyLevel.EASY,
          ageGroup,
          3,
        );
        break;
      case 'easy-all':
        games = await this.getAllGamesByDifficultyAndAge(DifficultyLevel.EASY, ageGroup);
        break;
      case 'medium-starter':
        games = await this.getGamesByDifficultyAndAge(
          DifficultyLevel.MEDIUM,
          ageGroup,
          3,
        );
        break;
      case 'medium-all':
        games = await this.getAllGamesByDifficultyAndAge(
          DifficultyLevel.MEDIUM,
          ageGroup,
        );
        break;
      case 'hard-starter':
        games = await this.getGamesByDifficultyAndAge(DifficultyLevel.HARD, ageGroup, 3);
        break;
      case 'hard-all':
        games = await this.getAllGamesByDifficultyAndAge(DifficultyLevel.HARD, ageGroup);
        break;
      case 'legend':
        // All games for this age group
        const allGames = await this.gameModel.find({
          isActive: true,
          ageGroups: { $in: [ageGroup] },
        });
        games = allGames;
        break;
    }

    return games;
  }

  /**
   * Get player's current level info
   */
  async getPlayerLevel(userId: string, ageGroup?: AgeGroup): Promise<PlayerLevelDocument> {
    let playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!playerLevel && ageGroup) {
      await this.initializePlayerLevel(userId, ageGroup);
      playerLevel = await this.playerLevelModel.findOne({
        userId: new Types.ObjectId(userId),
      });
    }

    return playerLevel;
  }

  /**
   * Award XP to player and handle level ups
   */
  async awardXP(
    userId: string,
    xpAmount: number,
    source: string,
    description: string,
    metadata?: any,
  ): Promise<{
    xpAwarded: number;
    leveledUp: boolean;
    newLevel?: number;
    newUnlockedGames?: string[];
  }> {
    let playerLevel = await this.getPlayerLevel(userId);

    if (!playerLevel) {
      throw new Error(`Player not found with ID: ${userId}`);
    }

    // Create XP transaction
    const transaction = await this.xpTransactionModel.create({
      userId: new Types.ObjectId(userId),
      xpEarned: xpAmount,
      source,
      description,
      metadata,
      levelUpTriggered: false,
      previousLevel: playerLevel.currentLevel,
      isValid: true,
    });

    // Update XP
    playerLevel.currentXP += xpAmount;
    playerLevel.totalXPEarned += xpAmount;

    let leveledUp = false;
    let newUnlockedGames: string[] = [];

    // Check for level up
    while (
      playerLevel.currentLevel < this.levelConfigs.length &&
      playerLevel.currentXP >= this.levelConfigs[playerLevel.currentLevel].xpThreshold
    ) {
      // Level up!
      const oldLevel = playerLevel.currentLevel;
      playerLevel.currentLevel += 1;
      playerLevel.currentXP = 0; // Reset XP for new level

      const levelConfig = this.getLevelConfig(playerLevel.currentLevel);
      playerLevel.currentLevelTitle = levelConfig.title;
      playerLevel.currentLevelDescription = levelConfig.description;

      // Get next level info
      if (playerLevel.currentLevel < this.levelConfigs.length) {
        const nextLevelConfig = this.levelConfigs[playerLevel.currentLevel];
        playerLevel.nextLevelTitle = nextLevelConfig.title;
        playerLevel.nextLevelDescription = nextLevelConfig.description;
        playerLevel.xpNeededForNextLevel = nextLevelConfig.xpThreshold;
      }

      // Track level up
      if (!playerLevel.levelUpHistory) {
        playerLevel.levelUpHistory = {};
      }
      playerLevel.levelUpHistory[playerLevel.currentLevel] = new Date();

      // Unlock games based on difficulty stage
      const stagesToUnlock = await this.getGamesByStage(
        levelConfig.difficultyStage,
        playerLevel.ageGroup,
      );
      const newGameIds = stagesToUnlock.map((g) => g._id.toString());

      playerLevel.unlockedGames.push(...newGameIds);
      // Remove from locked games if they were there
      playerLevel.lockedGames = playerLevel.lockedGames.filter(
        (g) => !newGameIds.includes(g),
      );
      newUnlockedGames.push(...newGameIds);

      leveledUp = true;
      transaction.levelUpTriggered = true;
      transaction.newLevel = playerLevel.currentLevel;

      this.logger.log(
        `Player ${userId} leveled up to level ${playerLevel.currentLevel}`,
      );
    }

    // Save updates
    await playerLevel.save();
    await transaction.save();

    return {
      xpAwarded: xpAmount,
      leveledUp,
      newLevel: leveledUp ? playerLevel.currentLevel : undefined,
      newUnlockedGames: leveledUp ? newUnlockedGames : undefined,
    };
  }

  /**
   * Calculate XP earned from game completion
   */
  calculateGameCompletionXP(gameDifficulty: 'easy' | 'medium' | 'hard'): number {
    const xpMap = {
      easy: 15,
      medium: 30,
      hard: 50,
    };
    return xpMap[gameDifficulty];
  }

  /**
   * Calculate high score bonus XP (80%+ = bonus)
   */
  calculateHighScoreBonusXP(score: number): number {
    if (score >= 80) {
      return 10;
    }
    return 0;
  }

  /**
   * Calculate no-hints bonus XP
   */
  calculateNoHintsBonusXP(hintsUsed: number): number {
    if (hintsUsed === 0) {
      return 5;
    }
    return 0;
  }

  /**
   * Calculate speed bonus XP (under 2 minutes = bonus)
   */
  calculateSpeedBonusXP(timeSeconds: number): number {
    if (timeSeconds < 120) {
      return 5;
    }
    return 0;
  }

  /**
   * Award consecutive days bonus
   */
  async awardConsecutiveDaysBonus(userId: string): Promise<number> {
    const playerLevel = await this.getPlayerLevel(userId);

    if (!playerLevel) {
      throw new Error(`Player not found with ID: ${userId}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let bonus = 0;

    if (playerLevel.lastPlayDate) {
      const lastPlay = new Date(playerLevel.lastPlayDate);
      lastPlay.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - lastPlay.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        // Consecutive day
        playerLevel.consecutiveDaysPlayed += 1;
        if (playerLevel.consecutiveDaysPlayed >= 7) {
          bonus = 10;
        }
      } else if (daysDiff > 1) {
        // Streak broken
        playerLevel.consecutiveDaysPlayed = 1;
      }
    } else {
      playerLevel.consecutiveDaysPlayed = 1;
    }

    playerLevel.lastPlayDate = new Date();
    await playerLevel.save();

    return bonus;
  }

  /**
   * Award achievement bonus XP
   */
  async awardAchievementBonusXP(userId: string, achievementId: string): Promise<void> {
    await this.awardXP(
      userId,
      20,
      'achievement',
      `Achievement unlocked: ${achievementId}`,
      { achievementId },
    );
  }

  /**
   * Get list of unlocked games for player
   */
  async getUnlockedGames(userId: string): Promise<string[]> {
    let playerLevel = await this.playerLevelModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    // If player level doesn't exist, try to initialize it
    if (!playerLevel) {
      const user = await this.usersModel.findById(userId);
      if (user && user.ageGroup) {
        this.logger.log(`Auto-initializing player level for user ${userId}`);
        await this.initializePlayerLevel(userId, user.ageGroup);
        playerLevel = await this.playerLevelModel.findOne({
          userId: new Types.ObjectId(userId),
        });
      }
    }

    if (!playerLevel) {
      this.logger.warn(`No player level found for user ${userId}`);
      return [];
    }
    const unlockedGames = playerLevel.unlockedGames || [];
    this.logger.log(`User ${userId} has ${unlockedGames.length} unlocked games: ${JSON.stringify(unlockedGames)}`);
    return unlockedGames;
  }

  /**
   * Get list of locked games for player
   */
  async getLockedGames(userId: string): Promise<string[]> {
    const playerLevel = await this.getPlayerLevel(userId);
    if (!playerLevel) {
      return [];
    }
    return playerLevel.lockedGames;
  }

  /**
   * Check if player can play a specific game
   */
  async canPlayGame(userId: string, gameId: string): Promise<boolean> {
    const playerLevel = await this.getPlayerLevel(userId);
    if (!playerLevel) {
      return false;
    }
    return playerLevel.unlockedGames.includes(gameId);
  }

  /**
   * Get level config by level number
   */
  getLevelConfig(level: number): LevelConfig {
    return this.levelConfigs[Math.min(level - 1, this.levelConfigs.length - 1)];
  }

  /**
   * Get all level configurations
   */
  getAllLevelConfigs(): LevelConfig[] {
    return this.levelConfigs;
  }

  /**
   * Get XP progress toward next level
   */
  async getProgressToNextLevel(userId: string): Promise<{
    currentXP: number;
    xpNeeded: number;
    progressPercentage: number;
    xpRemaining: number;
  }> {
    const playerLevel = await this.getPlayerLevel(userId);

    if (!playerLevel) {
      return {
        currentXP: 0,
        xpNeeded: this.levelConfigs[0].xpThreshold,
        progressPercentage: 0,
        xpRemaining: this.levelConfigs[0].xpThreshold,
      };
    }

    const xpNeeded = this.levelConfigs[Math.min(playerLevel.currentLevel, this.levelConfigs.length - 1)].xpThreshold;
    const xpRemaining = Math.max(0, xpNeeded - playerLevel.totalXPEarned);

    return {
      currentXP: playerLevel.currentXP,
      xpNeeded,
      progressPercentage: (playerLevel.currentXP / xpNeeded) * 100,
      xpRemaining,
    };
  }

  /**
   * Get detailed player level information
   */
  async getPlayerLevelDetails(userId: string): Promise<any> {
    const playerLevel = await this.getPlayerLevel(userId);

    if (!playerLevel) {
      return {
        userId,
        currentLevel: 1,
        currentLevelTitle: this.levelConfigs[0].title,
        currentLevelDescription: this.levelConfigs[0].description,
        nextLevelTitle: this.levelConfigs[1]?.title || null,
        nextLevelDescription: this.levelConfigs[1]?.description || null,
        totalXPEarned: 0,
        currentXPInLevel: 0,
        xpProgress: {
          currentXP: 0,
          xpNeeded: this.levelConfigs[0].xpThreshold,
          progressPercentage: 0,
          xpRemaining: this.levelConfigs[0].xpThreshold,
        },
        unlockedGamesCount: 0,
        unlockedGames: [],
        lockedGamesCount: 0,
        lockedGames: [],
        totalPoints: 0,
        consecutiveDaysPlayed: 0,
        levelUpHistory: [],
        hasMoreLevels: true,
      };
    }

    const progress = await this.getProgressToNextLevel(userId);

    return {
      userId,
      currentLevel: playerLevel.currentLevel,
      currentLevelTitle: playerLevel.currentLevelTitle,
      currentLevelDescription: playerLevel.currentLevelDescription,
      nextLevelTitle: playerLevel.nextLevelTitle,
      nextLevelDescription: playerLevel.nextLevelDescription,
      totalXPEarned: playerLevel.totalXPEarned,
      currentXPInLevel: playerLevel.currentXP,
      xpProgress: progress,
      unlockedGamesCount: playerLevel.unlockedGames.length,
      unlockedGames: playerLevel.unlockedGames,
      lockedGamesCount: playerLevel.lockedGames.length,
      lockedGames: playerLevel.lockedGames,
      totalPoints: playerLevel.totalPoints,
      consecutiveDaysPlayed: playerLevel.consecutiveDaysPlayed,
      levelUpHistory: playerLevel.levelUpHistory,
      hasMoreLevels: playerLevel.currentLevel < this.levelConfigs.length,
    };
  }

  /**
   * Get XP transaction history for player
   */
  async getXPTransactionHistory(
    userId: string,
    limit: number = 20,
  ): Promise<any[]> {
    return this.xpTransactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Calculate total XP statistics for a player
   */
  async getXPStatistics(userId: string): Promise<{
    totalXPEarned: number;
    bySource: Record<string, number>;
    averageXPPerDay: number;
  }> {
    const transactions: any[] = await this.xpTransactionModel
      .find({
        userId: new Types.ObjectId(userId),
        isValid: true,
      })
      .lean();

    const bySource: Record<string, number> = {};
    let totalXP = 0;

    for (const tx of transactions) {
      totalXP += tx.xpEarned;
      bySource[tx.source] = (bySource[tx.source] || 0) + tx.xpEarned;
    }

    // Get days since first transaction
    const firstTx: any = transactions.length > 0 ? transactions[transactions.length - 1] : null;
    const createdAtDate = firstTx?.createdAt ? new Date(firstTx.createdAt) : null;
    const daysSinceStart = createdAtDate
      ? Math.max(
          1,
          Math.floor((Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : 1;

    return {
      totalXPEarned: totalXP,
      bySource,
      averageXPPerDay: Math.round(totalXP / daysSinceStart),
    };
  }

  /**
   * Get specific level configuration
   */
  /**
   * Reset player level (admin function)
   */
  async resetPlayerLevel(userId: string, ageGroup: AgeGroup): Promise<PlayerLevelDocument> {
    await this.playerLevelModel.deleteOne({ userId: new Types.ObjectId(userId) });
    return this.initializePlayerLevel(userId, ageGroup);
  }
}
