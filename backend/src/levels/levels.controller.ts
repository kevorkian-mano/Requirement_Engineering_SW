import { Controller, Get, Post, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LevelProgressionService } from './level-progression.service';
import { GameUnlockService } from './game-unlock.service';

interface AwardXpDto {
  xpAmount: number;
  source:
    | 'game_completion'
    | 'high_score'
    | 'no_hints_bonus'
    | 'speed_bonus'
    | 'consecutive_days'
    | 'achievement'
    | 'manual_admin';
  description: string;
  metadata?: {
    gameId?: number;
    score?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    timeSeconds?: number;
    hintsUsed?: number;
    achievementId?: string;
  };
}

@Controller('levels')
export class LevelsController {
  constructor(
    private levelProgressionService: LevelProgressionService,
    private gameUnlockService: GameUnlockService,
  ) {}

  /**
   * Get current player's level information
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyLevel(@Request() req: any) {
    const userId = req.user.sub;
    return this.levelProgressionService.getPlayerLevelDetails(userId);
  }

  /**
   * Get level information for specific player (admin/teacher)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getPlayerLevel(@Param('userId') userId: string) {
    return this.levelProgressionService.getPlayerLevelDetails(userId);
  }

  /**
   * Award XP to player
   */
  @UseGuards(JwtAuthGuard)
  @Post('me/award-xp')
  async awardXpToMe(@Request() req: any, @Body() dto: AwardXpDto) {
    const userId = req.user.sub;
    return this.levelProgressionService.awardXP(
      userId,
      dto.xpAmount,
      dto.source,
      dto.description,
      dto.metadata,
    );
  }

  /**
   * Award XP to specific player (admin/teacher)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/award-xp')
  async awardXpToPlayer(
    @Param('userId') userId: string,
    @Body() dto: AwardXpDto,
  ) {
    return this.levelProgressionService.awardXP(
      userId,
      dto.xpAmount,
      dto.source,
      dto.description,
      dto.metadata,
    );
  }

  /**
   * Get progress to next level
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/progress')
  async getMyProgress(@Request() req: any) {
    const userId = req.user.sub;
    return this.levelProgressionService.getProgressToNextLevel(userId);
  }

  /**
   * Get progress for specific player
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/progress')
  async getPlayerProgress(@Param('userId') userId: string) {
    return this.levelProgressionService.getProgressToNextLevel(userId);
  }

  /**
   * Get all unlocked games for current player
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/unlocked-games')
  async getMyUnlockedGames(@Request() req: any) {
    const userId = req.user?.sub || req.user?._id;
    
    if (!userId) {
      throw new Error('User ID not found in request. Authentication may have failed.');
    }
    
    return {
      unlockedGames: await this.levelProgressionService.getUnlockedGames(userId),
      gameDetails: await this.gameUnlockService.getAvailableGames(userId),
    };
  }

  /**
   * Get all unlocked games for specific player
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/unlocked-games')
  async getPlayerUnlockedGames(@Param('userId') userId: string) {
    return {
      unlockedGames: await this.levelProgressionService.getUnlockedGames(userId),
      gameDetails: await this.gameUnlockService.getAvailableGames(userId),
    };
  }

  /**
   * Get locked games (upcoming unlocks)
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/locked-games')
  async getMyLockedGames(@Request() req: any) {
    const userId = req.user.sub;
    return this.gameUnlockService.getLockedGames(userId);
  }

  /**
   * Get locked games for specific player
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/locked-games')
  async getPlayerLockedGames(@Param('userId') userId: string) {
    return this.gameUnlockService.getLockedGames(userId);
  }

  /**
   * Check if player can play a specific game
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/can-play/:gameId')
  async canIPlayGame(
    @Request() req: any,
    @Param('gameId') gameId: string,
  ) {
    const userId = req.user.sub;
    const can = await this.gameUnlockService.canPlayGame(userId, gameId);
    return { canPlay: can, gameId };
  }

  /**
   * Check if player can play a specific game (admin check)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/can-play/:gameId')
  async canPlayerPlayGame(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    const can = await this.gameUnlockService.canPlayGame(userId, gameId);
    return { canPlay: can, gameId };
  }

  /**
   * Get XP transaction history
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/xp-transactions')
  async getMyXPTransactions(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    return this.levelProgressionService.getXPTransactionHistory(
      userId,
      limit ? parseInt(limit) : 50,
    );
  }

  /**
   * Get XP transaction history for specific player
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/xp-transactions')
  async getPlayerXPTransactions(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.levelProgressionService.getXPTransactionHistory(
      userId,
      limit ? parseInt(limit) : 50,
    );
  }

  /**
   * Get XP statistics
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/xp-statistics')
  async getMyXPStatistics(@Request() req: any) {
    const userId = req.user.sub;
    return this.levelProgressionService.getXPStatistics(userId);
  }

  /**
   * Get XP statistics for specific player
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/xp-statistics')
  async getPlayerXPStatistics(@Param('userId') userId: string) {
    return this.levelProgressionService.getXPStatistics(userId);
  }

  /**
   * Get all level configurations
   */
  @Get('config/all')
  async getAllLevelConfigs() {
    return this.levelProgressionService.getAllLevelConfigs();
  }

  /**
   * Get specific level configuration
   */
  @Get('config/:level')
  async getLevelConfig(@Param('level') level: string) {
    return this.levelProgressionService.getLevelConfig(parseInt(level));
  }

  /**
   * Get recommended games
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/recommended')
  async getMyRecommendedGames(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    return this.gameUnlockService.getRecommendedGames(
      userId,
      limit ? parseInt(limit) : 3,
    );
  }

  /**
   * Get recommended games for specific player
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/recommended')
  async getPlayerRecommendedGames(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.gameUnlockService.getRecommendedGames(
      userId,
      limit ? parseInt(limit) : 3,
    );
  }

  /**
   * Admin: Initialize player level
   */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/initialize')
  async initializePlayerLevel(
    @Param('userId') userId: string,
    @Query('ageGroup') ageGroup: string,
  ) {
    return this.levelProgressionService.initializePlayerLevel(userId, ageGroup as any);
  }

  /**
   * Admin: Reset player level
   */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/reset')
  async resetPlayerLevel(
    @Param('userId') userId: string,
    @Query('ageGroup') ageGroup: string,
  ) {
    return this.levelProgressionService.resetPlayerLevel(userId, ageGroup as any);
  }
}
