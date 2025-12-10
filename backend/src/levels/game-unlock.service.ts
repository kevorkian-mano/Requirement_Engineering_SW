import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas/game.schema';
import { LevelProgressionService } from './level-progression.service';

@Injectable()
export class GameUnlockService {
  private readonly logger = new Logger(GameUnlockService.name);

  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private levelProgressionService: LevelProgressionService,
  ) {}

  /**
   * Get available games for a player (unlocked only)
   */
  async getAvailableGames(userId: string): Promise<GameDocument[]> {
    const playerLevel = await this.levelProgressionService.getPlayerLevel(userId);
    if (!playerLevel) {
      return [];
    }

    return this.gameModel.find({
      _id: { $in: playerLevel.unlockedGames },
      isActive: true,
    });
  }

  /**
   * Get locked games for a player
   */
  async getLockedGames(userId: string): Promise<GameDocument[]> {
    const playerLevel = await this.levelProgressionService.getPlayerLevel(userId);
    if (!playerLevel) {
      return [];
    }

    return this.gameModel.find({
      _id: { $in: playerLevel.lockedGames },
      isActive: true,
    });
  }

  /**
   * Check if player can play a specific game
   */
  async canPlayGame(userId: string, gameId: string): Promise<boolean> {
    return this.levelProgressionService.canPlayGame(userId, gameId);
  }

  /**
   * Get recommended games for next unlock
   */
  async getRecommendedGames(userId: string, limit: number = 3): Promise<GameDocument[]> {
    const availableGames = await this.getAvailableGames(userId);
    return availableGames.slice(0, limit);
  }
}
